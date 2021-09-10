import { enum_count } from "./util.js";
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
    // assert equals
    Opcode[Opcode["ASE"] = 59] = "ASE";
})(Opcode || (Opcode = {}));
export var Register;
(function (Register) {
    Register[Register["r0"] = 0] = "r0";
    Register[Register["r1"] = 0] = "r1";
    Register[Register["$0"] = 0] = "$0";
    Register[Register["Zero"] = 0] = "Zero";
    Register[Register["PC"] = 1] = "PC";
    Register[Register["SP"] = 2] = "SP";
})(Register || (Register = {}));
export const register_count = enum_count(Register);
console.log(register_count);
export var Operant_Prim;
(function (Operant_Prim) {
    Operant_Prim[Operant_Prim["Reg"] = 0] = "Reg";
    Operant_Prim[Operant_Prim["Imm"] = 1] = "Imm";
})(Operant_Prim || (Operant_Prim = {}));
export var Operant_Type;
(function (Operant_Type) {
    Operant_Type[Operant_Type["Reg"] = 0] = "Reg";
    Operant_Type[Operant_Type["Imm"] = 1] = "Imm";
    Operant_Type[Operant_Type["Port"] = 2] = "Port";
    Operant_Type[Operant_Type["Memory"] = 3] = "Memory";
    Operant_Type[Operant_Type["Label"] = 4] = "Label";
    Operant_Type[Operant_Type["Char"] = 5] = "Char";
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
    [URCL_Header.BITS]: { def: 8 },
    [URCL_Header.MINREG]: { def: 8 },
    [URCL_Header.MINHEAP]: { def: 16 },
    [URCL_Header.RUN]: { def: Header_Run.ROM },
    [URCL_Header.MINSTACK]: { def: 8 },
};
export var IO_Ports;
(function (IO_Ports) {
    // General
    IO_Ports[IO_Ports["CPUBUS"] = 0] = "CPUBUS";
    IO_Ports[IO_Ports["TEXT"] = 1] = "TEXT";
    IO_Ports[IO_Ports["NUMB"] = 2] = "NUMB";
    IO_Ports[IO_Ports["SUPPORTED"] = 5] = "SUPPORTED";
    IO_Ports[IO_Ports["SPECIAL"] = 6] = "SPECIAL";
    IO_Ports[IO_Ports["PROFILE"] = 7] = "PROFILE";
    // Graphics
    IO_Ports[IO_Ports["X"] = 8] = "X";
    IO_Ports[IO_Ports["Y"] = 9] = "Y";
    IO_Ports[IO_Ports["COLOR"] = 10] = "COLOR";
    IO_Ports[IO_Ports["BUFFER"] = 11] = "BUFFER";
    IO_Ports[IO_Ports["G_SPECIAL"] = 15] = "G_SPECIAL";
    // Text
    IO_Ports[IO_Ports["ASCII"] = 16] = "ASCII";
    IO_Ports[IO_Ports["CHAR5"] = 17] = "CHAR5";
    IO_Ports[IO_Ports["CHAR6"] = 18] = "CHAR6";
    IO_Ports[IO_Ports["ASCII7"] = 19] = "ASCII7";
    IO_Ports[IO_Ports["UTF8"] = 20] = "UTF8";
    IO_Ports[IO_Ports["T_SPECIAL"] = 23] = "T_SPECIAL";
    // Numbers
    IO_Ports[IO_Ports["INT"] = 24] = "INT";
    IO_Ports[IO_Ports["UINT"] = 25] = "UINT";
    IO_Ports[IO_Ports["BIN"] = 26] = "BIN";
    IO_Ports[IO_Ports["HEX"] = 27] = "HEX";
    IO_Ports[IO_Ports["FLOAT"] = 28] = "FLOAT";
    IO_Ports[IO_Ports["FIXED"] = 29] = "FIXED";
    IO_Ports[IO_Ports["N_SPECIAL"] = 31] = "N_SPECIAL";
    // Storage
    IO_Ports[IO_Ports["ADDR"] = 32] = "ADDR";
    IO_Ports[IO_Ports["BUS"] = 33] = "BUS";
    IO_Ports[IO_Ports["PAGE"] = 34] = "PAGE";
    IO_Ports[IO_Ports["S_SPECIAL"] = 39] = "S_SPECIAL";
    // Miscellaneous
    IO_Ports[IO_Ports["RNG"] = 40] = "RNG";
    IO_Ports[IO_Ports["NOTE"] = 41] = "NOTE";
    IO_Ports[IO_Ports["INSTR"] = 42] = "INSTR";
    IO_Ports[IO_Ports["NLEG"] = 43] = "NLEG";
    IO_Ports[IO_Ports["WAIT"] = 44] = "WAIT";
    IO_Ports[IO_Ports["NADDR"] = 45] = "NADDR";
    IO_Ports[IO_Ports["DATA"] = 46] = "DATA";
    IO_Ports[IO_Ports["M_SPECIAL"] = 47] = "M_SPECIAL";
    // User defined
    IO_Ports[IO_Ports["UD1"] = 48] = "UD1";
    IO_Ports[IO_Ports["UD2"] = 49] = "UD2";
    IO_Ports[IO_Ports["UD3"] = 50] = "UD3";
    IO_Ports[IO_Ports["UD4"] = 51] = "UD4";
    IO_Ports[IO_Ports["UD5"] = 52] = "UD5";
    IO_Ports[IO_Ports["UD6"] = 53] = "UD6";
    IO_Ports[IO_Ports["UD7"] = 54] = "UD7";
    IO_Ports[IO_Ports["UD8"] = 55] = "UD8";
    IO_Ports[IO_Ports["UD9"] = 56] = "UD9";
    IO_Ports[IO_Ports["UD10"] = 57] = "UD10";
    IO_Ports[IO_Ports["UD11"] = 58] = "UD11";
    IO_Ports[IO_Ports["UD12"] = 59] = "UD12";
    IO_Ports[IO_Ports["UD13"] = 60] = "UD13";
    IO_Ports[IO_Ports["UD14"] = 61] = "UD14";
    IO_Ports[IO_Ports["UD15"] = 62] = "UD15";
    IO_Ports[IO_Ports["UD16"] = 63] = "UD16";
})(IO_Ports || (IO_Ports = {}));
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
    [Opcode.IN]: [[SET, GET], async (ops, s) => { ops[0] = await s.in(ops[1]); }],
    [Opcode.OUT]: [[GET, GET], (ops, s) => { s.out(ops[0], ops[1]); }],
};
//# sourceMappingURL=instructions.js.map