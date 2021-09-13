import { compile } from "./emulator/compiler.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Color_Mode, Display } from "./emulator/devices/display.js";
import { Emulator, Step_Result } from "./emulator/emulator.js";
import { IO_Port } from "./emulator/instructions.js";
import { parse } from "./emulator/parser.js";
import { enum_from_str, expand_warning } from "./emulator/util.js";
let animation_frame;
let running = false;
const source_input = document.getElementById("urcl-source");
const output_element = document.getElementById("output");
const memory_view = document.getElementById("memory-view");
const register_view = document.getElementById("register-view");
const console_input = document.getElementById("stdin");
const console_output = document.getElementById("stdout");
let input_callback;
console_input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input_callback) {
        input_callback();
    }
});
const console_io = new Console_IO({
    read(callback) {
        input_callback = callback;
    },
    get text() {
        return console_input.value;
    },
    set text(value) {
        console_input.value = value;
    }
}, (text) => {
    console_output.innerText += text;
}, () => {
    console_output.textContent = "";
    input_callback = undefined;
});
const canvas = document.getElementsByTagName("canvas")[0];
const display = new Display(canvas, 32, 32, 32);
const color_mode_input = document.getElementById("color-mode");
color_mode_input.addEventListener("change", change_color_mode);
change_color_mode();
function change_color_mode() {
    const color_mode = enum_from_str(Color_Mode, color_mode_input.value);
    console.log(color_mode_input.value, color_mode);
    display.color_mode = color_mode ?? display.color_mode;
}
const width_input = document.getElementById("display-width");
const height_input = document.getElementById("display-height");
width_input.addEventListener("input", resize_display);
height_input.addEventListener("input", resize_display);
resize_display();
function resize_display() {
    const width = parseInt(width_input.value) || 16;
    const height = parseInt(height_input.value) || 16;
    display.resize(width, height);
}
const emulator = new Emulator(frame);
emulator.add_io_device(IO_Port.TEXT, console_io.text_in.bind(console_io), console_io.text_out.bind(console_io), console_io.reset.bind(console_io));
emulator.add_io_device(IO_Port.NUMB, console_io.numb_in.bind(console_io), console_io.numb_out.bind(console_io), console_io.reset.bind(console_io));
emulator.add_io_device(IO_Port.COLOR, display.color_in.bind(display), display.color_out.bind(display), display.reset.bind(display));
emulator.add_io_device(IO_Port.X, display.x_in.bind(display), display.x_out.bind(display), display.reset.bind(display));
emulator.add_io_device(IO_Port.Y, display.y_in.bind(display), display.y_out.bind(display), display.reset.bind(display));
emulator.add_io_device(IO_Port.BUFFER, display.buffer_in.bind(display), display.buffer_out.bind(display), display.reset.bind(display));
source_input.addEventListener("input", compile_and_run);
fetch("examples/urcl/display-io.urcl").then(res => res.text()).then((text) => {
    if (source_input.value) {
        return;
    }
    source_input.value = text;
    compile_and_run();
});
const compile_and_run_button = document.getElementById("compile-and-run-button");
const pause_button = document.getElementById("pause-button");
const compile_and_reset_button = document.getElementById("compile-and-reset-button");
const step_button = document.getElementById("step-button");
compile_and_run_button.addEventListener("click", compile_and_run);
compile_and_reset_button.addEventListener("click", compile_and_reset);
pause_button.addEventListener("click", pause);
step_button.addEventListener("click", step);
function step() {
    process_step_result(emulator.step());
}
function pause() {
    if (running) {
        if (animation_frame) {
            cancelAnimationFrame(animation_frame);
            animation_frame = undefined;
            pause_button.textContent = "Start";
            running = false;
            step_button.disabled = running;
        }
    }
    else {
        animation_frame = requestAnimationFrame(frame);
        pause_button.textContent = "Pause";
        running = true;
        step_button.disabled = running;
    }
}
function compile_and_run() {
    compile_and_reset();
    pause_button.textContent = "Pause";
    pause_button.disabled = false;
    if (!running) {
        running = true;
        step_button.disabled = running;
        frame();
    }
}
function compile_and_reset() {
    output_element.innerText = "";
    try {
        const source = source_input.value;
        const parsed = parse(source);
        if (parsed.errors.length > 0) {
            output_element.innerText = parsed.errors.map(v => "ERROR: " + expand_warning(v, parsed.lines) + "\n").join("");
            output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines) + "\n").join("");
            return;
        }
        output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines) + "\n").join("");
        const [program, debug_info] = compile(parsed);
        emulator.load_program(program, debug_info);
        display.bits = emulator.bits;
        output_element.innerText += `
compilation done
bits: ${emulator.bits}
register-count: ${emulator.registers.length}
memory-size: ${emulator.memory.length}
`;
        if (animation_frame) {
            cancelAnimationFrame(animation_frame);
        }
        animation_frame = undefined;
        pause_button.textContent = "Start";
        pause_button.disabled = false;
        step_button.disabled = false;
        running = false;
        memory_view.innerText = memoryToString(new DataView(emulator.buffer, emulator.memory.byteOffset, emulator.memory.byteLength));
        register_view.innerText = emulator.registers.join(" ");
    }
    catch (e) {
        output_element.innerText += "ERROR: " + e;
        throw e;
    }
}
function frame() {
    if (running) {
        process_step_result(emulator.run(16));
    }
    else {
        step_button.disabled = false;
        pause_button.disabled = false;
    }
}
function process_step_result(result) {
    animation_frame = undefined;
    switch (result) {
        case Step_Result.Continue:
            {
                if (running) {
                    animation_frame = requestAnimationFrame(frame);
                    running = true;
                    step_button.disabled = running;
                    pause_button.disabled = false;
                }
            }
            break;
        case Step_Result.Input:
            {
                step_button.disabled = true;
                pause_button.disabled = true;
            }
            break;
        case Step_Result.Halt:
            {
                output_element.innerText += "Program halted";
                step_button.disabled = true;
                pause_button.disabled = true;
                pause_button.textContent = "Start";
                running = false;
            }
            break;
        default: {
            console.warn("unkown step result");
        }
    }
    memory_view.innerText = memoryToString(new DataView(emulator.buffer, emulator.memory.byteOffset, emulator.memory.byteLength));
    register_view.innerText = emulator.registers.join(" ");
}
function memoryToString(view, from = 0x0, length = 0x1000, bits = 8) {
    const width = 0x10;
    const end = Math.min(from + length, view.byteLength);
    const hexes = Math.ceil(bits / 4);
    let lines = [
        " ".repeat(hexes) + Array.from({ length: width }, (_, i) => {
            const str = i.toString(16);
            return " ".repeat(2 - str.length) + str;
        }).join(" ")
    ];
    for (let i = from; i < end;) {
        const sub_end = Math.min(i + width, end);
        let subs = [];
        const addr = (0 | i / width).toString(16);
        for (; i < sub_end; i++) {
            let sub = view.getUint8(i).toString(16);
            sub = "0".repeat(2 - sub.length) + sub;
            subs.push(sub);
        }
        const line = subs.join(" ");
        lines.push(addr + " ".repeat(hexes - addr.length) + line);
    }
    console.log(lines);
    return lines.join("\n");
}
//# sourceMappingURL=index.js.map