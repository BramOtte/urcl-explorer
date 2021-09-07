// emulator cli
import { emulator_new } from "./emulator.js";
import * as fs from "fs";
import { argv } from "process";

const usage = `Usage: node urcl-emu.js <file name>`;

declare const process: {argv: string[]};
console.log(argv);

if (process.argv.length < 3){
    throw new Error(`Not enougth arguments\n${usage}\n`);
}
const file_name = argv[2];
// TODO: handle error
const file = fs.readFileSync(file_name, {"encoding": "utf-8"}).toString();
console.log(file);
const emulator = emulator_new(file);
emulator.run();
console.log(emulator);
