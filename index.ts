import { Console_IO } from "./emulator/devices/console-io.js";
import { emulator_new } from "./emulator/emulator.js";
import { IO_Ports } from "./emulator/instructions.js";

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
    (text) => {console_output.innerText += text}
);
    
source_input.addEventListener("input", onchange);
fetch("examples/urcl/fib.urcl").then(res => res.text()).then((text) => {
    if (source_input.value){
        return;
    }
    source_input.value = text;
    onchange();
});
function onchange(){
    const source = source_input.value;
    let emulator;
    try {
        emulator = emulator_new(source);
        console_output.innerText = "";
        emulator.input_devices[IO_Ports.NUMB] = console_io.numb_in.bind(console_io);
        emulator.output_devices[IO_Ports.NUMB] = console_io.numb_out.bind(console_io);
        emulator.output_devices[IO_Ports.TEXT] = console_io.text_out.bind(console_io);
        emulator.input_devices[IO_Ports.TEXT] = console_io.text_in.bind(console_io);
        emulator.run();
    } catch (e) {
        output_element.innerText = `ERROR: ${e}`;
        throw e;
    }
    output_element.innerText = `
bits: ${emulator.bits}
register-count: ${emulator.registers.length}
stack-size: ${emulator.stack.length}
heap-size: ${emulator.memory.length}
registers: [${emulator.registers}]
memory: [${emulator.memory.slice(0, 32)}]
`.trim();
    
}
