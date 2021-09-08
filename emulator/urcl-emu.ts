// emulator cli
import { emulator_new } from "./emulator.js";
import * as fs from "fs";
import { argv, stdin, stdout } from "process";
import { IO_Ports } from "./instructions.js";
import { Console_IO } from "./devices/console-io.js";

const usage = `Usage: node urcl-emu.js <file name>`;

console.log(argv);

if (process.argv.length < 3){
    throw new Error(`Not enougth arguments\n${usage}\n`);
}
const file_name = argv[2];
// TODO: handle error
const file = fs.readFileSync(file_name, {"encoding": "utf-8"}).toString();
console.log(file);
const emulator = emulator_new(file);
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
emulator.input_devices[IO_Ports.TEXT] = console_io.text_in.bind(console_io);
emulator.input_devices[IO_Ports.NUMB] = console_io.numb_in.bind(console_io);
emulator.output_devices[IO_Ports.TEXT] = console_io.text_out.bind(console_io);
emulator.output_devices[IO_Ports.NUMB] = console_io.numb_out.bind(console_io);

await emulator.run();
console.log("program halted");
