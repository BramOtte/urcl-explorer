import { enum_count, object_map } from "./util.js";
// export 
export var Opcode;
(function (Opcode) {
    // Core Instructions
    Opcode[Opcode["ADD"] = 0] = "ADD";
    Opcode[Opcode["RSH"] = 1] = "RSH";
    Opcode[Opcode["LOD"] = 2] = "LOD";
    Opcode[Opcode["STR"] = 3] = "STR";
    Opcode[Opcode["BGE"] = 4] = "BGE";
    Opcode[Opcode["NOR"] = 5] = "NOR";
    Opcode[Opcode["IMM"] = 6] = "IMM";
    // Basic Instructions
    Opcode[Opcode["SUB"] = 7] = "SUB";
    Opcode[Opcode["JMP"] = 8] = "JMP";
    Opcode[Opcode["MOV"] = 9] = "MOV";
    Opcode[Opcode["NOP"] = 10] = "NOP";
    Opcode[Opcode["LSH"] = 11] = "LSH";
    Opcode[Opcode["INC"] = 12] = "INC";
    Opcode[Opcode["DEC"] = 13] = "DEC";
    Opcode[Opcode["NEG"] = 14] = "NEG";
    Opcode[Opcode["AND"] = 15] = "AND";
    Opcode[Opcode["OR"] = 16] = "OR";
    Opcode[Opcode["NOT"] = 17] = "NOT";
    Opcode[Opcode["XNOR"] = 18] = "XNOR";
    Opcode[Opcode["XOR"] = 19] = "XOR";
    Opcode[Opcode["NAND"] = 20] = "NAND";
    Opcode[Opcode["BRL"] = 21] = "BRL";
    Opcode[Opcode["BRG"] = 22] = "BRG";
    Opcode[Opcode["BRE"] = 23] = "BRE";
    Opcode[Opcode["BNE"] = 24] = "BNE";
    Opcode[Opcode["BOD"] = 25] = "BOD";
    Opcode[Opcode["BEV"] = 26] = "BEV";
    Opcode[Opcode["BLE"] = 27] = "BLE";
    Opcode[Opcode["BRZ"] = 28] = "BRZ";
    Opcode[Opcode["BNZ"] = 29] = "BNZ";
    Opcode[Opcode["BRN"] = 30] = "BRN";
    Opcode[Opcode["BRP"] = 31] = "BRP";
    Opcode[Opcode["PSH"] = 32] = "PSH";
    Opcode[Opcode["POP"] = 33] = "POP";
    Opcode[Opcode["CAL"] = 34] = "CAL";
    Opcode[Opcode["RET"] = 35] = "RET";
    Opcode[Opcode["HLT"] = 36] = "HLT";
    Opcode[Opcode["CPY"] = 37] = "CPY";
    Opcode[Opcode["BRC"] = 38] = "BRC";
    Opcode[Opcode["BNC"] = 39] = "BNC";
    // Complex Instructions
    Opcode[Opcode["MLT"] = 40] = "MLT";
    Opcode[Opcode["DIV"] = 41] = "DIV";
    Opcode[Opcode["MOD"] = 42] = "MOD";
    Opcode[Opcode["BSR"] = 43] = "BSR";
    Opcode[Opcode["BSL"] = 44] = "BSL";
    Opcode[Opcode["SRS"] = 45] = "SRS";
    Opcode[Opcode["BSS"] = 46] = "BSS";
    Opcode[Opcode["SETE"] = 47] = "SETE";
    Opcode[Opcode["SETNE"] = 48] = "SETNE";
    Opcode[Opcode["SETG"] = 49] = "SETG";
    Opcode[Opcode["SETL"] = 50] = "SETL";
    Opcode[Opcode["SETGE"] = 51] = "SETGE";
    Opcode[Opcode["SETLE"] = 52] = "SETLE";
    Opcode[Opcode["SETC"] = 53] = "SETC";
    Opcode[Opcode["SETNC"] = 54] = "SETNC";
    Opcode[Opcode["LLOD"] = 55] = "LLOD";
    Opcode[Opcode["LSTR"] = 56] = "LSTR";
    // IO Instructions
    Opcode[Opcode["IN"] = 57] = "IN";
    Opcode[Opcode["OUT"] = 58] = "OUT";
    //----- Debug Instructions
    Opcode[Opcode["__ASSERT"] = 59] = "__ASSERT";
    Opcode[Opcode["__ASSERT0"] = 60] = "__ASSERT0";
    Opcode[Opcode["__ASSERT_EQ"] = 61] = "__ASSERT_EQ";
    Opcode[Opcode["__ASSERT_NEQ"] = 62] = "__ASSERT_NEQ";
})(Opcode || (Opcode = {}));
export var Register;
(function (Register) {
    Register[Register["R0"] = 0] = "R0";
    Register[Register["PC"] = 1] = "PC";
    Register[Register["SP"] = 2] = "SP";
})(Register || (Register = {}));
export const register_count = enum_count(Register);
export var Operant_Prim;
(function (Operant_Prim) {
    Operant_Prim[Operant_Prim["Reg"] = 0] = "Reg";
    Operant_Prim[Operant_Prim["Imm"] = 1] = "Imm";
})(Operant_Prim || (Operant_Prim = {}));
export var Operant_Type;
(function (Operant_Type) {
    Operant_Type[Operant_Type["Reg"] = 0] = "Reg";
    Operant_Type[Operant_Type["Imm"] = 1] = "Imm";
    Operant_Type[Operant_Type["Memory"] = 2] = "Memory";
    Operant_Type[Operant_Type["Label"] = 3] = "Label";
    Operant_Type[Operant_Type["Constant"] = 4] = "Constant";
})(Operant_Type || (Operant_Type = {}));
export var Operant_Operation;
(function (Operant_Operation) {
    Operant_Operation[Operant_Operation["SET"] = 0] = "SET";
    Operant_Operation[Operant_Operation["GET"] = 1] = "GET";
    Operant_Operation[Operant_Operation["GET_RAM"] = 2] = "GET_RAM";
    Operant_Operation[Operant_Operation["SET_RAM"] = 3] = "SET_RAM";
    Operant_Operation[Operant_Operation["RAM_OFFSET"] = 4] = "RAM_OFFSET";
})(Operant_Operation || (Operant_Operation = {}));
export var URCL_Header;
(function (URCL_Header) {
    URCL_Header[URCL_Header["BITS"] = 0] = "BITS";
    URCL_Header[URCL_Header["MINREG"] = 1] = "MINREG";
    URCL_Header[URCL_Header["MINHEAP"] = 2] = "MINHEAP";
    URCL_Header[URCL_Header["RUN"] = 3] = "RUN";
    URCL_Header[URCL_Header["MINSTACK"] = 4] = "MINSTACK";
})(URCL_Header || (URCL_Header = {}));
export var Constants;
(function (Constants) {
    Constants[Constants["BITS"] = 0] = "BITS";
    Constants[Constants["MSB"] = 1] = "MSB";
    Constants[Constants["SMSB"] = 2] = "SMSB";
    Constants[Constants["MAX"] = 3] = "MAX";
    Constants[Constants["SMAX"] = 4] = "SMAX";
    Constants[Constants["UHALF"] = 5] = "UHALF";
    Constants[Constants["LHALF"] = 6] = "LHALF";
    Constants[Constants["MINREG"] = 7] = "MINREG";
    Constants[Constants["MINHEAP"] = 8] = "MINHEAP";
    Constants[Constants["MINSTACK"] = 9] = "MINSTACK";
})(Constants || (Constants = {}));
export var Header_Operant;
(function (Header_Operant) {
    Header_Operant[Header_Operant["=="] = 0] = "==";
    Header_Operant[Header_Operant["<="] = 1] = "<=";
    Header_Operant[Header_Operant[">="] = 2] = ">=";
})(Header_Operant || (Header_Operant = {}));
export var Header_Run;
(function (Header_Run) {
    Header_Run[Header_Run["ROM"] = 0] = "ROM";
    Header_Run[Header_Run["RAM"] = 1] = "RAM";
})(Header_Run || (Header_Run = {}));
export const urcl_headers = {
    [URCL_Header.BITS]: { def: 8, def_operant: Header_Operant["=="] },
    [URCL_Header.MINREG]: { def: 8 },
    [URCL_Header.MINHEAP]: { def: 16 },
    [URCL_Header.RUN]: { def: Header_Run.ROM, in: Header_Run },
    [URCL_Header.MINSTACK]: { def: 8 },
};
export var IO_Port;
(function (IO_Port) {
    // General
    IO_Port[IO_Port["CPUBUS"] = 0] = "CPUBUS";
    IO_Port[IO_Port["TEXT"] = 1] = "TEXT";
    IO_Port[IO_Port["NUMB"] = 2] = "NUMB";
    IO_Port[IO_Port["SUPPORTED"] = 5] = "SUPPORTED";
    IO_Port[IO_Port["SPECIAL"] = 6] = "SPECIAL";
    IO_Port[IO_Port["PROFILE"] = 7] = "PROFILE";
    // Graphics
    IO_Port[IO_Port["X"] = 8] = "X";
    IO_Port[IO_Port["Y"] = 9] = "Y";
    IO_Port[IO_Port["COLOR"] = 10] = "COLOR";
    IO_Port[IO_Port["BUFFER"] = 11] = "BUFFER";
    IO_Port[IO_Port["G_SPECIAL"] = 15] = "G_SPECIAL";
    // Text
    IO_Port[IO_Port["ASCII"] = 16] = "ASCII";
    IO_Port[IO_Port["CHAR5"] = 17] = "CHAR5";
    IO_Port[IO_Port["CHAR6"] = 18] = "CHAR6";
    IO_Port[IO_Port["ASCII7"] = 19] = "ASCII7";
    IO_Port[IO_Port["UTF8"] = 20] = "UTF8";
    IO_Port[IO_Port["T_SPECIAL"] = 23] = "T_SPECIAL";
    // Numbers
    IO_Port[IO_Port["INT"] = 24] = "INT";
    IO_Port[IO_Port["UINT"] = 25] = "UINT";
    IO_Port[IO_Port["BIN"] = 26] = "BIN";
    IO_Port[IO_Port["HEX"] = 27] = "HEX";
    IO_Port[IO_Port["FLOAT"] = 28] = "FLOAT";
    IO_Port[IO_Port["FIXED"] = 29] = "FIXED";
    IO_Port[IO_Port["N_SPECIAL"] = 31] = "N_SPECIAL";
    // Storage
    IO_Port[IO_Port["ADDR"] = 32] = "ADDR";
    IO_Port[IO_Port["BUS"] = 33] = "BUS";
    IO_Port[IO_Port["PAGE"] = 34] = "PAGE";
    IO_Port[IO_Port["S_SPECIAL"] = 39] = "S_SPECIAL";
    // Miscellaneous
    IO_Port[IO_Port["RNG"] = 40] = "RNG";
    IO_Port[IO_Port["NOTE"] = 41] = "NOTE";
    IO_Port[IO_Port["INSTR"] = 42] = "INSTR";
    IO_Port[IO_Port["NLEG"] = 43] = "NLEG";
    IO_Port[IO_Port["WAIT"] = 44] = "WAIT";
    IO_Port[IO_Port["NADDR"] = 45] = "NADDR";
    IO_Port[IO_Port["DATA"] = 46] = "DATA";
    IO_Port[IO_Port["M_SPECIAL"] = 47] = "M_SPECIAL";
    // User defined
    IO_Port[IO_Port["UD1"] = 48] = "UD1";
    IO_Port[IO_Port["UD2"] = 49] = "UD2";
    IO_Port[IO_Port["UD3"] = 50] = "UD3";
    IO_Port[IO_Port["UD4"] = 51] = "UD4";
    IO_Port[IO_Port["UD5"] = 52] = "UD5";
    IO_Port[IO_Port["UD6"] = 53] = "UD6";
    IO_Port[IO_Port["UD7"] = 54] = "UD7";
    IO_Port[IO_Port["UD8"] = 55] = "UD8";
    IO_Port[IO_Port["UD9"] = 56] = "UD9";
    IO_Port[IO_Port["UD10"] = 57] = "UD10";
    IO_Port[IO_Port["UD11"] = 58] = "UD11";
    IO_Port[IO_Port["UD12"] = 59] = "UD12";
    IO_Port[IO_Port["UD13"] = 60] = "UD13";
    IO_Port[IO_Port["UD14"] = 61] = "UD14";
    IO_Port[IO_Port["UD15"] = 62] = "UD15";
    IO_Port[IO_Port["UD16"] = 63] = "UD16";
})(IO_Port || (IO_Port = {}));
const { SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO } = Operant_Operation;
export const Opcodes_operants = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcode.ADD]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] + ops[2]; }],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcode.RSH]: [[SET, GET], (ops) => { ops[0] = ops[1] >>> 1; }],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcode.LOD]: [[SET, GAM], (ops) => { ops[0] = ops[1]; }],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcode.STR]: [[SAM, GET], (ops) => { ops[0] = ops[1]; }],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcode.BGE]: [[GET, GET, GET], (ops, s) => { if (ops[1] >= ops[2])
            s.pc = ops[0]; }],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcode.NOR]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] | ops[2]); }],
    // Load immediate
    [Opcode.IMM]: [[SET, GET], (ops) => { ops[0] = ops[1]; }],
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcode.SUB]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] - ops[2]; }],
    // Branch to address specified by Op1
    [Opcode.JMP]: [[GET], (ops, s) => { s.pc = ops[0]; }],
    // Copy Op2 to Op1
    [Opcode.MOV]: [[SET, GET], (ops) => { ops[0] = ops[1]; }],
    // Copy Op2 to Op1
    [Opcode.NOP]: [[], () => { }],
    // Left shift Op2 once then put result into Op1
    [Opcode.LSH]: [[SET, GET], (ops) => { ops[0] = ops[1] << 1; }],
    // Add 1 to Op2 then put result into Op1
    [Opcode.INC]: [[SET, GET], (ops) => { ops[0] = ops[1] + 1; }],
    // Subtract 1 from Op2 then put result into Op1
    [Opcode.DEC]: [[SET, GET], (ops) => { ops[0] = ops[1] - 1; }],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcode.NEG]: [[SET, GET], (ops) => { ops[0] = -ops[1]; }],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcode.AND]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] & ops[2]; }],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcode.OR]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] | ops[2]; }],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcode.NOT]: [[SET, GET], (ops) => { ops[0] = ~ops[1]; }],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcode.XNOR]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] ^ ops[2]); }],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcode.XOR]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] ^ ops[2]; }],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcode.NAND]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] & ops[2]); }],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcode.BRL]: [[GET, GET, GET], (ops, s) => { if (ops[1] < ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcode.BRG]: [[GET, GET, GET], (ops, s) => { if (ops[1] > ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcode.BRE]: [[GET, GET, GET], (ops, s) => { if (ops[1] === ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcode.BNE]: [[GET, GET, GET], (ops, s) => { if (ops[1] !== ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcode.BOD]: [[GET, GET], (ops, s) => { if (ops[1] & 1)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcode.BEV]: [[GET, GET], (ops, s) => { if (!(ops[1] & 1))
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcode.BLE]: [[GET, GET, GET], (ops, s) => { if (ops[1] <= ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcode.BRZ]: [[GET, GET], (ops, s) => { if (ops[1] === 0)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcode.BNZ]: [[GET, GET], (ops, s) => { if (ops[1] !== 0)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcode.BRN]: [[GET, GET], (ops, s) => { if (ops[1] & s.sign_bit)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcode.BRP]: [[GET, GET], (ops, s) => { if (!(ops[1] & s.sign_bit))
            s.pc = ops[0]; }],
    // Push Op1 onto the value stack
    [Opcode.PSH]: [[GET], (ops, s) => { s.push(ops[0]); }],
    // Pop from the value stack into Op1
    [Opcode.POP]: [[SET], (ops, s) => { ops[0] = s.pop(); }],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcode.CAL]: [[GET], (ops, s) => { s.push(s.pc); s.pc = ops[0]; }],
    // Pops from the stack, then branches to that value
    [Opcode.RET]: [[], (_, s) => { s.pc = s.pop(); }],
    // Stop Execution emediately after opcode is read
    [Opcode.HLT]: [[], () => { }],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcode.CPY]: [[SAM, GAM], (ops) => { ops[0] = ops[1]; }],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcode.BRC]: [[GET, GET, GET], (ops, s) => { if (ops[1] + ops[2] > s.max_value)
            s.pc = ops[0]; }],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcode.BNC]: [[GET, GET, GET], (ops, s) => { if (ops[1] + ops[2] <= s.max_value)
            s.pc = ops[0]; }],
    //----- Complex Instructions
    // Multiply Op2 by Op3 then put the lower half of the answer into Op1
    [Opcode.MLT]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] * ops[2]; }],
    // Unsigned division of Op2 by Op3 then put answer into Op1
    [Opcode.DIV]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] / ops[2]; }],
    // Unsigned modulus of Op2 by Op3 then put answer into Op1
    [Opcode.MOD]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] % ops[2]; }],
    // Right shift Op2, Op3 times then put result into Op1
    [Opcode.BSR]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] >>> ops[2]; }],
    // Left shift Op2, Op3 times then put result into Op1
    [Opcode.BSL]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] << ops[2]; }],
    // Signed right shift Op2 once then put result into Op1
    [Opcode.SRS]: [[SET, GET], (ops) => { ops[0] = ops[1] >> 1; }],
    // Signed right shift Op2, Op3 times then put result into Op1
    [Opcode.BSS]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] >> ops[2]; }],
    // If Op2 equals Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETE]: [[SET, GET, GET], (ops, s) => { if (ops[1] === ops[2])
            ops[0] = s.max_value; }],
    // If Op2 is not equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETNE]: [[SET, GET, GET], (ops, s) => { if (ops[1] !== ops[2])
            ops[0] = s.max_value; }],
    // If Op2 if more than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETG]: [[SET, GET, GET], (ops, s) => { if (ops[1] > ops[2])
            ops[0] = s.max_value; }],
    // If Op2 if less than Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETL]: [[SET, GET, GET], (ops, s) => { if (ops[1] < ops[2])
            ops[0] = s.max_value; }],
    // If Op2 if greater than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETGE]: [[SET, GET, GET], (ops, s) => { if (ops[1] >= ops[2])
            ops[0] = s.max_value; }],
    // If Op2 if less than or equal to Op3 then set Op1 to all ones in binary else set Op1 to 0
    [Opcode.SETLE]: [[SET, GET, GET], (ops, s) => { if (ops[1] <= ops[2])
            ops[0] = s.max_value; }],
    // If Op2 + Op3 produces a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcode.SETC]: [[SET, GET, GET], (ops, s) => { if (ops[1] + ops[2] > s.max_value)
            ops[0] = s.max_value; }],
    // If Op2 + Op3 does not produce a carry out then set Op1 to all ones in binary, else set Op1 to 0
    [Opcode.SETNC]: [[SET, GET, GET], (ops, s) => { if (ops[1] + ops[2] <= s.max_value)
            ops[0] = s.max_value; }],
    // Copy RAM value pointed to by (Op2 + Op3) into Op1. Where Op2 is the base pointer is Op3 is the offset.
    [Opcode.LLOD]: [[SET, RAO, GAM], (ops) => { ops[0] = ops[2]; }],
    // Copy Op3 into RAM value pointed to by (Op1 + Op2). Where Op1 is the base pointer is Op2 is the offset.
    [Opcode.LLOD]: [[RAO, SAM, GET], (ops) => { ops[1] = ops[2]; }],
    //----- IO Instructions
    [Opcode.IN]: [[SET, GET], (ops, s) => { return s.in(ops[1], ops); }],
    [Opcode.OUT]: [[GET, GET], (ops, s) => { s.out(ops[0], ops[1]); }],
    //----- Assert Instructions
    [Opcode.__ASSERT]: [[GET], (ops, s) => { if (!ops[0])
            fail_assert(s); }],
    [Opcode.__ASSERT0]: [[GET], (ops, s) => { if (ops[0])
            fail_assert(s); }],
    [Opcode.__ASSERT_EQ]: [[GET, GET], (ops, s) => { if (ops[0] !== ops[1])
            fail_assert(s); }],
    [Opcode.__ASSERT_NEQ]: [[GET, GET], (ops, s) => { if (ops[0] === ops[1])
            fail_assert(s); }],
};
export const Opcodes_operant_lengths = object_map(Opcodes_operants, (key, value) => {
    if (value === undefined) {
        throw new Error("instruction definition undefined");
    }
    return [key, value[0].length];
});
function fail_assert(ctx) {
    const message = `Assertion failed at pc=${ctx.pc}\n`;
    for (let i = 0; i < message.length; i++) {
        ctx.out(IO_Port.TEXT, message.charCodeAt(i));
    }
}
//# sourceMappingURL=instructions.js.map