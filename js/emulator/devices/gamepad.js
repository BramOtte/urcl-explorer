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
    constructor() {
        this.pads = [];
        this.gamepads = new Map();
        this.selected = 0;
        this.axis_index = 0;
        this.info_index = 0;
        this.connect = (e) => {
            const pad = new ControlPad(e.gamepad);
            console.log(pad);
            this.gamepads.set(e.gamepad, pad);
            this.add_pad(pad);
        };
        this.disconnect = (e) => {
            const pad = this.gamepads.get(e.gamepad);
            if (pad !== undefined) {
                this.remove_pad(pad);
                this.gamepads.delete(e.gamepad);
            }
        };
        this.inputs = {
            [IO_Port.GAMEPAD]: () => { var _a, _b; return (_b = (_a = this.pads[this.selected]) === null || _a === void 0 ? void 0 : _a.buttons) !== null && _b !== void 0 ? _b : 0; },
            [IO_Port.AXIS]: () => { var _a, _b, _c; return (_c = (_b = (_a = this.pads[this.selected]) === null || _a === void 0 ? void 0 : _a.axis) === null || _b === void 0 ? void 0 : _b.call(_a, this.axis_index)) !== null && _c !== void 0 ? _c : 0; },
            [IO_Port.GAMEPAD_INFO]: () => { var _a, _b; return (_b = (_a = this.pads[this.selected]) === null || _a === void 0 ? void 0 : _a.info(this.info_index)) !== null && _b !== void 0 ? _b : 0; }
        };
        this.outputs = {
            [IO_Port.GAMEPAD]: (i) => this.selected = i,
            [IO_Port.AXIS]: (i) => this.axis_index = i,
        };
        addEventListener("gamepadconnected", this.connect);
        addEventListener("gamepaddisconnected", this.disconnect);
    }
    cleanup() {
        var _a;
        for (const pad of this.pads) {
            (_a = pad === null || pad === void 0 ? void 0 : pad.cleanup) === null || _a === void 0 ? void 0 : _a.call(pad);
        }
        removeEventListener("gamepadconnected", this.connect);
        removeEventListener("gamepaddisconnected", this.disconnect);
    }
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
}
//# sourceMappingURL=gamepad.js.map