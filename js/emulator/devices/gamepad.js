import { IO_Port } from "../instructions.js";
import { ControlPad } from "./controlpad.js";
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
export var Gamepad_Exes;
(function (Gamepad_Exes) {
    Gamepad_Exes[Gamepad_Exes["LEFT_X"] = 0] = "LEFT_X";
    Gamepad_Exes[Gamepad_Exes["LEFT_Y"] = 1] = "LEFT_Y";
    Gamepad_Exes[Gamepad_Exes["RIGHT_X"] = 2] = "RIGHT_X";
    Gamepad_Exes[Gamepad_Exes["RIGHT_Y"] = 3] = "RIGHT_Y";
})(Gamepad_Exes || (Gamepad_Exes = {}));
export class Pad {
    pads = [];
    gamepads = new Map();
    selected = 0;
    axis_index = 0;
    info_index = 0;
    constructor() {
        addEventListener("gamepadconnected", this.connect);
        addEventListener("gamepaddisconnected", this.disconnect);
    }
    cleanup() {
        for (const pad of this.pads) {
            pad?.cleanup?.();
        }
        removeEventListener("gamepadconnected", this.connect);
        removeEventListener("gamepaddisconnected", this.disconnect);
    }
    connect = (e) => {
        const pad = new ControlPad(e.gamepad);
        console.log(pad);
        this.gamepads.set(e.gamepad, pad);
        this.add_pad(pad);
    };
    disconnect = (e) => {
        const pad = this.gamepads.get(e.gamepad);
        if (pad !== undefined) {
            this.remove_pad(pad);
            this.gamepads.delete(e.gamepad);
        }
    };
    add_pad(pad) {
        this.pads.push(pad);
    }
    remove_pad(pad) {
        const index = this.pads.indexOf(pad);
        if (index < 0) {
            return;
        }
        this.pads[index] = undefined;
    }
    inputs = {
        [IO_Port.GAMEPAD]: () => this.pads[this.selected]?.buttons ?? 0,
        [IO_Port.AXIS]: () => this.pads[this.selected]?.axis?.(this.axis_index) ?? 0,
        [IO_Port.GAMEPAD_INFO]: () => this.pads[this.selected]?.info(this.info_index) ?? 0
    };
    outputs = {
        [IO_Port.GAMEPAD]: (i) => this.selected = i,
        [IO_Port.AXIS]: (i) => this.axis_index = i,
    };
}
//# sourceMappingURL=gamepad.js.map