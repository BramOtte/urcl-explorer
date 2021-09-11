import { Header_Operant, IO_Port as IO_Port, Opcode, Opcodes_operant_lengths as Opcodes_operant_counts, Operant_Prim, Operant_Type, Register, register_count, URCL_Header, urcl_headers } from "./instructions.js";
import { enum_count, enum_from_str, enum_strings, i53, is_digit, warn, Warning, Word } from "./util.js";

function my_parse_int(x: string){
    x = x.replace(/\_/g, "");
    if (x.startsWith("0b")){
        return parseInt(x.slice(2), 2);
    }
    return parseInt(x);
}


interface Header_Value {
    value: number,
    line_nr?: number,
    operant?: Header_Operant,
}
export type Header_Obj = {[K in URCL_Header]: Header_Value};

export class Parser_output implements Label_Out, Instruction_Out {
    readonly errors: Warning[] = [];
    readonly warnings: Warning[] = [];

    lines                      : string[] = [];
    readonly headers           : Header_Obj = {} as Header_Obj;
    readonly label_line_nrs    : Record<string, i53> = {};
    readonly label_inst_i      : Record<string, i53> = {};
    readonly instr_line_nrs    : i53[] = [];
    readonly opcodes           : Opcode[] = [];
    readonly operant_strings   : string[][] = [];
    readonly operant_types     : Operant_Type[][] = [];
    readonly operant_values    : i53[][] = [];
}
interface Label_Out {
    readonly label_line_nrs    : Record<string, i53>;
    readonly label_inst_i      : Record<string, i53>;
}
interface Instruction_Out {
    readonly headers           : Header_Obj;
    readonly instr_line_nrs    : i53[];
    readonly opcodes           : Opcode[];
    readonly operant_strings   : string[][];
    readonly operant_types     : Operant_Type[][];
    readonly operant_values    : i53[][];
    readonly label_inst_i      : Record<string, i53>;
}

export function parse(source: string): Parser_output
{
    const out = new Parser_output();
    out.lines = source.split('\n').map(line =>
        line.replace(/,/g, "").replace(/  /g, " ").replace(/\/\/.*/g, "").trim()
    );
    //TODO: multiline comments
    for (let i = 0; i < enum_count(URCL_Header); i++){
        out.headers[i as URCL_Header] = {value: urcl_headers[i as URCL_Header].def};
        out.headers[i as URCL_Header].operant = urcl_headers[i as URCL_Header].def_operant;
    }

    for (let line_nr = 0, inst_i = 0; line_nr < out.lines.length; line_nr++){
        const line = out.lines[line_nr];
        if (line === ""){continue;};
        if (parse_header(line, line_nr, out.headers, out.warnings)){continue;}
        if (parse_label(line, line_nr, inst_i, out, out.warnings)){continue;}
        if (split_instruction(line, line_nr, inst_i, out, out.errors)){
            inst_i++; continue;
        }
        out.errors.push(warn(line_nr, `Unknown identifier ${line.split(" ")[0]}`));
    }
    for (let inst_i = 0; inst_i < out.opcodes.length; inst_i++){
        parse_instructions(out.instr_line_nrs[inst_i], inst_i, out, out.errors);
    }
    return out;
}

// return whether the line contains a header
function parse_header(line: string, line_nr: number, headers: Header_Obj, errors: Warning[]):
    boolean
{
    const [header_str, opOrVal_str, val_str] = line.split(" ") as (string | undefined)[];
    if (header_str === undefined){
        return false;
    }
    const header: URCL_Header | undefined = URCL_Header[header_str.toUpperCase() as any] as any;
    if (header === undefined){
        return false;
    }
    const header_def = urcl_headers[header];
    if (header_def.def_operant !== undefined){
        if (opOrVal_str === undefined){
            errors.push(warn(line_nr,
                `Missing operant for header ${header_str}, must be ${enum_strings(Header_Operant)}`
            )); 
        }
        const operant = enum_from_str(Header_Operant, opOrVal_str||"");
        if (operant === undefined && opOrVal_str !== undefined){
            errors.push(warn(line_nr,
                `Unknown operant ${opOrVal_str} for header ${header_str}, must be ${enum_strings(Header_Operant)}`
            )); 
        }
        const value= check_value(val_str);
        if (operant !== undefined && value !== undefined){
            headers[header] = {line_nr, operant, value};
        }
    } else {
        let value = check_value(opOrVal_str);
        if (value !== undefined){
            headers[header] = {line_nr, value};
        }
    }
    return true;

    function check_value(value: string | undefined): number | undefined {
        if (value === undefined){
            errors.push(warn(line_nr, `Missing value for header ${header_str}`));
            return undefined;
        }
        if (header_def.in){
            const num = enum_from_str(header_def.in, value.toUpperCase());
            if (num === undefined){
                errors.push(warn(line_nr, 
                    `Value ${value} for header ${header_str} most be one of: ${enum_strings(header_def.in)}`
                ));
                return undefined;
            }
            return num;
        } else {
            const num = my_parse_int(value);
            if (!Number.isInteger(num)){
                errors.push(warn(line_nr,
                    `Value ${value} for header ${header_str} must be an integer`
                ));
                return undefined;
            }
            return num;
        }
    }
}

