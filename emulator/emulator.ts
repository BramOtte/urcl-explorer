import { Word, Arr } from "./util.js";
import {Opcode, Operant_Operation, Operant_Prim, Opcodes_operants, Instruction_Ctx, URCL_Header, IO_Port, Register, Header_Run, register_count} from "./instructions.js";
import { Debug_Info, Program } from "./compiler.js";

export enum Step_Result {
    Continue, Halt, Input
}

type Device_Input = ((callback: (value: Word) => void) => undefined | number) | (() => number);
type Device_Output = (value: Word) => void;
type Device_Reset = ()=>void;

export class Emulator implements Instruction_Ctx {
    public program!: Program;
    public debug_info!: Debug_Info;
    constructor(public on_continue: ()=>void){
    }
    load_program(program: Program, debug_info: Debug_Info){
        this.program = program, this.debug_info = debug_info;
        const bits = program.headers[URCL_Header.BITS].value;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        const registers = program.headers[URCL_Header.MINREG].value + register_count;
        const run = program.headers[URCL_Header.RUN].value;
        if (run === Header_Run.RAM){
            throw new Error("emulator currently doesn't support running in ram");
        }
        let WordArray;
        if (bits <= 8){
            WordArray = Uint8Array;
            this.bits = 8;
        } else if (bits <= 16){
            WordArray = Uint16Array;
            this.bits = 16;
        } else if (bits <= 32){
            WordArray = Uint32Array;
            this.bits = 32;
        } else {
            throw new Error(`BITS = ${bits} exceeds 32 bits`);
        }
        if (registers >= this.max_value){
            throw new Error(`Too many registers ${registers}, must be <= ${this.max_value}`)
        }
        if (heap + stack > this.max_value){
            throw new Error(`Too much memory heap:${heap} + stack:${stack} = ${heap+stack}, must be <= ${this.max_value+1}`);
        }
        this.registers = new WordArray(this.buffer, 0, registers).fill(0);
        this.memory = new WordArray(this.buffer, registers * WordArray.BYTES_PER_ELEMENT, heap + stack).fill(0);

        this.reset();
    }
    private reset(){
        this.stack_ptr = this.memory.length-1;
        this.pc = 0;
        for (let port in this.device_resets){
            const reset = this.device_resets[port as any as IO_Port];
            if (reset){
                reset();
            }
        }
    }
    buffer = new ArrayBuffer(1024*1024*512);
    registers: Arr & {byteLength: number, byteOffset: number, [Symbol.iterator](): IterableIterator<number> } = new Uint8Array(32);
    memory: Arr & {byteLength: number, byteOffset: number} = new Uint8Array(256);
    get pc(){
        return this.registers[Register.PC];
    }
    set pc(value: Word){
        this.registers[Register.PC] = value;
    }
    get stack_ptr(){
        return this.registers[Register.SP];
    }
    set stack_ptr(value: Word){
        this.registers[Register.SP] = value;
    }
    bits = 8;
    private device_inputs: {[K in IO_Port]?: Device_Input} = {};
    private device_outputs: {[K in IO_Port]?: Device_Output} = {};
    private device_resets: {[K in IO_Port]?: Device_Reset} = {};
    public add_io_device(port: IO_Port, input: Device_Input, output: Device_Output, reset: Device_Reset){
        this.device_inputs[port] = input;
        this.device_outputs[port] = output;
        this.device_resets[port] = reset;
    }
    

    get max_value(){
        return 0xff_ff_ff_ff >>> (32 - this.bits);
    }
    get max_signed(){
        return (1 << (this.bits-1)) - 1;
    }
    get sign_bit(){
        return (1 << (this.bits-1));
    }
    push(value: Word): void {
        this.memory[this.stack_ptr--] = value;
    }
    pop(): Word { 
        return this.memory[++this.stack_ptr];
    }
    in(port: Word, target: Arr<Word>): boolean {
        const device = this.device_inputs[port as IO_Port];
        if (device === undefined){
            console.warn(`unsupported input device port ${port} (${IO_Port[port]}) ${this.line()}`);
            return false;
        }
        const res = device(this.finish_step_in.bind(this));
        if (res === undefined){
            return true;
        } else {
            target[0] = res as number;
            return false;
        }
    }
    out(port: Word, value: Word): void{
        const device = this.device_outputs[port as IO_Port];
        if (device === undefined){
            console.warn(`unsupported output device port ${port} (${IO_Port[port]}) ${this.line()}`);
            return;
        }
        device(value);
    }
    run(max_duration: number): Step_Result {
        const burst_length = 128;
        const end = Date.now() + max_duration;
        do {
            for (let i = 0; i < burst_length; i++){
                const res = this.step();
                if (res !== Step_Result.Continue){
                    return res;
                }
            }
        } while (Date.now() < end);
        return Step_Result.Continue;
    }
    step(): Step_Result {
        const pc = this.pc++;
        if (pc >= this.program.opcodes.length){return Step_Result.Halt;}
        const opcode = this.program.opcodes[pc];
        if (opcode === Opcode.HLT){
            return Step_Result.Halt;
        }
        const instruction = Opcodes_operants[opcode];
        if (instruction === undefined){throw new Error(`unkown opcode ${opcode} ${this.line()}`);}
        const [op_operations, func] = instruction;
        const op_types = this.program.operant_prims[pc];
        const op_values = this.program.operant_values[pc];
        const ops = op_operations.map(() => 0);
        let ram_offset = 0;
        for (let i = 0; i < op_operations.length; i++){
            switch (op_operations[i]){
                case Operant_Operation.GET: ops[i] = this.read(op_types[i], op_values[i]); break;
                case Operant_Operation.GET_RAM: ops[i] = this.memory[this.read(op_types[i], op_values[i]) + ram_offset]; break;
                case Operant_Operation.RAM_OFFSET: ram_offset = this.read(op_types[i], op_values[i]); break;
            }
        }
        if (func(ops, this)) {
            return Step_Result.Input;
        }
        for (let i = 0; i < op_operations.length; i++){
            switch (op_operations[i]){
                case Operant_Operation.SET: this.write(op_types[i], op_values[i], ops[i]); break;
                case Operant_Operation.SET_RAM: this.memory[this.read(op_types[i], op_values[i]) + ram_offset] = ops[i]; break;
            }
        }
        return Step_Result.Continue;
    }
    // this method only needs to be called for the IN instruction
    finish_step_in(result: Word){
        const pc = this.pc-1;
        const type = this.program.operant_prims[pc][0];
        const value = this.program.operant_values[pc][0];
        this.write(type, value, result);
        this.on_continue();
    }
    write(target: Operant_Prim, index: Word, value: Word){
        switch (target){
            case Operant_Prim.Reg: this.registers[index] = value;return;
            case Operant_Prim.Imm: throw new Error("Can't write to immediate");
            default: throw new Error(`Unknown operant target ${target} ${this.line()}`);
        }
    }
    read(source: Operant_Prim, value: Word){
        switch (source){
            case Operant_Prim.Imm: return value;
            case Operant_Prim.Reg: return this.registers[value];
            default: throw new Error(`Unknown operant source ${source} ${this.line()}`);
        }
    }
    line(){
        const {pc_line_nrs, lines} = this.debug_info;
        const line_nr = pc_line_nrs[this.pc-1];
        return `on line ${line_nr}, pc=${this.pc-1}\n${lines[line_nr]}`;
    }
}
