import { registers_to_string, indent, hex, pad_center, pad_left } from "./util.js";
import { Opcode, Operant_Operation, Operant_Prim, Opcodes_operants, URCL_Header, IO_Port, Register, Header_Run, register_count } from "./instructions.js";
import { Break } from "./breaks.js";
import { Step_Result } from "./IEmu.js";
export { Step_Result } from "./IEmu.js";
export class Emulator {
    options;
    signed(v) {
        if (this._bits === 32) {
            return 0 | v;
        }
        return (v & this.sign_bit) === 0 ? v : v | (0xffff_ffff << this._bits);
    }
    a = 0;
    b = 0;
    c = 0;
    get sa() { return this.signed(this.a); }
    set sa(v) { this.a = v; }
    get sb() { return this.signed(this.b); }
    set sb(v) { this.b = v; }
    get sc() { return this.signed(this.c); }
    set sc(v) { this.c = v; }
    program;
    debug_info;
    _debug_message = undefined;
    get_debug_message() {
        const msg = this._debug_message;
        this._debug_message = undefined;
        return msg;
    }
    constructor(options) {
        this.options = options;
    }
    heap_size = 0;
    do_debug_memory = false;
    do_debug_registers = false;
    do_debug_ports = false;
    do_debug_program = false;
    jit_run;
    jit_step;
    load_program(program, debug_info) {
        if (this.compiled) {
            this.jit_delete();
        }
        this._debug_message = undefined;
        this.program = program, this.debug_info = debug_info;
        this.pc_counters = Array.from({ length: program.opcodes.length }, () => 0);
        const bits = program.headers[URCL_Header.BITS].value;
        const static_data = program.data;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        const registers = program.headers[URCL_Header.MINREG].value + register_count;
        const run = program.headers[URCL_Header.RUN].value;
        this.heap_size = heap;
        this.debug_reached = false;
        this.pc = 0;
        this.do_debug_memory = Object.keys(debug_info.memory_breaks).length > 0;
        this.do_debug_registers = Object.keys(debug_info.register_breaks).length > 0;
        this.do_debug_ports = Object.keys(debug_info.port_breaks).length > 0;
        this.do_debug_program = Object.keys(debug_info.program_breaks).length > 0;
        if (run === Header_Run.RAM) {
            throw new Error("emulator currently doesn't support running in ram");
        }
        let WordArray;
        let IntArray;
        if (bits <= 8) {
            WordArray = Uint8Array;
            IntArray = Int8Array;
            this._bits = 8;
        }
        else if (bits <= 16) {
            WordArray = Uint16Array;
            IntArray = Int16Array;
            this._bits = 16;
        }
        else if (bits <= 32) {
            WordArray = Uint32Array;
            IntArray = Int32Array;
            this._bits = 32;
        }
        else {
            throw new Error(`BITS = ${bits} exceeds 32 bits`);
        }
        if (registers > this.max_size) {
            throw new Error(`Too many registers ${registers}, must be <= ${this.max_size}`);
        }
        const memory_size = heap + stack + static_data.length;
        if (memory_size > this.max_size) {
            throw new Error(`Too much memory heap:${heap} + stack:${stack} + dws:${static_data.length} = ${memory_size}, must be <= ${this.max_size}`);
        }
        const buffer_size = (memory_size + registers) * WordArray.BYTES_PER_ELEMENT;
        if (this.buffer.byteLength < buffer_size) {
            this.warn(`resizing Arraybuffer to ${buffer_size} bytes`);
            const max_size = this.options.max_memory?.();
            if (max_size && buffer_size > max_size) {
                throw new Error(`Unable to allocate memory for the emulator because\t\n${buffer_size} bytes exceeds the maximum of ${max_size}bytes`);
            }
            try {
                this.buffer = new ArrayBuffer(buffer_size);
            }
            catch (e) {
                throw new Error(`Unable to allocate enough memory for the emulator because:\n\t${e}`);
            }
        }
        this.registers = new WordArray(this.buffer, 0, registers).fill(0);
        this.registers_s = new IntArray(this.registers.buffer, this.registers.byteOffset, this.registers.length);
        this.memory = new WordArray(this.buffer, registers * WordArray.BYTES_PER_ELEMENT, memory_size).fill(0);
        this.memory_s = new IntArray(this.memory.buffer, this.memory.byteOffset, this.memory.length);
        for (let i = 0; i < static_data.length; i++) {
            this.memory[i] = static_data[i];
        }
        this.reset();
        for (const device of this.devices) {
            device.bits = bits;
        }
    }
    compiled = false;
    jit_init() {
        if (this.compiled) {
            return;
        }
        const program = this.program;
        const max_duration = "max_duration";
        const burst_length = 1024 * 8;
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
                    }
                    else {
                        inst = inst
                            .replaceAll(`s.${letter}`, `${value}`)
                            .replaceAll(`s.s${letter}`, `${value}`);
                    }
                }
                else {
                    inst = inst
                        .replaceAll(`s.${letter}`, `s.registers[${value}]`)
                        .replaceAll(`s.s${letter}`, `s.registers_s[${value}]`);
                }
            }
            inst = inst.replaceAll("s.", "this.");
            step += `case ${i}: // ${Opcode[opcode]}\n`;
            step += `this.pc = ${i + 1};\n`;
            run += `case ${i}: // ${Opcode[opcode]}\n`;
            run += `this.pc = ${i + 1}; i++;\n`;
            if (opcode === Opcode.IN) {
                step += `return (${inst}) ? ${Step_Result.Input} : ${Step_Result.Continue};\n`;
                run += `if (${inst}) return [${Step_Result.Input}, i];\n`;
            }
            else if (opcode === Opcode.HLT) {
                step += `return ${Step_Result.Halt};\n`;
                run += `return [${Step_Result.Halt}, i];\n`;
            }
            else {
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
        this.jit_step = new Function(step);
        this.jit_run = new Function(max_duration, run);
        this.compiled = true;
    }
    jit_delete() {
        this.jit_run = undefined;
        this.jit_step = undefined;
        this.compiled = false;
    }
    reset() {
        this.stack_ptr = this.memory.length;
        this.pc = 0;
        this.ins = [];
        this.outs = [];
        for (const reset of this.device_resets) {
            reset();
        }
    }
    shrink_buffer() {
        this.buffer = new ArrayBuffer(1024 * 1024);
    }
    buffer = new ArrayBuffer(1024 * 1024);
    registers = new Uint8Array(32);
    registers_s = new Int8Array(this.registers);
    memory = new Uint8Array(256);
    memory_s = new Int8Array(this.registers);
    pc_counters = [];
    // FIXME: if pc is ever set as a register this code will fail
    pc_full = 0;
    get pc() {
        return this.pc_full;
    }
    set pc(value) {
        this.registers[Register.PC] = value;
        this.pc_full = value;
    }
    get stack_ptr() {
        return this.registers[Register.SP];
    }
    set stack_ptr(value) {
        this.registers[Register.SP] = value;
    }
    _bits = 8;
    device_inputs = {};
    device_outputs = {};
    device_resets = [];
    devices = [];
    add_io_device(device) {
        this.devices.push(device);
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
        return 0xff_ff_ff_ff >>> (32 - this._bits);
    }
    get max_size() {
        return this.max_value + 1;
    }
    get max_signed() {
        return (1 << (this._bits - 1)) - 1;
    }
    get sign_bit() {
        return (1 << (this._bits - 1));
    }
    push(value) {
        if (this.stack_ptr !== 0 && this.stack_ptr <= this.heap_size) {
            this.error(`Stack overflow: ${this.stack_ptr} <= ${this.heap_size}}`);
        }
        this.write_reg(Register.SP, this.stack_ptr - 1);
        this.memory[this.stack_ptr] = value;
    }
    pop() {
        if (this.stack_ptr >= this.memory.length) {
            this.error(`Stack underflow: ${this.stack_ptr} >= ${this.memory.length}`);
        }
        const value = this.memory[this.stack_ptr];
        this.write_reg(Register.SP, this.stack_ptr + 1);
        return value;
    }
    ins = [];
    outs = [];
    in(port) {
        try {
            const device = this.device_inputs[port];
            if (device === undefined) {
                if (port === IO_Port.SUPPORTED) {
                    this.a = this.device_inputs[this.supported] || this.device_outputs[this.supported] || this.supported === IO_Port.SUPPORTED ? 1 : 0;
                    return false;
                }
                if (this.ins[port] === undefined) {
                    this.warn(`unsupported input device port ${port} (${IO_Port[port]})`);
                }
                this.ins[port] = 1;
                return false;
            }
            if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD) {
                this.debug(`Reading from Port ${port} (${IO_Port[port]})`);
            }
            const res = device(this.finish_step_in.bind(this, port));
            if (res === undefined) {
                if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD) {
                    this.debug(`Read from port ${port} (${IO_Port[port]})`);
                }
                this.pc--;
                return true;
            }
            else {
                this.a = res;
                if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONREAD) {
                    this.debug(`Read from port ${port} (${IO_Port[port]}) value=0x${res.toString(16)}`);
                }
                if (this.compiled) {
                    const type = this.program.operant_prims[this.pc - 1][0];
                    const value = this.program.operant_values[this.pc - 1][0];
                    this.write(type, value, res);
                }
                return false;
            }
        }
        catch (e) {
            this.error("" + e);
        }
    }
    supported = 0;
    out(port, value) {
        try {
            const device = this.device_outputs[port];
            if (device === undefined) {
                if (port === IO_Port.SUPPORTED) {
                    this.supported = value;
                    return;
                }
                if (this.outs[port] === undefined) {
                    this.warn(`unsupported output device port ${port} (${IO_Port[port]}) value=0x${value.toString(16)}`);
                    this.outs[port] = value;
                }
                return;
            }
            if (this.do_debug_ports && this.debug_info.port_breaks[port] & Break.ONWRITE) {
                let char_str = "";
                try {
                    const char = JSON.stringify(String.fromCodePoint(value));
                    char_str = `'${char.substring(1, char.length - 1)}'`;
                }
                catch { }
                this.debug(`Written to port ${port} (${IO_Port[port]}) value=0x${value.toString(16)} ${char_str}`);
            }
            device(value);
        }
        catch (e) {
            this.error("" + e);
        }
    }
    burst(length, max_duration) {
        const start_length = length;
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        for (; length >= burst_length; length -= burst_length) {
            for (let i = 0; i < burst_length; i++) {
                const res = this.step();
                if (res !== Step_Result.Continue) {
                    return [res, start_length - length + i + 1];
                }
            }
            if (performance.now() > end) {
                return [Step_Result.Continue, start_length - length + burst_length];
            }
        }
        for (let i = 0; i < length; i++) {
            const res = this.step();
            if (res !== Step_Result.Continue) {
                return [res, start_length - length + i + 1];
            }
        }
        return [Step_Result.Continue, start_length];
    }
    run(max_duration) {
        if (this.compiled && this.jit_run) {
            return this.jit_run(max_duration);
        }
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        let j = 0;
        do {
            for (let i = 0; i < burst_length; i++) {
                const res = this.step();
                if (res !== Step_Result.Continue) {
                    return [res, j + i + 1];
                }
            }
            j += burst_length;
        } while (performance.now() < end);
        return [Step_Result.Continue, j];
    }
    debug_reached = false;
    step() {
        if (this.compiled && this.jit_step) {
            return this.jit_step();
        }
        const pc = this.pc++;
        if (this.do_debug_program && this.debug_info.program_breaks[pc] && !this.debug_reached) {
            this.debug_reached = true;
            this.debug(`Reached @DEBUG Before:`);
            this.pc--;
            return Step_Result.Debug;
        }
        this.debug_reached = false;
        if (pc >= this.program.opcodes.length) {
            return Step_Result.Halt;
        }
        this.pc_counters[pc]++;
        const opcode = this.program.opcodes[pc];
        if (opcode === Opcode.HLT) {
            this.pc--;
            return Step_Result.Halt;
        }
        const [[op], func] = Opcodes_operants[opcode];
        if (func === undefined) {
            this.error(`unkown opcode ${opcode}`);
        }
        const op_types = this.program.operant_prims[pc];
        const op_values = this.program.operant_values[pc];
        const length = op_values.length;
        if (length >= 1 && op !== Operant_Operation.SET)
            this.a = this.read(op_types[0], op_values[0]);
        if (length >= 2)
            this.b = this.read(op_types[1], op_values[1]);
        if (length >= 3)
            this.c = this.read(op_types[2], op_values[2]);
        if (func(this)) {
            return Step_Result.Input;
        }
        if (length >= 1 && op === Operant_Operation.SET)
            this.write(op_types[0], op_values[0], this.a);
        if (this._debug_message !== undefined) {
            return Step_Result.Debug;
        }
        return Step_Result.Continue;
    }
    m_set(addr, value) {
        if (addr >= this.memory.length) {
            this.error(`Heap overflow on store: 0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
        }
        if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & Break.ONWRITE) {
            this.debug(`Written memory[0x${addr.toString(16)}] which was 0x${this.memory[addr].toString(16)} to 0x${value.toString(16)}`);
        }
        this.memory[addr] = value;
    }
    m_get(addr) {
        if (addr >= this.memory.length) {
            this.error(`Heap overflow on load: #0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
        }
        if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & Break.ONREAD) {
            this.debug(`Read memory[0x${addr.toString(16)}] = 0x${this.memory[addr].toString(16)}`);
        }
        return this.memory[addr];
    }
    // this method only needs to be called for the IN instruction
    finish_step_in(port, result) {
        const pc = this.pc++;
        const type = this.program.operant_prims[pc][0];
        const value = this.program.operant_values[pc][0];
        this.write(type, value, result);
        this.options.on_continue?.();
    }
    write(target, index, value) {
        switch (target) {
            case Operant_Prim.Reg:
                {
                    this.write_reg(index, value);
                }
                return;
            case Operant_Prim.Imm: return; // do nothing
            default: this.error(`Unknown operant target ${target}`);
        }
    }
    write_reg(index, value) {
        if (this.do_debug_registers && this.debug_info.register_breaks[index] & Break.ONWRITE) {
            const old = this.registers[index];
            this.registers[index] = value;
            const register_name = Register[index] ?? `r${index - register_count + 1}`;
            this.debug(`Written ${register_name} which was ${old} to 0x${this.registers[index].toString(16)}`);
        }
        this.registers[index] = value;
    }
    read(source, index) {
        switch (source) {
            case Operant_Prim.Imm: return index;
            case Operant_Prim.Reg: {
                return this.read_reg(index);
            }
            default: this.error(`Unknown operant source ${source}`);
        }
    }
    read_reg(index) {
        if (this.do_debug_registers && this.debug_info.register_breaks[index] & Break.ONREAD) {
            this.debug(`Read r${index - register_count + 1} = 0x${this.registers[index].toString(16)}`);
        }
        return this.registers[index];
    }
    error(msg) {
        const { pc_line_nrs, lines, file_name } = this.debug_info;
        const line_nr = pc_line_nrs[this.pc - 1];
        const trace = this.decode_memory(this.stack_ptr, this.memory.length, false);
        const content = `${file_name ?? "eval"}:${line_nr + 1} - ERROR - ${msg}\n    ${lines[line_nr]}\n\n${indent(registers_to_string(this), 1)}\n\nstack trace:\n${trace}`;
        if (this.options.error) {
            this.options.error(content);
        }
        throw Error(content);
    }
    get_line_nr(pc = this.pc) {
        return this.debug_info.pc_line_nrs[pc - 1] || -2;
    }
    get_line(pc = this.pc) {
        const line = this.debug_info.lines[this.get_line_nr(pc)];
        if (line == undefined) {
            return "";
        }
        return `\n\t${line}`;
    }
    format_message(msg, pc = this.pc) {
        const { lines, file_name } = this.debug_info;
        const line_nr = this.get_line_nr(pc);
        return `${file_name ?? "eval"}:${line_nr + 1} - ${msg}\n\t${lines[line_nr] ?? ""}`;
    }
    warn(msg) {
        const content = this.format_message(`warning - ${msg}`);
        if (this.options.warn) {
            this.options.warn(content);
        }
        else {
            console.warn(content);
        }
    }
    debug(msg) {
        this._debug_message = (this._debug_message ?? "") + this.format_message(`debug - ${msg}`) + "\n";
    }
    decode_memory(start, end, reverse) {
        const w = 8;
        const headers = ["hexaddr", "hexval", "value", "*value", "linenr", "*opcode"];
        let str = headers.map(v => pad_center(v, w)).join("|");
        let view = this.memory.slice(start, end);
        if (reverse) {
            view = view.reverse();
        }
        for (const [i, v] of view.entries()) {
            const j = reverse ? end - i : start + i;
            const index = hex(j, w, " ");
            const h = hex(v, w, " ");
            const value = pad_left("" + v, w);
            const opcode = pad_left(Opcode[this.program.opcodes[v]] ?? ".", w);
            const linenr = pad_left("" + (this.debug_info.pc_line_nrs[v] ?? "."), w);
            const mem = pad_left("" + (this.memory[v] ?? "."), w);
            str += `\n${index}|${h}|${value}|${mem}|${linenr}|${opcode}`;
        }
        return str;
    }
}
//# sourceMappingURL=emulator.js.map