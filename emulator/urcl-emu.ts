// emulator cli
import * as fs from "fs";
import { argv, exit, stdin, stdout } from "process";
import { IO_Port } from "./instructions.js";
import { Console_IO } from "./devices/console-io.js";
import { Emulator } from "./emulator.js";
import { compile } from "./compiler.js";
import { parse } from "./parser.js";

const usage = `Usage: node urcl-emu.js <file name>`;

console.log(argv);

if (process.argv.length < 3){
    throw new Error(`Not enougth arguments\n${usage}\n`);
}
const file_name = argv[2];
// TODO: handle error
const file = fs.readFileSync(file_name, {"encoding": "utf-8"}).toString();
console.log(file);
const emulator = new Emulator();
const console_io = new Console_IO({
    read(callback){
        stdin.resume();
        stdin.once("data", (data) => {
            this.text = data.toString();
            callback();
            stdin.pause();
        });
    },
    text: "",
    }, 
    (text) => {stdout.write(text)}
);
emulator.input_devices[IO_Port.TEXT] = console_io.text_in.bind(console_io);
emulator.input_devices[IO_Port.NUMB] = console_io.numb_in.bind(console_io);
emulator.output_devices[IO_Port.TEXT] = console_io.text_out.bind(console_io);
emulator.output_devices[IO_Port.NUMB] = console_io.numb_out.bind(console_io);

const code = parse(file);
if (code.errors.length > 0){
    console.log(code.errors, code.warnings);
    exit(1);
}
console.log(code.warnings);
const [program, debug_info] = compile(code);

emulator.load_program(program, debug_info);
await emulator.run();
console.log("program halted");
