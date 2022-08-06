import { compile } from "./emulator/compiler.js";
import { parse } from "./emulator/parser.js";
import { Emu } from "./emulator/to_js.js";
const urcl = `
BITS == 32
IMM r1 0
.loop
    INC r1 r1
    JMP .loop

`;
const parsed = parse(urcl);
const [program, debug_info] = compile(parsed);
if (parsed.errors.length > 0) {
    console.error(parsed.errors);
    throw new Error();
}
const emu = new Emu();
emu.load_program(program, debug_info);
for (let i = 0; i < 10; i++) {
    const [res, count] = emu.burst(400_000_000, 1000);
    console.log(count, "Hz");
}
//# sourceMappingURL=test.js.map