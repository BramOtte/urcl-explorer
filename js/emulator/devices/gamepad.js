import { IO_Port } from "../instructions.js";
export var Gamepad_Key;
(function (Gamepad_Key) {
    Gamepad_Key[Gamepad_Key["A"] = 0] = "A";
    Gamepad_Key[Gamepad_Key["B"] = 1] = "B";
    Gamepad_Key[Gamepad_Key["SELECT"] = 2] = "SELECT";
    Gamepad_Key[Gamepad_Key["START"] = 3] = "START";
    Gamepad_Key[Gamepad_Key["LEFT"] = 4] = "LEFT";
    Gamepad_Key[Gamepad_Key["RIGHT"] = 5] = "RIGHT";
    Gamepad_Key[Gamepad_Key["UP"] = 6] = "UP";
    Gamepad_Key[Gamepad_Key["DOWN"] = 7] = "DOWN";
})(Gamepad_Key || (Gamepad_Key = {}));
const { A, B, SELECT, START, LEFT, RIGHT, UP, DOWN } = Gamepad_Key;
export class Pad {
    keymap;
    pad1 = 0;
    constructor(options = {}) {
        this.keymap = options.keymap ?? {
            k: A, j: B, n: START, v: SELECT, a: LEFT, d: RIGHT, w: UP, s: DOWN,
        };
        addEventListener("keydown", this.onkeydown.bind(this));
        addEventListener("keyup", this.onkeyup.bind(this));
    }
    inputs = {
        [IO_Port.GAMEPAD]: () => this.pad1
    };
    key(e) {
        return this.keymap[e.key.toLowerCase()];
    }
    onkeydown(e) {
        const k = this.key(e);
        if (k !== undefined) {
            this.pad1 |= 1 << k;
        }
    }
    onkeyup(e) {
        const k = this.key(e);
        if (k !== undefined) {
            this.pad1 &= ~(1 << k);
        }
    }
}
//# sourceMappingURL=gamepad.js.map