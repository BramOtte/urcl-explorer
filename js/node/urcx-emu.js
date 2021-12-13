import fs from "fs/promises";
import { exit, stdin, stdout } from "process";
import { Console_IO } from "../emulator/devices/console-io.js";
import { Emulator, Step_Result } from "../emulator/emulator.js";
import { compile } from "../emulator/compiler.js";
import { parse } from "../emulator/parser.js";
import { parse_argv } from "./args.js";
import { Storage } from "../emulator/devices/storage.js";
import { URCL_Header } from "../emulator/instructions.js";
function error(msg) {
    console.error(`ERROR: ${msg}\n${usage}\n`);
    exit(1);
}
const usage = `Usage: urcx-emu [<...options>] <filename>
    --storage <file>
        the file the storage device should open
    
    --storage-size <kibibytes>
        how big the storage file will be

    --text-file <file>
        file to be read into %TEXT
`;
const { args, flags } = parse_argv({
    __storage: "",
    __storage_size: 0,
    __text_file: "",
});
const { __storage, __storage_size, __text_file } = flags;
if (args.length < 1) {
    throw new Error("Not enough arguments");
}
const urcl = (await fs.readFile(args[0])).toString();
const emulator = new Emulator(frame);
const console_io = new Console_IO({
    read(callback) {
        stdin.resume();
        stdin.once("data", (data) => {
            this.text = data.toString();
            callback();
            stdin.pause();
        });
    },
    text: "",
}, (text) => { stdout.write(text); }, () => { });
emulator.add_io_device(console_io);
const code = parse(urcl);
if (code.errors.length > 0) {
    console.error(code.errors, code.warnings);
    exit(1);
}
if (code.warnings.length > 0) {
    console.warn(code.warnings);
}
const [program, debug_info] = compile(code);
debug_info.file_name = args[0];
emulator.load_program(program, debug_info);
let bytes;
if (__storage) {
    const file = (await fs.readFile(__storage));
    bytes = file;
    if (__storage_size) {
        bytes = new Uint8Array(__storage_size * 1024);
        bytes.set(file);
    }
    const storage = new Storage(program.headers[URCL_Header.BITS].value, bytes);
    emulator.add_io_device(storage);
}
if (__text_file) {
    const text = (await fs.readFile(__text_file, { "encoding": "utf-8" })).toString();
    console_io.set_text(text);
}
setTimeout(frame, 1);
async function frame() {
    try {
        switch (emulator.run(2000)) {
            case Step_Result.Continue:
                {
                    emulator.warn("Long running program");
                    setTimeout(frame, 1);
                }
                break;
            case Step_Result.Input: break;
            case Step_Result.Halt:
                {
                    await on_halt();
                    exit(0);
                }
                break;
            default: {
                console.error("\nunknown step result");
            }
        }
    }
    catch (e) {
        console.error(e.message);
        exit(1);
    }
}
async function on_halt() {
    if (__storage && bytes) {
        await fs.writeFile(__storage, bytes);
    }
}
//# sourceMappingURL=urcx-emu.js.map