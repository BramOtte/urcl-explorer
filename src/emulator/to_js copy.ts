import { Debug_Info, Program } from "./compiler.js";
import { Device, Device_Host, Device_Input, Device_Output, Device_Reset } from "./devices/device.js";
import { Step_Result } from "./emulator.js";
import { Instruction_Ctx, IO_Port, Opcode, Opcodes_operants, Operant_Operation, Operant_Prim, Register, register_count, URCL_Header } from "./instructions.js";
import {Burst, Run} from "./IEmu.js";

type UintArray = Uint8Array | Uint16Array | Uint32Array;
type IntArray = Int8Array | Int16Array | Int32Array;

type Step = (this: Emu) => Step_Result;

const {SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO} = Operant_Operation;

interface Emu_Options {
    error?: (a: string) => never;
    warn?: (a: string) => void;
    on_continue?: ()=>void;
    max_memory?: ()=>number;
}

export class Emu implements Device_Host, Instruction_Ctx {   
    constructor(public options: Emu_Options){

    }

    m_set(a: number, v: number): void {
        this.memory[a] = v;
    }
    m_get(a: number): number {
        return this.memory[a]
    }
    push(value: number): void {
        this.memory[--this.stack_pointer] = value;
    }
    pop(): number {
        return this.memory[this.stack_pointer++]
    }
    warn(msg: string): void {
        console.warn(msg);
    }
    error(msg: string): never {
        const {pc_line_nrs, lines, file_name} = this.debug_info;
        const line_nr = pc_line_nrs[this.pc-1];
        const content = `${file_name??"eval"}:${line_nr + 1} - ERROR - ${msg}\n    ${lines[line_nr]}\n`;

        throw Error(content);
    }

    registers!: UintArray;
    registers_s!: IntArray;
    
    memory!: UintArray;

    step!: Step;

    pc: number = 0;

    bits!: number;
    max_value!: number;
    max_signed!: number;
    sign_bit!: number;

    get stack_pointer() {
        return this.registers[Register.SP];
    }
    set stack_pointer(value: number) {
        this.registers[Register.SP] = value;
    }
    
    program!: Program;
    debug_info!: Debug_Info;

    load_program(program: Program, debug_info: Debug_Info) {
        for (const reset of this.device_resets) {
            reset();
        }

        this.pc = 0;
        this.program = program;
        this.debug_info = debug_info;
        const reg_count = program.headers[URCL_Header.MINREG].value + register_count;
        const static_data = program.data;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        this.bits = program.headers[URCL_Header.BITS].value;
        this.max_value = 0xffff_ffff >>> (32 - this.bits);
        this.max_signed = this.max_value >>> 1;
        this.sign_bit = 1 << (this.bits - 1);

        let UintArray;
        let IntArray;
        switch (this.bits) {
            case 8:
                UintArray = Uint8Array;
                IntArray = Int8Array;
                break;
            case 16:
                UintArray = Uint16Array;
                IntArray = Int16Array;
                break;
            case 32:
                UintArray = Uint32Array;
                IntArray = Int32Array;
                break;
            default: throw new Error(">:(");
        }

        this.registers = new UintArray(reg_count);
        this.registers_s = new IntArray(this.registers.buffer);

        const memory_size = heap + stack + static_data.length
        this.memory = new UintArray(memory_size);
        this.memory.set(static_data);

        const max_duration = "max_duration";
        const burst_length = 1024;

        console.log(program);
        let step = "switch(this.pc) {\n";
        let run = `let i = 0;
const end = performance.now() + ${max_duration};
while (performance.now() < end) for (let j = 0; j < ${burst_length}; j++) switch(this.pc) {\n`;
        for (let i = 0; i < program.opcodes.length; i++) {
            const opcode = program.opcodes[i];
            const [operations, alu] = Opcodes_operants[opcode];
            let inst = alu.toString();
            const start = inst.indexOf("=>") + 2;
            inst = inst.substring(start);

            const prims = program.operant_prims[i];
            const values = program.operant_values[i];
            for (let j = 0; j < values.length; j++) {
                const letter = "abc"[j];
                const prim = prims[j];
                const value = values[j];
                console.log("->", prim, value);
                // TODO: make sure signed and unsigned values are always handled properly
                if (prim === Operant_Prim.Imm) {
                    inst = inst
                        .replaceAll(`s.${letter}`, `${value}`)
                        .replaceAll(`s.s${letter}`, `${value}`);
                } else {
                    inst = inst
                        .replaceAll(`s.${letter}`, `s.registers[${value}]`)
                        .replaceAll(`s.s${letter}`, `s.registers_s[${value}]`);
                }
            }
            inst = inst.replaceAll("s.", "this.");
            
            // if (inst.includes("pc")) {
            //     inst += `\nreturn ${Step_Result.Continue};\n`;
            // }

            step += `case ${i}: // ${Opcode[opcode]}\n`;
            step += `this.pc = ${i+1};\n`;
            run += `case ${i}: // ${Opcode[opcode]}\n`;
            if (inst.includes(".pc =")) {
                run += `i += ${i+1} - this.pc; this.pc = ${i+1};\n`;
            }
            if (opcode === Opcode.IN) {
                step += `return (${inst}) ? ${Step_Result.Input} : ${Step_Result.Continue};\n`;
                run += `if (${inst}) return [${Step_Result.Input}, i];`;
            } else
            if (opcode === Opcode.HLT) {
                step += `return ${Step_Result.Halt};\n`;
                run += `return [${Step_Result.Halt}, i + ${i+1} - this.pc];\n`;
            } else {
                step += `${inst}\nreturn ${Step_Result.Continue};\n`;
                run += `${inst}\n`;
            }
            if (inst.includes(".pc =")) {
                run += `continue;\n`;
            }
        }
        step += `}\nreturn ${Step_Result.Halt};\n`;
        run += `default: return [${Step_Result.Halt}, i + ${program.opcodes.length + 1} - this.pc];`;
        run += `}\nreturn [${Step_Result.Continue}, i];`;

        console.log(run);

        this.step = new Function(step) as Step;
        this.run = new Function(max_duration, run) as Run;
        
        this.stack_pointer = memory_size;
    }

