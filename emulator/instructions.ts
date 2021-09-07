import { Arr, i53, Word } from "./util.js";

// export 
export enum Opcodes {
    // Core Instructions
    ADD, RSH, LOD, STR, BGE, NOR, IMM,
    // Basic Instructions
    SUB, JMP, MOV, NOP, LSH, INC, DEC, NEG,
    AND, OR, NOT, XNOR, XOR, NAND,
    BRL, BRG, BRE, BNE, BOD, BEV, BLE, BRZ,
    BNZ, BRN, BRP, PSH, POP, CAL, RET, HLT,
    CPY, BRC, BNC,

    // Complex Instructions
    MLT, DIV, MOD, BSR, BSL, SRS, BSS,
    SETE, SETNE, SETG, SETL, SETGE, SETLE,
    SETC, SETNC, LLOD, LSTR,

    // IO Instructions
    IN, OUT,

    //----- Debug Instructions
    // assert equals
    ASEQ
}
export enum Value_Type {
    Reg, Imm, Ram
} 

export enum Op_Type {
    PC, SET, GET, GET_RAM, SET_RAM, PSH, POP
}

export enum URCL_Headers {
    BITS, MINREG, RUN, MINSTACK
}
export enum IO_Ports {
    TEXT
}

export interface Instruction_Ctx {
    readonly bits: i53,
    readonly max_value: Word,
    readonly max_signed: Word,
    readonly sign_bit: Word,
    pc: Word;
    push(a: Word): void;
    pop(): Word;
    in(port: Word): Word;
    out(port: Word, value: Word): void;
}

const {SET, GET, GET_RAM: GAM, SET_RAM: SAM} = Op_Type;
export const Opcodes_operants: Partial<Record<Opcodes, [Op_Type[], (ops: Arr<Word>, specs: Instruction_Ctx)=>void]>> = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcodes.ADD ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] + ops[2]],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcodes.RSH ]: [[SET, GET     ], (ops) => ops[0] = ops[1] >>> 1],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcodes.LOD ]: [[SET, GAM     ], (ops) => ops[0] = ops[1]],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcodes.STR ]: [[SAM, GET     ], (ops) => ops[0] = ops[1]],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcodes.BGE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] >= ops[2]) s.pc = ops[0]}],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcodes.NOR ]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] | ops[2])],
    // Load immediate
    [Opcodes.IMM ]: [[SET, GET     ], (ops) => ops[0] = ops[1]],
    
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcodes.SUB ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] - ops[2]],
    // Branch to address specified by Op1
    [Opcodes.JMP ]: [[GET          ], (ops, s) => s.pc = ops[0]],
    // Copy Op2 to Op1
    [Opcodes.MOV ]: [[SET, GET     ], (ops) => ops[0] = ops[1]],
    // Copy Op2 to Op1
    [Opcodes.NOP ]: [[             ], ()=>{}],
    // Left shift Op2 once then put result into Op1
    [Opcodes.LSH ]: [[SET, GET     ], (ops) => ops[0] = ops[1] << 1],
    // Add 1 to Op2 then put result into Op1
    [Opcodes.INC ]: [[SET, GET     ], (ops) => ops[0] = ops[1] + 1],
    // Subtract 1 from Op2 then put result into Op1
    [Opcodes.DEC ]: [[SET, GET     ], (ops) => ops[0] = ops[1] - 1],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcodes.NEG ]: [[SET, GET     ], (ops) => ops[0] = -ops[1]],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcodes.AND ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] & ops[2]],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcodes.OR  ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] | ops[2]],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcodes.NOT ]: [[SET, GET     ], (ops) => ops[0] = ~ops[1]],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcodes.XNOR]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] ^ ops[2])],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcodes.XOR ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] ^ ops[2]],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcodes.NAND]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] & ops[2])],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcodes.BRL ]: [[GET, GET, GET], (ops, s) => {if (ops[1] < ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcodes.BRG ]: [[GET, GET, GET], (ops, s) => {if (ops[1] > ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcodes.BRE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] === ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcodes.BNE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] !== ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcodes.BOD ]: [[GET, GET     ], (ops, s) => {if (ops[1] & 1) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcodes.BEV ]: [[GET, GET     ], (ops, s) => {if (!(ops[1] & 1)) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcodes.BLE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] <= ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcodes.BRZ ]: [[GET, GET     ], (ops, s) => {if (ops[1] === 0) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcodes.BNZ ]: [[GET, GET     ], (ops, s) => {if (ops[1] !== 0) s.pc = ops[0]}],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcodes.BRN ]: [[GET, GET     ], (ops, s) => {if (ops[1] & s.sign_bit) s.pc = ops[0]}],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcodes.BRP ]: [[GET, GET     ], (ops, s) => {if (!(ops[1] & s.sign_bit)) s.pc = ops[0]}],
    // Push Op1 onto the value stack
    [Opcodes.PSH ]: [[GET          ], (ops, s) => s.push(ops[0])],
    // Pop from the value stack into Op1
    [Opcodes.POP ]: [[SET          ], (ops, s) => ops[0] = s.pop()],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcodes.CAL ]: [[GET          ], (ops, s) => {s.push(s.pc); s.pc = ops[0]}],
    // Pops from the stack, then branches to that value
    [Opcodes.RET ]: [[             ], (_, s) => s.pc = s.pop()],
    // Stop Execution emediately after opcode is read
    [Opcodes.HLT ]: [[             ],()=>{}],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcodes.CPY ]: [[SAM, GAM     ], (ops) => ops[0] = ops[1]],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcodes.BRC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] > s.max_value) s.pc = ops[0]}],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcodes.BNC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] <= s.max_value) s.pc = ops[0]}],

    //----- Complex Instructions
    [Opcodes.MLT ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] * ops[2]],
    [Opcodes.DIV ]: [[SET, GET, GET], (ops) => ops[0] = ops[1] / ops[2]],

    //----- IO Instructions
    [Opcodes.IN  ]: [[SET, GET], (ops, s) => ops[0] = s.in(ops[1])],
    [Opcodes.OUT ]: [[GET, GET], (ops, s) => s.out(ops[0], ops[1])],
};
