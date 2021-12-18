import { registers_to_string, indent } from "./util.js";
import { Opcode, Operant_Prim, URCL_Header, IO_Port, Register, Header_Run, register_count, inst_fns } from "./instructions.js";
export var Step_Result;
(function (Step_Result) {
    Step_Result[Step_Result["Continue"] = 0] = "Continue";
    Step_Result[Step_Result["Halt"] = 1] = "Halt";
    Step_Result[Step_Result["Input"] = 2] = "Input";
})(Step_Result || (Step_Result = {}));
export class Emulator {
    options;
    a = 0;
    b = 0;
    c = 0;
    program;
    debug_info;
    constructor(options) {
        this.options = options;
    }
    heap_size = 0;
    load_program(program, debug_info) {
        this.program = program, this.debug_info = debug_info;
        const bits = program.headers[URCL_Header.BITS].value;
        const static_data = program.data;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        const registers = program.headers[URCL_Header.MINREG].value + register_count;
        const run = program.headers[URCL_Header.RUN].value;
        this.heap_size = heap;
        if (run === Header_Run.RAM) {
            throw new Error("emulator currently doesn't support running in ram");
        }
        let WordArray;
        if (bits <= 8) {
            WordArray = Uint8Array;
            this.bits = 8;
        }
        else if (bits <= 16) {
            WordArray = Uint16Array;
            this.bits = 16;
        }
        else if (bits <= 32) {
            WordArray = Uint32Array;
            this.bits = 32;
        }
        else {
            throw new Error(`BITS = ${bits} exceeds 32 bits`);
        }
        if (registers >= this.max_value) {
            throw new Error(`Too many registers ${registers}, must be <= ${this.max_value}`);
        }
        const memory_size = heap + stack + static_data.length;
        if (memory_size > this.max_value) {
            throw new Error(`Too much memory heap:${heap} + stack:${stack} = ${heap + stack}, must be <= ${this.max_value + 1}`);
        }
        this.registers = new WordArray(this.buffer, 0, registers).fill(0);
        this.memory = new WordArray(this.buffer, registers * WordArray.BYTES_PER_ELEMENT, memory_size).fill(0);
        for (let i = 0; i < static_data.length; i++) {
            this.memory[i] = static_data[i];
        }
        this.reset();
    }
    reset() {
        this.stack_ptr = this.memory.length;
        this.pc = 0;
        for (const reset of this.device_resets) {
            reset();
        }
    }
    buffer = new ArrayBuffer(1024 * 1024 * 512);
    registers = new Uint8Array(32);
    memory = new Uint8Array(256);
    get pc() {
        return this.registers[Register.PC];
    }
    set pc(value) {
        this.registers[Register.PC] = value;
    }
    get stack_ptr() {
        return this.registers[Register.SP];
    }
    set stack_ptr(value) {
        this.registers[Register.SP] = value;
    }
    bits = 8;
    device_inputs = {};
    device_outputs = {};
    device_resets = [];
    add_io_device(device) {
        if (device.inputs) {
            for (const port in device.inputs) {
                const input = device.inputs[port];
                this.device_inputs[port] = input.bind(device);
            }
        }
        if (device.outputs) {
            for (const port in device.outputs) {
                const output = device.outputs[port];
                this.device_outputs[port] = output.bind(device);
            }
        }
        if (device.reset) {
            this.device_resets.push(device.reset.bind(device));
        }
    }
    get max_value() {
        return 0xff_ff_ff_ff >>> (32 - this.bits);
    }
    get max_signed() {
        return (1 << (this.bits - 1)) - 1;
    }
    get sign_bit() {
        return (1 << (this.bits - 1));
    }
    push(value) {
        if (this.stack_ptr <= this.heap_size) {
            this.error(`Stack overflow: ${this.stack_ptr} <= ${this.heap_size}}`);
        }
        this.memory[--this.stack_ptr] = value;
    }
    pop() {
        if (this.stack_ptr >= this.memory.length) {
            this.error(`Stack underflow: ${this.stack_ptr} >= ${this.memory.length}`);
        }
        return this.memory[this.stack_ptr++];
    }
    in(port) {
        const device = this.device_inputs[port];
        if (device === undefined) {
            this.warn(`unsupported input device port ${port} (${IO_Port[port]})`);
            return false;
        }
        const res = device(this.finish_step_in.bind(this));
        if (res === undefined) {
            return true;
        }
        else {
            this.a = res;
            return false;
        }
    }
    out(port, value) {
        const device = this.device_outputs[port];
        if (device === undefined) {
            this.warn(`unsupported output device port ${port} (${IO_Port[port]})`);
            return;
        }
        device(value);
    }
    run(max_duration) {
        const burst_length = 128;
        const end = Date.now() + max_duration;
        do {
            for (let i = 0; i < burst_length; i++) {
                const res = this.step();
                if (res !== Step_Result.Continue) {
                    return res;
                }
            }
        } while (Date.now() < end);
        return Step_Result.Continue;
    }
    step() {
        const pc = this.pc++;
        if (pc >= this.program.opcodes.length) {
            return Step_Result.Halt;
        }
        const opcode = this.program.opcodes[pc];
        if (opcode === Opcode.HLT) {
            return Step_Result.Halt;
        }
        const func = inst_fns[opcode];
        if (func === undefined) {
            this.error(`unkown opcode ${opcode}`);
        }
        const op_types = this.program.operant_prims[pc];
        const op_values = this.program.operant_values[pc];
        const length = op_values.length;
        if (length >= 1)
            this.a = this.read(op_types[0], op_values[0]);
        if (length >= 2)
            this.b = this.read(op_types[1], op_values[1]);
        if (length >= 3)
            this.c = this.read(op_types[2], op_values[2]);
        if (func(this)) {
            return Step_Result.Input;
        }
        if (length >= 1)
            this.write(op_types[0], op_values[0], this.a);
        return Step_Result.Continue;
    }
    m_set(addr, value) {
        if (addr >= this.memory.length) {
            this.error(`Heap overflow on store: ${addr} >= ${this.memory.length}`);
        }
        this.memory[addr] = value;
    }
    m_get(addr) {
        if (addr >= this.memory.length) {
            this.error(`Heap overflow on load: ${addr} >= ${this.memory.length}`);
        }
        return this.memory[addr];
    }
    // this method only needs to be called for the IN instruction
    finish_step_in(result) {
        const pc = this.pc - 1;
        const type = this.program.operant_prims[pc][0];
        const value = this.program.operant_values[pc][0];
        this.write(type, value, result);
        this.options.on_continue?.();
    }
    write(target, index, value) {
        switch (target) {
            case Operant_Prim.Reg:
                this.registers[index] = value;
                return;
            case Operant_Prim.Imm: return; // do nothing
            default: this.error(`Unknown operant target ${target}`);
        }
    }
    read(source, value) {
        switch (source) {
            case Operant_Prim.Imm: return value;
            case Operant_Prim.Reg: return this.registers[value];
            default: this.error(`Unknown operant source ${source}`);
        }
    }
    error(msg) {
        const { pc_line_nrs, lines, file_name } = this.debug_info;
        const line_nr = pc_line_nrs[this.pc - 1];
        const content = `${file_name ?? "eval"}:${line_nr + 1} - ERROR - ${msg}\n    ${lines[line_nr]}\n\n${indent(registers_to_string(this), 1)}`;
        if (this.options.error) {
            this.options.error(content);
        }
        throw Error(content);
    }
    warn(msg) {
        const { pc_line_nrs, lines, file_name } = this.debug_info;
        const line_nr = pc_line_nrs[this.pc - 1];
        const content = `${file_name ?? "eval"}:${line_nr + 1} - warning - ${msg}\n ${lines[line_nr]}`;
        if (this.options.warn) {
            this.options.warn(content);
        }
        else {
            console.warn(content);
        }
    }
}
//# sourceMappingURL=emulator.js.map