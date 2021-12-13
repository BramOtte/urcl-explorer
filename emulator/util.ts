import { Emulator } from "./emulator.js";
import { Register, register_count } from "./instructions.js";

export type i53 = number;
export type Reg = number;
export type Word = number;
export type Ln_Nr = number;

export interface Warning {
    line_nr: number,
    message: string
}
export function warn(line_nr: number, message: string): Warning {
    return {line_nr, message};
}
export function expand_warning(warning: Warning, lines: string[], file_name?: string){
    const {message, line_nr} = warning;
    return `${file_name ?? "urcl"}:${line_nr+1} - ${message}\n   ${lines[line_nr]}`;
}

export function pad_left(str: string, size: number, char = " "){
    const pad = Math.max(0, size - str.length);
    return char.repeat(pad) + str;
}
export function pad_right(str: string, size: number, char = " "){
    const pad = Math.max(0, size - str.length);
    return str + char.repeat(pad);
}
export function pad_center(str: string, size: number, left_char = " ", right_char = left_char){
    const pad = Math.max(0, size - str.length);
    const left = 0| pad /2;
    const right = pad - left;
    return left_char.repeat(left) + str + right_char.repeat(right);
}
export function hex(num: number, size: number, pad="_"){
    return pad_left(num.toString(16), size, pad).toUpperCase();
}
export function hex_size(bits: number){
    return Math.ceil(bits / 4);
}
export function registers_to_string(emulator: Emulator) {
    const nibbles = hex_size(emulator.bits);
    return Array.from({ length: register_count }, (_,i) => pad_center(Register[i], nibbles) + " ").join("") +
        Array.from({ length: emulator.registers.length - register_count }, (_, i) => pad_center(`R${i + 1}`, nibbles) + " ").join("") + "\n" +
        Array.from(emulator.registers, (v)=> hex(v, nibbles) + " ").join("");
}

export function indent(string: string, spaces: number){
    const left = " ".repeat(spaces);
    return string.split("\n").map(line=>left + line).join("\n")
}

export interface Arr<T = number, L extends number = number> {
    [K: number]: T; 
    length: L;
    fill(a: number): this
    map(callback: (v: T, i: keyof this, arr:this)=>T): this
    join(sepperator?: string): string;
}
export function object_map<T, Res extends {}>
(obj: T, callback: (key: keyof T, value: T[keyof T])=>[keyof Res, Res[keyof Res]])
{
    const res = {} as Res;
    for (const key in obj){
        const value = obj[key];
        const [new_key, new_value] = callback(key, value);
        res[new_key] = new_value;
    }
    return res;
}

const char_code_0 = "0".charCodeAt(0);
const char_code_9 = char_code_0 + 9;
export function is_digit(str: string, index = 0){
    const char_code = str.charCodeAt(index);
    return char_code >= char_code_0 && char_code <= char_code_9; 
}
type Enum_Obj<T = unknown> = Record<string, T>

export function enum_last(enum_obj: Record<string, unknown> ){
    let last = -1;
    for (const key in enum_obj){
        const value = enum_obj[key];
        if (typeof value === "number"){
            last = Math.max(last, value);
        }
    }
    return last;
}

export function enum_count(enum_obj: Enum_Obj){
    return enum_last(enum_obj) + 1;
}

export function enum_strings<T>(enum_obj: Enum_Obj<T>): (T&string)[]
{
    const strings: (T&string)[] = [];
    for (const key in enum_obj){
        const value = enum_obj[key];
        if (typeof value === "string"){
            strings.push(value);
        }
    }
    return strings;
}
export function enum_numbers<T>(enum_obj: Enum_Obj<T>): (T&number)[]
{
    const strings: (T&number)[] = [];
    for (const key in enum_obj){
        const value = enum_obj[key];
        if (typeof value === "number"){
            strings.push(value);
        }
    }
    return strings;
}

export function enum_from_str<T>
    (enum_obj: Enum_Obj<T>, str: string): undefined | (T & number)
{
    if (is_digit(str)){
        return undefined;
    }
    const value = enum_obj[str];
    return value as T & number;
}

export function with_defaults<T>(defaults: T, options: Partial<T>): T {
    const with_defaults = {...defaults};
    for (const name in options){
        if (options[name] !== undefined){
            with_defaults[name] = options[name] as any;
        }
    }
    return with_defaults;
}
