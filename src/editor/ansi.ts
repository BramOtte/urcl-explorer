import {Token_Type} from "./tokenizer.js";

const enum F {
    normal, bold, underline = 4
}
const enum C {
    gray=30, red, green , yellow, blue, pink, cyan
}

function ansi(f: F, c: C) {
    return `\u001b[${f};${c}m`;
}
const clear = "\u001b[0m";

export const token_to_ansi: Record<Token_Type, string> = {
    unknown: ansi(F.underline, C.red),
    comment: ansi(F.normal, C.green),
    "comment-multi": ansi(F.normal, C.green),
    white: clear,
    "white-inline": clear,
    opcode: ansi(F.bold, C.blue),
    dw: ansi(F.bold, C.blue),
    "square-open": ansi(F.normal, C.gray),
    "square-close": ansi(F.normal, C.gray),
    number: ansi(F.bold, C.green),
    register: ansi(F.normal, C.blue),
    port: ansi(F.bold, C.green),
    memory: ansi(F.bold, C.green),
    escape: ansi(F.bold, C.yellow),
    "quote-string": ansi(F.normal, C.yellow),
    "quote-char": ansi(F.normal, C.yellow),
    text: ansi(F.normal, C.yellow),
    macro: ansi(F.bold, C.pink),
    name: ansi(F.normal, C.blue),
    expansion: ansi(F.bold, C.pink),
    label: ansi(F.normal, C.yellow),
    relative: ansi(F.normal, C.yellow),
    comparator: clear
};