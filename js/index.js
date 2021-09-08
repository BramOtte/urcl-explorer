import { emulator_new } from "./emulator/emulator.js";
import { IO_Ports } from "./emulator/instructions.js";
const source_input = document.getElementById("urcl-source");
if (!source_input) {
    throw new Error("unable to get source input");
}
const output_element = document.getElementById("output");
if (!output_element) {
    throw new Error("unable to get output element");
}
const console_input = document.getElementById("stdin");
const console_output = document.getElementById("stdout");
let input_callback;
console_input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input_callback) {
        if (input_callback(console_input.value)) {
            console_input.value = "";
            input_callback = undefined;
        }
    }
});
async function numb_in() {
    let number = NaN;
    while (Number.isNaN(number)) {
        console_output.innerText += "\nenter a number: ";
        number = await new Promise((res) => input_callback = (value) => {
            const num = parseInt(value);
            if (Number.isNaN(num)) {
                return false;
            }
            res(num);
            return true;
        });
    }
    console_output.innerText += `${number}\n`;
    return number;
}
async function numb_out(value) {
    console_output.innerText += value;
}
async function text_out(value) {
    console_output.innerText += String.fromCodePoint(value);
}
onchange();
source_input.addEventListener("input", onchange);
function onchange() {
    const source = source_input.innerText;
    let emulator;
    try {
        emulator = emulator_new(source);
        console_output.innerText = "";
        emulator.input_devices[IO_Ports.NUMB] = numb_in;
        emulator.ouput_devices[IO_Ports.NUMB] = numb_out;
        emulator.ouput_devices[IO_Ports.TEXT] = text_out;
        emulator.run();
    }
    catch (e) {
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
//# sourceMappingURL=index.js.map