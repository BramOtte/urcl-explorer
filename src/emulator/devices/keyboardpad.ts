import { Gamepad_Key, PadI } from "./gamepad.js";

interface Game_Key {
    pad: number,
    key: Gamepad_Key
}

export interface Gamepad_Options {
    keymap?: Record<string, Game_Key>
}


const {A, B, SELECT, START, LEFT, RIGHT, UP, DOWN} = Gamepad_Key;

function k(key: number, pad = 0): Game_Key{
    return {key, pad}; 
}

export class KeyboardPad implements PadI {
    keymap: Record<string, undefined | Game_Key>;
    buttons = 0;
    constructor (options: Gamepad_Options = {}){
        this.keymap = options.keymap ?? {
            keyk: k(A), keyj: k(B), keyn: k(START), keyv: k(SELECT), keya: k(LEFT), keyd: k(RIGHT), keyw: k(UP), keys: k(DOWN),
        };
        addEventListener("keydown", this.onkeydown);
        addEventListener("keyup", this.onkeyup);
    }
    info(index: number): number {
        if (index == 0){
            return 1;
        } else {
            return 0;
        }
    }
    axis?: ((index: number) => number | undefined) | undefined;

    cleanup(){
        removeEventListener("keydown", this.onkeydown);
        removeEventListener("keyup", this.onkeyup);
    }
    

    private key(e: KeyboardEvent): Game_Key | undefined {
        return this.keymap[e.code.toLowerCase()]
    }
    private onkeydown = (e: KeyboardEvent) => {
        const k = this.key(e);
        if (k !== undefined){
            this.buttons |= 1 << k.key;
        }
    }
    private onkeyup = (e: KeyboardEvent) => {
        const k = this.key(e);
        if (k !== undefined){
            this.buttons &= ~(1 << k.key);
        }
    }
}