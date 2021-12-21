import { IO_Port } from "../instructions.js";
import { Device } from "./device.js";

export interface Gamepad_Options {
    keymap?: Record<string, Gamepad_Key>
}

export enum Gamepad_Key {
    A, B, SELECT, START, LEFT, RIGHT, UP, DOWN
}
const {A, B, SELECT, START, LEFT, RIGHT, UP, DOWN} = Gamepad_Key;

export class Pad implements Device {
    keymap: Record<string, Gamepad_Key>;
    pad1 = 0
    constructor (options: Gamepad_Options = {}){
        this.keymap = options.keymap ?? {
            k: A, j: B, n: START, v: SELECT, a: LEFT, d: RIGHT, w: UP, s: DOWN,
        };
        addEventListener("keydown", this.onkeydown.bind(this));
        addEventListener("keyup", this.onkeyup.bind(this));
    }
    inputs = {
        [IO_Port.GAMEPAD]: () => this.pad1
    }

    private key(e: KeyboardEvent): Gamepad_Key | undefined {
        return this.keymap[e.key.toLowerCase()];
    }
    private onkeydown(e: KeyboardEvent){
        const k = this.key(e);
        if (k !== undefined){
            this.pad1 |= 1 << k;
        }
    }
    private onkeyup(e: KeyboardEvent){
        const k = this.key(e);
        if (k !== undefined){
            this.pad1 &= ~(1 << k);
        }
    }
}