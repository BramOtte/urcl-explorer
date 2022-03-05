import { IO_Port } from "../instructions.js";
import { Device } from "./device.js";

export class Keyboard implements Device {
    bits: number = 8;
    down: Uint8Array = new Uint8Array(256);
    keymap: Record<string, number> = {
        Digit1: 1,
        Digit2: 2,
        Digit3: 3,
        Digit4: 4,
        Digit5: 5,
        Digit6: 6,
        Digit7: 7,
        Digit8: 8,
        Digit9: 9,
        Digit0: 10,
    };
    offset: number = 0;
    constructor (){
        addEventListener("keydown", this.onkeydown.bind(this));
        addEventListener("keyup", this.onkeyup.bind(this));
    }
    inputs = {
        [IO_Port.KEY]: () => this.down.slice(this.offset, this.offset + this.bits)
            .reduceRight((acc, v) => (acc << 1) + v, 0),
    }
    outputs = {
        [IO_Port.KEY]: (i: number) => this.offset = i,
    }
    private key(k: string) {
        return this.keymap[k];
    }
    private onkeydown(e: KeyboardEvent){
        const k = this.key(e.code);
        if (k !== undefined){
            this.down[k] = 1;
        }
    }
    private onkeyup(e: KeyboardEvent){
        const k = this.key(e.code);
        if (k !== undefined){
            this.down[k] = 0;
        }
    }
}