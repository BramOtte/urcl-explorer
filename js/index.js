import { emulator_new } from "./emulator/emulator.js";
const source_input = document.getElementById("urcl-source");
if (!source_input) {
    throw new Error("unable to get source input");
}
const output = document.getElementById("output");
if (!output) {
    throw new Error("unable to get output element");
}
onchange();
source_input.addEventListener("input", onchange);
function onchange() {
    const source = source_input.innerText;
    console.log(source);
    let emulator;
    try {
        emulator = emulator_new(source);
        emulator.run();
    }
    catch (e) {
        output.innerText = `ERROR: ${e}`;
        throw e;
    }
    console.log(emulator);
    output.innerText = `
specs: ${JSON.stringify(emulator.specs, null, 2)}
registers: [${emulator.registers}]
memory: [${emulator.memory.slice(0, 32)}]
`.trim();
}
//# sourceMappingURL=index.js.map