    burst(length: number, max_duration: number): [Step_Result, number] {
        const start_length = length;
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        
        for (;length >= burst_length; length -= burst_length) {
            for (let i = 0; i < burst_length; i++){
                const res = this.step();
                if (res !== Step_Result.Continue){
                    return [res, start_length - length + i + 1];
                }
            }
            
            if (performance.now() > end){
                return [Step_Result.Continue, start_length - length + burst_length]
            }
        }
        for (let i = 0; i < length; i++){
            const res = this.step();
            if (res !== Step_Result.Continue){
                return [res, start_length - length + i + 1];
            }
        }
        return [Step_Result.Continue, start_length];
    }
    
    run(max_duration: number): [Step_Result, number] {
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        let j = 0;
        do {
            for (let i = 0; i < burst_length; i++){
                const res = this.step();
                if (res !== Step_Result.Continue){
                    return [res, j + i + 1];
                }
            }
            j += burst_length;
        } while (performance.now() < end);
        return [Step_Result.Continue, j];
    }

    private device_inputs: {[K in IO_Port]?: Device_Input} = {};
    private device_outputs: {[K in IO_Port]?: Device_Output} = {};
    private device_resets: Device_Reset[] = [];
    private devices: Device[] = []
    public add_io_device(device: Device){
        this.devices.push(device);
        if (device.inputs){
            for (const port in device.inputs){
                const input = device.inputs[port as any as IO_Port] as Device_Input;
                this.device_inputs[port as any as IO_Port] = input.bind(device);
            }
        }
        if (device.outputs){
            for (const port in device.outputs){
                const output = device.outputs[port as any as IO_Port] as Device_Output;
                this.device_outputs[port as any as IO_Port] = output.bind(device);
            }
        }
        if (device.reset){
            this.device_resets.push(device.reset.bind(device));
        }
    }


    ins: number[] = [];
    outs: number[] = [];
    in(port: number): boolean {
        try {
            const device = this.device_inputs[port as IO_Port];
            if (device === undefined){
                if (port === IO_Port.SUPPORTED){
                    this.a = this.device_inputs[this.supported as IO_Port] || this.device_outputs[this.supported as IO_Port] || this.supported === IO_Port.SUPPORTED ? 1 : 0;
                    return false;
                }
                if (this.ins[port] === undefined){
                    this.warn(`unsupported input device port ${port} (${IO_Port[port]})`);
                }
                this.ins[port] = 1;
                return false;
            }
    
            const res = device(this.finish_step_in.bind(this, port));
            if (res === undefined){
                this.pc--;
                return true;
            } else {
                const type = this.program.operant_prims[this.pc-1][0];
                const value = this.program.operant_values[this.pc-1][0];
                this.write(type, value, res);
                return false;
            }
        } catch (e){
            this.error(""+e);
        }
        }
        supported = 0;
    out(port: number, value: number): void{
    try {
        const device = this.device_outputs[port as IO_Port];
        if (device === undefined){
            if (port === IO_Port.SUPPORTED){
                this.supported = value;
                return;
            }
            if (this.outs[port] === undefined){
                this.warn(`unsupported output device port ${port} (${IO_Port[port]}) value=0x${value.toString(16)}`);
                this.outs[port] = value
            }
            return;
        }
        device(value);
    } catch (e){
        this.error(""+e);
    }
    }


    write(target: Operant_Prim, index: number, value: number){
        switch (target){
            case Operant_Prim.Reg: {
                this.write_reg(index, value);
            } return;
            case Operant_Prim.Imm: return; // do nothing
            default: this.error(`Unknown operant target ${target}`);
        }
    }
    write_reg(index: number, value: number) {
        this.registers[index] = value;
    }

    // this method only needs to be called for the IN instruction
    finish_step_in(port: number, result: number){
        const pc = this.pc++;
        // console.log("finish", this.program.opcodes[pc], Opcode[this.program.opcodes[pc]]);
        const type = this.program.operant_prims[pc][0];
        const value = this.program.operant_values[pc][0];
        console.log(this.debug_info.lines[this.debug_info.pc_line_nrs[pc]])
        this.write(type, value, result);
        this.options.on_continue?.();
    }

    // not used
    a!: number;
    b!: number;
    c!: number;
    sa!: number;
    sb!: number;
    sc!: number;
}