import { IO_Port } from "../instructions.js";
import {Storage} from "./storage.js";
import fs from "fs";

export class Node_Storage extends Storage {
    buffer: string = "";
    constructor(public bits: number, little_endian: boolean, size: number){
        super(bits, little_endian, size);

        this.outputs[IO_Port.FILE] = (char: number) => {
            this.buffer += String.fromCodePoint(char);
        }
        this.inputs[IO_Port.FILE] = (cb) => {
            const file_name = this.buffer;
            this.buffer = "";
            fs.readFile(file_name, (err, data) => {
                if (err){
                    cb(-1);
                } else {
                    this.set_bytes(data);
                    cb(0);
                }
            });
        }
    }
}