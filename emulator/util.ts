export type i53 = number;
export type Reg = number;
export type Word = number;
export type Ln_Nr = number;
export interface Arr<T, L extends number = number> {
    [K: number]: T, 
    length: L,
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
