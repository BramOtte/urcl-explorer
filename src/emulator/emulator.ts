import { Word, registers_to_string, indent, hex, pad_center, pad_left } from "./util.js";
import {Opcode, Operant_Operation, Operant_Prim, Opcodes_operants, Instruction_Ctx, URCL_Header, IO_Port, Register, Header_Run, register_count, inst_fns, Opcodes_operant_lengths} from "./instructions.js";
import { Debug_Info, Program } from "./compiler.js";
import { Device, Device_Host, Device_Input, Device_Output, Device_Reset } from "./devices/device.js";
import { Break } from "./breaks.js"; 
import { Step_Result, IntArray, Run, Step, UintArray } from "./IEmu.js";
import { Run_Type, URCL_Memory, WASM_Exports, WASM_Imports, create_urcl_memory, urcl2wasm } from "./wasm/urcl2wasm.js";
export { Step_Result } from "./IEmu.js"

type WordArray = UintArray;

interface Emu_Options {
    error?: (a: string, linenr: undefined | number, file: undefined | string) => never;
    warn?: (a: string, linenr: undefined | number, file: undefined | string) => void;
    on_continue?: ()=>void;
    max_memory?: ()=>number;
}

export enum JIT_Type {
    None, JS, WASM
}

export class Emulator implements Instruction_Ctx, Device_Host, URCL_Memory {
    private signed(v: number){
        if (this._bits === 32){
            return 0| v;
        }
        return (v & this.sign_bit) === 0 ? v : v | (0xffff_ffff << this._bits);
    }
    a = 0;
    b = 0;
    c = 0;
    get sa(){return this.signed(this.a);}
    set sa(v: number){this.a = v;}

    get sb(){return this.signed(this.b);}
    set sb(v: number){this.b = v;}

    get sc(){return this.signed(this.c);}
    set sc(v: number){this.c = v;}

    public program!: Program;
    public debug_info!: Debug_Info;
    private _debug_message: undefined | string = undefined;

    public get_debug_message(){
        const msg = this._debug_message;
        this._debug_message = undefined;
        return msg;
    }

    constructor(public options: Emu_Options){

    }
    private heap_size = 0;
    private do_debug_memory = false;
    private do_debug_registers = false;
    private do_debug_ports = false;
    private do_debug_program = false;
    block_count: number = 0;
    wasm_memory = new WebAssembly.Memory({initial: this.block_count});

    private jit_run?: Run;
    private jit_step?: Step;


    load_program(program: Program, debug_info: Debug_Info){
        if (this.compiled) {
            this.jit_delete();
        }

        this._debug_message = undefined;
        this.program = program, this.debug_info = debug_info;
        const bits = program.headers[URCL_Header.BITS].value;
        const static_data = program.data;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        const register_file_length = program.headers[URCL_Header.MINREG].value + register_count;
        const run = program.headers[URCL_Header.RUN].value;
        this.heap_size = heap;
        this.debug_reached = false;
        this.pc = 0;

        this.do_debug_memory = Object.keys(debug_info.memory_breaks).length > 0;
        this.do_debug_registers = Object.keys(debug_info.register_breaks).length > 0;
        this.do_debug_ports = Object.keys(debug_info.port_breaks).length > 0;
        this.do_debug_program = Object.keys(debug_info.program_breaks).length > 0;

        if (run === Header_Run.RAM){
            throw new Error("emulator currently doesn't support running in ram");
        }
        if (bits <= 8){
            this._bits = 8;
        } else if (bits <= 16){
            this._bits = 16;
        } else if (bits <= 32){
            this._bits = 32;
        } else {
            throw new Error(`BITS = ${bits} exceeds 32 bits`);
        }

        if (register_file_length > this.max_size){
            throw new Error(`Too many registers ${register_file_length}, must be <= ${this.max_size}`)
        }
        const memory_size = heap + stack + static_data.length
        if (memory_size > this.max_size){
            throw new Error(`Too much memory heap:${heap} + stack:${stack} + dws:${static_data.length} = ${memory_size}, must be <= ${this.max_size}`);
        }

        Object.assign(this, create_urcl_memory(program));

        for (let i = 0; i < static_data.length; i++){
            this.memory[i] = static_data[i];
        }

        this.reset();
        for (const device of this.devices){
            device.bits = bits;
        }
    }

    compiled = JIT_Type.None;
    run_type = Run_Type.Count_Instrutions;

