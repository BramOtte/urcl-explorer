import { Gamepad_Key } from "./gamepad.js";
export class ControlPad {
    constructor(gamepad) {
        this.gamepad = gamepad;
        this.xbox_mapping = {
            0: 1 << Gamepad_Key.A,
            1: 1 << Gamepad_Key.B,
            8: 1 << Gamepad_Key.SELECT,
            9: 1 << Gamepad_Key.START,
            12: 1 << Gamepad_Key.UP,
            13: 1 << Gamepad_Key.DOWN,
            14: 1 << Gamepad_Key.LEFT,
            15: 1 << Gamepad_Key.RIGHT,
        };
    }
    info(index) {
        if (index == 0) {
            return 1;
        }
        else {
            return 0;
        }
    }
    chrome_fix() {
        const gamepad = navigator.getGamepads()[this.gamepad.index];
        if (gamepad !== null) {
            this.gamepad = gamepad;
        }
    }
    get buttons() {
        this.chrome_fix();
        let value = 0;
        this.gamepad.buttons.forEach((button, i) => {
            var _a;
            if (button.pressed) {
                value += (_a = this.xbox_mapping[i]) !== null && _a !== void 0 ? _a : 0;
            }
        });
        return value;
    }
    axis(index) {
        this.chrome_fix();
        const a = this.gamepad.axes[index];
        return a * 127;
    }
}
//# sourceMappingURL=controlpad.js.map