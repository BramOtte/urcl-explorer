export enum Step_Result {
    Continue, Halt, Input, Debug
}

export type Step = () => Step_Result;
export type Burst = (length: number, max_duration: number) => [Step_Result, number];
export type Run = (max_duration: number) => [Step_Result, number];

export type UintArray = Uint8Array | Uint16Array | Uint32Array;
export type IntArray = Int8Array | Int16Array | Int32Array;