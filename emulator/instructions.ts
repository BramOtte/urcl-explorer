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
    Reg, Imm, Ram,
} 

export enum Op_Type {
    PC, SET, GET, GET_RAM, SET_RAM, PSH, POP
}

export enum URCL_Headers {
    BITS, MINREG, RUN, MINSTACK
}

export interface Instruction_Ctx {
    readonly bits: i53,
    readonly max_value: Word,
    readonly max_signed: Word,
    readonly sign_bit: Word,
}

const {PC, SET, GET, GET_RAM, SET_RAM, PSH, POP} = Op_Type;
export const Opcodes_operants: Partial<Record<Opcodes, [Op_Type[], (ops: Arr<Op_Type>, specs: Instruction_Ctx)=>void]>>= {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcodes.ADD ]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] + ops[2]],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcodes.RSH ]: [[SET, GET         ], (ops) => ops[0] = ops[1] >>> 1],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcodes.LOD ]: [[SET, GET_RAM     ], (ops) => ops[0] = ops[1]],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcodes.STR ]: [[SET_RAM, GET     ], (ops) => ops[0] = ops[1]],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcodes.BGE ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] >= ops[3] ? ops[1] : ops[0]],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcodes.NOR ]: [[SET, GET, GET    ], (ops) => ops[0] = ~(ops[1] | ops[2])],
    // Load immediate
    [Opcodes.IMM ]: [[SET, GET         ], (ops) => ops[0] = ops[1]],
    
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcodes.SUB ]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] - ops[2]],
    // Branch to address specified by Op1
    [Opcodes.JMP ]: [[PC, GET          ], (ops) => ops[0] = ops[1]],
    // Copy Op2 to Op1
    [Opcodes.MOV ]: [[SET, GET         ], (ops) => ops[0] = ops[1]],
    // Copy Op2 to Op1
    [Opcodes.NOP ]: [[], ()=>{}],
    // Left shift Op2 once then put result into Op1
    [Opcodes.LSH ]: [[SET, GET         ], (ops) => ops[0] = ops[1] << 1],
    // Add 1 to Op2 then put result into Op1
    [Opcodes.INC ]: [[SET, GET         ], (ops) => ops[0] = ops[1] + 1],
    // Subtract 1 from Op2 then put result into Op1
    [Opcodes.DEC ]: [[SET, GET         ], (ops) => ops[0] = ops[1] - 1],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcodes.NEG ]: [[SET, GET         ], (ops) => ops[0] = -ops[1]],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcodes.AND ]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] & ops[2]],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcodes.OR  ]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] | ops[2]],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcodes.NOT ]: [[SET, GET         ], (ops) => ops[0] = ~ops[1]],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcodes.XNOR]: [[SET, GET, GET    ], (ops) => ops[0] = ~(ops[1] ^ ops[2])],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcodes.XOR ]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] ^ ops[2]],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcodes.NAND]: [[SET, GET, GET    ], (ops) => ops[0] = ~(ops[1] & ops[2])],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcodes.BRL ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] < ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcodes.BRG ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] > ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcodes.BRE ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] === ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcodes.BNE ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] !== ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcodes.BOD ]: [[PC, GET, GET     ], (ops) => ops[0] = ops[2] & 1 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcodes.BEV ]: [[PC, GET, GET     ], (ops) => ops[0] = ops[2] & 1 ? ops[0] : ops[1]],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcodes.BLE ]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] <= ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcodes.BRZ ]: [[PC, GET, GET     ], (ops) => ops[0] = ops[2] === 0 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcodes.BNZ ]: [[PC, GET, GET     ], (ops) => ops[0] = ops[2] !== 0 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcodes.BRN ]: [[PC, GET, GET     ], (ops, s) => ops[0] = ops[2] & s.sign_bit ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcodes.BRP ]: [[PC, GET, GET     ], (ops, s) => ops[0] = ops[2] & s.sign_bit ? ops[0] : ops[1]],
    // Push Op1 onto the value stack
    [Opcodes.PSH ]: [[PSH, GET         ], (ops) => ops[0] = ops[1]],
    // Pop from the value stack into Op1
    [Opcodes.POP ]: [[SET, POP         ], (ops) => ops[0] = ops[1]],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcodes.CAL ]: [[PSH, PC          ], (ops) => ops[0] = ops[1]],
    // Pops from the stack, then branches to that value
    [Opcodes.RET ]: [[PC, POP          ], (ops) => ops[0] = ops[1]],
    // Stop Execution emediately after opcode is read
    [Opcodes.HLT]: [[],()=>{}],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcodes.CPY]: [[SET_RAM, GET_RAM  ], (ops) => ops[0] = ops[1]],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcodes.BRC]: [[PC, GET, GET, GET ], (ops, s) => ops[0] = ops[2] + ops[3] > s.max_value ? ops[1] : ops[0] ],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcodes.BNC]: [[PC, GET, GET, GET ], (ops, s) => ops[0] = ops[2] + ops[3] <= s.max_value ? ops[1] : ops[0] ],

    //----- Complex Instructions
    [Opcodes.MLT]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] * ops[2]],
    [Opcodes.DIV]: [[SET, GET, GET    ], (ops) => ops[0] = ops[1] / ops[2]],
};
