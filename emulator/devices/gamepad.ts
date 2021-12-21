import { IO_Port } from "../instructions.js";
import { Device } from "./device.js";


interface Game_Key {
    pad: number,
    key: Gamepad_Key
}

export interface Gamepad_Options {
    keymap?: Record<string, Game_Key>
}

export enum Gamepad_Key {
    A, B, SELECT, START, LEFT, RIGHT, UP, DOWN
}
const {A, B, SELECT, START, LEFT, RIGHT, UP, DOWN} = Gamepad_Key;

function k(key: number, pad = 0): Game_Key{
    return {key, pad}; 
}

export class Pad implements Device {
    keymap: Record<string, Game_Key>;
    pads = [0]
    selected = 0
    constructor (options: Gamepad_Options = {}){
        this.keymap = options.keymap ?? {
            k: k(A), j: k(B), n: k(START), v: k(SELECT), a: k(LEFT), d: k(RIGHT), w: k(UP), s: k(DOWN),
        };
        addEventListener("keydown", this.onkeydown.bind(this));
        addEventListener("keyup", this.onkeyup.bind(this));
    }
    inputs = {
        [IO_Port.GAMEPAD]: () => this.pads[this.selected] ?? 0
    }
    outputs = {
        [IO_Port.GAMEPAD]: (i: number) => this.selected = i
    }

    private key(e: KeyboardEvent): Game_Key | undefined {
        return this.keymap[e.key.toLowerCase()]
    }
    private onkeydown(e: KeyboardEvent){
        const k = this.key(e);
        if (k !== undefined){
            this.pads[k.pad] |= 1 << k.key;
        }
    }
    private onkeyup(e: KeyboardEvent){
        const k = this.key(e);
        if (k !== undefined){
            this.pads[k.pad] &= ~(1 << k.key);
        }
    }
}