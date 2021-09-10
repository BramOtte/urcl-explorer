import { compile } from "./emulator/compiler.js";
import { Console_IO } from "./emulator/devices/console-io.js";
import { Emulator } from "./emulator/emulator.js";
import { IO_Port } from "./emulator/instructions.js";
import { parse } from "./emulator/parser.js";
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
});
const emulator = new Emulator();
emulator.input_devices[IO_Port.NUMB] = console_io.numb_in.bind(console_io);
emulator.output_devices[IO_Port.NUMB] = console_io.numb_out.bind(console_io);
emulator.output_devices[IO_Port.TEXT] = console_io.text_out.bind(console_io);
emulator.input_devices[IO_Port.TEXT] = console_io.text_in.bind(console_io);
onchange();
source_input.addEventListener("input", onchange);
fetch("examples/urcl/fib.urcl").then(res => res.text()).then((text) => {
    if (source_input.value) {
        return;
    }
    source_input.value = text;
    onchange();
});
async function onchange() {
    output_element.innerText = "";
    console_output.innerText = "";
    console.timeEnd("running");
    console.time("compiling");
    const source = source_input.value;
    const parsed = parse(source);
    if (parsed.errors.length > 0) {
        output_element.innerText = parsed.errors.map(v => v.message + `\n\ton line ${v.line_nr}`).join("\n");
        output_element.innerText += parsed.warnings.map(v => v.message + `\n\ton line ${v.line_nr}`).join("\n");
        return;
    }
    output_element.innerText += parsed.warnings.map(v => v.message + `\n\ton line ${v.line_nr}`).join("\n");
    const [program, debug_info] = compile(parsed);
    emulator.load_program(program, debug_info);
    console.timeEnd("compiling");
    console.time("running");
    await emulator.run();
    console.timeEnd("running");
    //     output_element.innerText = `
    // bits: ${emulator.bits}
    // register-count: ${emulator.registers.length}
    // stack-size: ${emulator.stack.length}
    // heap-size: ${emulator.memory.length}
    // registers: [${emulator.registers}]
    // memory: [${emulator.memory.slice(0, 32)}]
    // `.trim();
}
//# sourceMappingURL=index.js.map