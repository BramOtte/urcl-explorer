import { Arr, i53, Word } from "./util.js";

// export 
export enum Opcode {
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
    ASE, _Count
}

export enum Register {
    "r0" = 0, "r1" = 0, "$0" = 0, 
    Zero = 0, PC, SP,
    _Count
}

export enum Operant_Prim {
    Reg, Imm, _Count
}

export enum Operant_Type {
    Reg = Operant_Prim.Reg, Imm = Operant_Prim.Imm,
    Port, Memory, Label, Char,
    _Count
}

export enum Operant_Operation {
    SET, GET, GET_RAM, SET_RAM, RAM_OFFSET, _Count
}

export enum URCL_Header {
    BITS, MINREG, MINHEAP, RUN, MINSTACK, _Count
}

export enum Header_Operant {
    "==", "<=", ">=", _Count
}
export enum Header_Run {
    ROM, RAM, _Count
}

export const urcl_headers = {
    [URCL_Header.BITS]: {def: 8},
    [URCL_Header.MINREG]: {def: 8},
    [URCL_Header.MINHEAP]: {def: 16},
    [URCL_Header.RUN]: {def: Header_Run.ROM},
    [URCL_Header.MINSTACK]: {def: 8},
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
    _Count
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

const {SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO} = Operant_Operation;
export const Opcodes_operants: Partial<Record<Opcode, [Operant_Operation[], Instruction_Callback]>> = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcode.ADD ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] + ops[2]}],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcode.RSH ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] >>> 1}],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcode.LOD ]: [[SET, GAM     ], (ops) => {ops[0] = ops[1]}],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcode.STR ]: [[SAM, GET     ], (ops) => {ops[0] = ops[1]}],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcode.BGE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] >= ops[2]) s.pc = ops[0]}],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcode.NOR ]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] | ops[2])}],
    // Load immediate
    [Opcode.IMM ]: [[SET, GET     ], (ops) => {ops[0] = ops[1]}],
    
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcode.SUB ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] - ops[2]}],
    // Branch to address specified by Op1
    [Opcode.JMP ]: [[GET          ], (ops, s) => {s.pc = ops[0]}],
    // Copy Op2 to Op1
    [Opcode.MOV ]: [[SET, GET     ], (ops) => {ops[0] = ops[1]}],
    // Copy Op2 to Op1
    [Opcode.NOP ]: [[             ], ()=>{}],
    // Left shift Op2 once then put result into Op1
    [Opcode.LSH ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] << 1}],
    // Add 1 to Op2 then put result into Op1
    [Opcode.INC ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] + 1}],
    // Subtract 1 from Op2 then put result into Op1
    [Opcode.DEC ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] - 1}],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcode.NEG ]: [[SET, GET     ], (ops) => {ops[0] = -ops[1]}],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcode.AND ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] & ops[2]}],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcode.OR  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] | ops[2]}],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcode.NOT ]: [[SET, GET     ], (ops) => {ops[0] = ~ops[1]}],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcode.XNOR]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] ^ ops[2])}],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcode.XOR ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] ^ ops[2]}],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcode.NAND]: [[SET, GET, GET], (ops) => {ops[0] = ~(ops[1] & ops[2])}],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcode.BRL ]: [[GET, GET, GET], (ops, s) => {if (ops[1] < ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcode.BRG ]: [[GET, GET, GET], (ops, s) => {if (ops[1] > ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcode.BRE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] === ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcode.BNE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] !== ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcode.BOD ]: [[GET, GET     ], (ops, s) => {if (ops[1] & 1) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcode.BEV ]: [[GET, GET     ], (ops, s) => {if (!(ops[1] & 1)) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcode.BLE ]: [[GET, GET, GET], (ops, s) => {if (ops[1] <= ops[2]) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcode.BRZ ]: [[GET, GET     ], (ops, s) => {if (ops[1] === 0) s.pc = ops[0]}],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcode.BNZ ]: [[GET, GET     ], (ops, s) => {if (ops[1] !== 0) s.pc = ops[0]}],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcode.BRN ]: [[GET, GET     ], (ops, s) => {if (ops[1] & s.sign_bit) s.pc = ops[0]}],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcode.BRP ]: [[GET, GET     ], (ops, s) => {if (!(ops[1] & s.sign_bit)) s.pc = ops[0]}],
    // Push Op1 onto the value stack
    [Opcode.PSH ]: [[GET          ], (ops, s) => {s.push(ops[0])}],
    // Pop from the value stack into Op1
    [Opcode.POP ]: [[SET          ], (ops, s) => {ops[0] = s.pop()}],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcode.CAL ]: [[GET          ], (ops, s) => {s.push(s.pc); s.pc = ops[0]}],
    // Pops from the stack, then branches to that value
    [Opcode.RET ]: [[             ], (_, s) => {s.pc = s.pop()}],
    // Stop Execution emediately after opcode is read
    [Opcode.HLT ]: [[             ],()=>{}],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcode.CPY ]: [[SAM, GAM     ], (ops) => {ops[0] = ops[1]}],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcode.BRC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] > s.max_value) s.pc = ops[0]}],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcode.BNC ]: [[GET, GET, GET], (ops, s) => {if (ops[1] + ops[2] <= s.max_value) s.pc = ops[0]}],

    //----- Complex Instructions
    // Multiply Op2 by Op3 then put the lower half of the answer into Op1
    [Opcode.MLT  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] * ops[2]}],
    // Unsigned division of Op2 by Op3 then put answer into Op1
    [Opcode.DIV  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] / ops[2]}],
    // Unsigned modulus of Op2 by Op3 then put answer into Op1
    [Opcode.MOD  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] % ops[2]}],
    // Right shift Op2, Op3 times then put result into Op1
    [Opcode.BSR  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] >>> ops[2]}],
    // Left shift Op2, Op3 times then put result into Op1
    [Opcode.BSL  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] << ops[2]}],
    // Signed right shift Op2 once then put result into Op1
    [Opcode.SRS  ]: [[SET, GET     ], (ops) => {ops[0] = ops[1] >> 1}],
    // Signed right shift Op2, Op3 times then put result into Op1
    [Opcode.BSS  ]: [[SET, GET, GET], (ops) => {ops[0] = ops[1] >> ops[2]}],
    // If Op2 equals Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETE ]: [[SET, GET, GET], (ops, s) => {if (ops[1] === ops[2]) ops[0] = s.max_value}],
    // If Op2 is not equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETNE]: [[SET, GET, GET], (ops, s) => {if (ops[1] !== ops[2]) ops[0] = s.max_value}],
    // If Op2 if more than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETG ]: [[SET, GET, GET], (ops, s) => {if (ops[1] > ops[2]) ops[0] = s.max_value}],
    // If Op2 if less than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETL ]: [[SET, GET, GET], (ops, s) => {if (ops[1] < ops[2]) ops[0] = s.max_value}],
    // If Op2 if greater than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETGE]: [[SET, GET, GET], (ops, s) => {if (ops[1] >= ops[2]) ops[0] = s.max_value}],
    // If Op2 if less than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETLE]: [[SET, GET, GET], (ops, s) => {if (ops[1] <= ops[2]) ops[0] = s.max_value}],
    // If Op2 + Op3 produces a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcode.SETC ]: [[SET, GET, GET], (ops, s) => {if (ops[1] + ops[2] > s.max_value) ops[0] = s.max_value}],
    // If Op2 + Op3 does not produce a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcode.SETNC]: [[SET, GET, GET], (ops, s) => {if (ops[1] + ops[2] <= s.max_value) ops[0] = s.max_value}],
    // Copy RAM value pointed to by (Op2 + Op3) into Op1. Where Op2 is the base pointer is Op3 is the offset.
    [Opcode.LLOD ]: [[SET, RAO, GAM], (ops) => {ops[0] = ops[2]}],
    // Copy Op3 into RAM value pointed to by (Op1 + Op2). Where Op1 is the base pointer is Op2 is the offset.
    [Opcode.LLOD ]: [[RAO, SAM, GET], (ops) => {ops[1] = ops[2]}],

    //----- IO Instructions
    [Opcode.IN  ]: [[SET, GET], async (ops, s) => {ops[0] = await s.in(ops[1])}],
    [Opcode.OUT ]: [[GET, GET], (ops, s) => {s.out(ops[0], ops[1])}],
};
