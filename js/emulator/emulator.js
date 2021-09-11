import { Opcode, Operant_Operation, Operant_Prim, Opcodes_operants, URCL_Header, IO_Port, Register, Header_Run } from "./instructions.js";
export class Emulator {
    program;
    debug_info;
    constructor() {
    }
    load_program(program, debug_info) {
        this.program = program, this.debug_info = debug_info;
        const bits = program.headers[URCL_Header.BITS].value;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        const registers = program.headers[URCL_Header.MINREG].value;
        const run = program.headers[URCL_Header.RUN].value;
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
        if (heap + stack > this.max_value) {
            throw new Error(`Too much memory heap:${heap} + stack:${stack} = ${heap + stack}, must be <= ${this.max_value + 1}`);
        }
        this.registers = new WordArray(this.buffer, 0, registers).fill(0);
        this.memory = new WordArray(this.buffer, registers * WordArray.BYTES_PER_ELEMENT, heap + stack).fill(0);
        this.stack_ptr = this.memory.length - 1;
        this.pc = 0;
    }
    pc = 0;
    buffer = new ArrayBuffer(1024 * 1024 * 512);
    registers = new Uint8Array(32);
    memory = new Uint8Array(256);
    get stack_ptr() {
        return this.registers[Register.SP];
    }
    set stack_ptr(value) {
        this.registers[Register.SP] = value;
    }
    bits = 8;
    input_devices = {};
    output_devices = {};
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
        this.memory[--this.stack_ptr] = value;
    }
    pop() {
        return this.memory[this.stack_ptr++];
    }
    async in(port) {
        const device = this.input_devices[port];
        if (device === undefined) {
            console.warn(`unsupported input device port ${port} (${IO_Port[port]}) ${this.line()}`);
            return 0;
        }
        return device();
    }
    async out(port, value) {
        const device = this.output_devices[port];
        if (device === undefined) {
            console.warn(`unsupported output device port ${port} (${IO_Port[port]}) ${this.line()}`);
            return;
        }
        device(value);
    }
    async run() {
        const max_cycles = 1_000_000;
        let cycles = 0;
        for (; cycles < max_cycles; cycles++) {
            const pc = this.pc++;
            if (pc >= this.program.opcodes.length) {
                break;
            }
            const opcode = this.program.opcodes[pc];
            if (opcode === Opcode.HLT) {
                break;
            }
            const instruction = Opcodes_operants[opcode];
            if (instruction === undefined) {
                throw new Error(`unkown opcode ${opcode} ${this.line()}`);
            }
            const [op_operations, func] = instruction;
            const op_types = this.program.operant_prims[pc];
            const op_values = this.program.operant_values[pc];
            const ops = op_operations.map(() => 0);
            let ram_offset = 0;
            for (let i = 0; i < op_operations.length; i++) {
                switch (op_operations[i]) {
                    case Operant_Operation.GET:
                        ops[i] = this.read(op_types[i], op_values[i]);
                        break;
                    case Operant_Operation.GET_RAM:
                        ops[i] = this.memory[this.read(op_types[i], op_values[i]) + ram_offset];
                        break;
                    case Operant_Operation.RAM_OFFSET:
                        ram_offset = this.read(op_types[i], op_values[i]);
                        break;
                }
            }
            await func(ops, this);
            for (let i = 0; i < op_operations.length; i++) {
                switch (op_operations[i]) {
                    case Operant_Operation.SET:
                        this.write(op_types[i], op_values[i], ops[i]);
                        break;
                    case Operant_Operation.SET_RAM:
                        this.memory[this.read(op_types[i], op_values[i]) + ram_offset] = ops[i];
                        break;
                }
            }
        }
        if (cycles >= max_cycles) {
            console.warn("reached max cycles");
        }
    }
    write(target, index, value) {
        switch (target) {
            case Operant_Prim.Reg:
                this.registers[index] = value;
                return;
            case Operant_Prim.Imm: throw new Error("Can't write to immediate");
            default: throw new Error(`Unknown operant target ${target} ${this.line()}`);
        }
    }
    read(source, value) {
        switch (source) {
            case Operant_Prim.Imm: return value;
            case Operant_Prim.Reg: return value === Register.R0 ? 0 : this.registers[value];
            default: throw new Error(`Unknown operant source ${source} ${this.line()}`);
        }
    }
    line() {
        const { pc_line_nrs, lines } = this.debug_info;
        const line_nr = pc_line_nrs[this.pc - 1];
        return `on line ${line_nr}, pc=${this.pc - 1}\n${lines[line_nr]}`;
    }
}
//# sourceMappingURL=emulator.js.map