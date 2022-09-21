import { IO_Port, Opcode, Opcodes_operants, Operant_Operation, Operant_Prim, Register, URCL_Header } from "./instructions.js";
const curcl_inst = {
    [Opcode.ADD]: s => `${s.a} = ${s.b} + ${s.c};`,
    [Opcode.RSH]: s => `${s.a} = ${s.b} >> 1;`,
    [Opcode.LOD]: s => `${s.a} = memory[${s.b}];`,
    [Opcode.STR]: s => `memory[${s.a}] = ${s.b};`,
    [Opcode.BGE]: s => `if (${s.b} >= ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.SBGE]: s => `if (${s.sb} >= ${s.sc}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.NOR]: s => `${s.a} = ~(${s.b} | ${s.c});`,
    [Opcode.IMM]: s => `${s.a} = ${s.b};`,
    [Opcode.SUB]: s => `${s.a} = ${s.b} - ${s.c};`,
    [Opcode.JMP]: s => `${s.pc} = ${s.a}; continue;`,
    [Opcode.MOV]: s => `${s.a} = ${s.b};`,
    [Opcode.NOP]: s => ``,
    [Opcode.LSH]: s => `${s.a} = ${s.b} << 1;`,
    [Opcode.INC]: s => `${s.a} = ${s.b} + 1;`,
    [Opcode.DEC]: s => `${s.a} = ${s.b} - 1;`,
    [Opcode.NEG]: s => `${s.a} = -${s.b};`,
    [Opcode.AND]: s => `${s.a} = ${s.b} & ${s.c};`,
    [Opcode.OR]: s => `${s.a} = ${s.b} | ${s.c};`,
    [Opcode.NOT]: s => `${s.a} = ~${s.b};`,
    [Opcode.XNOR]: s => `${s.a} = ~(${s.b} ^ ${s.c});`,
    [Opcode.XOR]: s => `${s.a} = ${s.b} ^ ${s.c};`,
    [Opcode.NAND]: s => `${s.a} = ~(${s.b} & ${s.c});`,
    [Opcode.BRL]: s => `if (${s.b} < ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.SBRL]: s => `if (${s.sb} < ${s.sc}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BRG]: s => `if (${s.b} > ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.SBRG]: s => `if (${s.sb} > ${s.sc}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BRE]: s => `if (${s.b} == ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BNE]: s => `if (${s.b} != ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BOD]: s => `if (${s.b} & 1 == 1) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BEV]: s => `if (${s.b} & 1 == 0) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BLE]: s => `if (${s.b} <= ${s.c}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.SBLE]: s => `if (${s.sb} <= ${s.sc}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BRZ]: s => `if (${s.b} == 0) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BNZ]: s => `if (${s.b} != 0) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BRN]: s => `if (${s.sb} < 0) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BRP]: s => `if (${s.sb} >= 0) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.PSH]: s => `memory[--${s.sp}] = ${s.a};`,
    [Opcode.POP]: s => `${s.a} = memory[${s.sp}++];`,
    [Opcode.CAL]: s => `memory[--${s.sp}] = ${s.pc}; ${s.pc} = ${s.a}; continue;`,
    [Opcode.RET]: s => `${s.pc} = memory[${s.sp}++]; continue;`,
    [Opcode.HLT]: s => `${s.pc} = -1; continue;`,
    [Opcode.CPY]: s => `memory[${s.a}] = memory[${s.b}];`,
    [Opcode.BRC]: s => `if (${s.b} + ${s.c} < ${s.b}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.BNC]: s => `if (${s.b} + ${s.c} >= ${s.b}) {${s.pc} = ${s.a}; continue;}`,
    [Opcode.ABS]: s => `${s.a} = ${s.b} < 0 ? -${s.b} : ${s.b};`,
    [Opcode.MLT]: s => `${s.a} = ${s.b} * ${s.c};`,
    [Opcode.DIV]: s => `${s.a} = ${s.b} / ${s.c};`,
    [Opcode.MOD]: s => `${s.a} = ${s.b} % ${s.c};`,
    [Opcode.BSR]: s => `${s.a} = ${s.b} >> ${s.c};`,
    [Opcode.SRS]: s => `${s.a} = ${s.sb} >> 1;`,
    [Opcode.BSS]: s => `${s.a} = ${s.sb} >> ${s.c};`,
    [Opcode.SETE]: s => `${s.a} = ${s.b} === ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SETNE]: s => `${s.a} = ${s.b} !== ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SETG]: s => `${s.a} = ${s.b} > ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SSETG]: s => `${s.a} = ${s.sb} > ${s.sc} ? ${s.max_value} : 0;`,
    [Opcode.SETL]: s => `${s.a} = ${s.b} < ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SSETL]: s => `${s.a} = ${s.sb} < ${s.sc} ? ${s.max_value} : 0;`,
    [Opcode.SETGE]: s => `${s.a} = ${s.b} >= ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SSETGE]: s => `${s.a} = ${s.sb} >= s.sc ? ${s.max_value} : 0;`,
    [Opcode.SETLE]: s => `${s.a} = ${s.b} <= ${s.c} ? ${s.max_value} : 0;`,
    [Opcode.SSETLE]: s => `${s.a} = ${s.sb} <= ${s.sc} ? ${s.max_value} : 0;`,
    [Opcode.SETC]: s => `${s.a} = ${s.b} + ${s.c} > ${s.max_value} ? ${s.max_value} : 0;`,
    [Opcode.SETNC]: s => `${s.a} = ${s.b} + ${s.c} > ${s.b} ? ${s.max_value} : 0;`,
    [Opcode.LLOD]: s => `${s.a} = memory[${s.b} + ${s.c}];`,
    [Opcode.LSTR]: s => `memory[${s.a} + ${s.b}] = ${s.c};`,
    [Opcode.OUT]: s => {
        switch (parseInt(s.a)) {
            case IO_Port.TEXT: return `fprintf(cout, "%c", ${s.b});`;
            case IO_Port.NUMB: return `fprintf(cout, "%${s.fint}", ${s.b});`;
        }
        return ``;
    }
};
export function urcl2c(program, debug_info) {
    const bits = program.headers[URCL_Header.BITS].value;
    const register_count = program.headers[URCL_Header.MINREG].value + 2;
    const heap_size = program.headers[URCL_Header.MINHEAP].value;
    const stack_size = program.headers[URCL_Header.MINSTACK].value;
    const memory_size = program.data.length + heap_size + stack_size;
    const ctx = {
        a: "0", b: "0", c: "0",
        sa: "0", sb: "0", sc: "0",
        pc: `r${Register.PC}`, sp: `r${Register.SP}`,
        max_value: "" + (2 ** bits - 1),
        fint: "d"
    };
    let c = `#include "stdint.h"
#include "stdio.h"
typedef uint${bits}_t uword;
typedef int${bits}_t sword;

uword memory[${memory_size}] = {${program.data.join(", "), 0}};

int main() {
FILE* cout = stdout;
int out_p = -1;
int out_v = -1;
uword zero = 0;
register uword${Array.from({ length: register_count }, (_, i) => ` r${i} = 0`).join(",\n")};
while (1) switch (${ctx.pc}) {
`;
    for (let i = 0; i < program.opcodes.length; ++i) {
        const prims = program.operant_prims[i];
        const values = program.operant_values[i];
        const opcode = program.opcodes[i];
        for (let j = 0; j < prims.length; ++j) {
            let op = prims[j] == Operant_Prim.Reg ? "r" + values[j] : "" + values[j];
            if (j == 0) {
                if (prims[j] === Operant_Prim.Imm && values[j] === 0
                    && Opcodes_operants[opcode][0][0] === Operant_Operation.SET) {
                    op = "zero";
                }
                ctx.a = op;
                ctx.sa = "(sword)" + op;
            }
            else if (j == 1) {
                ctx.b = op;
                ctx.sb = "(sword)" + op;
            }
            else if (j == 2) {
                ctx.c = op;
                ctx.sc = "(sword)" + op;
            }
            else {
                throw new Error("inst can't have more than 3 operants");
            }
        }
        const inst = curcl_inst[opcode];
        if (inst === undefined) {
            throw new Error(`unimplemented opcode ${opcode} (${Opcode[opcode]})`);
        }
        c += `case ${i}: {${inst(ctx)}} ${ctx.pc} = ${i + 1};\n`;
    }
    return c + `default: printf("done %d %d", out_p, out_v);\n;return 0;\n}}`;
}
//# sourceMappingURL=urcl2c.js.map