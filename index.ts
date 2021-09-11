import { compile } from "./emulator/compiler.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Color_Mode, Display } from "./emulator/devices/display.js";
import { Emulator } from "./emulator/emulator.js";
import { IO_Port } from "./emulator/instructions.js";
import { parse } from "./emulator/parser.js";
import { enum_from_str, expand_warning } from "./emulator/util.js";

const source_input = document.getElementById("urcl-source") as HTMLTextAreaElement;
if (!source_input){throw new Error("unable to get source input");}
const output_element = document.getElementById("output") as HTMLElement;
if (!output_element){throw new Error("unable to get output element");}


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
    }
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

const emulator = new Emulator();
emulator.input_devices[IO_Port.NUMB] = console_io.numb_in.bind(console_io);
emulator.output_devices[IO_Port.NUMB] = console_io.numb_out.bind(console_io);
emulator.input_devices[IO_Port.TEXT] = console_io.text_in.bind(console_io);
emulator.output_devices[IO_Port.TEXT] = console_io.text_out.bind(console_io);

emulator.input_devices[IO_Port.COLOR] = display.color_in.bind(display);
emulator.output_devices[IO_Port.COLOR] = display.color_out.bind(display);
emulator.input_devices[IO_Port.X] = display.x_in.bind(display);
emulator.output_devices[IO_Port.X] = display.x_out.bind(display);
emulator.input_devices[IO_Port.Y] = display.y_in.bind(display);
emulator.output_devices[IO_Port.Y] = display.y_out.bind(display);
emulator.input_devices[IO_Port.BUFFER] = display.buffer_in.bind(display);
emulator.output_devices[IO_Port.BUFFER] = display.buffer_out.bind(display);

const run_button = document.getElementById("run-button") as HTMLButtonElement;
run_button.addEventListener("click", run);
run();
source_input.addEventListener("input", run);
fetch("examples/urcl/display-io.urcl").then(res => res.text()).then((text) => {
    if (source_input.value){
        return;
    }
    source_input.value = text;
    run();
});


async function run(){
    run_button.disabled = true;
    run_button.innerText = "Running...";
try {
    display.buffer_out(0);
    output_element.innerText = "";
    console_output.innerText = "";
    const source = source_input.value;
    const parsed = parse(source);

    if (parsed.errors.length > 0){
        output_element.innerText = parsed.errors.map(v => "ERROR: " + expand_warning(v, parsed.lines)+"\n").join("");
        output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines)+"\n").join("");
        run_button.innerText = "Compile Error";
        return;
    }
    output_element.innerText += parsed.warnings.map(v => "Warning: " + expand_warning(v, parsed.lines)+"\n").join("");
    const [program, debug_info] = compile(parsed);
    emulator.load_program(program, debug_info);
    display.bits = emulator.bits;

    output_element.innerText += `
bits: ${emulator.bits}
register-count: ${emulator.registers.length}
memory-size: ${emulator.memory.length}
registers: [${emulator.registers}]
`;
    const pause = emulator.run();
    run_button.disabled = false;
    await pause;
} catch (e) {
    run_button.innerText = "Error";
    output_element.innerText += e;
    throw e;
}
    run_button.innerText = "Run";
}
