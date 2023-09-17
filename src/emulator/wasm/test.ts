import { exec } from "child_process";
import { compile } from "../compiler";
import { parse } from "../parser";
import { urcl2wasm } from "./urcl2wasm";
import { WASM_Reader } from "./wasm_reader";
import fs from "fs"

const example = `
IMM r1 1
IMM r2 1
OUT %NUMB r1
.loop
    OUT %NUMB r2
    ADD r1 r1 r2
    OUT %NUMB r1
    ADD r2 r1 r2
    BGE .loop 40 r1
`;

console.log(example);

const code = parse(example);
const [program, debug_info] = compile(code);
console.log(program);
const wasm = urcl2wasm(program, debug_info);


fs.writeFileSync("js/test.wasm", wasm);
exec("wasm2wat js/test.wasm -o js/test.wat");

new WASM_Reader(new DataView(wasm.buffer, wasm.byteOffset, wasm.byteLength)).wasm();

const module = await WebAssembly.instantiate(wasm, {
    env: {
        what(port: number, value: number) {
            console.log("out", port, value);
        }
    }
});

interface Exports {
    run(): void;
}

const exports = module.instance.exports as any as Exports;

console.log(exports.run());

