import { Gamepad_Key } from "./gamepad.js";
const { A, B, SELECT, START, LEFT, RIGHT, UP, DOWN } = Gamepad_Key;
function k(key, pad = 0) {
    return { key, pad };
}
export class KeyboardPad {
    constructor(options = {}) {
        var _a;
        this.buttons = 0;
        this.onkeydown = (e) => {
            const k = this.key(e);
            if (k !== undefined) {
                this.buttons |= 1 << k.key;
            }
        };
        this.onkeyup = (e) => {
            const k = this.key(e);
            if (k !== undefined) {
                this.buttons &= ~(1 << k.key);
            }
        };
        this.keymap = (_a = options.keymap) !== null && _a !== void 0 ? _a : {
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
    cleanup() {
        removeEventListener("keydown", this.onkeydown);
        removeEventListener("keyup", this.onkeyup);
    }
    key(e) {
        return this.keymap[e.code.toLowerCase()];
    }
}
//# sourceMappingURL=keyboardpad.js.map