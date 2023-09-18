import { exec } from "child_process";
import { compile } from "../compiler";
import { parse } from "../parser";
import { urcl2wasm } from "./urcl2wasm";
import { WASM_Reader } from "./wasm_reader";
import fs from "fs"
import { URCL_Header } from "../instructions";


const file_name = "examples/urcl/prime-sieve32.urcl";
// const file_name = "js/test.urcl";
const example = fs.readFileSync(file_name, {encoding: "utf8"});
// const example = `
// OUT %NUMB 10
// JMP .skip
// OUT %NUMB 20
// .skip
// OUT %NUMB 30
// `;

console.log(example);

const code = parse(example);
const [program, debug_info] = compile(code);
debug_info.file_name = file_name;
console.log(program);
const wasm = urcl2wasm(program, debug_info);


fs.writeFileSync("js/test.wasm", wasm);
exec("wasm2wat js/test.wasm -o js/test.wat");

// new WASM_Reader(new DataView(wasm.buffer, wasm.byteOffset, wasm.byteLength)).wasm();

const min_heap = program.headers[URCL_Header.MINHEAP].value;
const min_stack = program.headers[URCL_Header.MINSTACK].value;
const min_reg = program.headers[URCL_Header.MINREG].value;
const bits = program.headers[URCL_Header.BITS].value;


const block_size = 1024 * 64;
const memory_size = min_heap + min_stack + min_reg;
const wasm_block_count = Math.ceil(memory_size * (bits / 8) / block_size);
console.log(">>>", wasm_block_count);
const memory = new WebAssembly.Memory({
    initial: wasm_block_count
});

const module = await WebAssembly.instantiate(wasm, {
    env: {
        memory,
        in(port: number): number {
            console.log("in", port);
            return 0;
        },
        out(port: number, value: number) {
            console.log("out", port, value);
            if (port === 420) {
                const line_nr = debug_info.pc_line_nrs[value];
                const line = debug_info.lines[line_nr];
                console.log(`${debug_info.file_name}:${line_nr + 1}: assert failed\n\t${line}`)
            }
        }
    }
});

interface Exports {
    run(): void;
}

const exports = module.instance.exports as any as Exports;

console.log(exports.run());

