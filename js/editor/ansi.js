function ansi(f, c) {
    return `\u001b[${f};${c}m`;
}
const clear = "\u001b[0m";
export const token_to_ansi = {
    unknown: ansi(4 /* F.underline */, 31 /* C.red */),
    comment: ansi(0 /* F.normal */, 32 /* C.green */),
    "comment-multi": ansi(0 /* F.normal */, 32 /* C.green */),
    white: clear,
    "white-inline": clear,
    opcode: ansi(1 /* F.bold */, 34 /* C.blue */),
    dw: ansi(1 /* F.bold */, 34 /* C.blue */),
    "square-open": ansi(0 /* F.normal */, 30 /* C.gray */),
    "square-close": ansi(0 /* F.normal */, 30 /* C.gray */),
    number: ansi(1 /* F.bold */, 32 /* C.green */),
    register: ansi(0 /* F.normal */, 34 /* C.blue */),
    port: ansi(1 /* F.bold */, 32 /* C.green */),
    memory: ansi(1 /* F.bold */, 32 /* C.green */),
    escape: ansi(1 /* F.bold */, 33 /* C.yellow */),
    "quote-string": ansi(0 /* F.normal */, 33 /* C.yellow */),
    "quote-char": ansi(0 /* F.normal */, 33 /* C.yellow */),
    text: ansi(0 /* F.normal */, 33 /* C.yellow */),
    macro: ansi(1 /* F.bold */, 35 /* C.pink */),
    name: ansi(0 /* F.normal */, 34 /* C.blue */),
    expansion: ansi(1 /* F.bold */, 35 /* C.pink */),
    label: ansi(0 /* F.normal */, 33 /* C.yellow */),
    relative: ansi(0 /* F.normal */, 33 /* C.yellow */),
    comparator: clear
};
//# sourceMappingURL=ansi.js.map