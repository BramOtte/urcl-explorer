import { Editor_Window } from "./editor/editor.js";
import { compile } from "./emulator/compiler.js";
import { Clock } from "./emulator/devices/clock.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Color_Mode, Display } from "./emulator/devices/display.js";
import { Gl_Display } from "./emulator/devices/gl-display.js";
import { Emulator, Step_Result } from "./emulator/emulator.js";
import { Register, register_count } from "./emulator/instructions.js";
import { parse } from "./emulator/parser.js";
import { Arr, enum_from_str, expand_warning, hex, hex_size, pad_center } from "./emulator/util.js";

let animation_frame: number | undefined;
let running = false;

const source_input = document.getElementById("urcl-source") as Editor_Window;
const output_element = document.getElementById("output") as HTMLElement;
const memory_view = document.getElementById("memory-view") as HTMLElement;
const register_view = document.getElementById("register-view") as HTMLElement;

const console_input = document.getElementById("stdin") as HTMLTextAreaElement;
const console_output = document.getElementById("stdout") as HTMLElement;
let input_callback: undefined | (() => void);


console_input.addEventListener("keydown", e => {
    if (!e.shiftKey && e.key === "Enter" && input_callback){
        input_callback();
        e.preventDefault();
    }
})

const console_io = new Console_IO({
    read(callback){
        input_callback = callback;
    },
    get text(){
            return console_input.value;
        },
        set text(value: string){
            console_input.value = value;
        }
    }, 
    (text) => {
        console_output.innerText += text
    },
    () => {
        console_output.textContent = "";
        input_callback = undefined
    }
);
const canvas = document.getElementsByTagName("canvas")[0];
const display = new Gl_Display(canvas, 32, 32, 32);
const color_mode_input = document.getElementById("color-mode") as HTMLOptionElement;
color_mode_input.addEventListener("change", change_color_mode);
function change_color_mode(){
    const color_mode = enum_from_str(Color_Mode, color_mode_input.value);
    console.log(color_mode_input.value, color_mode);
    display.color_mode = color_mode ?? display.color_mode;
    display.update_display();
}
const width_input = document.getElementById("display-width") as HTMLInputElement;
const height_input = document.getElementById("display-height") as HTMLInputElement;
width_input.addEventListener("input", resize_display);
height_input.addEventListener("input", resize_display);
resize_display();
function resize_display(){
    const width = parseInt(width_input.value) || 16;
    const height = parseInt(height_input.value) || 16;
    display.resize(width, height);
}

const emulator = new Emulator(frame);
emulator.add_io_device(console_io);
emulator.add_io_device(display);
emulator.add_io_device(new Clock())

source_input.oninput = compile_and_run;
fetch("examples/urcl/text-io.urcl").then(res => res.text()).then((text) => {
    if (source_input.value){
        return;
    }
    source_input.value = text;
    compile_and_run();
});


const compile_and_run_button = document.getElementById("compile-and-run-button") as HTMLButtonElement;
const pause_button = document.getElementById("pause-button") as HTMLButtonElement;
const compile_and_reset_button = document.getElementById("compile-and-reset-button") as HTMLButtonElement;
const step_button = document.getElementById("step-button") as HTMLButtonElement;

compile_and_run_button.addEventListener("click", compile_and_run);
compile_and_reset_button.addEventListener("click", compile_and_reset);
pause_button.addEventListener("click", pause);
step_button.addEventListener("click", step);

function step(){
    process_step_result(emulator.step()); 
}

function pause(){
    if (running){
        if (animation_frame){
            cancelAnimationFrame(animation_frame);
            animation_frame = undefined;
            pause_button.textContent = "Start";
            running = false;
            step_button.disabled = running;
        }
    } else {
        animation_frame = requestAnimationFrame(frame);
        pause_button.textContent = "Pause";
        running = true;
        step_button.disabled = running;
    }

}

function compile_and_run(){
    compile_and_reset();
    pause_button.textContent = "Pause";
    pause_button.disabled = false;
    if (!running){
        running = true;
        step_button.disabled = running;
        frame();
    }
}
function compile_and_reset(){
    output_element.innerText = "";
try {
    const source = source_input.value;
    const parsed = parse(source);

    if (parsed.errors.length > 0){
        output_element.innerText = parsed.errors.map(v => "ERROR: " + expand_warning(v, parsed.lines)+"\n").join("");
        output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines)+"\n").join("");
        return;
    }
    output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines)+"\n").join("");
    const [program, debug_info] = compile(parsed);
    emulator.load_program(program, debug_info);
    display.bits = emulator.bits;

    output_element.innerText += `
compilation done
bits: ${emulator.bits}
register-count: ${emulator.registers.length}
memory-size: ${emulator.memory.length}
`;
    if (animation_frame){
        cancelAnimationFrame(animation_frame);
    }
    animation_frame = undefined;
    pause_button.textContent = "Start";
    pause_button.disabled = false;
    step_button.disabled = false;
    running = false;
    update_views();
} catch (e: any){
    output_element.innerText += "ERROR: " + e;
    throw e;
}
}

function frame(){
    if (running){
        try {
        process_step_result(emulator.run(16));
        } catch (e){
            output_element.innerText += e + "\nProgram Halted";
            throw e;
        }
    } else {
        step_button.disabled = false;
        pause_button.disabled = false;
    }
}
function process_step_result(result: Step_Result){
    animation_frame = undefined;
    switch (result){
        case Step_Result.Continue: {
            if (running){
                animation_frame = requestAnimationFrame(frame); 
                running = true;
                step_button.disabled = running;
                pause_button.disabled = false;
            }
        } break;
        case Step_Result.Input: {
            step_button.disabled = true;
            pause_button.disabled = true;
        } break;
        case Step_Result.Halt: {
            output_element.innerText += "Program halted";
            step_button.disabled = true;
            pause_button.disabled = true;
            pause_button.textContent = "Start";
            running = false
        } break;
        default: {
            console.warn("unkown step result");
        }
    }
    update_views()
}
function update_views(){
    const bits = emulator.bits
    const hexes = hex_size(bits);
    memory_view.innerText = memoryToString(emulator.memory as Arr, 0, emulator.memory.length, bits);
    register_view.innerText = 
        Array.from({length: register_count}, (v,i) => pad_center(Register[i], hexes) + " ").join("") +
        Array.from({length: emulator.registers.length - register_count}, (_,i) => pad_center(`R${i+1}`, hexes) + " ").join("") + "\n" +
        Array.from(emulator.registers, (v)=> hex(v, hexes) + " ").join("");
}

function memoryToString(view: Arr, from = 0x0, length=0x1000, bits=8){
    const width = 0x10;
    const end = Math.min(from+length, view.length);
    const hexes = hex_size(bits)
    let lines: string[] = [
        " ".repeat(hexes) + Array.from({length: width}, (_,i)=>{
        return pad_center(hex(i, 1), hexes); 
    }).join(" ") ];

    for (let i = from; i < end;){
        const sub_end = Math.min(i + width, end);
        let subs = [];
        const addr = hex(0| i / width, hexes-1, " ");
        for (; i < sub_end; i++){
            subs.push(hex(view[i], hexes));
        }
        const line =  subs.join(" ");
        lines.push(addr + " ".repeat(hexes - addr.length) + line);
    }
    return lines.join("\n");
}

change_color_mode();
