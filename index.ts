import { emulator_new } from "./emulator/emulator.js";

const source_input = document.getElementById("urcl-source") as HTMLElement;
if (!source_input){throw new Error("unable to get source input");}
const output = document.getElementById("output") as HTMLElement;
if (!output){throw new Error("unable to get output element");}

onchange();
source_input.addEventListener("input", onchange);
function onchange(){
    const source = source_input.innerText;
    console.log(source);
    let emulator;
    try {
        emulator = emulator_new(source);
        emulator.run();
    } catch (e) {
        output.innerText = `ERROR: ${e}`;
        throw e;
    }
    console.log(emulator);
    output.innerText = `
bits: ${emulator.bits}
register-count: ${emulator.registers.length}
stack-size: ${emulator.stack.length}
heap-size: ${emulator.memory.length}
registers: [${emulator.registers}]
memory: [${emulator.memory.slice(0, 32)}]
`.trim();
    
}
