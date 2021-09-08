import { i53, Ln_Nr, object_map, Reg, Word } from "./util.js";
import {Opcodes, Op_Type, Value_Type, Opcodes_operants, Instruction_Ctx, URCL_Headers, IO_Ports} from "./instructions.js";


const Opcodes_operant_lengths: Record<Opcodes, i53> 
    = object_map(Opcodes_operants, (key, value) => {
        if (value === undefined){throw new Error("instruction definition undefined");}
        return [key, value[0].length];
    });

export function emulator_new(file: string) {
    const label_line_nrs    : Record<string, i53> = {};
    const label_inst_i      : Record<string, i53> = {};
    const label_ptrs        : Record<string, Word> = {};
    
    const instr_line_nrs    : i53[] = [];
    const instr_ptrs        : i53[] = [];
    const opcodes           : Opcodes[] = [];
    const operant_strings   : string[][] = [];
    const operant_types     : Value_Type[][] = [];
    const operant_values    : i53[][] = [];

    const lines = file.split('\n')
        .map(line => str_until(line, "//").trim());
    
    for (let line_nr = 0, inst_ptr = 0, inst_i = 0; line_nr < lines.length; line_nr++){
        const line = lines[line_nr];
        if (line.length == 0){continue;}
        if (line.startsWith(".")){
            if (label_line_nrs[line]) {
                throw new Error(`duplicate label ${line} at line ${line_nr}\n${line}`);
            }
            label_line_nrs[line] = line_nr;
            label_inst_i[line] = inst_i;
            label_ptrs[line] = inst_ptr; 
        } else {
            const parts = line
                .replace(/' /g, "'\xA0").replace(/,/g, "")
                .split(" ").filter(str => str.length > 0);
            const opcode_str = parts[0];
            const header: URCL_Headers | undefined = URCL_Headers[opcode_str as any] as any;
            if (header){
                continue;
            }
            const opcode: Opcodes | undefined = Opcodes[opcode_str as any] as any;
            if (opcode === undefined){
                throw new Error(`unknown opcode ${opcode_str} at line ${line_nr}\n${line}`);
            }
            const operants_length = Opcodes_operant_lengths[opcode];
            inst_ptr += 1 + operants_length;
            const operants =  parts.slice(1);
            if (operants.length !== operants_length){
                throw new Error(`expected ${operants_length} operants but got [${operants}] for opcode ${opcode_str}\n${line}`);
            }
            instr_line_nrs[inst_i]  = line_nr;
            instr_ptrs[inst_i] = inst_ptr;
            opcodes[inst_i] = opcode;
            operant_strings[inst_i] = operants;
            inst_i++;
        }
    }

    
    for (let i = 0; i < opcodes.length; i++){
        const line_nr = instr_line_nrs[i]
        for (const operant of operant_strings[i]){
            let type: Value_Type, value: Word | Reg | Ln_Nr;
            function parse_number(type: Value_Type, offset: i53, radic?: i53){
                const value = parseInt(operant.slice(offset), radic);
                if (Number.isNaN(value)){
                    throw new Error(`invalid ${Value_Type[type]} ${operant} on line ${line_nr}\n${lines[line_nr]}`);
                }
                return [type, value];
            }
            function parse_port(offset: i53){
                const port = operant.slice(offset).toUpperCase().replace(/-/g, "_");
                let port_nr: Word = parseInt(port);
                if (!Number.isNaN(port_nr)){
                    return [Value_Type.Imm, port_nr];
                }
                port_nr = IO_Ports[port as any] as any;
                if (port_nr === undefined){
                    throw new Error(`invalid port ${port} on line ${line_nr}\n${lines[line_nr]}
supported ports are TEXT`);
                }
                return [Value_Type.Imm, port_nr];
            }
            switch (operant[0]){
                case '.': {
                    type = Value_Type.Imm;
                    value = label_inst_i[operant];
                    if (value === undefined){
                        throw new Error(`invalid label ${operant} on line ${line_nr}\n${lines[line_nr]}`);
                    }
                } break;
                case '+': case '-': {
                    [type, value] = parse_number(Value_Type.Imm, 0);
                    value += i;;
                } break;
                case 'R': case 'r': case '$': [type, value] = parse_number(Value_Type.Reg, 1); break;
                case '#': [type, value] = parse_number(Value_Type.Imm, 16); break;
                case '%': [type, value] = parse_port(1); break;
                case '\'': case '"': {
                    type = Value_Type.Imm;
                    const char_lit = JSON.parse(operant.replace(/'/g, '"'));
                    value = char_lit.charCodeAt(0);
                } break;
                default: [type, value] = parse_number(Value_Type.Imm, 0);
            }
            (operant_types[i] = operant_types[i] ?? []).push(type);
            (operant_values[i] = operant_values[i] ?? []).push(value);
        }
    }
    const program: Program = {
        lines,
        label_line_nrs ,
        label_inst_i   ,
        label_ptrs     ,
        instr_line_nrs ,
        instr_ptrs     ,
        opcodes        ,
        operant_strings,
        operant_types  ,
        operant_values ,
    };

    const emulator = new Emulator(program);
    return emulator;
}
function str_until(string: string, sub_string: string){
    const end = string.indexOf(sub_string);
    if (end < 0){return string;}
    return string.slice(0, end);
}

interface Program {
    readonly lines             : string[];
    readonly label_line_nrs    : Record<string, i53>;
    readonly label_inst_i      : Record<string, i53>;
    readonly label_ptrs        : Record<string, Word>;
    readonly instr_line_nrs    : i53[];
    readonly instr_ptrs        : i53[];
    readonly opcodes           : Opcodes[];
    readonly operant_strings   : string[][];
    readonly operant_types     : Value_Type[][];
    readonly operant_values    : i53[][];
}

class Emulator implements Instruction_Ctx {
    constructor(public program: Program){
    }
    pc: i53 = 0;
    registers = new Uint8Array(32);
    memory = new Uint8Array(256);
    stack = new Uint8Array(256);
    stack_ptr = this.stack.length;
    bits = 8;
    input_devices: {[K in IO_Ports]?: () => Promise<Word>} = {};
    ouput_devices: {[K in IO_Ports]?: (value: Word) => Promise<void>} = {};
    

    get max_value(){
        return (1 << this.bits) - 1;
    }
    get max_signed(){
        return (1 << (this.bits-1)) - 1;
    }
    get sign_bit(){
        return (1 << (this.bits-1));
    }
    push(value: Word): void {
        this.stack[--this.stack_ptr] = value;
    }
    pop(): Word {
        return this.stack[this.stack_ptr++];
    }
    async in(port: Word): Promise<number>{
        const device = this.input_devices[port as IO_Ports];
        if (device === undefined){
            console.warn(`unsupported input device port ${port} (${IO_Ports[port]}) ${this.line()}`);
            return 0;
        }
        return device();
    }
    async out(port: Word, value: Word): Promise<void>{
        const device = this.ouput_devices[port as IO_Ports];
        if (device === undefined){
            console.warn(`unsupported output device port ${port} (${IO_Ports[port]}) ${this.line()}`);
            return;
        }
        device(value);
    }
    async run(){
        const max_cycles = 100;
        let cycles = 0;
        for (;cycles < max_cycles; cycles++){
            const pc = this.pc++;
            if (pc >= this.program.opcodes.length){break;}
            const opcode = this.program.opcodes[pc];
            if (opcode === Opcodes.HLT){
                break;
            }
            const instruction = Opcodes_operants[opcode];
            if (instruction === undefined){throw new Error(`unkown opcode ${opcode} ${this.line()}`);}
            const [op_operations, func] = instruction;
            const op_types = this.program.operant_types[pc];
            const op_values = this.program.operant_values[pc];
            const ops = op_operations.map(() => 0);
            for (let i = 0, min = 0; i < op_operations.length; i++){
                const operation = op_operations[i];
                const op_type = op_types[i - min];
                const op_value = op_values[i - min];
                switch (operation){
                    case Op_Type.GET: ops[i] = this.read(op_type, op_value); break;
                    case Op_Type.GET_RAM: ops[i] = this.memory[this.read(op_type, op_value)]; break;
                }
            }
            await func(ops, this);
            for (let i = 0; i < op_operations.length; i++){
                switch (op_operations[i]){
                    case Op_Type.SET: this.write(op_types[i], op_values[i], ops[i]); break;
                    case Op_Type.SET_RAM: this.memory[this.read(op_types[i], op_values[i])] = ops[i]; break;
                }
            }
        }
        if (cycles >= max_cycles){
            console.warn("reached max cycles");
        }
    }
    write(target: Value_Type, index: Word, value: Word){
        switch (target){
            case Value_Type.Reg: this.registers[index] = value;return;
            case Value_Type.Imm: throw new Error("Can't write to immediate");
            default: throw new Error(`Unknown operant target ${target} ${this.line()}`);
        }
    }
    read(source: Value_Type, value: Word){
        switch (source){
            case Value_Type.Imm: return value;
            case Value_Type.Reg: return value === 0 ? 0 : this.registers[value];
            default: throw new Error(`Unknown operant source ${source} ${this.line()}`);
        }
    }
    line(){
        const {instr_line_nrs, lines} = this.program;
        const line_nr = instr_line_nrs[this.pc-1];
        return `on line ${line_nr}, pc=${this.pc-1}\n${lines[line_nr]}`;
    }
}
