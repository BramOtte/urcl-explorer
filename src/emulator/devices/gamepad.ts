import { IO_Port } from "../instructions.js";
import { Device } from "./device.js";
import { ControlPad } from "./controlpad.js";

export interface PadI {
    readonly buttons: number;
    info(index: number): number;
    axis?: (index: number) => undefined | number;
    cleanup?: () => void;
}

export enum Gamepad_Key {
    A, B, SELECT, START, LEFT, RIGHT, UP, DOWN,
    Y, X, LB, RB, LEFT2, RIGHT2, UP2, DOWN2,
    LT, RT, LStick, RStick
}

// TODO: map these to the correct axis depending on controller
export enum Gamepad_Axis {
    LEFT_X, LEFT_Y,
    RIGHT_X, RIGHT_Y,
}

export class Pad implements Device {
    pads: (undefined | PadI)[] = [];
    gamepads = new Map<Gamepad, PadI>();
    selected = 0;
    axis_index = 0;
    info_index = 0;
    constructor (){
        addEventListener("gamepadconnected", this.connect);
        addEventListener("gamepaddisconnected", this.disconnect);
    }

    cleanup(){
        for (const pad of this.pads){
            pad?.cleanup?.();
        }
        removeEventListener("gamepadconnected", this.connect);
        removeEventListener("gamepaddisconnected", this.disconnect);
    }

    private connect = (e: GamepadEvent) => {
        const pad = new ControlPad(e.gamepad);
        this.gamepads.set(e.gamepad, pad);
        this.add_pad(pad);
    }
    private disconnect = (e: GamepadEvent) => {
        const pad = this.gamepads.get(e.gamepad);
        if (pad !== undefined){
            this.remove_pad(pad);
            this.gamepads.delete(e.gamepad);
        }
    }

    add_pad(pad: PadI){
        this.pads.push(pad);
    }
    remove_pad(pad: PadI){
        const index = this.pads.indexOf(pad);
        if (index < 0){return;}
        this.pads[index] = undefined;
    }

    inputs = {
        [IO_Port.GAMEPAD]: () => this.pads[this.selected]?.buttons ?? 0,
        [IO_Port.AXIS]: () => this.pads[this.selected]?.axis?.(this.axis_index) ?? 0,
        [IO_Port.GAMEPAD_INFO]: () => this.pads[this.selected]?.info(this.info_index) ?? 0
    }
    outputs = {
        [IO_Port.GAMEPAD]: (i: number) => this.selected = i,
        [IO_Port.AXIS]: (i: number) => this.axis_index = i,
    }
}