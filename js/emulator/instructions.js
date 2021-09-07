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
    Opcodes[Opcodes["ASEQ"] = 59] = "ASEQ";
})(Opcodes || (Opcodes = {}));
export var Value_Type;
(function (Value_Type) {
    Value_Type[Value_Type["Reg"] = 0] = "Reg";
    Value_Type[Value_Type["Imm"] = 1] = "Imm";
    Value_Type[Value_Type["Ram"] = 2] = "Ram";
})(Value_Type || (Value_Type = {}));
export var Op_Type;
(function (Op_Type) {
    Op_Type[Op_Type["PC"] = 0] = "PC";
    Op_Type[Op_Type["SET"] = 1] = "SET";
    Op_Type[Op_Type["GET"] = 2] = "GET";
    Op_Type[Op_Type["GET_RAM"] = 3] = "GET_RAM";
    Op_Type[Op_Type["SET_RAM"] = 4] = "SET_RAM";
    Op_Type[Op_Type["PSH"] = 5] = "PSH";
    Op_Type[Op_Type["POP"] = 6] = "POP";
})(Op_Type || (Op_Type = {}));
export var URCL_Headers;
(function (URCL_Headers) {
    URCL_Headers[URCL_Headers["BITS"] = 0] = "BITS";
    URCL_Headers[URCL_Headers["MINREG"] = 1] = "MINREG";
    URCL_Headers[URCL_Headers["RUN"] = 2] = "RUN";
    URCL_Headers[URCL_Headers["MINSTACK"] = 3] = "MINSTACK";
})(URCL_Headers || (URCL_Headers = {}));
const { PC, SET, GET, GET_RAM, SET_RAM, PSH, POP } = Op_Type;
export const Opcodes_operants = {
    //----- Core Instructions
    // Add Op2 to Op3 then put result into Op1
    [Opcodes.ADD]: [[SET, GET, GET], (ops) => ops[0] = ops[1] + ops[2]],
    // Unsigned right shift Op2 once then put result into Op1
    [Opcodes.RSH]: [[SET, GET], (ops) => ops[0] = ops[1] >>> 1],
    // Copy RAM value pointed to by Op2 into Op1
    [Opcodes.LOD]: [[SET, GET_RAM], (ops) => ops[0] = ops[1]],
    // Copy Op2 into RAM value pointed to by Op1
    [Opcodes.STR]: [[SET_RAM, GET], (ops) => ops[0] = ops[1]],
    // Branch to address specified by Op1 if Op2 is more than or equal to Op3
    [Opcodes.BGE]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] >= ops[3] ? ops[1] : ops[0]],
    // Bitwise NOR Op2 and Op3 then put result into Op1
    [Opcodes.NOR]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] | ops[2])],
    // Load immediate
    [Opcodes.IMM]: [[SET, GET], (ops) => ops[0] = ops[1]],
    //----- Basic Instructions
    // Subtract Op3 from Op2 then put result into Op1
    [Opcodes.SUB]: [[SET, GET, GET], (ops) => ops[0] = ops[1] - ops[2]],
    // Branch to address specified by Op1
    [Opcodes.JMP]: [[PC, GET], (ops) => ops[0] = ops[1]],
    // Copy Op2 to Op1
    [Opcodes.MOV]: [[SET, GET], (ops) => ops[0] = ops[1]],
    // Copy Op2 to Op1
    [Opcodes.NOP]: [[], () => { }],
    // Left shift Op2 once then put result into Op1
    [Opcodes.LSH]: [[SET, GET], (ops) => ops[0] = ops[1] << 1],
    // Add 1 to Op2 then put result into Op1
    [Opcodes.INC]: [[SET, GET], (ops) => ops[0] = ops[1] + 1],
    // Subtract 1 from Op2 then put result into Op1
    [Opcodes.DEC]: [[SET, GET], (ops) => ops[0] = ops[1] - 1],
    // Calculates the 2s complement of Op2 then puts answer into Op1
    [Opcodes.NEG]: [[SET, GET], (ops) => ops[0] = -ops[1]],
    // Bitwise AND Op2 and Op3 then put result into Op1
    [Opcodes.AND]: [[SET, GET, GET], (ops) => ops[0] = ops[1] & ops[2]],
    // Bitwise OR Op2 and Op3 then put result into Op1
    [Opcodes.OR]: [[SET, GET, GET], (ops) => ops[0] = ops[1] | ops[2]],
    // Bitwise NOT of Op2 then put result into Op1
    [Opcodes.NOT]: [[SET, GET], (ops) => ops[0] = ~ops[1]],
    // Bitwise XNOR Op2 and Op3 then put result into Op1
    [Opcodes.XNOR]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] ^ ops[2])],
    // Bitwise XOR Op2 and Op3 then put result into Op1
    [Opcodes.XOR]: [[SET, GET, GET], (ops) => ops[0] = ops[1] ^ ops[2]],
    // Bitwise NAND Op2 and Op3 then put result into Op1
    [Opcodes.NAND]: [[SET, GET, GET], (ops) => ops[0] = ~(ops[1] & ops[2])],
    // Branch to address specified by Op1 if Op2 is less than Op3
    [Opcodes.BRL]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] < ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is more than Op3
    [Opcodes.BRG]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] > ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is equal to Op3
    [Opcodes.BRE]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] === ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is not equal to Op3
    [Opcodes.BNE]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] !== ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is Odd (AKA the lowest bit is active)
    [Opcodes.BOD]: [[PC, GET, GET], (ops) => ops[0] = ops[2] & 1 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is Even (AKA the lowest bit is not active)
    [Opcodes.BEV]: [[PC, GET, GET], (ops) => ops[0] = ops[2] & 1 ? ops[0] : ops[1]],
    // Branch to address specified by Op1 if Op2 is less than or equal to Op3
    [Opcodes.BLE]: [[PC, GET, GET, GET], (ops) => ops[0] = ops[2] <= ops[3] ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 equal to 0
    [Opcodes.BRZ]: [[PC, GET, GET], (ops) => ops[0] = ops[2] === 0 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if Op2 is not equal to 0
    [Opcodes.BNZ]: [[PC, GET, GET], (ops) => ops[0] = ops[2] !== 0 ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if the result of the previous instruction is negative (AKA the upper most bit is active)
    [Opcodes.BRN]: [[PC, GET, GET], (ops, s) => ops[0] = ops[2] & s.sign_bit ? ops[1] : ops[0]],
    // Branch to address specified by Op1 if the result of the previous instruction is positive (AKA the upper most bit is not active)
    [Opcodes.BRP]: [[PC, GET, GET], (ops, s) => ops[0] = ops[2] & s.sign_bit ? ops[0] : ops[1]],
    // Push Op1 onto the value stack
    [Opcodes.PSH]: [[PSH, GET], (ops) => ops[0] = ops[1]],
    // Pop from the value stack into Op1
    [Opcodes.POP]: [[SET, POP], (ops) => ops[0] = ops[1]],
    // Pushes the address of the next instruction onto the stack then branches to Op1
    [Opcodes.CAL]: [[PSH, PC], (ops) => ops[0] = ops[1]],
    // Pops from the stack, then branches to that value
    [Opcodes.RET]: [[PC, POP], (ops) => ops[0] = ops[1]],
    // Stop Execution emediately after opcode is read
    [Opcodes.HLT]: [[], () => { }],
    // Copies the value located at the RAM location pointed to by Op2 into the RAM position pointed to by Op1.
    [Opcodes.CPY]: [[SET_RAM, GET_RAM], (ops) => ops[0] = ops[1]],
    // Branch to Op1 if Op2 + Op3 gives a carry out
    [Opcodes.BRC]: [[PC, GET, GET, GET], (ops, s) => ops[0] = ops[2] + ops[3] > s.max_value ? ops[1] : ops[0]],
    // Branch to Op1 if Op2 + Op3 does not give a carry out
    [Opcodes.BNC]: [[PC, GET, GET, GET], (ops, s) => ops[0] = ops[2] + ops[3] <= s.max_value ? ops[1] : ops[0]],
    //----- Complex Instructions
    [Opcodes.MLT]: [[SET, GET, GET], (ops) => ops[0] = ops[1] * ops[2]],
    [Opcodes.DIV]: [[SET, GET, GET], (ops) => ops[0] = ops[1] / ops[2]],
};
//# sourceMappingURL=instructions.js.map