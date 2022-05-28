function ansi(f, c) {
    return `\u001b[${f};${c}m`;
}
const clear = "\u001b[0m";
export const token_to_ansi = {
    unknown: ansi(4 /* underline */, 31 /* red */),
    comment: ansi(0 /* normal */, 32 /* green */),
    "comment-multi": ansi(0 /* normal */, 32 /* green */),
    white: clear,
    "white-inline": clear,
    opcode: ansi(1 /* bold */, 34 /* blue */),
    dw: ansi(1 /* bold */, 34 /* blue */),
    "square-open": ansi(0 /* normal */, 30 /* gray */),
    "square-close": ansi(0 /* normal */, 30 /* gray */),
    number: ansi(1 /* bold */, 32 /* green */),
    register: ansi(0 /* normal */, 34 /* blue */),
    port: ansi(1 /* bold */, 32 /* green */),
    memory: ansi(1 /* bold */, 32 /* green */),
    escape: ansi(1 /* bold */, 33 /* yellow */),
    "quote-string": ansi(0 /* normal */, 33 /* yellow */),
    "quote-char": ansi(0 /* normal */, 33 /* yellow */),
    text: ansi(0 /* normal */, 33 /* yellow */),
    macro: ansi(1 /* bold */, 35 /* pink */),
    name: ansi(0 /* normal */, 34 /* blue */),
    expansion: ansi(1 /* bold */, 35 /* pink */),
    label: ansi(0 /* normal */, 33 /* yellow */),
    relative: ansi(0 /* normal */, 33 /* yellow */),
    comparator: clear
};
//# sourceMappingURL=ansi.js.map