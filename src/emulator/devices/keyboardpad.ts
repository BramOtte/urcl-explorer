import { Gamepad_Key, PadI } from "./gamepad.js";

interface Game_Key {
    pad: number,
    key: Gamepad_Key
}

export interface Gamepad_Options {
    keymap?: Record<string, Game_Key>
}


const {
    A, B, SELECT, START, LEFT, RIGHT, UP, DOWN,
    Y, X, LB, RB, LEFT2, RIGHT2, UP2, DOWN2,
    LT, RT, LStick, RStick,
} = Gamepad_Key;

function k(key: number, pad = 0): Game_Key {
    return {key, pad}; 
}

export class KeyboardPad implements PadI {
    keymap: Record<string, undefined | Game_Key>;
    buttons = 0;
    constructor (options: Gamepad_Options = {}){
        this.keymap = options.keymap ?? {
            KeyK: k(A), KeyJ: k(B), KeyN: k(START), KeyV: k(SELECT), KeyA: k(LEFT), KeyD: k(RIGHT), KeyW: k(UP), KeyS: k(DOWN),
            KeyU: k(Y), KeyI: k(X), ShiftLeft: k(LB), KeyL: k(RB), ArrowLeft: k(LEFT2), ArrowRight: k(RIGHT2), ArrowUp: k(UP2), ArrowDown: k(DOWN2),
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
        return this.keymap[e.code]
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