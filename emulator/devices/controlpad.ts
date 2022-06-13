import { Gamepad_Key, PadI } from "./gamepad.js";


export class ControlPad implements PadI {
    xbox_mapping: Record<number, number> = {
        0: 1 << Gamepad_Key.A,
        1: 1 << Gamepad_Key.B,
        8: 1 << Gamepad_Key.SELECT,
        9: 1 << Gamepad_Key.START,
        12: 1 << Gamepad_Key.UP,
        13: 1 << Gamepad_Key.DOWN,
        14: 1 << Gamepad_Key.LEFT,
        15: 1 << Gamepad_Key.RIGHT,

    }

    constructor (private gamepad: Gamepad){
    }
    info(index: number): number {
        if (index == 0){
            return 1;
        } else {
            return 0;
        }
    }
    cleanup?: (() => void) | undefined;
    private chrome_fix(){
        const gamepad = navigator.getGamepads()[this.gamepad.index];
        if (gamepad !== null){
            this.gamepad = gamepad;
        }
    }
    get buttons(): number {
        this.chrome_fix();
        let value = 0;
        this.gamepad.buttons.forEach((button, i) => {if (button.pressed) {
            value += this.xbox_mapping[i] ?? 0;
        }})
        return value;
    }
    axis(index: number){
        this.chrome_fix();
        const a = this.gamepad.axes[index];
        return a * 127;
    }
}