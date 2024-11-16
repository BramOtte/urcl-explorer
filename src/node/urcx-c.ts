import fsp from "fs/promises";
import fs from "fs";
import { urcl2c } from "../emulator/urcl2c.js";
import { exit, stdout } from "process";
import { parse } from "../emulator/parser.js";
import { compile } from "../emulator/compiler.js";
import { IO_Port, Opcode, Opcodes_operants, Operant_Operation } from "../emulator/instructions.js";
import { Emulator, Step_Result } from "../emulator/emulator.js";

const file_name = process.argv[2];
if (file_name === undefined) {
    console.error("missing file path");
    exit(1);
}

let urcl;
urcl = generated_tests();
fs.writeFileSync(file_name, urcl, {encoding: "utf8"});

const code = parse(urcl);
if (code.errors.length > 0){
    console.error(code.errors, code.warnings);
    exit(1);
}
if (code.warnings.length > 0){
    console.warn(code.warnings);
}
const [program, debug_info] = compile(code);
debug_info.file_name = file_name;


stdout.write(urcl2c(program, debug_info));


function generated_tests(): string {
    const bits = 16;
    const stack = 1000;
    let output = `BITS 16\nMINSTACK ${stack}\nMINHEAP ${(1 << bits) - stack}\n`;
    output += "\n";
    let test_count = 0;
    const max = 0xffffffff >>> (32 - bits);

    const inputs: {b: number, c: number}[] = [];
    for (const [key, [ops, func]] of Object.entries(Opcodes_operants)) {
        const opcode_string = Opcode[Number(key)];
        if (opcode_string.includes("__") || opcode_string === "OUT" || opcode_string === "IN" || opcode_string === "HLT") {
            continue;
        }
        const is_LMEM = opcode_string === "LLOD" || opcode_string === "LSTR";
        const is_SHIFT = opcode_string === "BSL" || opcode_string === "BSR" || opcode_string === "BSS";

        const then_label = `.then_${opcode_string}`;
        const end_label = `.end_${opcode_string}`;

        // sum does not exceed 0xffff to prevent segfault on LLOD and LSTR
        const b = 0| Math.random() * max;
        let c = 0| Math.random() * max;
        if (is_LMEM) {
            c = Math.min(c, max-b);
        }
        if (is_SHIFT) {
            c %= bits;
        }

        inputs.push({b, c});

        output += `IMM r1 ${then_label}\nIMM r2 ${b}\nIMM r3 ${c}\n`;
        output += `PSH r1\n`;
        output += opcode_string;
        for (let i = 1; i <= ops.length; ++i) {
            output += ` r${i}`;
        }
        output += ` /////\n`;
        output += `IMM r4 1\n`;
        output += `JMP ${end_label}\n`;
        output += `${then_label}\n`;
        output += `IMM r4 2\n`;
        output += `${end_label}\n`;
        output += `INC r5 r5\n`;
        output += `OUT %DBG_INT SP\n`;
        output += `OUT %DBG_INT r1\n`;
        output += `OUT %DBG_INT r2\n`;
        output += `OUT %DBG_INT r3\n`;
        output += `OUT %DBG_INT r4\n`;

        test_count += 1;
    }
    output += `@ASSERT_EQ r5 ${test_count}\n`;
    output += `HLT`;

    const code = parse(output);
    const [program, debug_info] = compile(code);
    const emulator = new Emulator({on_continue});
    const values: number[] = [];
    emulator.add_io_device({
        outputs: {
            [IO_Port.DBG_INT]: value => {
                values.push(value);
            }
        }
    })
    emulator.load_program(program, debug_info);

    const [result, steps] = emulator.run(1000);

    let final_output = "";
    {
        let i = 0;
        const out_dbg_int = "OUT %DBG_INT ";
        for (const value of values) {
            const start = output.indexOf(out_dbg_int, i);
            if (start < 0) {
                console.error("sad", final_output);
                exit(1);
            }
            final_output += output.substring(i, start);

            i = output.indexOf("\n", start) + 1;
            if (i <= 0) {
                i = output.length;
            }
            const reg = output.substring(start + out_dbg_int.length, i - 1);

            final_output += `@ASSERT_EQ ${reg} ${value}\n`;

        }
        final_output += output.substring(i); 
    }

    return final_output;


    async function on_continue(){
        try {
            const [res, its] = emulator.run(2000)
            switch (res){
                case Step_Result.Continue: {
                    emulator.warn("Long running program");
                    setTimeout(on_continue, 1); 
                } break;
                case Step_Result.Input: break;
                case Step_Result.Halt: {
                    return;
                } break;
                default: {
                    console.error("\nunknown step result");
                    exit(1);
                }
            }
        } catch (e) {
            console.error((e as Error).message);
            exit(1);
        }
    }
}

