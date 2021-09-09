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
    ASE
}

export enum Value_Type {
    Reg, Imm
}

export enum Pre_Value_Type {
    Reg = Value_Type.Reg, Imm = Value_Type.Imm,
    Port, Memory, Label, Char
}

export enum Op_Type {
    SET, GET, GET_RAM, SET_RAM, RAM_OFFSET
}

export enum URCL_Headers {
    BITS, MINREG, RUN, MINSTACK
}
export enum IO_Ports {
    // General
    CPUBUS, TEXT, NUMB, SUPPORTED = 5, SPECIAL, PROFILE,
    // Graphics
    X, Y, COLOR, BUFFER, G_SPECIAL = 15,
    // Text
    ASCII, CHAR5, CHAR6, ASCII7, UTF8, T_SPECIAL = 23,
    // Numbers
    INT, UINT, BIN, HEX, FLOAT, FIXED, N_SPECIAL=31,
    // Storage
    ADDR, BUS, PAGE, S_SPECIAL=39,
    // Miscellaneous
    RNG, NOTE, INSTR, NLEG, WAIT, NADDR, DATA, M_SPECIAL,
    // User defined
    UD1, UD2, UD3, UD4, UD5, UD6, UD7, UD8, UD9, UD10, UD11, UD12, UD13, UD14, UD15, UD16,
}

export interface Instruction_Ctx {
    readonly bits: i53,
    readonly max_value: Word,
    readonly max_signed: Word,
    readonly sign_bit: Word,
    pc: Word;
    push(a: Word): void;
    pop(): Word;
    in(port: Word): Word | Promise<Word>;
    out(port: Word, value: Word): void;
}

type Instruction_Callback = (ops: Arr<Word>, ctx: Instruction_Ctx) => void | Promise<void>;

const {SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO} = Op_Type;
export const Opcodes_operants: Partial<Record<Opcodes, [Op_Type[], Instruction_Callback]>> = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcodes.ADD ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] + ops[2]}],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcodes.RSH ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] >>> 1}],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcodes.LOD ]: [[SET, GAM     ], (ops) => {ops[0] = ops[1]}],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcodes.STR ]: [[SAM, GET     ], (ops) => {ops[0] = ops[1]}],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcodes.BGE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] >= ops[2]) s.pc = ops[0]}],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcodes.NOR ]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] | ops[2])}],
    // Load immediate
    [Opcodes.IMM ]: [[SET, GET     ], (ops) => {ops[0] = ops[1]}],
    
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcodes.SUB ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] - ops[2]}],
    // Branch to address specified by Op1
    [Opcodes.JMP ]: [[GET          ], (ops, s) => {s.pc = ops[0]}],
    // Copy Op2 to Op1
    [Opcodes.MOV ]: [[SET, GET     ], (ops) => {ops[0] = ops[1]}],
    // Copy Op2 to Op1
    [Opcodes.NOP ]: [[             ], ()=>{}],
    // Left shift Op2 once then put result into Op1
    [Opcodes.LSH ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] << 1}],
    // Add 1 to Op2 then put result into Op1
    [Opcodes.INC ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] + 1}],
    // Subtract 1 from Op2 then put result into Op1
    [Opcodes.DEC ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] - 1}],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcodes.NEG ]: [[SET, GET     ], (ops) => {ops[0] = -ops[1]}],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcodes.AND ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] & ops[2]}],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcodes.OR  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] | ops[2]}],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcodes.NOT ]: [[SET, GET     ], (ops) => {ops[0] = ~ops[1]}],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcodes.XNOR]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] ^ ops[2])}],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcodes.XOR ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] ^ ops[2]}],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcodes.NAND]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] & ops[2])}],
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
    [Opcodes.PSH ]: [[GET          ], (ops, s) => {s.push(ops[0])}],
    // Pop from the value stack into Op1
    [Opcodes.POP ]: [[SET          ], (ops, s) => {ops[0] = s.pop()}],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcodes.CAL ]: [[GET          ], (ops, s) => {s.push(s.pc); s.pc = ops[0]}],
    // Pops from the stack, then branches to that value
    [Opcodes.RET ]: [[             ], (_, s) => {s.pc = s.pop()}],
    // Stop Execution emediately after opcode is read
    [Opcodes.HLT ]: [[             ],()=>{}],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcodes.CPY ]: [[SAM, GAM     ], (ops) => {ops[0] = ops[1]}],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcodes.BRC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] > s.max_value) s.pc = ops[0]}],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcodes.BNC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] <= s.max_value) s.pc = ops[0]}],

    //----- Complex Instructions
    // Multiply Op2 by Op3 then put the lower half of the answer into Op1
    [Opcodes.MLT  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] * ops[2]}],
    // Unsigned division of Op2 by Op3 then put answer into Op1
    [Opcodes.DIV  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] / ops[2]}],
    // Unsigned modulus of Op2 by Op3 then put answer into Op1
    [Opcodes.MOD  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] % ops[2]}],
    // Right shift Op2, Op3 times then put result into Op1
    [Opcodes.BSR  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] >>> ops[2]}],
    // Left shift Op2, Op3 times then put result into Op1
    [Opcodes.BSL  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] << ops[2]}],
    // Signed right shift Op2 once then put result into Op1
    [Opcodes.SRS  ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] >> 1}],
    // Signed right shift Op2, Op3 times then put result into Op1
    [Opcodes.BSS  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] >> ops[2]}],
    // If Op2 equals Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETE ]: [[SET, GET, GET], (ops, s) => {if (ops[1] === ops[2]) ops[0] = s.max_value}],
    // If Op2 is not equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETNE]: [[SET, GET, GET], (ops, s) => {if (ops[1] !== ops[2]) ops[0] = s.max_value}],
    // If Op2 if more than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETG ]: [[SET, GET, GET], (ops, s) => {if (ops[1] > ops[2]) ops[0] = s.max_value}],
    // If Op2 if less than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETL ]: [[SET, GET, GET], (ops, s) => {if (ops[1] < ops[2]) ops[0] = s.max_value}],
    // If Op2 if greater than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETGE]: [[SET, GET, GET], (ops, s) => {if (ops[1] >= ops[2]) ops[0] = s.max_value}],
    // If Op2 if less than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcodes.SETLE]: [[SET, GET, GET], (ops, s) => {if (ops[1] <= ops[2]) ops[0] = s.max_value}],
    // If Op2 + Op3 produces a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcodes.SETC ]: [[SET, GET, GET], (ops, s) => {if (ops[1] + ops[2] > s.max_value) ops[0] = s.max_value}],
    // If Op2 + Op3 does not produce a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcodes.SETNC]: [[SET, GET, GET], (ops, s) => {if (ops[1] + ops[2] <= s.max_value) ops[0] = s.max_value}],
    // Copy RAM value pointed to by (Op2 + Op3) into Op1. Where Op2 is the base pointer is Op3 is the offset.
    [Opcodes.LLOD ]: [[SET, RAO, GAM], (ops) => {ops[0] = ops[2]}],
    // Copy Op3 into RAM value pointed to by (Op1 + Op2). Where Op1 is the base pointer is Op2 is the offset.
    [Opcodes.LLOD ]: [[RAO, SAM, GET], (ops) => {ops[1] = ops[2]}],

    //----- IO Instructions
    [Opcodes.IN  ]: [[SET, GET], async (ops, s) => {ops[0] = await s.in(ops[1])}],
    [Opcodes.OUT ]: [[GET, GET], (ops, s) => {s.out(ops[0], ops[1])}],
};
