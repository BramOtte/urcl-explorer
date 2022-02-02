import { compile } from "./emulator/compiler.js";
import { Clock } from "./emulator/devices/clock.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Color_Mode } from "./emulator/devices/display.js";
import { Gamepad_Key, Pad } from "./emulator/devices/gamepad.js";
import { Gl_Display } from "./emulator/devices/gl-display.js";
import { RNG } from "./emulator/devices/rng.js";
import { Sound } from "./emulator/devices/sound.js";
import { Storage } from "./emulator/devices/storage.js";
import { Emulator, Step_Result } from "./emulator/emulator.js";
import { parse } from "./emulator/parser.js";
import { enum_from_str, enum_strings, expand_warning, registers_to_string, memoryToString, format_int } from "./emulator/util.js";
let animation_frame;
let running = false;
let started = false;
let input = false;
let last_step = performance.now();
let clock_speed = 0;
let clock_count = 0;
const source_input = document.getElementById("urcl-source");
const output_element = document.getElementById("output");
const memory_view = document.getElementById("memory-view");
const register_view = document.getElementById("register-view");
const console_input = document.getElementById("stdin");
const console_output = document.getElementById("stdout");
const null_terminate_input = document.getElementById("null-terminate");
const share_button = document.getElementById("share-button");
const auto_run_input = document.getElementById("auto-run-input");
const storage_input = document.getElementById("storage-input");
const storage_msg = document.getElementById("storage-msg");
const clock_speed_input = document.getElementById("clock-speed-input");
const clock_speed_output = document.getElementById("clock-speed-output");
const memory_update_input = document.getElementById("update-mem-input");
memory_update_input.oninput = () => update_views();
const max_clock_speed = 40_000_000;
const max_its = 1.2 * max_clock_speed / 16;
clock_speed_input.oninput = change_clockspeed;
function change_clockspeed() {
    clock_speed = Math.min(max_clock_speed, Math.max(0, Number(clock_speed_input.value) || 0));
    clock_speed_output.value = "" + clock_speed;
    last_step = performance.now();
}
change_clockspeed();
share_button.onclick = e => {
    const srcurl = `data:text/plain;base64,${btoa(source_input.value)}`;
    const share = new URL(location.href);
    share.searchParams.set("srcurl", srcurl);
    navigator.clipboard.writeText(share.href);
};
let uploaded_storage;
let storage_loads = 0;
storage_input.oninput = async (e) => {
    storage_msg.classList.remove("error");
    const files = storage_input.files;
    if (files === null || files.length < 1) {
        storage_msg.classList.add("error");
        storage_msg.innerText = "No file specified";
        return;
    }
    const file = files[0];
    try {
        const data = await file.arrayBuffer();
        uploaded_storage = new Uint8Array(data);
        const bytes = uploaded_storage.slice();
        emulator.add_io_device(new Storage(emulator.bits, bytes, false, bytes.length)); // TODO: add little endian option
        storage_msg.innerText = `loaded storage device with ${0 | bytes.length / (emulator.bits / 8)} words`;
    }
    catch (error) {
        storage_msg.classList.add("error");
        storage_msg.innerText = "" + error;
    }
};
let input_callback;
console_input.addEventListener("keydown", e => {
    if (!e.shiftKey && e.key === "Enter" && input_callback) {
        e.preventDefault();
        if (null_terminate_input.checked) {
            console_input.value += "\0";
        }
        else {
            console_input.value += "\n";
        }
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
    console_output.write(text);
}, () => {
    console_output.clear();
    input_callback = undefined;
});
const canvas = document.getElementsByTagName("canvas")[0];
const gl = canvas.getContext("webgl2");
if (!gl) {
    throw new Error("Unable to get webgl rendering context");
}
canvas.width = 32;
canvas.height = 32;
const display = new Gl_Display(gl);
const color_mode_input = document.getElementById("color-mode");
color_mode_input.addEventListener("change", change_color_mode);
function change_color_mode() {
    const color_mode = enum_from_str(Color_Mode, color_mode_input.value);
    display.color_mode = color_mode ?? display.color_mode;
    display.update_display();
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
const emulator = new Emulator({ on_continue: frame });
emulator.add_io_device(new Sound());
emulator.add_io_device(console_io);
emulator.add_io_device(display);
emulator.add_io_device(new Clock());
emulator.add_io_device(new Pad());
emulator.add_io_device(new RNG);
const url = new URL(location.href, location.origin).searchParams.get("srcurl");
source_input.oninput = oninput;
auto_run_input.onchange = oninput;
function oninput() {
    if (started) {
        const size = Math.max(1, 0 | (Number(localStorage.getItem("history-size")) || 128));
        localStorage.setItem("history-size", "" + size);
        const offset = (Math.max(0, 0 | (Number(localStorage.getItem("history-offset")) || 0)) + 1) % size;
        localStorage.setItem("history-offset", "" + offset);
        localStorage.setItem(`history-${offset}`, source_input.value);
    }
    if (auto_run_input.checked) {
        compile_and_run();
    }
}
const compile_and_run_button = document.getElementById("compile-and-run-button");
const pause_button = document.getElementById("pause-button");
const compile_and_reset_button = document.getElementById("compile-and-reset-button");
const step_button = document.getElementById("step-button");
compile_and_run_button.addEventListener("click", compile_and_run);
compile_and_reset_button.addEventListener("click", compile_and_reset);
pause_button.addEventListener("click", pause);
step_button.addEventListener("click", step);
function step() {
    process_step_result(emulator.step(), 1);
    clock_speed_output.value = `stepping, executed ${format_int(clock_count)} instructions`;
    console_output.flush();
}
function pause() {
    if (running) {
        if (animation_frame) {
            cancelAnimationFrame(animation_frame);
        }
        animation_frame = undefined;
        pause_button.textContent = "Start";
        running = false;
        step_button.disabled = running || input;
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
    clock_count = 0;
    output_element.innerText = "";
    try {
        const source = source_input.value;
        const parsed = parse(source, {
            constants: Object.fromEntries(enum_strings(Gamepad_Key).map(key => ["@" + key, "" + (1 << Gamepad_Key[key])])),
        });
        if (parsed.errors.length > 0) {
            output_element.innerText = parsed.errors.map(v => expand_warning(v, parsed.lines) + "\n").join("");
            output_element.innerText += parsed.warnings.map(v => expand_warning(v, parsed.lines) + "\n").join("");
            return;
        }
        output_element.innerText += parsed.warnings.map(v => expand_warning(v, parsed.lines) + "\n").join("");
        const [program, debug_info] = compile(parsed);
        emulator.load_program(program, debug_info);
        if (uploaded_storage) {
            const bytes = uploaded_storage.slice();
            emulator.add_io_device(new Storage(emulator.bits, bytes, false, bytes.length)); // TODO: add little endian option
            storage_msg.innerText = `loaded storage device with ${0 | bytes.length / (emulator.bits / 8)} words, ${storage_loads++ % 2 === 0 ? "flip" : "flop"}`;
        }
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
        update_views();
    }
    catch (e) {
        output_element.innerText += e.message;
        throw e;
    }
}
function frame() {
    if (running) {
        try {
            if (clock_speed > 0) {
                const now = performance.now();
                const dt = now - last_step;
                const its = Math.min(max_its, 0 | dt * clock_speed / 1000);
                const [res, steps] = emulator.burst(its, 16);
                clock_count += steps;
                process_step_result(res, steps);
                if (its === max_its || (res === Step_Result.Continue && steps !== its)) {
                    last_step = now;
                    clock_speed_output.value = `${format_int(clock_speed)}Hz slowdown to ${format_int(steps * 1000 / 16)}Hz, executed ${format_int(clock_count)} instructions`;
                }
                else {
                    last_step += its * 1000 / clock_speed;
                    clock_speed_output.value = `${format_int(clock_speed)}Hz, executed ${format_int(clock_count)} instructions`;
                }
            }
            else {
                const [res, steps] = emulator.run(16);
                process_step_result(res, steps);
                clock_speed_output.value = `${format_int(steps * 1000 / 16)}Hz, executed ${format_int(clock_count)} instructions`;
            }
        }
        catch (e) {
            output_element.innerText += e.message + "\nProgram Halted";
            update_views();
            throw e;
        }
    }
    else {
        step_button.disabled = false;
        pause_button.disabled = false;
    }
}
function process_step_result(result, steps) {
    clock_count += steps;
    animation_frame = undefined;
    input = false;
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
                pause_button.disabled = false;
                input = true;
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
    update_views();
}
function update_views() {
    const bits = emulator.bits;
    if (memory_update_input.checked) {
        memory_view.innerText = memoryToString(emulator.memory, 0, emulator.memory.length, bits);
    }
    register_view.innerText =
        registers_to_string(emulator);
    const lines = emulator.debug_info.pc_line_nrs;
    const line = lines[Math.min(emulator.pc, lines.length - 1)];
    source_input.set_pc_line(line);
    console_output.flush();
}
change_color_mode();
started = true;
if (url) {
    fetch(url).then(res => res.text()).then((text) => {
        if (source_input.value) {
            return;
        }
        source_input.value = text;
        compile_and_run();
    });
}
else
    autofill: {
        const offset = Number(localStorage.getItem("history-offset"));
        if (!Number.isInteger(offset)) {
            break autofill;
        }
        source_input.value = localStorage.getItem(`history-${offset}`) ?? "";
    }
//# sourceMappingURL=index.js.map