    jit_init_wasm(run_type: Run_Type) {
        if (this.compiled === JIT_Type.WASM && this.run_type === run_type) {
            return;
        }
        if (this.compiled !== JIT_Type.None) {
            this.jit_delete();
        }
        this.compiled = JIT_Type.WASM;
        this.run_type = run_type;

        this.jit_step = () => Step_Result.Continue;
        this.jit_run = () => [Step_Result.Continue, 0];

        const emulator = this;
        const memory = this.wasm_memory;

        const byte_code = urcl2wasm(this.program, this, run_type, this.debug_info);
        const imports: WASM_Imports = {
            env: {
                in(port: number, pc: number): Step_Result {
                    const device = emulator.device_inputs[port as IO_Port];
                    if (!device) {
                        throw new Error();
                    }
                    const value = device(value => {
                        emulator.write_reg(emulator.program.operant_values[pc][0], value);
                        emulator.pc = pc + 1;
                        emulator.options.on_continue?.();
                    });
                    if (value !== undefined) {
                        emulator.write_reg(emulator.program.operant_values[pc][0], value);
                        return Step_Result.Continue;
                    }
                    return Step_Result.Input;
                },
                out(port: number, value: number) {
                    emulator.out(port, value);
                },
                now(): number {
                    return performance.now();
                },
                memory
            }
        };
        
        // TODO: make sure interrupting this operation is properly handled
        WebAssembly.instantiate(byte_code, imports).then(module => {
            const exports = module.instance.exports as unknown as WASM_Exports;
    
            this.jit_run = max_duration => {
                const end = performance.now() + max_duration;
                const result = exports.run(end);
                return result;
            };
            this.jit_step = undefined;
            console.log("wasm compile finished");
        }) .catch((error: Error) => {
            this.warn(error.message);
            this.error(error.message);
        })
    }

    jit_init(){
        if (this.compiled === JIT_Type.JS) {
            return;
        }
        const program = this.program;

        const max_duration = "max_duration";
        const burst_length = 1024 * 64;

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
                // TODO: make sure signed and unsigned values are always handled properly
                if (prim === Operant_Prim.Imm) {
                    if (operations[j] === Operant_Operation.SET) {
                        inst = inst.replaceAll(`s.${letter}`, `s.a`)
                            .replaceAll(`s.s${letter}`, `s.a`);
                    } else {
                        inst = inst
                            .replaceAll(`s.${letter}`, `${value}`)
                            .replaceAll(`s.s${letter}`, `${value}`);
                    }
                } else {
                    inst = inst
                        .replaceAll(`s.${letter}`, `s.registers[${value}]`)
                        .replaceAll(`s.s${letter}`, `s.registers_s[${value}]`);
                }
            }
            inst = inst.replaceAll("s.", "this.");

