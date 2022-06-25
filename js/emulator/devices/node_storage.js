import { IO_Port } from "../instructions.js";
import { Storage } from "./storage.js";
import fs from "fs";
export class Node_Storage extends Storage {
    bits;
    buffer = "";
    constructor(bits, little_endian, size) {
        super(bits, little_endian, size);
        this.bits = bits;
        this.outputs[IO_Port.FILE] = (char) => {
            this.buffer += String.fromCodePoint(char);
        };
        this.inputs[IO_Port.FILE] = (cb) => {
            const file_name = this.buffer;
            this.buffer = "";
            fs.readFile(file_name, (err, data) => {
                if (err) {
                    cb(-1);
                }
                else {
                    this.set_bytes(data);
                    cb(0);
                }
            });
        };
    }
}
//# sourceMappingURL=node_storage.js.map