// emulator cli
import { emulator_new } from "./emulator.js";
import * as fs from "fs";
import { argv } from "process";
import { IO_Ports } from "./instructions.js";

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
emulator.ouput_devices[IO_Ports.NUMB] = async (num) => {
    process.stdout.write(""+num);
};
emulator.ouput_devices[IO_Ports.TEXT] = async (num) => {
    process.stdout.write(String.fromCodePoint(num));
};
await emulator.run();
console.log("program halted");