// returns whether the line contains a label
function parse_label(line: string, line_nr: number, inst_i: number, out: Label_Out, warnings: Warning[]): boolean {
    if (!line.startsWith(".")){
        return false;
    };
    const label = str_until(str_until(line, " ").slice(0), "//");
    if (label === "."){
        warnings.push(warn(line_nr, `Empty label`));
    }
    if (out.label_line_nrs[label] !== undefined){
        warnings.push(warn(line_nr, `Duplicate label ${label}`));
    }
    out.label_line_nrs[label] = line_nr;
    out.label_inst_i[label] = inst_i;
    return true;
}

// returns the length of the instruction or 0 if there is an error
function split_instruction
(line: string, line_nr: number, inst_i: number, out: Instruction_Out, errors: Warning[]): boolean
{
    const [opcode_str, ...ops] = line
        .replace(/' /g, "'\xA0").replace(/,/g, "").split(" ");
    const opcode = enum_from_str(Opcode, opcode_str.toUpperCase());
    if (opcode === undefined){
        return false;
    }
    const operant_count = Opcodes_operant_counts[opcode];
    if (ops.length != operant_count){
        errors.push(warn(line_nr,
            `Expected ${operant_count} operants but got [${ops}] for opcode ${opcode_str}`
        ));
    }
    out.opcodes[inst_i] = opcode;
    out.operant_strings[inst_i] = ops;
    out.instr_line_nrs[inst_i] = line_nr;
    
    return true;
}
function parse_instructions(line_nr: number, inst_i: number, out: Instruction_Out, errors: Warning[]): number {
    const types: number[] = out.operant_types[inst_i] = [];
    const values: number[] = out.operant_values[inst_i] = [];
    for (const operant of out.operant_strings[inst_i]){
        const [type, value] = parse_operant(operant, line_nr, inst_i, out.label_inst_i, errors) ?? [];
        if (type !== undefined){
            types.push(type);
            values.push(value as number);
        }
    }
    return 0;
}

function parse_operant(
    operant: string, line_nr: number, inst_i: number, labels: {[K in string]?: number}, errors: Warning[]
):
    undefined | [type: Operant_Type, value: Word]
{
    switch (operant){
        case "R0": case "r0": case "$0": return [Operant_Type.Imm, 0];
        case "PC": return [Operant_Type.Reg, Register.PC];
        case "SP": return [Operant_Type.Reg, Register.SP];
    }
    switch (operant[0]){
        case '.': {
            const value = labels[operant];
            if (value === undefined){
                errors.push(warn(line_nr, `Undefined label ${operant}`)); return undefined; 
            }
            return [Operant_Type.Imm, value];
        }
        case '+': case '-': {
            const value = my_parse_int(operant);
            if (!Number.isInteger(value)){
                errors.push(warn(line_nr, `Invalid relative address ${operant}`)); return undefined;
            }
            return [Operant_Type.Label, value + inst_i];
        }
        case 'R': case 'r': case '$': {
            const value = my_parse_int(operant.slice(1));
            if (!Number.isInteger(value)){
                errors.push(warn(line_nr, `Invalid register ${operant}`)); return undefined;
            }
            return [Operant_Type.Reg, value + register_count-1];
        }
        case 'M': case 'm': case '#': {
            const value = my_parse_int(operant.slice(1));
            if (!Number.isInteger(value)){
                errors.push(warn(line_nr, `Invalid memory address ${operant}`)); return undefined;
            }
            return [Operant_Type.Memory, value];
        }
        case '%': {
            let port;
            if (is_digit(operant, 1)){
                port = my_parse_int(operant.slice(1));
                if (!Number.isInteger(port)){
                    errors.push(warn(line_nr, `Invalid port number ${operant}`)); return undefined;
                }
            } else {
                port = enum_from_str(IO_Port, operant.slice(1).toUpperCase());
                if (port === undefined){
                    errors.push(warn(line_nr, `Unkown port ${operant}`)); return undefined;
                }
            }
            return [Operant_Type.Imm, port];
        }
        case '\'': case '"': {
            let char_lit;
            try {
                char_lit = JSON.parse(operant.replace(/"/g, "\\\"").replace(/'/g, '"')) as string;
            } catch (e) {
                errors.push(warn(line_nr, `Invalid character ${operant}\n  ${e}`));
                return undefined;
            }
            return [Operant_Type.Imm, char_lit.charCodeAt(0)];
        }
        default: {
            const value = my_parse_int(operant);
            if (!Number.isInteger(value)){
                errors.push(warn(line_nr, `Invalid immediate ${operant}`)); return undefined;
            }
            return [Operant_Type.Imm, value];
        }
    }
}

function str_until(string: string, sub_string: string){
    const end = string.indexOf(sub_string);
    if (end < 0){return string;}
    return string.slice(0, end);
}
