// export 
export var Opcodes;
(function (Opcodes) {
    // Core Instructions
    Opcodes[Opcodes["ADD"] = 0] = "ADD";
    Opcodes[Opcodes["RSH"] = 1] = "RSH";
    Opcodes[Opcodes["LOD"] = 2] = "LOD";
    Opcodes[Opcodes["STR"] = 3] = "STR";
    Opcodes[Opcodes["BGE"] = 4] = "BGE";
    Opcodes[Opcodes["NOR"] = 5] = "NOR";
    Opcodes[Opcodes["IMM"] = 6] = "IMM";
    // Basic Instructions
    Opcodes[Opcodes["SUB"] = 7] = "SUB";
    Opcodes[Opcodes["JMP"] = 8] = "JMP";
    Opcodes[Opcodes["MOV"] = 9] = "MOV";
    Opcodes[Opcodes["NOP"] = 10] = "NOP";
    Opcodes[Opcodes["LSH"] = 11] = "LSH";
    Opcodes[Opcodes["INC"] = 12] = "INC";
    Opcodes[Opcodes["DEC"] = 13] = "DEC";
    Opcodes[Opcodes["NEG"] = 14] = "NEG";
    Opcodes[Opcodes["AND"] = 15] = "AND";
    Opcodes[Opcodes["OR"] = 16] = "OR";
    Opcodes[Opcodes["NOT"] = 17] = "NOT";
    Opcodes[Opcodes["XNOR"] = 18] = "XNOR";
    Opcodes[Opcodes["XOR"] = 19] = "XOR";
    Opcodes[Opcodes["NAND"] = 20] = "NAND";
    Opcodes[Opcodes["BRL"] = 21] = "BRL";
    Opcodes[Opcodes["BRG"] = 22] = "BRG";
    Opcodes[Opcodes["BRE"] = 23] = "BRE";
    Opcodes[Opcodes["BNE"] = 24] = "BNE";
    Opcodes[Opcodes["BOD"] = 25] = "BOD";
    Opcodes[Opcodes["BEV"] = 26] = "BEV";
    Opcodes[Opcodes["BLE"] = 27] = "BLE";
    Opcodes[Opcodes["BRZ"] = 28] = "BRZ";
    Opcodes[Opcodes["BNZ"] = 29] = "BNZ";
    Opcodes[Opcodes["BRN"] = 30] = "BRN";
    Opcodes[Opcodes["BRP"] = 31] = "BRP";
    Opcodes[Opcodes["PSH"] = 32] = "PSH";
    Opcodes[Opcodes["POP"] = 33] = "POP";
    Opcodes[Opcodes["CAL"] = 34] = "CAL";
    Opcodes[Opcodes["RET"] = 35] = "RET";
    Opcodes[Opcodes["HLT"] = 36] = "HLT";
    Opcodes[Opcodes["CPY"] = 37] = "CPY";
    Opcodes[Opcodes["BRC"] = 38] = "BRC";
    Opcodes[Opcodes["BNC"] = 39] = "BNC";
    // Complex Instructions
    Opcodes[Opcodes["MLT"] = 40] = "MLT";
    Opcodes[Opcodes["DIV"] = 41] = "DIV";
    Opcodes[Opcodes["MOD"] = 42] = "MOD";
    Opcodes[Opcodes["BSR"] = 43] = "BSR";
    Opcodes[Opcodes["BSL"] = 44] = "BSL";
    Opcodes[Opcodes["SRS"] = 45] = "SRS";
    Opcodes[Opcodes["BSS"] = 46] = "BSS";
    Opcodes[Opcodes["SETE"] = 47] = "SETE";
    Opcodes[Opcodes["SETNE"] = 48] = "SETNE";
    Opcodes[Opcodes["SETG"] = 49] = "SETG";
    Opcodes[Opcodes["SETL"] = 50] = "SETL";
    Opcodes[Opcodes["SETGE"] = 51] = "SETGE";
    Opcodes[Opcodes["SETLE"] = 52] = "SETLE";
    Opcodes[Opcodes["SETC"] = 53] = "SETC";
    Opcodes[Opcodes["SETNC"] = 54] = "SETNC";
    Opcodes[Opcodes["LLOD"] = 55] = "LLOD";
    Opcodes[Opcodes["LSTR"] = 56] = "LSTR";
    // IO Instructions
    Opcodes[Opcodes["IN"] = 57] = "IN";
    Opcodes[Opcodes["OUT"] = 58] = "OUT";
    //----- Debug Instructions
    // assert equals
    Opcodes[Opcodes["ASE"] = 59] = "ASE";
})(Opcodes || (Opcodes = {}));
export var Value_Type;
(function (Value_Type) {
    Value_Type[Value_Type["Reg"] = 0] = "Reg";
    Value_Type[Value_Type["Imm"] = 1] = "Imm";
})(Value_Type || (Value_Type = {}));
export var Op_Type;
(function (Op_Type) {
    Op_Type[Op_Type["SET"] = 0] = "SET";
    Op_Type[Op_Type["GET"] = 1] = "GET";
    Op_Type[Op_Type["GET_RAM"] = 2] = "GET_RAM";
    Op_Type[Op_Type["SET_RAM"] = 3] = "SET_RAM";
})(Op_Type || (Op_Type = {}));
export var URCL_Headers;
(function (URCL_Headers) {
    URCL_Headers[URCL_Headers["BITS"] = 0] = "BITS";
    URCL_Headers[URCL_Headers["MINREG"] = 1] = "MINREG";
    URCL_Headers[URCL_Headers["RUN"] = 2] = "RUN";
    URCL_Headers[URCL_Headers["MINSTACK"] = 3] = "MINSTACK";
})(URCL_Headers || (URCL_Headers = {}));
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
const { SET, GET, GET_RAM: GAM, SET_RAM: SAM } = Op_Type;
export const Opcodes_operants = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcodes.ADD]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] + ops[2]; }],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcodes.RSH]: [[SET, GET], (ops) => { ops[0] = ops[1] >>> 1; }],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcodes.LOD]: [[SET, GAM], (ops) => { ops[0] = ops[1]; }],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcodes.STR]: [[SAM, GET], (ops) => { ops[0] = ops[1]; }],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcodes.BGE]: [[GET, GET, GET], (ops, s) => { if (ops[1] >= ops[2])
            s.pc = ops[0]; }],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcodes.NOR]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] | ops[2]); }],
    // Load immediate
    [Opcodes.IMM]: [[SET, GET], (ops) => { ops[0] = ops[1]; }],
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcodes.SUB]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] - ops[2]; }],
    // Branch to address specified by Op1
    [Opcodes.JMP]: [[GET], (ops, s) => { s.pc = ops[0]; }],
    // Copy Op2 to Op1
    [Opcodes.MOV]: [[SET, GET], (ops) => { ops[0] = ops[1]; }],
    // Copy Op2 to Op1
    [Opcodes.NOP]: [[], () => { }],
    // Left shift Op2 once then put result into Op1
    [Opcodes.LSH]: [[SET, GET], (ops) => { ops[0] = ops[1] << 1; }],
    // Add 1 to Op2 then put result into Op1
    [Opcodes.INC]: [[SET, GET], (ops) => { ops[0] = ops[1] + 1; }],
    // Subtract 1 from Op2 then put result into Op1
    [Opcodes.DEC]: [[SET, GET], (ops) => { ops[0] = ops[1] - 1; }],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcodes.NEG]: [[SET, GET], (ops) => { ops[0] = -ops[1]; }],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcodes.AND]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] & ops[2]; }],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcodes.OR]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] | ops[2]; }],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcodes.NOT]: [[SET, GET], (ops) => { ops[0] = ~ops[1]; }],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcodes.XNOR]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] ^ ops[2]); }],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcodes.XOR]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] ^ ops[2]; }],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcodes.NAND]: [[SET, GET, GET], (ops) => { ops[0] = ~(ops[1] & ops[2]); }],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcodes.BRL]: [[GET, GET, GET], (ops, s) => { if (ops[1] < ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcodes.BRG]: [[GET, GET, GET], (ops, s) => { if (ops[1] > ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcodes.BRE]: [[GET, GET, GET], (ops, s) => { if (ops[1] === ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcodes.BNE]: [[GET, GET, GET], (ops, s) => { if (ops[1] !== ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcodes.BOD]: [[GET, GET], (ops, s) => { if (ops[1] & 1)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcodes.BEV]: [[GET, GET], (ops, s) => { if (!(ops[1] & 1))
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcodes.BLE]: [[GET, GET, GET], (ops, s) => { if (ops[1] <= ops[2])
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcodes.BRZ]: [[GET, GET], (ops, s) => { if (ops[1] === 0)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcodes.BNZ]: [[GET, GET], (ops, s) => { if (ops[1] !== 0)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcodes.BRN]: [[GET, GET], (ops, s) => { if (ops[1] & s.sign_bit)
            s.pc = ops[0]; }],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcodes.BRP]: [[GET, GET], (ops, s) => { if (!(ops[1] & s.sign_bit))
            s.pc = ops[0]; }],
    // Push Op1 onto the value stack
    [Opcodes.PSH]: [[GET], (ops, s) => { s.push(ops[0]); }],
    // Pop from the value stack into Op1
    [Opcodes.POP]: [[SET], (ops, s) => { ops[0] = s.pop(); }],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcodes.CAL]: [[GET], (ops, s) => { s.push(s.pc); s.pc = ops[0]; }],
    // Pops from the stack, then branches to that value
    [Opcodes.RET]: [[], (_, s) => { s.pc = s.pop(); }],
    // Stop Execution emediately after opcode is read
    [Opcodes.HLT]: [[], () => { }],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcodes.CPY]: [[SAM, GAM], (ops) => { ops[0] = ops[1]; }],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcodes.BRC]: [[GET, GET, GET], (ops, s) => { if (ops[1] + ops[2] > s.max_value)
            s.pc = ops[0]; }],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcodes.BNC]: [[GET, GET, GET], (ops, s) => { if (ops[1] + ops[2] <= s.max_value)
            s.pc = ops[0]; }],
    //----- Complex Instructions
    [Opcodes.MLT]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] * ops[2]; }],
    [Opcodes.DIV]: [[SET, GET, GET], (ops) => { ops[0] = ops[1] / ops[2]; }],
    //----- IO Instructions
    [Opcodes.IN]: [[SET, GET], async (ops, s) => { ops[0] = await s.in(ops[1]); }],
    [Opcodes.OUT]: [[GET, GET], (ops, s) => { s.out(ops[0], ops[1]); }],
};
//# sourceMappingURL=instructions.js.map