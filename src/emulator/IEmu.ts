import { Device, Device_Host, Device_Output, Device_Reset } from "./devices/device";
import { Instruction_Ctx, IO_Port } from "./instructions.js";

export enum Step_Result {
    Continue, Halt, Input, Debug
}

export type Step = (this: IEmu) => Step_Result;
export type Burst = (this: IEmu, length: number, max_duration: number) => [Step_Result, number];
export type Run = (this: IEmu, max_duration: number) => [Step_Result, number];

export type UintArray = Uint8Array | Uint16Array | Uint32Array;
export type IntArray = Int8Array | Int16Array | Int32Array;

interface IEmu extends Device_Host {
    step: Step;
    burst: Burst;
    run: Run;
}

type Async_Input = (cb: (input: number) => void) => void;


class Device_Interface implements Device_Host {
    bits?: number | undefined;
    reset?: Device_Reset | undefined;
    cleanup?: (() => void) | undefined;
    
    add_io_device(device: Device): void {
        this.devices.push(device);
        // TODO: check for duplicate ports

        for (const [port, input] of Object.entries(device.inputs ?? {})) {
            if (input.length === 0) {
                this.inputs[Number(port)] = (cb: (value: number) => void) => cb((input as () => number)());
            } else {
                this.inputs[Number(port)] = input.bind(input);
            }
        }

        for (const [port, output] of Object.entries(device.outputs ?? {})) {
            this.outputs[Number(port)] = output;
        }

        throw new Error("Method not implemented.");
        // device.
        
    }
    
    private devices: Device[] = [];
    private inputs: {[K in number]?: Async_Input} = [];
    private outputs: {[K in number]?: Device_Output} = [];
}