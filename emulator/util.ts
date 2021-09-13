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
export function expand_warning(warning: Warning, lines: string[]){
    const {message, line_nr} = warning;
    return message + `\n  on line ${line_nr}: ${lines[line_nr]}`;
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
