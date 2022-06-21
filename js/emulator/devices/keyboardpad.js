import { Gamepad_Key } from "./gamepad.js";
const { A, B, SELECT, START, LEFT, RIGHT, UP, DOWN } = Gamepad_Key;
function k(key, pad = 0) {
    return { key, pad };
}
export class KeyboardPad {
    keymap;
    buttons = 0;
    constructor(options = {}) {
        this.keymap = options.keymap ?? {
            keyk: k(A), keyj: k(B), keyn: k(START), keyv: k(SELECT), keya: k(LEFT), keyd: k(RIGHT), keyw: k(UP), keys: k(DOWN),
        };
        addEventListener("keydown", this.onkeydown);
        addEventListener("keyup", this.onkeyup);
    }
    info(index) {
        if (index == 0) {
            return 1;
        }
        else {
            return 0;
        }
    }
    axis;
    cleanup() {
        removeEventListener("keydown", this.onkeydown);
        removeEventListener("keyup", this.onkeyup);
    }
    key(e) {
        return this.keymap[e.code.toLowerCase()];
    }
    onkeydown = (e) => {
        const k = this.key(e);
        if (k !== undefined) {
            this.buttons |= 1 << k.key;
        }
    };
    onkeyup = (e) => {
        const k = this.key(e);
        if (k !== undefined) {
            this.buttons &= ~(1 << k.key);
        }
    };
}
//# sourceMappingURL=keyboardpad.js.map