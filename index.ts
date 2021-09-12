import { compile } from "./emulator/compiler.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Color_Mode, Display } from "./emulator/devices/display.js";
import { Emulator, Step_Result } from "./emulator/emulator.js";
import { IO_Port } from "./emulator/instructions.js";
import { parse } from "./emulator/parser.js";
import { enum_from_str, expand_warning } from "./emulator/util.js";

let animation_frame: number | undefined;

const source_input = document.getElementById("urcl-source") as HTMLTextAreaElement;
const output_element = document.getElementById("output") as HTMLElement;


const console_input = document.getElementById("stdin") as HTMLInputElement;
const console_output = document.getElementById("stdout") as HTMLElement;
let input_callback: undefined | (() => void);


console_input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input_callback){
        input_callback();
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
    () => input_callback = undefined
);
const canvas = document.getElementsByTagName("canvas")[0];
const display = new Display(canvas, 32, 32, 32);
const color_mode_input = document.getElementById("color-mode") as HTMLOptionElement;
color_mode_input.addEventListener("change", change_color_mode);
change_color_mode();
function change_color_mode(){
    const color_mode = enum_from_str(Color_Mode, color_mode_input.value);
    console.log(color_mode_input.value, color_mode);
    display.color_mode = color_mode ?? display.color_mode;
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
emulator.add_io_device(IO_Port.TEXT,
    console_io.text_in.bind(console_io),
    console_io.text_out.bind(console_io),
    console_io.reset.bind(console_io)
);
emulator.add_io_device(IO_Port.NUMB,
    console_io.numb_in.bind(console_io),
    console_io.numb_out.bind(console_io),
    console_io.reset.bind(console_io)
);
emulator.add_io_device(IO_Port.COLOR,
    display.color_in.bind(display),
    display.color_out.bind(display),
    display.reset.bind(display)
);
emulator.add_io_device(IO_Port.X,
    display.x_in.bind(display),
    display.x_out.bind(display),
    display.reset.bind(display)
);
emulator.add_io_device(IO_Port.Y,
    display.y_in.bind(display),
    display.y_out.bind(display),
    display.reset.bind(display)
);
emulator.add_io_device(IO_Port.BUFFER,
    display.buffer_in.bind(display),
    display.buffer_out.bind(display),
    display.reset.bind(display)
);

source_input.addEventListener("input", compile_and_run);
fetch("examples/urcl/text-io.urcl").then(res => res.text()).then((text) => {
    if (source_input.value){
        return;
    }
    source_input.value = text;
    compile_and_run();
});


const compile_and_run_button = document.getElementById("compile-and-run-button") as HTMLButtonElement;
compile_and_run_button.addEventListener("click", compile_and_run);
const pause_button = document.getElementById("pause-button") as HTMLButtonElement;
const compile_and_reset_button = document.getElementById("compile-and-reset-button") as HTMLButtonElement;
const step_button = document.getElementById("step-button") as HTMLButtonElement;
function compile_and_run(){
    compile_and_reset();
    pause_button.textContent = "Pause";
    pause_button.disabled = false;
    if (animation_frame === undefined){
        animation_frame = requestAnimationFrame(frame);
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
    console_output.innerText = "";
} catch (e: any){
    output_element.innerText += "ERROR: " + e;
    throw e;
}
}

function frame(){
    compile_and_run_button.disabled = false;
    pause_button.disabled = false;
    compile_and_reset_button.disabled = false;
    step_button.disabled = false;
    animation_frame = undefined;
    switch (emulator.run(16)){
        case Step_Result.Continue: {
            animation_frame = requestAnimationFrame(frame); 
        } break;
        case Step_Result.Input: {

        } break;
        case Step_Result.Halt: {
            output_element.innerText += "Program halted";
        } break;
        default: {
            console.warn("unkown step result");
        }
    }
}
