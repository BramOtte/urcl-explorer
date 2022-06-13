import { IO_Port } from "../instructions.js";
import { Device } from "./device.js";

export class Clock implements Device {
    wait_end = 0;
    time_out?: any;
    inputs = {
        [IO_Port.WAIT]: this.wait_in,
    }
    outputs = {
        [IO_Port.WAIT]: this.wait_out,
    }
    wait_out(time: number){
        if (time === 0){
            this.wait_end = -1;
        } else {
            this.wait_end = Date.now() + time;
        }
    }
    wait_in(callback: (value: number)=>void) {
        if (this.wait_end == -1){
            requestAnimationFrame((dt) => callback(dt));
        } else {
            this.time_out = setTimeout(()=>callback(1), this.wait_end - Date.now());
        }
    }

    reset(){
        this.wait_end = 0;
        if (this.time_out !== undefined){
            clearTimeout(this.time_out);
        }
    }
}