            step += `case ${i}: // ${Opcode[opcode]}\n`;
            step += `this.pc = ${i+1};\n`;
            run += `case ${i}: // ${Opcode[opcode]}\n`;
            run += `this.pc = ${i+1}; i++;\n`;
            if (opcode === Opcode.IN) {
                step += `return (${inst}) ? ${Step_Result.Input} : ${Step_Result.Continue};\n`;
                run += `if (${inst}) return [${Step_Result.Input}, i];\n`;
            } else
            if (opcode === Opcode.HLT) {
                step += `return ${Step_Result.Halt};\n`;
                run += `return [${Step_Result.Halt}, i];\n`;
            } else {
                step += `${inst}\nreturn ${Step_Result.Continue};\n`;
                run += `${inst};\n`;
            }
            if (inst.includes(".pc =")) {
                run += `continue;\n`;
            }
        }
        step += `}\nreturn ${Step_Result.Halt};\n`;
        run += `default: return [${Step_Result.Halt}, i]`;
        run += `}\nreturn [${Step_Result.Continue}, i]`;

        this.jit_step = new Function(step) as Step;
        this.jit_run = new Function(max_duration, run) as Run;

        this.compiled = JIT_Type.JS;
    }

    jit_delete() {
        this.jit_run = undefined;
        this.jit_step = undefined;
        this.compiled = JIT_Type.None;
    }


    reset(){
        this.stack_ptr = this.memory.length;
        this.pc = 0;
        this.ins = []; this.outs = [];
        for (const reset of this.device_resets){
            reset();
        }
    }
    
    get buffer() {
        return this.wasm_memory.buffer
    }
    registers: WordArray = new Uint8Array(this.buffer);
    registers_s: IntArray = new Int8Array(this.buffer);
    memory: WordArray = new Uint8Array(this.buffer);
    memory_s: IntArray = new Int8Array(this.buffer);
    pc_counters: Uint32Array = new Uint32Array(this.buffer);

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
    _bits = 8;
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
    

    get max_value(){
        return 0xff_ff_ff_ff >>> (32 - this._bits);
    }
    get max_size(){
        return this.max_value + 1;
    }
    get max_signed(){
        return (1 << (this._bits-1)) - 1;
    }
    get sign_bit(){
        return (1 << (this._bits-1));
    }
    push(value: Word): void {
        if (this.stack_ptr !== 0 && this.stack_ptr <= this.heap_size){
            this.error(`Stack overflow: ${this.stack_ptr} <= ${this.heap_size}}`);
        }
        this.write_reg(Register.SP, this.stack_ptr - 1);
        this.memory[this.stack_ptr] = value;
    }
    pop(): Word { 
        if (this.stack_ptr >= this.memory.length){
            this.error(`Stack underflow: ${this.stack_ptr} >= ${this.memory.length}`);
        }
        const value = this.memory[this.stack_ptr];
        this.write_reg(Register.SP, this.stack_ptr + 1);

        return value;
    }
    ins: number[] = [];
    outs: number[] = [];
    in(port: Word): boolean {
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
        if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD){
            this.debug(`Reading from Port ${port} (${IO_Port[port]})`);
        }

        const res = device(this.finish_step_in.bind(this, port));
        if (res === undefined){
            if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD){
                this.debug(`Read from port ${port} (${IO_Port[port]})`);
            }
            this.pc--;
            return true;
        } else {
            this.a = res;
            if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD){
                this.debug(`Read from port ${port} (${IO_Port[port]}) value=0x${res.toString(16)}`);
            }
            if (this.compiled) {
                const type = this.program.operant_prims[this.pc-1][0];
                const value = this.program.operant_values[this.pc-1][0];
                this.write(type, value, res);
            }
            return false;
        }
    } catch (e){
        this.error(""+e);
    }
    }
    supported = 0;
    out(port: Word, value: Word): void{
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
        if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONWRITE){
            let char_str = "";
            try {
                const char = JSON.stringify(String.fromCodePoint(value));
                char_str = `'${char.substring(1, char.length-1)}'`;
            } catch {}
            this.debug(`Written to port ${port} (${IO_Port[port]}) value=0x${value.toString(16)} ${char_str}`);
        }
        device(value);
    } catch (e){
        this.error(""+e);
    }
    }
    burst(length: number, max_duration: number): [Step_Result, number]{
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
        if (this.compiled && this.jit_run) {
            return this.jit_run(max_duration);
        }
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
    private debug_reached = false;
step(): Step_Result {
    if (this.compiled && this.jit_step) {
        return this.jit_step();
    }
    const pc = this.pc++;
    if (this.do_debug_program && this.debug_info.program_breaks[pc] && !this.debug_reached){
        this.debug_reached = true;
        this.debug(`Reached @DEBUG Before:`);
        this.pc--;
        return Step_Result.Debug;
    }
    this.debug_reached = false
    if (pc >= this.program.opcodes.length){return Step_Result.Halt;}
    this.pc_counters[pc]++;
    const opcode = this.program.opcodes[pc];
    if (opcode === Opcode.HLT){
        this.pc--;
        return Step_Result.Halt;
    }
    const [[op], func] = Opcodes_operants[opcode];
    if (func === undefined){this.error(`unkown opcode ${opcode}`);}

    const op_types = this.program.operant_prims[pc];
    const op_values = this.program.operant_values[pc];
    const length = op_values.length;
    if (length >= 1 && op !== Operant_Operation.SET)this.a = this.read(op_types[0], op_values[0]);
    if (length >= 2)this.b = this.read(op_types[1], op_values[1]);
    if (length >= 3)this.c = this.read(op_types[2], op_values[2]);
    if (func(this)) {
        return Step_Result.Input;
    }
    if (length >= 1 && op === Operant_Operation.SET)this.write(op_types[0], op_values[0], this.a);

    if (this._debug_message !== undefined){
        return Step_Result.Debug;
    }

    return Step_Result.Continue;
}

    m_set(addr: number, value: number){
        if (addr >= this.memory.length){
            this.error(`Heap overflow on store: 0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
        }
        if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & Break.ONWRITE){
            this.debug(`Written memory[0x${addr.toString(16)}] which was 0x${this.memory[addr].toString(16)} to 0x${value.toString(16)}`);

        }
        this.memory[addr] = value;
    }
    m_get(addr: number){
        if (addr >= this.memory.length){
            this.error(`Heap overflow on load: #0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
        }
        if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & Break.ONREAD){
            this.debug(`Read memory[0x${addr.toString(16)}] = 0x${this.memory[addr].toString(16)}`);
        }
        return this.memory[addr];
    }
    // this method only needs to be called for the IN instruction
    finish_step_in(port: number, result: Word){
        const pc = this.pc++;
        const type = this.program.operant_prims[pc][0];
        const value = this.program.operant_values[pc][0];
        this.write(type, value, result);
        this.options.on_continue?.();
    }
    write(target: Operant_Prim, index: Word, value: Word){
        switch (target){
            case Operant_Prim.Reg: {
                this.write_reg(index, value);
            } return;
            case Operant_Prim.Imm: return; // do nothing
            default: this.error(`Unknown operant target ${target}`);
        }
    }
    write_reg(index: Word, value: Word) {
        
        if (this.do_debug_registers && this.debug_info.register_breaks[index] & Break.ONWRITE) {
            const old = this.registers[index];
            this.registers[index] = value;

            const register_name = Register[index] ?? `r${index - register_count + 1}`;
            this.debug(`Written ${register_name} which was ${old} to 0x${this.registers[index].toString(16)}`);
        }
        this.registers[index] = value;

    }
    read(source: Operant_Prim, index: Word){
        switch (source){
            case Operant_Prim.Imm: return index;
            case Operant_Prim.Reg: {
                return this.read_reg(index);
            }
            default: this.error(`Unknown operant source ${source}`); 
        }
    }
    read_reg(index: Word): Word {
        if (this.do_debug_registers && this.debug_info.register_breaks[index] & Break.ONREAD){
            this.debug(`Read r${index - register_count + 1} = 0x${this.registers[index].toString(16)}`);
        }
        return this.registers[index];
    }

    error(msg: string): never {
        const {pc_line_nrs, lines, file_name} = this.debug_info;
        const line_nr = pc_line_nrs[this.pc-1];
        if (this.options.error){
            this.options.error(msg, line_nr, file_name)
        }
        const trace = this.decode_memory(this.stack_ptr, this.memory.length, false);
        const content = `${file_name??"eval"}:${line_nr + 1} - ERROR - ${msg}\n    ${lines[line_nr]}\n\n${indent(registers_to_string(this), 1)}\n\nstack trace:\n${trace}`;
        throw Error(content);
    }
    get_line_nr(pc = this.pc): number {
        return this.debug_info.pc_line_nrs[pc-1] || -2;
    }
    get_line(pc = this.pc): string {
        const line = this.debug_info.lines[this.get_line_nr(pc)];
        if (line == undefined){return "";}
        return `\n\t${line}`;
    }
    format_message(msg: string, pc = this.pc): string {
        const {lines, file_name} = this.debug_info;
        const line_nr = this.get_line_nr(pc)
        return `${file_name??"eval"}:${line_nr + 1} - ${msg}\n\t${lines[line_nr] ?? ""}`;
    }

    warn(msg: string): void {
        if (this.options.warn){
            this.options.warn(msg, this.get_line_nr(), this.debug_info.file_name);
        } else {
            console.warn(this.format_message(`warning - ${msg}`));
        }
    }
    debug(msg: string): void {
        this._debug_message = (this._debug_message ?? "") + this.format_message(`debug - ${msg}`) + "\n";  
    }

    decode_memory(start: number, end: number, reverse: boolean): string {
        const w = 8;
        const headers = ["hexaddr", "hexval", "value", "*value", "linenr", "*opcode"]
        let str = headers.map(v => pad_center(v, w)).join("|");
        let view = this.memory.slice(start, end);
        if (reverse){
            view = view.reverse();
        }
        for (const [i, v] of view.entries()){
            const j = reverse ? end - i : start+i;
            const index = hex(j, w, " ");
            const h = hex(v, w, " ");
            const value = pad_left(""+v, w);
            const opcode = pad_left(Opcode[this.program.opcodes[v]] ?? ".", w);
            const linenr = pad_left(""+(this.debug_info.pc_line_nrs[v] ?? "."), w)
            const mem = pad_left(""+(this.memory[v] ?? "."), w);
            str += `\n${index}|${h}|${value}|${mem}|${linenr}|${opcode}`
        }
        return str
    }
}
