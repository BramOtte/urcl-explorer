import { object_map } from "./util.js";
import { Opcode, Operant_Operation, Operant_Prim, Opcodes_operants, URCL_Header, IO_Ports, Register, register_count } from "./instructions.js";
const Opcodes_operant_lengths = object_map(Opcodes_operants, (key, value) => {
    if (value === undefined) {
        throw new Error("instruction definition undefined");
    }
    return [key, value[0].length];
});
export function emulator_new(file) {
    const label_line_nrs = {};
    const label_inst_i = {};
    const label_ptrs = {};
    const instr_line_nrs = [];
    const instr_ptrs = [];
    const opcodes = [];
    const operant_strings = [];
    const operant_prims = [];
    const operant_values = [];
    const lines = file.split('\n')
        .map(line => str_until(line, "//").trim());
    for (let line_nr = 0, inst_ptr = 0, inst_i = 0; line_nr < lines.length; line_nr++) {
        const line = lines[line_nr];
        if (line.length == 0) {
            continue;
        }
        if (line.startsWith(".")) {
            if (label_line_nrs[line]) {
                throw new Error(`duplicate label ${line} at line ${line_nr}\n${line}`);
            }
            label_line_nrs[line] = line_nr;
            label_inst_i[line] = inst_i;
            label_ptrs[line] = inst_ptr;
        }
        else {
            const parts = line
                .replace(/' /g, "'\xA0").replace(/,/g, "")
                .split(" ").filter(str => str.length > 0);
            const opcode_str = parts[0];
            const header = URCL_Header[opcode_str];
            if (header) {
                continue;
            }
            const opcode = Opcode[opcode_str];
            if (opcode === undefined) {
                throw new Error(`unknown opcode ${opcode_str} at line ${line_nr}\n${line}`);
            }
            const operants_length = Opcodes_operant_lengths[opcode];
            inst_ptr += 1 + operants_length;
            const operants = parts.slice(1);
            if (operants.length !== operants_length) {
                throw new Error(`expected ${operants_length} operants but got [${operants}] for opcode ${opcode_str}\n${line}`);
            }
            instr_line_nrs[inst_i] = line_nr;
            instr_ptrs[inst_i] = inst_ptr;
            opcodes[inst_i] = opcode;
            operant_strings[inst_i] = operants;
            inst_i++;
        }
    }
    for (let i = 0; i < opcodes.length; i++) {
        const line_nr = instr_line_nrs[i];
        for (const operant of operant_strings[i]) {
            let type, value;
            function parse_number(type, offset, radic) {
                const value = parseInt(operant.slice(offset), radic);
                if (Number.isNaN(value)) {
                    throw new Error(`invalid ${Operant_Prim[type]} ${operant} on line ${line_nr}\n${lines[line_nr]}`);
                }
                return [type, value];
            }
            function parse_port(offset) {
                const port = operant.slice(offset).toUpperCase().replace(/-/g, "_");
                let port_nr = parseInt(port);
                if (!Number.isNaN(port_nr)) {
                    return [Operant_Prim.Imm, port_nr];
                }
                port_nr = IO_Ports[port];
                if (port_nr === undefined) {
                    throw new Error(`invalid port ${port} on line ${line_nr}\n${lines[line_nr]}
supported ports are TEXT`);
                }
                return [Operant_Prim.Imm, port_nr];
            }
            switch (operant[0]) {
                case '.':
                    {
                        type = Operant_Prim.Imm;
                        value = label_inst_i[operant];
                        if (value === undefined) {
                            throw new Error(`invalid label ${operant} on line ${line_nr}\n${lines[line_nr]}`);
                        }
                    }
                    break;
                case '+':
                case '-':
                    {
                        [type, value] = parse_number(Operant_Prim.Imm, 0);
                        value += i;
                        ;
                    }
                    break;
                case 'R':
                case 'r':
                case '$':
                    {
                        [type, value] = parse_number(Operant_Prim.Reg, 1);
                        value += register_count;
                    }
                    break;
                case 'M':
                case 'm':
                case '#':
                    [type, value] = parse_number(Operant_Prim.Imm, 1);
                    break;
                case '%':
                    [type, value] = parse_port(1);
                    break;
                case '\'':
                case '"':
                    {
                        type = Operant_Prim.Imm;
                        const char_lit = JSON.parse(operant.replace(/'/g, '"'));
                        value = char_lit.charCodeAt(0);
                    }
                    break;
                default: {
                    value = parseInt(operant);
                    if (!Number.isNaN(value)) {
                        type = Operant_Prim.Imm;
                        [type, value] = parse_number(Operant_Prim.Imm, 0);
                        break;
                    }
                    const register = Register[operant];
                    console.log(register);
                    if (register) {
                        type = Operant_Prim.Reg;
                        value = register;
                        break;
                    }
                    throw new Error(`invalid operant ${operant} on line ${line_nr}\n${lines[line_nr]}`);
                }
            }
            (operant_prims[i] = operant_prims[i] ?? []).push(type);
            (operant_values[i] = operant_values[i] ?? []).push(value);
        }
    }
    const program = {
        lines,
        label_line_nrs,
        label_inst_i,
        label_ptrs,
        instr_line_nrs,
        instr_ptrs,
        opcodes,
        operant_strings,
        operant_prims,
        operant_values,
    };
    const emulator = new Emulator(program);
    return emulator;
}
function str_until(string, sub_string) {
    const end = string.indexOf(sub_string);
    if (end < 0) {
        return string;
    }
    return string.slice(0, end);
}
class Emulator {
    program;
    constructor(program) {
        this.program = program;
        this.stack_ptr = this.stack.length;
    }
    pc = 0;
    registers = new Uint8Array(32);
    memory = new Uint8Array(256);
    stack = new Uint8Array(255);
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
        return (1 << this.bits) - 1;
    }
    get max_signed() {
        return (1 << (this.bits - 1)) - 1;
    }
    get sign_bit() {
        return (1 << (this.bits - 1));
    }
    push(value) {
        this.stack[--this.stack_ptr] = value;
    }
    pop() {
        return this.stack[this.stack_ptr++];
    }
    async in(port) {
        const device = this.input_devices[port];
        if (device === undefined) {
            console.warn(`unsupported input device port ${port} (${IO_Ports[port]}) ${this.line()}`);
            return 0;
        }
        return device();
    }
    async out(port, value) {
        const device = this.output_devices[port];
        if (device === undefined) {
            console.warn(`unsupported output device port ${port} (${IO_Ports[port]}) ${this.line()}`);
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
            case Operant_Prim.Reg: return value === Register["$0"] ? 0 : this.registers[value];
            default: throw new Error(`Unknown operant source ${source} ${this.line()}`);
        }
    }
    line() {
        const { instr_line_nrs, lines } = this.program;
        const line_nr = instr_line_nrs[this.pc - 1];
        return `on line ${line_nr}, pc=${this.pc - 1}\n${lines[line_nr]}`;
    }
}
//# sourceMappingURL=emulator.js.map