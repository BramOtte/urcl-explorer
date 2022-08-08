// src/emulator/instructions.ts
var Opcode = /* @__PURE__ */ ((Opcode3) => {
  Opcode3[Opcode3["ADD"] = 0] = "ADD";
  Opcode3[Opcode3["RSH"] = 1] = "RSH";
  Opcode3[Opcode3["LOD"] = 2] = "LOD";
  Opcode3[Opcode3["STR"] = 3] = "STR";
  Opcode3[Opcode3["BGE"] = 4] = "BGE";
  Opcode3[Opcode3["NOR"] = 5] = "NOR";
  Opcode3[Opcode3["IMM"] = 6] = "IMM";
  Opcode3[Opcode3["SUB"] = 7] = "SUB";
  Opcode3[Opcode3["JMP"] = 8] = "JMP";
  Opcode3[Opcode3["MOV"] = 9] = "MOV";
  Opcode3[Opcode3["NOP"] = 10] = "NOP";
  Opcode3[Opcode3["LSH"] = 11] = "LSH";
  Opcode3[Opcode3["INC"] = 12] = "INC";
  Opcode3[Opcode3["DEC"] = 13] = "DEC";
  Opcode3[Opcode3["NEG"] = 14] = "NEG";
  Opcode3[Opcode3["AND"] = 15] = "AND";
  Opcode3[Opcode3["OR"] = 16] = "OR";
  Opcode3[Opcode3["NOT"] = 17] = "NOT";
  Opcode3[Opcode3["XNOR"] = 18] = "XNOR";
  Opcode3[Opcode3["XOR"] = 19] = "XOR";
  Opcode3[Opcode3["NAND"] = 20] = "NAND";
  Opcode3[Opcode3["BRL"] = 21] = "BRL";
  Opcode3[Opcode3["BRG"] = 22] = "BRG";
  Opcode3[Opcode3["BRE"] = 23] = "BRE";
  Opcode3[Opcode3["BNE"] = 24] = "BNE";
  Opcode3[Opcode3["BOD"] = 25] = "BOD";
  Opcode3[Opcode3["BEV"] = 26] = "BEV";
  Opcode3[Opcode3["BLE"] = 27] = "BLE";
  Opcode3[Opcode3["BRZ"] = 28] = "BRZ";
  Opcode3[Opcode3["BNZ"] = 29] = "BNZ";
  Opcode3[Opcode3["BRN"] = 30] = "BRN";
  Opcode3[Opcode3["BRP"] = 31] = "BRP";
  Opcode3[Opcode3["PSH"] = 32] = "PSH";
  Opcode3[Opcode3["POP"] = 33] = "POP";
  Opcode3[Opcode3["CAL"] = 34] = "CAL";
  Opcode3[Opcode3["RET"] = 35] = "RET";
  Opcode3[Opcode3["HLT"] = 36] = "HLT";
  Opcode3[Opcode3["CPY"] = 37] = "CPY";
  Opcode3[Opcode3["BRC"] = 38] = "BRC";
  Opcode3[Opcode3["BNC"] = 39] = "BNC";
  Opcode3[Opcode3["MLT"] = 40] = "MLT";
  Opcode3[Opcode3["DIV"] = 41] = "DIV";
  Opcode3[Opcode3["MOD"] = 42] = "MOD";
  Opcode3[Opcode3["BSR"] = 43] = "BSR";
  Opcode3[Opcode3["BSL"] = 44] = "BSL";
  Opcode3[Opcode3["SRS"] = 45] = "SRS";
  Opcode3[Opcode3["BSS"] = 46] = "BSS";
  Opcode3[Opcode3["SETE"] = 47] = "SETE";
  Opcode3[Opcode3["SETNE"] = 48] = "SETNE";
  Opcode3[Opcode3["SETG"] = 49] = "SETG";
  Opcode3[Opcode3["SETL"] = 50] = "SETL";
  Opcode3[Opcode3["SETGE"] = 51] = "SETGE";
  Opcode3[Opcode3["SETLE"] = 52] = "SETLE";
  Opcode3[Opcode3["SETC"] = 53] = "SETC";
  Opcode3[Opcode3["SETNC"] = 54] = "SETNC";
  Opcode3[Opcode3["LLOD"] = 55] = "LLOD";
  Opcode3[Opcode3["LSTR"] = 56] = "LSTR";
  Opcode3[Opcode3["IN"] = 57] = "IN";
  Opcode3[Opcode3["OUT"] = 58] = "OUT";
  Opcode3[Opcode3["SDIV"] = 59] = "SDIV";
  Opcode3[Opcode3["SBRL"] = 60] = "SBRL";
  Opcode3[Opcode3["SBRG"] = 61] = "SBRG";
  Opcode3[Opcode3["SBLE"] = 62] = "SBLE";
  Opcode3[Opcode3["SBGE"] = 63] = "SBGE";
  Opcode3[Opcode3["SSETL"] = 64] = "SSETL";
  Opcode3[Opcode3["SSETG"] = 65] = "SSETG";
  Opcode3[Opcode3["SSETLE"] = 66] = "SSETLE";
  Opcode3[Opcode3["SSETGE"] = 67] = "SSETGE";
  Opcode3[Opcode3["__ASSERT"] = 68] = "__ASSERT";
  Opcode3[Opcode3["__ASSERT0"] = 69] = "__ASSERT0";
  Opcode3[Opcode3["__ASSERT_EQ"] = 70] = "__ASSERT_EQ";
  Opcode3[Opcode3["__ASSERT_NEQ"] = 71] = "__ASSERT_NEQ";
  return Opcode3;
})(Opcode || {});
var Register = /* @__PURE__ */ ((Register2) => {
  Register2[Register2["PC"] = 0] = "PC";
  Register2[Register2["SP"] = 1] = "SP";
  return Register2;
})(Register || {});
var register_count = enum_count(Register);
var Operant_Type = /* @__PURE__ */ ((Operant_Type2) => {
  Operant_Type2[Operant_Type2["Reg"] = 0 /* Reg */] = "Reg";
  Operant_Type2[Operant_Type2["Imm"] = 1 /* Imm */] = "Imm";
  Operant_Type2[Operant_Type2["Memory"] = 2] = "Memory";
  Operant_Type2[Operant_Type2["Label"] = 3] = "Label";
  Operant_Type2[Operant_Type2["Data_Label"] = 4] = "Data_Label";
  Operant_Type2[Operant_Type2["Constant"] = 5] = "Constant";
  Operant_Type2[Operant_Type2["String"] = 6] = "String";
  return Operant_Type2;
})(Operant_Type || {});
var Operant_Operation = /* @__PURE__ */ ((Operant_Operation2) => {
  Operant_Operation2[Operant_Operation2["SET"] = 0] = "SET";
  Operant_Operation2[Operant_Operation2["GET"] = 1] = "GET";
  Operant_Operation2[Operant_Operation2["GET_RAM"] = 2] = "GET_RAM";
  Operant_Operation2[Operant_Operation2["SET_RAM"] = 3] = "SET_RAM";
  Operant_Operation2[Operant_Operation2["RAM_OFFSET"] = 4] = "RAM_OFFSET";
  return Operant_Operation2;
})(Operant_Operation || {});
var URCL_Header = /* @__PURE__ */ ((URCL_Header2) => {
  URCL_Header2[URCL_Header2["BITS"] = 0] = "BITS";
  URCL_Header2[URCL_Header2["MINREG"] = 1] = "MINREG";
  URCL_Header2[URCL_Header2["MINHEAP"] = 2] = "MINHEAP";
  URCL_Header2[URCL_Header2["RUN"] = 3] = "RUN";
  URCL_Header2[URCL_Header2["MINSTACK"] = 4] = "MINSTACK";
  return URCL_Header2;
})(URCL_Header || {});
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["BITS"] = 0] = "BITS";
  Constants2[Constants2["MSB"] = 1] = "MSB";
  Constants2[Constants2["SMSB"] = 2] = "SMSB";
  Constants2[Constants2["MAX"] = 3] = "MAX";
  Constants2[Constants2["SMAX"] = 4] = "SMAX";
  Constants2[Constants2["UHALF"] = 5] = "UHALF";
  Constants2[Constants2["LHALF"] = 6] = "LHALF";
  Constants2[Constants2["MINREG"] = 7] = "MINREG";
  Constants2[Constants2["MINHEAP"] = 8] = "MINHEAP";
  Constants2[Constants2["HEAP"] = 9] = "HEAP";
  Constants2[Constants2["MINSTACK"] = 10] = "MINSTACK";
  return Constants2;
})(Constants || {});
var Header_Operant = /* @__PURE__ */ ((Header_Operant2) => {
  Header_Operant2[Header_Operant2["=="] = 0] = "==";
  Header_Operant2[Header_Operant2["<="] = 1] = "<=";
  Header_Operant2[Header_Operant2[">="] = 2] = ">=";
  return Header_Operant2;
})(Header_Operant || {});
var Header_Run = /* @__PURE__ */ ((Header_Run2) => {
  Header_Run2[Header_Run2["ROM"] = 0] = "ROM";
  Header_Run2[Header_Run2["RAM"] = 1] = "RAM";
  return Header_Run2;
})(Header_Run || {});
var urcl_headers = {
  [0 /* BITS */]: { def: 8, def_operant: 0 /* == */ },
  [1 /* MINREG */]: { def: 8 },
  [2 /* MINHEAP */]: { def: 16 },
  [3 /* RUN */]: { def: 0 /* ROM */, in: Header_Run },
  [4 /* MINSTACK */]: { def: 8 }
};
var IO_Port = /* @__PURE__ */ ((IO_Port2) => {
  IO_Port2[IO_Port2["CPUBUS"] = 0] = "CPUBUS";
  IO_Port2[IO_Port2["TEXT"] = 1] = "TEXT";
  IO_Port2[IO_Port2["NUMB"] = 2] = "NUMB";
  IO_Port2[IO_Port2["SUPPORTED"] = 5] = "SUPPORTED";
  IO_Port2[IO_Port2["SPECIAL"] = 6] = "SPECIAL";
  IO_Port2[IO_Port2["PROFILE"] = 7] = "PROFILE";
  IO_Port2[IO_Port2["X"] = 8] = "X";
  IO_Port2[IO_Port2["Y"] = 9] = "Y";
  IO_Port2[IO_Port2["COLOR"] = 10] = "COLOR";
  IO_Port2[IO_Port2["BUFFER"] = 11] = "BUFFER";
  IO_Port2[IO_Port2["G_SPECIAL"] = 15] = "G_SPECIAL";
  IO_Port2[IO_Port2["ASCII"] = 16] = "ASCII";
  IO_Port2[IO_Port2["CHAR5"] = 17] = "CHAR5";
  IO_Port2[IO_Port2["CHAR6"] = 18] = "CHAR6";
  IO_Port2[IO_Port2["ASCII7"] = 19] = "ASCII7";
  IO_Port2[IO_Port2["UTF8"] = 20] = "UTF8";
  IO_Port2[IO_Port2["UTF16"] = 21] = "UTF16";
  IO_Port2[IO_Port2["UTF32"] = 22] = "UTF32";
  IO_Port2[IO_Port2["T_SPECIAL"] = 23] = "T_SPECIAL";
  IO_Port2[IO_Port2["INT"] = 24] = "INT";
  IO_Port2[IO_Port2["UINT"] = 25] = "UINT";
  IO_Port2[IO_Port2["BIN"] = 26] = "BIN";
  IO_Port2[IO_Port2["HEX"] = 27] = "HEX";
  IO_Port2[IO_Port2["FLOAT"] = 28] = "FLOAT";
  IO_Port2[IO_Port2["FIXED"] = 29] = "FIXED";
  IO_Port2[IO_Port2["N_SPECIAL"] = 31] = "N_SPECIAL";
  IO_Port2[IO_Port2["ADDR"] = 32] = "ADDR";
  IO_Port2[IO_Port2["BUS"] = 33] = "BUS";
  IO_Port2[IO_Port2["PAGE"] = 34] = "PAGE";
  IO_Port2[IO_Port2["S_SPECIAL"] = 39] = "S_SPECIAL";
  IO_Port2[IO_Port2["RNG"] = 40] = "RNG";
  IO_Port2[IO_Port2["NOTE"] = 41] = "NOTE";
  IO_Port2[IO_Port2["INSTR"] = 42] = "INSTR";
  IO_Port2[IO_Port2["NLEG"] = 43] = "NLEG";
  IO_Port2[IO_Port2["WAIT"] = 44] = "WAIT";
  IO_Port2[IO_Port2["NADDR"] = 45] = "NADDR";
  IO_Port2[IO_Port2["DATA"] = 46] = "DATA";
  IO_Port2[IO_Port2["M_SPECIAL"] = 47] = "M_SPECIAL";
  IO_Port2[IO_Port2["UD1"] = 48] = "UD1";
  IO_Port2[IO_Port2["UD2"] = 49] = "UD2";
  IO_Port2[IO_Port2["UD3"] = 50] = "UD3";
  IO_Port2[IO_Port2["UD4"] = 51] = "UD4";
  IO_Port2[IO_Port2["UD5"] = 52] = "UD5";
  IO_Port2[IO_Port2["UD6"] = 53] = "UD6";
  IO_Port2[IO_Port2["UD7"] = 54] = "UD7";
  IO_Port2[IO_Port2["UD8"] = 55] = "UD8";
  IO_Port2[IO_Port2["UD9"] = 56] = "UD9";
  IO_Port2[IO_Port2["UD10"] = 57] = "UD10";
  IO_Port2[IO_Port2["UD11"] = 58] = "UD11";
  IO_Port2[IO_Port2["UD12"] = 59] = "UD12";
  IO_Port2[IO_Port2["UD13"] = 60] = "UD13";
  IO_Port2[IO_Port2["UD14"] = 61] = "UD14";
  IO_Port2[IO_Port2["UD15"] = 62] = "UD15";
  IO_Port2[IO_Port2["UD16"] = 63] = "UD16";
  IO_Port2[IO_Port2["GAMEPAD"] = 64] = "GAMEPAD";
  IO_Port2[IO_Port2["AXIS"] = 65] = "AXIS";
  IO_Port2[IO_Port2["GAMEPAD_INFO"] = 66] = "GAMEPAD_INFO";
  IO_Port2[IO_Port2["KEY"] = 67] = "KEY";
  IO_Port2[IO_Port2["MOUSE_X"] = 68] = "MOUSE_X";
  IO_Port2[IO_Port2["MOUSE_Y"] = 69] = "MOUSE_Y";
  IO_Port2[IO_Port2["MOUSE_DX"] = 70] = "MOUSE_DX";
  IO_Port2[IO_Port2["MOUSE_DY"] = 71] = "MOUSE_DY";
  IO_Port2[IO_Port2["MOUSE_DWHEEL"] = 72] = "MOUSE_DWHEEL";
  IO_Port2[IO_Port2["MOUSE_BUTTONS"] = 73] = "MOUSE_BUTTONS";
  IO_Port2[IO_Port2["FILE"] = 74] = "FILE";
  return IO_Port2;
})(IO_Port || {});
var { SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO } = Operant_Operation;
var Opcodes_operants = {
  [0 /* ADD */]: [[SET, GET, GET], (s) => {
    s.a = s.b + s.c;
  }],
  [1 /* RSH */]: [[SET, GET], (s) => {
    s.a = s.b >>> 1;
  }],
  [2 /* LOD */]: [[SET, GAM], (s) => {
    s.a = s.m_get(s.b);
  }],
  [3 /* STR */]: [[SAM, GET], (s) => s.m_set(s.a, s.b)],
  [4 /* BGE */]: [[GET, GET, GET], (s) => {
    if (s.b >= s.c)
      s.pc = s.a;
  }],
  [63 /* SBGE */]: [[GET, GET, GET], (s) => {
    if (s.sb >= s.sc)
      s.pc = s.a;
  }],
  [5 /* NOR */]: [[SET, GET, GET], (s) => {
    s.a = ~(s.b | s.c);
  }],
  [6 /* IMM */]: [[SET, GET], (s) => {
    s.a = s.b;
  }],
  [7 /* SUB */]: [[SET, GET, GET], (s) => {
    s.a = s.b - s.c;
  }],
  [8 /* JMP */]: [[GET], (s) => {
    s.pc = s.a;
  }],
  [9 /* MOV */]: [[SET, GET], (s) => {
    s.a = s.b;
  }],
  [10 /* NOP */]: [[], () => false],
  [11 /* LSH */]: [[SET, GET], (s) => {
    s.a = s.b << 1;
  }],
  [12 /* INC */]: [[SET, GET], (s) => {
    s.a = s.b + 1;
  }],
  [13 /* DEC */]: [[SET, GET], (s) => {
    s.a = s.b - 1;
  }],
  [14 /* NEG */]: [[SET, GET], (s) => {
    s.a = -s.b;
  }],
  [15 /* AND */]: [[SET, GET, GET], (s) => {
    s.a = s.b & s.c;
  }],
  [16 /* OR */]: [[SET, GET, GET], (s) => {
    s.a = s.b | s.c;
  }],
  [17 /* NOT */]: [[SET, GET], (s) => {
    s.a = ~s.b;
  }],
  [18 /* XNOR */]: [[SET, GET, GET], (s) => {
    s.a = ~(s.b ^ s.c);
  }],
  [19 /* XOR */]: [[SET, GET, GET], (s) => {
    s.a = s.b ^ s.c;
  }],
  [20 /* NAND */]: [[SET, GET, GET], (s) => {
    s.a = ~(s.b & s.c);
  }],
  [21 /* BRL */]: [[GET, GET, GET], (s) => {
    if (s.b < s.c)
      s.pc = s.a;
  }],
  [60 /* SBRL */]: [[GET, GET, GET], (s) => {
    if (s.sb < s.sc)
      s.pc = s.a;
  }],
  [22 /* BRG */]: [[GET, GET, GET], (s) => {
    if (s.b > s.c)
      s.pc = s.a;
  }],
  [61 /* SBRG */]: [[GET, GET, GET], (s) => {
    if (s.sb > s.sc)
      s.pc = s.sa;
  }],
  [23 /* BRE */]: [[GET, GET, GET], (s) => {
    if (s.b === s.c)
      s.pc = s.a;
  }],
  [24 /* BNE */]: [[GET, GET, GET], (s) => {
    if (s.b !== s.c)
      s.pc = s.a;
  }],
  [25 /* BOD */]: [[GET, GET], (s) => {
    if (s.b & 1)
      s.pc = s.a;
  }],
  [26 /* BEV */]: [[GET, GET], (s) => {
    if (!(s.b & 1))
      s.pc = s.a;
  }],
  [27 /* BLE */]: [[GET, GET, GET], (s) => {
    if (s.b <= s.c)
      s.pc = s.a;
  }],
  [62 /* SBLE */]: [[GET, GET, GET], (s) => {
    if (s.sb <= s.sc)
      s.pc = s.a;
  }],
  [28 /* BRZ */]: [[GET, GET], (s) => {
    if (s.b === 0)
      s.pc = s.a;
  }],
  [29 /* BNZ */]: [[GET, GET], (s) => {
    if (s.b !== 0)
      s.pc = s.a;
  }],
  [30 /* BRN */]: [[GET, GET], (s) => {
    if (s.b & s.sign_bit)
      s.pc = s.a;
  }],
  [31 /* BRP */]: [[GET, GET], (s) => {
    if (!(s.b & s.sign_bit))
      s.pc = s.a;
  }],
  [32 /* PSH */]: [[GET], (s) => {
    s.push(s.a);
  }],
  [33 /* POP */]: [[SET], (s) => {
    s.a = s.pop();
  }],
  [34 /* CAL */]: [[GET], (s) => {
    s.push(s.pc);
    s.pc = s.a;
  }],
  [35 /* RET */]: [[], (s) => {
    s.pc = s.pop();
  }],
  [36 /* HLT */]: [[], () => true],
  [37 /* CPY */]: [[SAM, GAM], (s) => s.m_set(s.a, s.m_get(s.b))],
  [38 /* BRC */]: [[GET, GET, GET], (s) => {
    if (s.b + s.c > s.max_value)
      s.pc = s.a;
  }],
  [39 /* BNC */]: [[GET, GET, GET], (s) => {
    if (s.b + s.c <= s.max_value)
      s.pc = s.a;
  }],
  [40 /* MLT */]: [[SET, GET, GET], (s) => {
    s.a = s.b * s.c;
  }],
  [41 /* DIV */]: [[SET, GET, GET], (s) => {
    s.a = s.b / s.c;
  }],
  [59 /* SDIV */]: [[SET, GET, GET], (s) => {
    s.a = s.sb / s.sc;
  }],
  [42 /* MOD */]: [[SET, GET, GET], (s) => {
    s.a = s.b % s.c;
  }],
  [43 /* BSR */]: [[SET, GET, GET], (s) => {
    s.a = s.b >>> s.c;
  }],
  [44 /* BSL */]: [[SET, GET, GET], (s) => {
    s.a = s.b << s.c;
  }],
  [45 /* SRS */]: [[SET, GET], (s) => {
    s.a = s.sb >> 1;
  }],
  [46 /* BSS */]: [[SET, GET, GET], (s) => {
    s.a = s.sb >> s.c;
  }],
  [47 /* SETE */]: [[SET, GET, GET], (s) => {
    s.a = s.b === s.c ? s.max_value : 0;
  }],
  [48 /* SETNE */]: [[SET, GET, GET], (s) => {
    s.a = s.b !== s.c ? s.max_value : 0;
  }],
  [49 /* SETG */]: [[SET, GET, GET], (s) => {
    s.a = s.b > s.c ? s.max_value : 0;
  }],
  [65 /* SSETG */]: [[SET, GET, GET], (s) => {
    s.a = s.sb > s.sc ? s.max_value : 0;
  }],
  [50 /* SETL */]: [[SET, GET, GET], (s) => {
    s.a = s.b < s.c ? s.max_value : 0;
  }],
  [64 /* SSETL */]: [[SET, GET, GET], (s) => {
    s.a = s.sb < s.sc ? s.max_value : 0;
  }],
  [51 /* SETGE */]: [[SET, GET, GET], (s) => {
    s.a = s.b >= s.c ? s.max_value : 0;
  }],
  [67 /* SSETGE */]: [[SET, GET, GET], (s) => {
    s.a = s.sb >= s.sc ? s.max_value : 0;
  }],
  [52 /* SETLE */]: [[SET, GET, GET], (s) => {
    s.a = s.b <= s.c ? s.max_value : 0;
  }],
  [66 /* SSETLE */]: [[SET, GET, GET], (s) => {
    s.a = s.sb <= s.sc ? s.max_value : 0;
  }],
  [53 /* SETC */]: [[SET, GET, GET], (s) => {
    s.a = s.b + s.c > s.max_value ? s.max_value : 0;
  }],
  [54 /* SETNC */]: [[SET, GET, GET], (s) => {
    s.a = s.b + s.c <= s.max_value ? s.max_value : 0;
  }],
  [55 /* LLOD */]: [[SET, RAO, GAM], (s) => {
    s.a = s.m_get(s.b + s.c);
  }],
  [56 /* LSTR */]: [[RAO, SAM, GET], (s) => s.m_set(s.a + s.b, s.c)],
  [57 /* IN */]: [[SET, GET], (s) => s.in(s.b)],
  [58 /* OUT */]: [[GET, GET], (s) => {
    s.out(s.a, s.b);
  }],
  [68 /* __ASSERT */]: [[GET], (s) => {
    if (!s.a)
      fail_assert(s, `value = ${s.a}`);
  }],
  [69 /* __ASSERT0 */]: [[GET], (s) => {
    if (s.a)
      fail_assert(s, `value = ${s.a}`);
  }],
  [70 /* __ASSERT_EQ */]: [[GET, GET], (s) => {
    if (s.a !== s.b)
      fail_assert(s, `left = ${s.a}, right = ${s.b}`);
  }],
  [71 /* __ASSERT_NEQ */]: [[GET, GET], (s) => {
    if (s.a === s.b)
      fail_assert(s, `left = ${s.a}, right = ${s.b}`);
  }]
};
var inst_fns = object_map(Opcodes_operants, (key, value) => {
  if (value === void 0) {
    throw new Error("instruction definition undefined");
  }
  return [key, value?.[1]];
}, []);
var Opcodes_operant_lengths = object_map(Opcodes_operants, (key, value) => {
  if (value === void 0) {
    throw new Error("instruction definition undefined");
  }
  return [key, value[0].length];
}, []);
function fail_assert(ctx, msg) {
  const message = `Assertion failed: ${msg}`;
  ctx.warn(message);
}

// src/emulator/util.ts
function warn(line_nr, message) {
  return { line_nr, message };
}
function expand_warning(warning, lines, file_name) {
  const { message, line_nr } = warning;
  return `${file_name ?? "urcl"}:${line_nr + 1} - ${message}
   ${lines[line_nr]}`;
}
function pad_left(str, size, char = " ") {
  const pad = Math.max(0, size - str.length);
  return char.repeat(pad) + str;
}
function pad_center(str, size, left_char = " ", right_char = left_char) {
  const pad = Math.max(0, size - str.length);
  const left = 0 | pad / 2;
  const right = pad - left;
  return left_char.repeat(left) + str + right_char.repeat(right);
}
function hex(num, size, pad = " ") {
  return pad_left(num.toString(16), size, pad).toUpperCase();
}
function hex_size(bits) {
  return Math.ceil(bits / 4);
}
function registers_to_string(emulator2) {
  const nibbles = hex_size(emulator2.bits);
  return Array.from({ length: register_count }, (_, i) => pad_center(Register[i], nibbles) + " ").join("") + Array.from({ length: emulator2.registers.length - register_count }, (_, i) => pad_left(`R${i + 1}`, nibbles) + " ").join("") + "\n" + Array.from(emulator2.registers, (v) => hex(v, nibbles) + " ").join("");
}
function memoryToString(view, from = 0, length = 4096, bits = 8) {
  const width2 = 16;
  const end = Math.min(from + length, view.length);
  const hexes = hex_size(bits);
  let lines = [];
  for (let i = from; i < end; ) {
    const sub_end = Math.min(i + width2, end);
    let subs = [];
    const addr = hex(0 | i / width2, hexes - 1, " ");
    for (; i < sub_end; i++) {
      subs.push(hex(view[i], hexes));
    }
    const line = subs.join(" ");
    lines.push(addr + ":" + " ".repeat(hexes - addr.length) + line);
  }
  return lines.join("\n");
}
function indent(string, spaces) {
  const left = " ".repeat(spaces);
  return string.split("\n").map((line) => left + line).join("\n");
}
function object_map(obj, callback, target = {}) {
  const res = target;
  for (const key in obj) {
    const value = obj[key];
    const [new_key, new_value] = callback(key, value);
    res[new_key] = new_value;
  }
  return res;
}
var char_code_0 = "0".charCodeAt(0);
var char_code_9 = char_code_0 + 9;
function is_digit(str, index = 0) {
  const char_code = str.charCodeAt(index);
  return char_code >= char_code_0 && char_code <= char_code_9;
}
function enum_last(enum_obj) {
  let last = -1;
  for (const key in enum_obj) {
    const value = enum_obj[key];
    if (typeof value === "number") {
      last = Math.max(last, value);
    }
  }
  return last;
}
function enum_count(enum_obj) {
  return enum_last(enum_obj) + 1;
}
function enum_strings(enum_obj) {
  const strings = [];
  for (const key in enum_obj) {
    const value = enum_obj[key];
    if (typeof value === "string") {
      strings.push(value);
    }
  }
  return strings;
}
function enum_from_str(enum_obj, str) {
  if (is_digit(str)) {
    return void 0;
  }
  const value = enum_obj[str];
  return value;
}
var conversion_buffer = new DataView(new ArrayBuffer(8));
function f32_decode(int) {
  conversion_buffer.setInt32(0, int, true);
  return conversion_buffer.getFloat32(0, true);
}
function f32_encode(float) {
  conversion_buffer.setFloat32(0, float, true);
  return conversion_buffer.getInt32(0, true);
}
function f16_decode(int) {
  if (int === 0) {
    return 0;
  }
  const sign = int >>> 15 & 1;
  const exponent = int >>> 10 & 31;
  const fraction = int & 1023;
  const mag = (fraction / 1024 + 1) * 2 ** (exponent - 15);
  return sign ? -mag : mag;
}
function f16_encode(float) {
  const sign = Math.sign(float);
  float *= sign;
  const exponent = Math.floor(Math.log2(float));
  const fraction = float / 2 ** exponent - 1;
  return (sign < 0 ? 1 : 0) << 15 | (exponent + 15 & 31) << 10 | fraction * 1024 & 1023;
}
function read16(buf, little_endian, size) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out = new Uint16Array(Math.floor(Math.max(size, buf.byteLength) / 2));
  for (let i = 0; i < Math.floor(buf.byteLength / 2); i++) {
    out[i] = view.getUint16(i * 2, little_endian);
  }
  return out;
}
function read32(buf, littleEndian, size) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out = new Uint32Array(Math.floor(Math.max(size, buf.byteLength) / 4));
  for (let i = 0; i < Math.floor(buf.byteLength / 4); i++) {
    out[i] = view.getUint32(i * 4, littleEndian);
  }
  return out;
}
function write16(arr, little_endian) {
  const out = new Uint8Array(arr.length * 2);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  for (let i = 0; i < arr.length; i++) {
    view.setUint16(i * 2, arr[i], little_endian);
  }
  return out;
}
function write32(arr, little_endian) {
  const out = new Uint8Array(arr.length * 4);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  for (let i = 0; i < arr.length; i++) {
    view.setUint32(i * 4, arr[i], little_endian);
  }
  return out;
}
function format_int(n) {
  const base = Math.floor(n).toString();
  let out = "";
  let i = base.length;
  out = base.substring(i - 3, i);
  for (i -= 3; i > 3; i -= 3) {
    out = base.substring(i - 3, i) + "_" + out;
  }
  if (i > 0) {
    out = base.substring(0, i) + "_" + out;
  }
  return out;
}
function bound(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// src/l.ts
function l(tagOrElement = "DIV", attributes = {}, ...children) {
  const element = typeof tagOrElement === "string" ? document.createElement(tagOrElement) : tagOrElement;
  attribute(element, attributes);
  element.append(...children);
  return element;
}
function attribute(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "object") {
      attribute(element[key], value);
    } else {
      element[key] = value;
    }
  }
}

// src/editor/tokenizer.ts
function bind(func, ...args) {
  return func.bind(null, ...args);
}
function regex_end(src, i, regex2) {
  const res = regex2.exec(src.substring(i));
  if (res === null || res.index !== 0) {
    return void 0;
  }
  return i + res[0].length;
}
function or(toks, src, i, tokens) {
  for (const tok of toks) {
    const next = tok(src, i, tokens);
    if (next !== i) {
      return next;
    }
  }
  return i;
}
function and(toks, src, i, tokens) {
  for (let tok_i = 0; tok_i < toks.length; tok_i++) {
    const tok = toks[tok_i];
    const next = tok(src, i, tokens);
    if (next === i) {
      return i;
    }
    if (next !== "skip" /* Skip */) {
      i = next;
    }
  }
  return i;
}
function opt(tok, src, i, tokens) {
  const end = tok(src, i, tokens);
  return end === i ? "skip" /* Skip */ : end;
}
function list(tok, src, i, tokens) {
  while (i < src.length) {
    const next = tok(src, i, tokens);
    if (next === i) {
      return i;
    }
    if (next !== "skip" /* Skip */) {
      i = next;
    }
  }
  return i;
}
function regex(type, regex2, src, i, tokens) {
  const end = regex_end(src, i, regex2);
  if (end === void 0) {
    return i;
  }
  tokens.push({ type, start: i, end });
  return end;
}
var tok_comment = bind(regex, "comment" /* Comment */, /^\/\/[^\n]*/);
var tok_white = bind(regex, "white" /* White */, /^\s+/);
var tok_white_inline = bind(regex, "white-inline" /* White_inline */, /^(,|[^\S\n])+/);
var tok_number = bind(regex, "number" /* Number */, /^-?(0x[0-9a-fA-F_]+|0b[01_]+|[0-9_]+)/);
var tok_register = bind(regex, "register" /* Register */, /^[Rr$]([0-9_]+|0x[0-9a-fA-F_]+|0b[01_]+)/);
var tok_port = bind(regex, "port" /* Port */, /^%\w+/);
var tok_memory = bind(regex, "port" /* Port */, /^[#mM]([0-9_]+|0x[0-9a-fA-F_]+|0b[01_]+)/);
var tok_escape = bind(regex, "escape" /* Escape */, /^\\(x[0-9a-fA-F_]+|.)/);
var tok_char_quote = bind(regex, "quote-char" /* Quote_Char */, /^'/);
var tok_string_quote = bind(regex, "quote-string" /* Quote_String */, /^"/);
var tok_relative = bind(regex, "relative" /* Relative */, /^~-?(0x[0-9a-fA-F_]+|0b[01_]+|[0-9_]+)/);
var tok_label = bind(and, [
  bind(regex, "label" /* Label */, /^\.\w+/),
  bind(opt, bind(regex, "number" /* Number */, /\+\d+/)),
  bind(list, bind(or, [
    tok_comment,
    tok_white_inline
  ]))
]);
var tok_char = bind(and, [
  tok_char_quote,
  bind(or, [
    tok_escape,
    bind(regex, "text" /* Text */, /^[^'\\]/)
  ]),
  tok_char_quote
]);
var tok_string = bind(and, [
  tok_string_quote,
  bind(list, bind(or, [
    tok_escape,
    bind(regex, "text" /* Text */, /^[^"\\]+/)
  ])),
  tok_string_quote
]);
var tokenize = bind(list, bind(or, [
  tok_white,
  tok_white_inline,
  bind(regex, "comparator" /* Comparator */, /^<=|>=|==/),
  bind(regex, "macro" /* Macro */, /^BITS|MINREG|MINHEAP|MINSTACK|RUN|HEAP/i),
  bind(regex, "text" /* Text */, /^RAM|ROM/i),
  tok_number,
  tok_char,
  tok_string,
  tok_register,
  tok_port,
  tok_memory,
  tok_label,
  tok_relative,
  tok_comment,
  bind(regex, "square-open" /* Square_Open */, /\[/),
  bind(regex, "square-close" /* Square_Close */, /\]/),
  bind(regex, "macro" /* Macro */, /^@[a-zA-Z_][a-zA-Z_0-9]*/),
  bind(regex, "name" /* Name */, /^[a-zA-Z_][a-zA-Z_0-9]*/),
  bind(regex, "unknown" /* Unknown */, /^\S+/)
]));

// src/editor/editor.ts
var Editor_Window = class extends HTMLElement {
  line_nrs;
  code;
  input;
  colors;
  profile_check = document.createElement("input");
  profiled = [];
  profile_present = false;
  lines = [];
  tab_width = 4;
  constructor() {
    super();
    l(this, {}, this.line_nrs = l("div", { className: "line-nrs" }), this.code = l("div", { className: "code" }, this.input = l("textarea", { spellcheck: false }), this.colors = l("code", { className: "colors" })));
    this.input.addEventListener("input", this.input_cb.bind(this));
    this.input.addEventListener("keydown", this.keydown_cb.bind(this));
    this.profile_check.type = "checkbox";
    const profile_text = document.createElement("span");
    this.parentElement?.insertBefore(this.profile_check, this);
    profile_text.textContent = `Show line-profile`;
    this.parentElement?.insertBefore(profile_text, this);
    const resize_observer = new ResizeObserver(() => this.render_lines());
    resize_observer.observe(this);
    this.onscroll = () => this.render_lines();
  }
  get value() {
    return this.input.value;
  }
  set value(value) {
    this.input.value = value;
    this.input_cb();
  }
  pc_line = 0;
  set_pc_line(line) {
    const old = this.line_nrs.children[this.pc_line];
    if (old) {
      old.classList.remove("pc-line");
    }
    const child = this.line_nrs.children[line];
    if (child) {
      child.classList.add("pc-line");
    }
    this.pc_line = line;
  }
  set_line_profile(counts) {
    if (!this.profile_check.checked) {
      if (!this.profile_present) {
        return;
      }
      this.profile_present = false;
    }
    const children = this.line_nrs.children;
    let last = 0;
    for (const [line_nr, executed] of counts) {
      for (; last < line_nr; last++) {
        if (this.profiled[last]) {
          const child = children[line_nr];
          child.textContent = `${last + 1}`;
        }
      }
      if (this.profile_check.checked) {
        const child = children[line_nr];
        child.textContent = `${executed} ${line_nr + 1}`;
      }
    }
  }
  keydown_cb(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      let start = this.input.selectionStart;
      let end = this.input.selectionEnd;
      if (!event.shiftKey && start === end) {
        const value = this.input.value;
        const line_offset = start - line_start(value, start);
        const add_count = this.tab_width - line_offset % this.tab_width || this.tab_width;
        this.input.value = str_splice(value, start, 0, " ".repeat(add_count));
        this.input.selectionStart = this.input.selectionEnd = start + add_count;
      } else {
        let src = this.input.value;
        if (event.shiftKey) {
          foreach_line_selected(src, start, end, (i) => {
            const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
            const delete_count = white_width === 0 ? 0 : white_width % this.tab_width || this.tab_width;
            if (i < start) {
              start -= delete_count;
            }
            end -= delete_count;
            src = str_splice(src, i, delete_count, "");
            return src;
          });
          this.input.value = src;
          this.input.selectionStart = start;
          this.input.selectionEnd = end;
        } else {
          foreach_line_selected(src, start, end, (i) => {
            const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
            const add_count = this.tab_width - white_width % this.tab_width || this.tab_width;
            if (i < start) {
              start += add_count;
            }
            end += add_count;
            src = str_splice(src, i, 0, " ".repeat(add_count));
            return src;
          });
          this.input.value = src;
          this.input.selectionStart = start;
          this.input.selectionEnd = end;
        }
      }
      this.input_cb();
    } else if (event.key === "/" && event.ctrlKey) {
      let start = this.input.selectionStart;
      let end = this.input.selectionEnd;
      let src = this.input.value;
      foreach_line_selected(src, start, end, (i) => {
        const white_end = regex_end(src, i, /^\s*/) ?? i;
        if (regex_end(src, white_end, /^\/\//) === void 0) {
          src = str_splice(src, white_end, 0, "// ");
          if (i < start) {
            start += 3;
          }
          end += 3;
        } else {
          const delete_count = src[white_end + 2] === " " ? 3 : 2;
          src = str_splice(src, white_end, delete_count, "");
          if (i < start) {
            start -= delete_count;
          }
          end -= delete_count;
        }
        return src;
      });
      this.input.value = src;
      this.input.selectionStart = start;
      this.input.selectionEnd = end;
      this.input_cb();
    }
  }
  input_cb() {
    this.render_lines();
    this.call_input_listeners();
  }
  render_lines() {
    this.input.style.height = "0px";
    const height2 = this.input.scrollHeight;
    this.input.style.height = height2 + "px";
    this.input.style.width = "0px";
    this.input.style.width = this.input.scrollWidth + "px";
    const lines = this.input.value.split("\n");
    this.lines = lines;
    {
      const width2 = (lines.length + "").length;
      const start_lines = this.line_nrs.children.length;
      const delta_lines = lines.length - start_lines;
      if (delta_lines > 0) {
        for (let i = 0; i < delta_lines; i++) {
          const div2 = this.line_nrs.appendChild(document.createElement("div"));
          div2.textContent = pad_left("" + (start_lines + i + 1), width2);
        }
      } else {
        for (let i = 0; i < -delta_lines; i++) {
          this.line_nrs.lastChild?.remove();
        }
      }
    }
    const ch = this.input.scrollHeight / Math.max(1, this.lines.length);
    const pixel_start = this.scrollTop;
    const pixel_end = Math.min(pixel_start + this.clientHeight, this.input.scrollHeight);
    const start = Math.floor(pixel_start / ch);
    const end = Math.min(this.lines.length, Math.ceil(pixel_end / ch));
    this.colors.style.top = start * ch + "px";
    let div = this.colors.firstElementChild;
    for (let i = start; i < end; i++) {
      const line = this.lines[i].replaceAll("\r", "");
      if (div === null) {
        div = document.createElement("div");
        this.colors.appendChild(div);
      }
      div.innerHTML = "";
      let span = div.firstElementChild;
      if (line.length == 0) {
        div.innerHTML = "<span> </span>";
      } else {
        const tokens = [];
        tokenize(line, 0, tokens);
        for (const { type, start: start2, end: end2 } of tokens) {
          if (span === null) {
            span = document.createElement("span");
            div.appendChild(span);
          }
          span.textContent = line.substring(start2, end2);
          span.className = type;
          span = span.nextElementSibling;
        }
      }
      while (span !== null) {
        const next = span.nextElementSibling;
        div.removeChild(span);
        span = next;
      }
      div = div.nextElementSibling;
    }
    while (div !== null) {
      const next = div.nextElementSibling;
      this.colors.removeChild(div);
      div = next;
    }
  }
  call_input_listeners() {
    for (const listener of this.input_listeners) {
      listener.call(this, new Event("input"));
    }
  }
  input_listeners = [];
  set oninput(cb) {
    this.input_listeners.push(cb);
  }
};
customElements.define("editor-window", Editor_Window);
function str_splice(string, index, delete_count, insert) {
  return string.slice(0, index) + insert + string.slice(index + delete_count);
}
function foreach_line_selected(string, start, end, callback) {
  const first_line = line_start(string, start);
  let i = string.indexOf("\n", first_line) + 1 || string.length;
  let line_count = 1;
  for (; i < end; i = string.indexOf("\n", i) + 1 || string.length) {
    line_count++;
  }
  for (let line = 0, i2 = first_line; line < line_count; line++) {
    string = callback(i2);
    i2 = string.indexOf("\n", i2) + 1 || string.length;
  }
  return string;
}
function line_start(string, index) {
  let i = 0, line_start2 = 0;
  for (; i <= index; i = string.indexOf("\n", i) + 1 || string.length) {
    line_start2 = i;
    if (i >= string.length) {
      line_start2 + 1;
      break;
    }
  }
  return line_start2;
}

// src/scroll-out/scroll-out.ts
var max_size = 1e9;
var Scroll_Out = class extends HTMLElement {
  scroll_div = document.createElement("div");
  content = document.createElement("div");
  char = document.createElement("div");
  cw = 8;
  ch = 8;
  lines = [""];
  size = 0;
  constructor() {
    super();
    this.appendChild(this.scroll_div);
    this.scroll_div.appendChild(this.content);
    this.onscroll = () => this.update();
    this.onresize = () => this.resize();
    this.char.textContent = "a";
    this.char.style.position = "absolute";
    this.char.style.visibility = "hidden";
    this.appendChild(this.char);
  }
  update() {
    const { ceil: c, floor: f } = Math;
    const { clientWidth: cw, clientHeight: ch } = this.char;
    const x = this.scrollLeft, y = this.scrollTop;
    const w = this.clientWidth, h = this.clientHeight;
    this.render(f(x / cw), f(y / ch), c(w + 1 + 1 / cw), c((h + 2) / ch));
  }
  resize() {
    const { clientWidth: cw, clientHeight: ch } = this.char;
    this.cw = cw;
    this.ch = ch;
    const scroll = this.scrollTop === this.scrollHeight - this.clientHeight;
    const W = this.text_width, H = this.lines.length;
    this.scroll_div.style.height = `${H * ch}px`;
    this.scroll_div.style.width = `${W * cw}px`;
    this.update();
    if (scroll) {
      this.scrollTop = this.scrollHeight * 2;
    }
    return scroll;
  }
  buf = "";
  text_width = 0;
  clear() {
    this.buf = "";
    this.text_width = 0;
    this.lines = [""];
    this.size = 0;
    this.resize();
  }
  write(text_to_add) {
    this.buf += text_to_add;
  }
  flush() {
    if (this.buf.length === 0) {
      return;
    }
    let j = 0;
    for (let i2 = this.buf.indexOf("\n") + 1; i2 > 0; j = i2, i2 = this.buf.indexOf("\n", i2) + 1) {
      const line = this.buf.substring(j, i2 - 1);
      const full_line2 = this.lines[this.lines.length - 1] += line;
      this.text_width = Math.max(full_line2.length, this.text_width);
      const clear_escape2 = "\x1B[2J";
      const escape_index2 = full_line2.lastIndexOf(clear_escape2);
      if (escape_index2 >= 0) {
        const escaped = full_line2.substring(escape_index2 + clear_escape2.length);
        this.lines = [escaped];
        this.size = escaped.length;
      }
      this.size += line.length;
      this.lines.push("");
    }
    const full_line = this.lines[this.lines.length - 1] += this.buf.substring(j, this.buf.length);
    const clear_escape = "\x1B[2J";
    const escape_index = full_line.lastIndexOf(clear_escape);
    if (escape_index >= 0) {
      const escaped = full_line.substring(escape_index + clear_escape.length);
      this.lines = [escaped];
      this.size = escaped.length;
    }
    this.text_width = Math.max(full_line.length, this.text_width);
    this.size += this.buf.length - j;
    this.buf = "";
    let i = 0;
    for (; this.size > max_size && i + 1 < this.lines.length; i++) {
      this.size -= this.lines[i].length;
    }
    this.lines.splice(0, i);
    if (this.lines.length === 1 && this.lines[0].length > max_size) {
      this.lines[0] = this.lines[0].substring(this.lines[0].length - max_size);
      this.size = max_size;
    }
    if (!this.resize()) {
      this.scrollTop -= this.ch * i;
    }
  }
  render(x, y, w, h) {
    const W = this.text_width, H = this.lines.length;
    const sx = bound(x, 0, W), ex = bound(x + w, 0, W);
    const sy = bound(y, 0, H), ey = bound(y + h, 0, H);
    this.content.style.top = `${sy * this.ch}px`;
    this.content.style.left = `${sx * this.cw}px`;
    let text = "";
    for (let y2 = sy; y2 < ey; y2++) {
      const line = this.lines[y2];
      text += line.substring(sx, ex) + "\n";
    }
    this.content.textContent = text;
  }
};
customElements.define("scroll-out", Scroll_Out);

// src/buffer_view/buffer_view.ts
var BufferView = class extends HTMLElement {
  content;
  scroll_div;
  char;
  memory = new Uint8Array();
  width = 16;
  constructor() {
    super();
    l(this, {
      style: { whiteSpace: "pre", fontFamily: "monospace", position: "relative", overflow: "auto", display: "block" }
    }, this.content = l("div", { style: { position: "absolute" } }), this.scroll_div = l("div"), this.char = l("div", { style: { position: "absolute", visibility: "hidden" } }, "a"));
    this.onscroll = this.update;
    const observer = new ResizeObserver(() => this.update());
    observer.observe(this);
  }
  update() {
    const ch = this.char.clientHeight;
    console.log(ch);
    const H = Math.ceil(this.memory.length / this.width);
    const height2 = H * ch;
    this.scroll_div.style.height = `${height2}px`;
    const y = Math.floor(this.scrollTop / ch);
    const h = Math.ceil((this.clientHeight + 2) / ch);
    const sy = bound(y, 0, H), ey = bound(y + h, 0, H);
    this.content.style.top = `${sy * ch}px`;
    this.content.innerText = memoryToString(this.memory, sy * this.width, (ey - sy) * this.width, this.memory.BYTES_PER_ELEMENT * 8);
  }
};
customElements.define("buffer-view", BufferView);

// src/emulator/compiler.ts
function compile(parsed) {
  const { headers, opcodes, operant_types, operant_values, instr_line_nrs, lines, register_breaks, program_breaks, data_breaks, heap_breaks, port_breaks } = parsed;
  const in_ram = parsed.headers[3 /* RUN */]?.value === 1 /* RAM */;
  const header_bits = parsed.headers[0 /* BITS */].value;
  const bits = header_bits <= 8 ? 8 : header_bits <= 16 ? 16 : header_bits <= 32 ? 32 : void 0;
  if (bits === void 0) {
    throw new Error("bits can not exceed 32");
  }
  parsed.headers[0 /* BITS */].value = bits;
  const msb = 1 << bits - 1;
  const smsb = 1 << bits - 2;
  const max = 4294967295 >>> 32 - bits;
  const smax = max >>> 1;
  const uhalf = max & max << bits / 2;
  const lhalf = max - uhalf;
  const minreg = headers[1 /* MINREG */].value;
  const minheap = headers[2 /* MINHEAP */].value;
  const minstack = headers[4 /* MINSTACK */].value;
  const heap_offset = parsed.data.length;
  const new_operant_values = operant_values.map((vals) => vals.slice());
  const new_operant_types = operant_types.map((types, i) => types.map((t, j) => {
    switch (t) {
      case 0 /* Reg */: {
        const num = new_operant_values[i][j] + 1 - register_count;
        if (num > minreg) {
          throw new Error(`register ${num} does not exist, ${num} > minreg:${minreg}`);
        }
        return 0 /* Reg */;
      }
      case 1 /* Imm */:
        return 1 /* Imm */;
      case 3 /* Label */:
        return 1 /* Imm */;
      case 6 /* String */:
        return 0 /* Reg */;
      case 2 /* Memory */: {
        new_operant_values[i][j] += heap_offset;
        return 1 /* Imm */;
      }
      case 4 /* Data_Label */:
        return 1 /* Imm */;
      case 5 /* Constant */: {
        const vals = new_operant_values[i];
        const constant = vals[j];
        switch (constant) {
          case 0 /* BITS */:
            vals[j] = bits;
            break;
          case 1 /* MSB */:
            vals[j] = msb;
            break;
          case 2 /* SMSB */:
            vals[j] = smsb;
            break;
          case 3 /* MAX */:
            vals[j] = max;
            break;
          case 4 /* SMAX */:
            vals[j] = smax;
            break;
          case 5 /* UHALF */:
            vals[j] = uhalf;
            break;
          case 6 /* LHALF */:
            vals[j] = lhalf;
            break;
          case 7 /* MINREG */:
            vals[j] = minreg;
            break;
          case 8 /* MINHEAP */:
            vals[j] = minheap;
            break;
          case 9 /* HEAP */:
            vals[j] = minheap;
            break;
          case 10 /* MINSTACK */:
            vals[j] = minstack;
            break;
          default:
            throw new Error(`Unsupported constant ${constant} ${Constants[constant]}`);
        }
        return 1 /* Imm */;
      }
      default:
        throw new Error(`Unkown opperant type ${t} ${Operant_Type[t]}`);
    }
  }));
  const memory_breaks = { ...data_breaks };
  for (const [key, value] of Object.entries(heap_breaks)) {
    memory_breaks[Number(key) + heap_offset] = value;
  }
  return [
    { headers, opcodes, operant_prims: new_operant_types, operant_values: new_operant_values, data: parsed.data },
    { pc_line_nrs: instr_line_nrs, lines, program_breaks, memory_breaks, register_breaks, port_breaks }
  ];
}

// src/emulator/devices/clock.ts
var Clock = class {
  wait_end = 0;
  time_out;
  inputs = {
    [44 /* WAIT */]: this.wait_in
  };
  outputs = {
    [44 /* WAIT */]: this.wait_out
  };
  wait_out(time) {
    if (time === 0) {
      this.wait_end = -1;
    } else {
      this.wait_end = Date.now() + time;
    }
  }
  wait_in(callback) {
    if (this.wait_end == -1) {
      requestAnimationFrame((dt) => callback(dt));
    } else {
      this.time_out = setTimeout(() => callback(1), this.wait_end - Date.now());
    }
  }
  reset() {
    this.wait_end = 0;
    if (this.time_out !== void 0) {
      clearTimeout(this.time_out);
    }
  }
};

// src/emulator/devices/console-io.ts
function sepperate(str) {
  let out = "";
  const seg_len = 4;
  for (let i = 0; i < str.length; i += seg_len) {
    out += "_" + str.substring(i, i + seg_len);
  }
  if (out.startsWith("_")) {
    out = out.substring(1);
  }
  return out;
}
var Console_IO = class {
  constructor(input2, write, _reset) {
    this.input = input2;
    this.write = write;
    this._reset = _reset;
  }
  bits = 32;
  inputs = {
    [1 /* TEXT */]: this.text_in,
    [2 /* NUMB */]: this.numb_in,
    [28 /* FLOAT */]: (cb) => {
      if (this.bits >= 32) {
        this.numb_in(cb, (s) => f32_encode(Number(s)));
      } else if (this.bits >= 16) {
        this.numb_in(cb, (s) => f16_encode(Number(s)));
      } else {
        throw new Error(`8 bit floats are not supported`);
      }
    },
    [29 /* FIXED */]: (cb) => {
      this.numb_in(cb, (s) => Math.floor(Number(s) * 2 ** (this.bits / 2)));
    }
  };
  outputs = {
    [1 /* TEXT */]: this.text_out,
    [2 /* NUMB */]: this.numb_out,
    [25 /* UINT */]: this.numb_out,
    [27 /* HEX */]: (v) => this.write(sepperate(v.toString(16).padStart(Math.ceil(this.bits / 4), "0"))),
    [26 /* BIN */]: (v) => this.write(sepperate(v.toString(2).padStart(this.bits, "0"))),
    [28 /* FLOAT */]: (v) => {
      if (this.bits >= 32) {
        this.write(f32_decode(v).toString());
      } else if (this.bits >= 16) {
        this.write(f16_decode(v).toString());
      } else {
        throw new Error(`8 bit floats are not supported`);
      }
    },
    [29 /* FIXED */]: (v) => {
      this.write((v / 2 ** (this.bits / 2)).toString());
    },
    [24 /* INT */]: (v) => {
      const sign_bit = 2 ** (this.bits - 1);
      if (v & sign_bit) {
        v = (v & sign_bit - 1) - sign_bit;
      }
      this.write(v.toString());
    },
    [16 /* ASCII */]: this.text_out,
    [17 /* CHAR5 */]: this.text_out,
    [18 /* CHAR6 */]: this.text_out,
    [16 /* ASCII */]: this.text_out,
    [20 /* UTF8 */]: this.text_out,
    [21 /* UTF16 */]: this.text_out,
    [22 /* UTF32 */]: this.text_out
  };
  set_text(text) {
    this.input.text = text;
  }
  reset() {
    this.input.text = "";
    this._reset();
  }
  text_in(callback) {
    if (this.input.text.length === 0) {
      this.input.read(() => {
        const char_code2 = this.input.text.codePointAt(0) ?? this.input.text.charCodeAt(0);
        this.input.text = this.input.text.slice(1);
        callback(char_code2);
      });
      return void 0;
    }
    const char_code = this.input.text.charCodeAt(0);
    this.input.text = this.input.text.slice(1);
    return char_code;
  }
  text_out(value) {
    this.write(String.fromCodePoint(value));
  }
  numb_in(callback, parse2 = parseInt) {
    if (this.input.text.length !== 0) {
      const num = parse2(this.input.text);
      if (!Number.isNaN(num)) {
        this.input.text = this.input.text.trimStart().slice(num.toString().length);
        return num;
      }
    }
    this.input.read(() => {
      const num = this.numb_in(callback, parse2);
      if (num !== void 0) {
        callback(num);
      }
    });
  }
  numb_out(value) {
    this.write("" + value);
  }
};

// src/emulator/devices/display.ts
var Color_Mode = /* @__PURE__ */ ((Color_Mode2) => {
  Color_Mode2[Color_Mode2["RGB"] = 0] = "RGB";
  Color_Mode2[Color_Mode2["Mono"] = 1] = "Mono";
  Color_Mode2[Color_Mode2["Bin"] = 2] = "Bin";
  Color_Mode2[Color_Mode2["RGB8"] = 3] = "RGB8";
  Color_Mode2[Color_Mode2["RGB16"] = 4] = "RGB16";
  Color_Mode2[Color_Mode2["RGB24"] = 5] = "RGB24";
  Color_Mode2[Color_Mode2["RGB6"] = 6] = "RGB6";
  Color_Mode2[Color_Mode2["RGB12"] = 7] = "RGB12";
  Color_Mode2[Color_Mode2["PICO8"] = 8] = "PICO8";
  Color_Mode2[Color_Mode2["RGBI"] = 9] = "RGBI";
  return Color_Mode2;
})(Color_Mode || {});
var pico8 = [
  0,
  1911635,
  8267091,
  34641,
  11227702,
  6248271,
  12764103,
  16773608,
  16711757,
  16753408,
  16772135,
  58422,
  2731519,
  8615580,
  16742312,
  16764074
].map((v) => [v >>> 16 & 255, v >>> 8 & 255, v & 255]);

// src/emulator/devices/controlpad.ts
var ControlPad = class {
  constructor(gamepad2) {
    this.gamepad = gamepad2;
  }
  xbox_mapping = {
    0: 1 << 0 /* A */,
    1: 1 << 1 /* B */,
    8: 1 << 2 /* SELECT */,
    9: 1 << 3 /* START */,
    12: 1 << 6 /* UP */,
    13: 1 << 7 /* DOWN */,
    14: 1 << 4 /* LEFT */,
    15: 1 << 5 /* RIGHT */
  };
  info(index) {
    if (index == 0) {
      return 1;
    } else {
      return 0;
    }
  }
  cleanup;
  chrome_fix() {
    const gamepad2 = navigator.getGamepads()[this.gamepad.index];
    if (gamepad2 !== null) {
      this.gamepad = gamepad2;
    }
  }
  get buttons() {
    this.chrome_fix();
    let value = 0;
    this.gamepad.buttons.forEach((button, i) => {
      if (button.pressed) {
        value += this.xbox_mapping[i] ?? 0;
      }
    });
    return value;
  }
  axis(index) {
    this.chrome_fix();
    const a = this.gamepad.axes[index];
    return a * 127;
  }
};

// src/emulator/devices/gamepad.ts
var Gamepad_Key = /* @__PURE__ */ ((Gamepad_Key2) => {
  Gamepad_Key2[Gamepad_Key2["A"] = 0] = "A";
  Gamepad_Key2[Gamepad_Key2["B"] = 1] = "B";
  Gamepad_Key2[Gamepad_Key2["SELECT"] = 2] = "SELECT";
  Gamepad_Key2[Gamepad_Key2["START"] = 3] = "START";
  Gamepad_Key2[Gamepad_Key2["LEFT"] = 4] = "LEFT";
  Gamepad_Key2[Gamepad_Key2["RIGHT"] = 5] = "RIGHT";
  Gamepad_Key2[Gamepad_Key2["UP"] = 6] = "UP";
  Gamepad_Key2[Gamepad_Key2["DOWN"] = 7] = "DOWN";
  return Gamepad_Key2;
})(Gamepad_Key || {});
var Gamepad_Exes = /* @__PURE__ */ ((Gamepad_Exes2) => {
  Gamepad_Exes2[Gamepad_Exes2["LEFT_X"] = 0] = "LEFT_X";
  Gamepad_Exes2[Gamepad_Exes2["LEFT_Y"] = 1] = "LEFT_Y";
  Gamepad_Exes2[Gamepad_Exes2["RIGHT_X"] = 2] = "RIGHT_X";
  Gamepad_Exes2[Gamepad_Exes2["RIGHT_Y"] = 3] = "RIGHT_Y";
  return Gamepad_Exes2;
})(Gamepad_Exes || {});
var Pad = class {
  pads = [];
  gamepads = /* @__PURE__ */ new Map();
  selected = 0;
  axis_index = 0;
  info_index = 0;
  constructor() {
    addEventListener("gamepadconnected", this.connect);
    addEventListener("gamepaddisconnected", this.disconnect);
  }
  cleanup() {
    for (const pad of this.pads) {
      pad?.cleanup?.();
    }
    removeEventListener("gamepadconnected", this.connect);
    removeEventListener("gamepaddisconnected", this.disconnect);
  }
  connect = (e) => {
    const pad = new ControlPad(e.gamepad);
    console.log(pad);
    this.gamepads.set(e.gamepad, pad);
    this.add_pad(pad);
  };
  disconnect = (e) => {
    const pad = this.gamepads.get(e.gamepad);
    if (pad !== void 0) {
      this.remove_pad(pad);
      this.gamepads.delete(e.gamepad);
    }
  };
  add_pad(pad) {
    this.pads.push(pad);
  }
  remove_pad(pad) {
    const index = this.pads.indexOf(pad);
    if (index < 0) {
      return;
    }
    this.pads[index] = void 0;
  }
  inputs = {
    [64 /* GAMEPAD */]: () => this.pads[this.selected]?.buttons ?? 0,
    [65 /* AXIS */]: () => this.pads[this.selected]?.axis?.(this.axis_index) ?? 0,
    [66 /* GAMEPAD_INFO */]: () => this.pads[this.selected]?.info(this.info_index) ?? 0
  };
  outputs = {
    [64 /* GAMEPAD */]: (i) => this.selected = i,
    [65 /* AXIS */]: (i) => this.axis_index = i
  };
};

// src/webgl/shader.ts
function createProgram(gl2, vertexSource, fragmentSource) {
  const vertexShader = loadShader(gl2, gl2.VERTEX_SHADER, vertexSource);
  const fragmentShader = loadShader(gl2, gl2.FRAGMENT_SHADER, fragmentSource);
  const program = gl2.createProgram();
  if (program == null) {
    throw new Error("failed to create shader program");
  }
  gl2.attachShader(program, vertexShader);
  gl2.attachShader(program, fragmentShader);
  gl2.linkProgram(program);
  gl2.detachShader(program, vertexShader);
  gl2.detachShader(program, fragmentShader);
  gl2.deleteShader(vertexShader);
  gl2.deleteShader(fragmentShader);
  if (!gl2.getProgramParameter(program, gl2.LINK_STATUS)) {
    const linkErrLog = gl2.getProgramInfoLog(program);
    gl2.deleteProgram(program);
    throw new Error("Shader program did not link successfully. Error log: " + linkErrLog);
  }
  return program;
}
function loadShader(gl2, type, source) {
  const shader = gl2.createShader(type);
  if (shader == null) {
    throw new Error("Failed to create shader");
  }
  gl2.shaderSource(shader, source);
  gl2.compileShader(shader);
  if (!gl2.getShaderParameter(shader, gl2.COMPILE_STATUS)) {
    const info = gl2.getShaderInfoLog(shader);
    gl2.deleteShader(shader);
    throw new Error("Shader compile error: " + info);
  }
  return shader;
}

// src/emulator/devices/gl-display.frag
var gl_display_default = "#version 300 es\r\nprecision mediump float;\r\nin vec2 v_uv;\r\nout vec4 color;\r\n\r\nuniform sampler2D u_image;\r\nuniform uint u_color_mode;\r\n\r\nvec4 rgb(vec4 v, uint bits){\r\n    uint color = uint(v.x * 255.) + (uint(v.y * 255.) << 8u) + (uint(v.z * 255.) << 16u);\r\n    uint blue_bits = bits / 3u;\r\n    uint blue_mask = (1u << blue_bits) - 1u;\r\n    uint red_bits = (bits - blue_bits) / 2u;\r\n    uint red_mask = (1u << red_bits) - 1u;\r\n    uint green_bits = bits - blue_bits - red_bits;\r\n    uint green_mask = (1u << green_bits) - 1u;\r\n    \r\n    uint green_offset = blue_bits;\r\n    uint red_offset = green_offset + green_bits;\r\n    return vec4(\r\n        float((color >> red_offset   ) & red_mask) / float(red_mask),\r\n        float((color >> green_offset ) & green_mask) / float(green_mask),\r\n        float((color                  ) & blue_mask) / float(blue_mask),\r\n        1\r\n    );\r\n}\r\nvec4 rgbi(vec4 v){\r\n    uint c = uint(v.x * 255.);\r\n    uint r = (c >> 3u) & 1u;\r\n    uint g = (c >> 2u) & 1u;\r\n    uint b = (c >> 1u) & 1u;\r\n    uint i = ((c >> 0u) & 1u) + 1u;\r\n    if ((c & 15u) == 1u){\r\n        return vec4(0.25, 0.25, 0.25, 1.);\r\n    }\r\n    return vec4(float(r*i)/2.1, float(g*i)/2.1, float(b*i)/2.1, 1.);\r\n}\r\nvec4 pallet_pico8[16] = vec4[16](\r\n    vec4(0./255., 0./255., 0./255., 1.), vec4(29./255., 43./255., 83./255., 1.),\r\n    vec4(126./255., 37./255., 83./255., 1.), vec4(0./255., 135./255., 81./255., 1.),\r\n    vec4(171./255., 82./255., 54./255., 1.), vec4(95./255., 87./255., 79./255., 1.),\r\n    vec4(194./255., 195./255., 199./255., 1.), vec4(255./255., 241./255., 232./255., 1.),\r\n    vec4(255./255., 0./255., 77./255., 1.), vec4(255./255., 163./255., 0./255., 1.),\r\n    vec4(255./255., 236./255., 39./255., 1.), vec4(0./255., 228./255., 54./255., 1.),\r\n    vec4(41./255., 173./255., 255./255., 1.), vec4(131./255., 118./255., 156./255., 1.),\r\n    vec4(255./255., 119./255., 168./255., 1.), vec4(255./255., 204./255., 170./255., 1.)\r\n);\r\n\r\nvec4 pico8(vec4 v){\r\n    return pallet_pico8[uint(v.x * 255.) & 15u];\r\n}\r\n\r\nvec4 mono(vec4 c){\r\n    return vec4(c.x, c.x, c.x, 1);\r\n}\r\n\r\nvec4 bin(vec4 c){\r\n    return c.x > 0. || c.y > 0. || c.z > 0. ? vec4(1,1,1,1) : vec4(0,0,0,1);\r\n}\r\n\r\n\r\nvoid main(){\r\n    vec4 c = texture(u_image, v_uv);\r\n    switch (u_color_mode){\r\n        case 0u: color = rgb(c, 8u); break;\r\n        case 1u: color = mono(c); break;\r\n        case 2u: color = bin(c); break;\r\n        case 3u: color = rgb(c, 8u); break;\r\n        case 4u: color = rgb(c, 16u); break;\r\n        case 5u: color = rgb(c, 24u); break;\r\n        case 6u: color = rgb(c, 6u); break;\r\n        case 7u: color = rgb(c, 12u); break;\r\n        case 8u: color = pico8(c); break;\r\n        case 9u: color = rgbi(c); break;\r\n        default: color = pico8(c); break;\r\n    }\r\n}";

// src/emulator/devices/gl-display.vert
var gl_display_default2 = "#version 300 es\r\nprecision mediump float;\r\nin vec2 a_uv;\r\nin vec2 a_pos;\r\n\r\nout vec2 v_uv;\r\n\r\nvoid main(){\r\n    gl_Position = vec4(a_pos, 0., 1.);\r\n    v_uv = a_uv;\r\n}";

// src/emulator/devices/gl-display.ts
var Gl_Display = class {
  constructor(gl2, color_mode = 8 /* PICO8 */) {
    this.color_mode = color_mode;
    this.gl = gl2;
    const { drawingBufferWidth: width2, drawingBufferHeight: height2 } = gl2;
    this.buffer = new Uint32Array(width2 * height2);
    this.bytes = new Uint8Array(this.buffer.buffer, 0, this.buffer.byteLength);
    const gl_program = createProgram(gl2, this.vert_src, this.frag_src);
    gl2.useProgram(gl_program);
    const attr_pos = gl2.getAttribLocation(gl_program, "a_pos");
    if (attr_pos < 0) {
      throw new Error("program does not have attribute a_pos");
    }
    const attr_uv = gl2.getAttribLocation(gl_program, "a_uv");
    if (attr_uv < 0) {
      throw new Error("program does not have attribute a_uv");
    }
    const uni_image = gl2.getUniformLocation(gl_program, "u_image");
    if (uni_image === null) {
      throw new Error("program does not have uniform u_image");
    }
    const uni_mode = gl2.getUniformLocation(gl_program, "u_color_mode");
    if (uni_mode === null) {
      throw new Error("program does not have uniform u_color_mode");
    }
    this.uni_mode = uni_mode;
    gl2.enableVertexAttribArray(attr_pos);
    gl2.enableVertexAttribArray(attr_uv);
    const gl_vertices = gl2.createBuffer();
    if (gl_vertices === null) {
      throw new Error("unable to create webgl buffer");
    }
    this.gl_vertices = gl_vertices;
    const gl_indices = gl2.createBuffer();
    if (gl_indices === null) {
      throw new Error("unable to create webgl buffer");
    }
    this.gl_indices = gl_indices;
    const gl_texture = gl2.createTexture();
    if (gl_texture === null) {
      throw new Error("unable to create webgl texture");
    }
    this.gl_texture = gl_texture;
    gl2.bindTexture(gl2.TEXTURE_2D, gl_texture);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.NEAREST);
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.NEAREST);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, gl_vertices);
    gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, gl_indices);
    gl2.vertexAttribPointer(attr_pos, 2, gl2.FLOAT, false, 4 * 4, 0);
    gl2.vertexAttribPointer(attr_uv, 2, gl2.FLOAT, false, 4 * 4, 4 * 2);
    gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 2, 1, 0, 2, 3]), gl2.STATIC_DRAW);
    this.init_buffers(width2, height2);
  }
  gl;
  gl_vertices;
  gl_indices;
  gl_texture;
  uni_mode;
  buffer;
  bytes;
  buffer_enabled = 0;
  x = 0;
  y = 0;
  pref_display = globalThis?.document?.getElementById?.("pref-display");
  bits = 8;
  vert_src = gl_display_default2;
  frag_src = gl_display_default;
  inputs = {
    [10 /* COLOR */]: this.color_in,
    [8 /* X */]: this.x_in,
    [9 /* Y */]: this.y_in,
    [11 /* BUFFER */]: this.buffer_in
  };
  outputs = {
    [10 /* COLOR */]: this.color_out,
    [8 /* X */]: this.x_out,
    [9 /* Y */]: this.y_out,
    [11 /* BUFFER */]: this.buffer_out
  };
  reset() {
    this.x = 0;
    this.y = 0;
    this.clear();
    this.buffer_enabled = 0;
    this.update_display();
  }
  resize(width2, height2) {
    const buffer = new Uint32Array(width2 * height2);
    const mw = Math.min(this.width, width2), mh = Math.min(this.height, height2);
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const from = x + y * this.width;
        const to = x + y * width2;
        buffer[to] = this.buffer[from];
      }
    }
    this.buffer = buffer;
    this.bytes = new Uint8Array(buffer.buffer, 0, buffer.byteLength);
    this.width = width2;
    this.height = height2;
    this.init_buffers(width2, height2);
    this.update_display();
  }
  clear() {
    this.buffer.fill(0);
  }
  x_in() {
    return this.width;
  }
  y_in() {
    return this.height;
  }
  x_out(value) {
    this.x = value;
  }
  y_out(value) {
    this.y = value;
  }
  color_in() {
    if (!this.in_bounds(this.x, this.y)) {
      return 0;
    }
    return this.buffer[this.x + this.y * this.width];
  }
  color_out(color2) {
    if (!this.in_bounds(this.x, this.y)) {
      return;
    }
    this.buffer[this.x + this.y * this.width] = color2;
    if (!this.buffer_enabled) {
      this.dirty_display();
    }
  }
  buffer_in() {
    return this.buffer_enabled;
  }
  start_t = 0;
  buffer_out(value) {
    switch (value) {
      case 0:
        {
          this.update_display();
          this.clear();
          this.buffer_enabled = 0;
        }
        break;
      case 1:
        {
          this.start_t = performance.now();
          this.buffer_enabled = 1;
        }
        break;
      case 2:
        {
          this.update_display();
          if (this.pref_display) {
            const end_t = performance.now();
            const dt = end_t - this.start_t;
            this.pref_display.innerText = `frame time: ${dt.toFixed(1)}ms`;
          }
          this.start_t = performance.now();
        }
        break;
    }
  }
  init_buffers(width2, height2) {
    const { gl: gl2 } = this;
    gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([
      -1,
      -1,
      0,
      1,
      1,
      -1,
      1,
      1,
      1,
      1,
      1,
      0,
      -1,
      1,
      0,
      0
    ]), gl2.STATIC_DRAW);
    gl2.viewport(0, 0, width2, height2);
  }
  dirty_display() {
    this.update_display();
  }
  update_display() {
    let { gl: gl2, width: width2, height: height2, bytes, uni_mode, color_mode, bits } = this;
    if (color_mode === 0 /* RGB */) {
      if (this.bits >= 24) {
        color_mode = 5 /* RGB24 */;
      } else if (this.bits >= 16) {
        color_mode = 4 /* RGB16 */;
      } else {
        color_mode = 3 /* RGB8 */;
      }
    }
    gl2.uniform1ui(uni_mode, color_mode);
    gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, width2, height2, 0, gl2.RGBA, gl2.UNSIGNED_BYTE, bytes);
    gl2.drawElements(gl2.TRIANGLES, 6, gl2.UNSIGNED_SHORT, 0);
  }
  in_bounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  get width() {
    return this.gl.canvas.width;
  }
  set width(value) {
    this.gl.canvas.width = value;
  }
  get height() {
    return this.gl.canvas.height;
  }
  set height(value) {
    this.gl.canvas.height = value;
  }
};

// src/emulator/devices/keyboard.ts
var Keyboard = class {
  bits = 8;
  down = new Uint8Array(256);
  keymap = usb;
  offset = 0;
  constructor() {
    addEventListener("keydown", this.onkeydown.bind(this));
    addEventListener("keyup", this.onkeyup.bind(this));
  }
  inputs = {
    [67 /* KEY */]: () => this.down.slice(this.offset, this.offset + this.bits).reduceRight((acc, v) => (acc << 1) + v, 0)
  };
  outputs = {
    [67 /* KEY */]: (i) => this.offset = i
  };
  key(k2) {
    return this.keymap[k2];
  }
  onkeydown(e) {
    const k2 = this.key(e.code);
    if (k2 !== void 0) {
      this.down[k2] = 1;
    }
  }
  onkeyup(e) {
    const k2 = this.key(e.code);
    if (k2 !== void 0) {
      this.down[k2] = 0;
    }
  }
};
var usb = {
  KeyA: 4,
  KeyB: 5,
  KeyC: 6,
  KeyD: 7,
  KeyE: 8,
  KeyF: 9,
  KeyG: 10,
  KeyH: 11,
  KeyI: 12,
  KeyJ: 13,
  KeyK: 14,
  KeyL: 15,
  KeyM: 16,
  KeyN: 17,
  KeyO: 18,
  KeyP: 19,
  KeyQ: 20,
  KeyR: 21,
  KeyS: 22,
  KeyT: 23,
  KeyU: 24,
  KeyV: 25,
  KeyW: 26,
  KeyX: 27,
  KeyY: 28,
  KeyZ: 29,
  Digit1: 30,
  Digit2: 31,
  Digit3: 32,
  Digit4: 33,
  Digit5: 34,
  Digit6: 35,
  Digit7: 36,
  Digit8: 37,
  Digit9: 38,
  Digit0: 39,
  Enter: 40,
  Escape: 41,
  Backspace: 42,
  Tab: 43,
  Space: 44,
  Minus: 45,
  Equal: 46,
  BracketLeft: 47,
  BracketRight: 48,
  Backslash: 49,
  Semicolon: 51,
  Quote: 52,
  Backquote: 53,
  Comma: 54,
  Period: 55,
  Slash: 56,
  CapsLock: 57,
  F1: 58,
  F2: 59,
  F3: 60,
  F4: 61,
  F5: 62,
  F6: 63,
  F7: 64,
  F8: 65,
  F9: 66,
  F10: 67,
  F11: 68,
  F12: 69,
  PrintScreen: 70,
  ScrollLock: 71,
  Pause: 72,
  Insert: 73,
  Home: 74,
  PageUp: 75,
  Delete: 76,
  End: 77,
  PageDown: 78,
  ArrowRight: 79,
  ArrowLeft: 80,
  ArrowDown: 81,
  ArrowUp: 82,
  NumLock: 83,
  NumpadDivide: 84,
  NumpadMultiply: 85,
  NumpadSubtract: 86,
  NumpadAdd: 87,
  NumpadEnter: 88,
  Numpad1: 89,
  Numpad2: 90,
  Numpad3: 91,
  Numpad4: 92,
  Numpad5: 93,
  Numpad6: 94,
  Numpad7: 95,
  Numpad8: 96,
  Numpad9: 97,
  Numpad0: 98,
  NumpadDecimal: 99,
  IntlBackslash: 100,
  Power: 102,
  NumpadEqual: 103,
  F13: 104,
  F14: 105,
  F15: 106,
  F16: 107,
  F17: 108,
  F18: 109,
  F19: 110,
  F20: 111,
  F21: 112,
  F22: 113,
  F23: 114,
  F24: 115,
  Help: 117,
  ContextMenu: 118,
  Props: 118,
  Select: 119,
  BrowserStop: 120,
  MediaStop: 120,
  Again: 121,
  Undo: 122,
  Copy: 124,
  Paste: 125,
  Find: 126,
  AudioVolumeMute: 127,
  VolumeMute: 127,
  AudioVolumeUp: 128,
  AudioVolumeDown: 129,
  NumpadComma: 133,
  IntlRo: 135,
  IntlYen: 132,
  Lang1: 144,
  HangulMode: 144,
  Lang2: 145,
  Hanja: 145,
  Lang3: 146,
  Lang4: 147,
  Cancel: 155,
  NumpadParenLeft: 182,
  NumpadParenRight: 183,
  ControlLeft: 224,
  ShiftLeft: 225,
  AltLeft: 226,
  OSLeft: 227,
  MetaLeft: 227,
  ControlRight: 228,
  ShiftRight: 229,
  AltRight: 230,
  OSRight: 231,
  MetaRight: 231
};

// src/emulator/devices/keyboardpad.ts
var { A, B, SELECT, START, LEFT, RIGHT, UP, DOWN } = Gamepad_Key;
function k(key, pad = 0) {
  return { key, pad };
}
var KeyboardPad = class {
  keymap;
  buttons = 0;
  constructor(options = {}) {
    this.keymap = options.keymap ?? {
      keyk: k(A),
      keyj: k(B),
      keyn: k(START),
      keyv: k(SELECT),
      keya: k(LEFT),
      keyd: k(RIGHT),
      keyw: k(UP),
      keys: k(DOWN)
    };
    addEventListener("keydown", this.onkeydown);
    addEventListener("keyup", this.onkeyup);
  }
  info(index) {
    if (index == 0) {
      return 1;
    } else {
      return 0;
    }
  }
  axis;
  cleanup() {
    removeEventListener("keydown", this.onkeydown);
    removeEventListener("keyup", this.onkeyup);
  }
  key(e) {
    return this.keymap[e.code.toLowerCase()];
  }
  onkeydown = (e) => {
    const k2 = this.key(e);
    if (k2 !== void 0) {
      this.buttons |= 1 << k2.key;
    }
  };
  onkeyup = (e) => {
    const k2 = this.key(e);
    if (k2 !== void 0) {
      this.buttons &= ~(1 << k2.key);
    }
  };
};

// src/emulator/devices/mouse.ts
var Mouse = class {
  constructor(canvas2) {
    this.canvas = canvas2;
    addEventListener("mousemove", this.onmove);
    addEventListener("mousedown", this.ondown);
    addEventListener("mouseup", this.onup);
    addEventListener("contextmenu", this.oncontext);
  }
  translate(mousex, mousey) {
    const { x, y, width: width2, height: height2 } = this.canvas.getBoundingClientRect();
    return [
      (mousex - x) * this.canvas.width / width2,
      (mousey - y) * this.canvas.height / height2
    ];
  }
  x = 0;
  y = 0;
  lastx = 0;
  lasty = 0;
  buttons = 0;
  oncontext = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();
    }
  };
  onup = (e) => {
    this.buttons = e.buttons;
    if (e.target === this.canvas) {
      e.preventDefault();
    }
  };
  ondown = this.onup;
  onmove = (e) => {
    if (document.pointerLockElement === null) {
      [this.x, this.y] = this.translate(e.clientX, e.clientY);
    } else {
      const { width: width2, height: height2 } = this.canvas.getBoundingClientRect();
      this.x += e.movementX * this.canvas.width / width2;
      this.y += e.movementY * this.canvas.height / height2;
    }
  };
  cleanup() {
    removeEventListener("mousemove", this.onmove);
    removeEventListener("mouseup", this.onup);
    removeEventListener("mousedown", this.ondown);
    removeEventListener("contextmenu", this.oncontext);
  }
  inputs = {
    [68 /* MOUSE_X */]: () => this.x,
    [69 /* MOUSE_Y */]: () => this.y,
    [70 /* MOUSE_DX */]: () => {
      const dx = 0 | this.x - this.lastx;
      this.lastx += dx;
      return dx;
    },
    [71 /* MOUSE_DY */]: () => {
      const dy = 0 | this.y - this.lasty;
      this.lasty += dy;
      return dy;
    },
    [73 /* MOUSE_BUTTONS */]: () => this.buttons
  };
  outputs = {};
};

// src/emulator/devices/rng.ts
var RNG = class {
  constructor(bits = 8) {
    this.bits = bits;
  }
  inputs = {
    [40 /* RNG */]: () => 0 | Math.random() * (4294967295 >>> 32 - this.bits)
  };
};

// src/emulator/devices/sound.ts
var base_frequency = 92.499;
var ramp_up = 5e-3;
var ramp_down = 0.01;
var NoteBlock = class {
  constructor(ctx) {
    this.ctx = ctx;
    this.oscillator = this.ctx.createOscillator();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.ctx.destination);
    this.oscillator.connect(this.gain);
    this.oscillator.type = "square";
    this.oscillator.start();
  }
  oscillator;
  gain;
  play(note, length, cb) {
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.oscillator.frequency.value = base_frequency * 2 ** (note / 12);
    this.gain.gain.setTargetAtTime(0.1, this.ctx.currentTime, ramp_up);
    this.gain.gain.setTargetAtTime(0, this.ctx.currentTime + length * 1e-3, ramp_down);
    setTimeout(() => {
      cb();
    }, length * 0.1 + ramp_down);
  }
};
var Sound = class {
  ctx = new AudioContext();
  blocks = [];
  note = 0;
  play(note, length) {
    console.log(this.blocks.length, note, length);
    let block = this.blocks.pop();
    if (!block) {
      block = new NoteBlock(this.ctx);
    }
    block.play(note, length, () => this.blocks.push(block));
  }
  constructor() {
  }
  outputs = {
    [41 /* NOTE */]: (v) => {
      this.note = v;
    },
    [43 /* NLEG */]: (v) => {
      this.play(this.note, v);
    }
  };
};

// src/emulator/devices/storage.ts
var Storage = class {
  constructor(bits, little_endian, size) {
    this.bits = bits;
    this.little_endian = little_endian;
    this.size = size;
  }
  set_bytes(data) {
    const { bits, size, little_endian } = this;
    switch (bits) {
      case 8:
        {
          this.address_mask = 255;
          this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          if (size > this.data.length) {
            const old = this.data;
            this.data = new Uint8Array(size);
            this.data.set(old);
          }
        }
        break;
      case 16:
        {
          this.address_mask = 65535;
          this.data = read16(data, little_endian, size);
        }
        break;
      case 32:
        {
          this.address_mask = 4294967295;
          this.data = read32(data, little_endian, size);
        }
        break;
      default:
        throw new Error(`${bits} is not a supported word length for a Storage device`);
    }
  }
  get_bytes() {
    if (this.data instanceof Uint8Array) {
      return new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
    } else if (this.data instanceof Uint16Array) {
      return write16(this.data, this.little_endian);
    } else if (this.data instanceof Uint32Array) {
      return write32(this.data, this.little_endian);
    } else {
      throw new Error(`${this.bits} is not a supported word length for a Storage device`);
    }
  }
  inputs = {
    [32 /* ADDR */]: this.address_in,
    [34 /* PAGE */]: this.page_in,
    [33 /* BUS */]: this.bus_in
  };
  outputs = {
    [32 /* ADDR */]: this.address_out,
    [34 /* PAGE */]: this.page_out,
    [33 /* BUS */]: this.bus_out
  };
  data;
  address_mask;
  address = 0;
  address_out(v) {
    this.address = this.address & ~this.address_mask | v;
  }
  address_in() {
    return Math.min(2 ** this.bits, this.data.length - (this.address & ~this.address_mask));
  }
  page_out(v) {
    this.address = this.address & this.address_mask | v << this.bits;
  }
  page_in() {
    return Math.ceil(this.data.length / 2 ** this.bits);
  }
  bus_out(v) {
    if (this.address > this.data.length) {
      throw Error(`Storage address out of bounds ${this.address} > ${this.data.length}`);
    }
    this.data[this.address] = v;
  }
  bus_in() {
    if (this.address > this.data.length) {
      throw Error(`Storage address out of bounds ${this.address} > ${this.data.length}`);
    }
    return this.data[this.address];
  }
  reset() {
  }
};

// src/emulator/breaks.ts
var Break = /* @__PURE__ */ ((Break2) => {
  Break2[Break2["ONREAD"] = 1] = "ONREAD";
  Break2[Break2["ONWRITE"] = 2] = "ONWRITE";
  return Break2;
})(Break || {});
function break_flag(flags) {
  return flags.reduce((a, b) => a | b, 0);
}

// src/emulator/emulator.ts
var Emulator = class {
  constructor(options) {
    this.options = options;
  }
  signed(v) {
    if (this.bits === 32) {
      return 0 | v;
    }
    return (v & this.sign_bit) === 0 ? v : v | 4294967295 << this.bits;
  }
  a = 0;
  b = 0;
  c = 0;
  get sa() {
    return this.signed(this.a);
  }
  set sa(v) {
    this.a = v;
  }
  get sb() {
    return this.signed(this.b);
  }
  set sb(v) {
    this.b = v;
  }
  get sc() {
    return this.signed(this.c);
  }
  set sc(v) {
    this.c = v;
  }
  program;
  debug_info;
  _debug_message = void 0;
  get_debug_message() {
    const msg = this._debug_message;
    this._debug_message = void 0;
    return msg;
  }
  heap_size = 0;
  do_debug_memory = false;
  do_debug_registers = false;
  do_debug_ports = false;
  do_debug_program = false;
  load_program(program, debug_info) {
    this._debug_message = void 0;
    this.program = program, this.debug_info = debug_info;
    this.pc_counters = Array.from({ length: program.opcodes.length }, () => 0);
    const bits = program.headers[0 /* BITS */].value;
    const static_data = program.data;
    const heap = program.headers[2 /* MINHEAP */].value;
    const stack = program.headers[4 /* MINSTACK */].value;
    const registers = program.headers[1 /* MINREG */].value + register_count;
    const run = program.headers[3 /* RUN */].value;
    this.heap_size = heap;
    this.debug_reached = false;
    this.pc = 0;
    this.do_debug_memory = Object.keys(debug_info.memory_breaks).length > 0;
    this.do_debug_registers = Object.keys(debug_info.register_breaks).length > 0;
    this.do_debug_ports = Object.keys(debug_info.port_breaks).length > 0;
    this.do_debug_program = Object.keys(debug_info.program_breaks).length > 0;
    if (run === 1 /* RAM */) {
      throw new Error("emulator currently doesn't support running in ram");
    }
    let WordArray;
    if (bits <= 8) {
      WordArray = Uint8Array;
      this.bits = 8;
    } else if (bits <= 16) {
      WordArray = Uint16Array;
      this.bits = 16;
    } else if (bits <= 32) {
      WordArray = Uint32Array;
      this.bits = 32;
    } else {
      throw new Error(`BITS = ${bits} exceeds 32 bits`);
    }
    if (registers > this.max_size) {
      throw new Error(`Too many registers ${registers}, must be <= ${this.max_size}`);
    }
    const memory_size = heap + stack + static_data.length;
    if (memory_size > this.max_size) {
      throw new Error(`Too much memory heap:${heap} + stack:${stack} + dws:${static_data.length} = ${memory_size}, must be <= ${this.max_size}`);
    }
    const buffer_size = (memory_size + registers) * WordArray.BYTES_PER_ELEMENT;
    if (this.buffer.byteLength < buffer_size) {
      this.warn(`resizing Arraybuffer to ${buffer_size} bytes`);
      const max_size2 = this.options.max_memory?.();
      if (max_size2 && buffer_size > max_size2) {
        throw new Error(`Unable to allocate memory for the emulator because	
${buffer_size} bytes exceeds the maximum of ${max_size2}bytes`);
      }
      try {
        this.buffer = new ArrayBuffer(buffer_size);
      } catch (e) {
        throw new Error(`Unable to allocate enough memory for the emulator because:
	${e}`);
      }
    }
    this.registers = new WordArray(this.buffer, 0, registers).fill(0);
    this.memory = new WordArray(this.buffer, registers * WordArray.BYTES_PER_ELEMENT, memory_size).fill(0);
    for (let i = 0; i < static_data.length; i++) {
      this.memory[i] = static_data[i];
    }
    this.reset();
    for (const device of this.devices) {
      device.bits = bits;
    }
  }
  reset() {
    this.stack_ptr = this.memory.length;
    this.pc = 0;
    this.ins = [];
    this.outs = [];
    for (const reset of this.device_resets) {
      reset();
    }
  }
  shrink_buffer() {
    this.buffer = new ArrayBuffer(1024 * 1024);
  }
  buffer = new ArrayBuffer(1024 * 1024);
  registers = new Uint8Array(32);
  memory = new Uint8Array(256);
  pc_counters = [];
  pc_full = 0;
  get pc() {
    return this.pc_full;
  }
  set pc(value) {
    this.registers[0 /* PC */] = value;
    this.pc_full = value;
  }
  get stack_ptr() {
    return this.registers[1 /* SP */];
  }
  set stack_ptr(value) {
    this.registers[1 /* SP */] = value;
  }
  bits = 8;
  device_inputs = {};
  device_outputs = {};
  device_resets = [];
  devices = [];
  add_io_device(device) {
    this.devices.push(device);
    if (device.inputs) {
      for (const port in device.inputs) {
        const input2 = device.inputs[port];
        this.device_inputs[port] = input2.bind(device);
      }
    }
    if (device.outputs) {
      for (const port in device.outputs) {
        const output = device.outputs[port];
        this.device_outputs[port] = output.bind(device);
      }
    }
    if (device.reset) {
      this.device_resets.push(device.reset.bind(device));
    }
  }
  get max_value() {
    return 4294967295 >>> 32 - this.bits;
  }
  get max_size() {
    return this.max_value + 1;
  }
  get max_signed() {
    return (1 << this.bits - 1) - 1;
  }
  get sign_bit() {
    return 1 << this.bits - 1;
  }
  push(value) {
    if (this.stack_ptr !== 0 && this.stack_ptr <= this.heap_size) {
      this.error(`Stack overflow: ${this.stack_ptr} <= ${this.heap_size}}`);
    }
    this.write_reg(1 /* SP */, this.stack_ptr - 1);
    this.memory[this.stack_ptr] = value;
  }
  pop() {
    if (this.stack_ptr >= this.memory.length) {
      this.error(`Stack underflow: ${this.stack_ptr} >= ${this.memory.length}`);
    }
    const value = this.memory[this.stack_ptr];
    this.write_reg(1 /* SP */, this.stack_ptr + 1);
    return value;
  }
  ins = [];
  outs = [];
  in(port) {
    try {
      const device = this.device_inputs[port];
      if (device === void 0) {
        if (port === 5 /* SUPPORTED */) {
          this.a = this.device_inputs[this.supported] || this.device_outputs[this.supported] || this.supported === 5 /* SUPPORTED */ ? 1 : 0;
          return false;
        }
        if (this.ins[port] === void 0) {
          this.warn(`unsupported input device port ${port} (${IO_Port[port]})`);
        }
        this.ins[port] = 1;
        return false;
      }
      if (this.do_debug_ports && this.debug_info.port_breaks[port] & 1 /* ONREAD */) {
        this.debug(`Reading from Port ${port} (${IO_Port[port]})`);
      }
      const res = device(this.finish_step_in.bind(this, port));
      if (res === void 0) {
        if (this.do_debug_ports && this.debug_info.port_breaks[port] & 1 /* ONREAD */) {
          this.debug(`Read from port ${port} (${IO_Port[port]})`);
        }
        this.pc--;
        return true;
      } else {
        this.a = res;
        if (this.do_debug_ports && this.debug_info.port_breaks[port] & 1 /* ONREAD */) {
          this.debug(`Read from port ${port} (${IO_Port[port]}) value=0x${res.toString(16)}`);
        }
        return false;
      }
    } catch (e) {
      this.error("" + e);
    }
  }
  supported = 0;
  out(port, value) {
    try {
      const device = this.device_outputs[port];
      if (device === void 0) {
        if (port === 5 /* SUPPORTED */) {
          this.supported = value;
          return;
        }
        if (this.outs[port] === void 0) {
          this.warn(`unsupported output device port ${port} (${IO_Port[port]}) value=0x${value.toString(16)}`);
          this.outs[port] = value;
        }
        return;
      }
      if (this.do_debug_ports && this.debug_info.port_breaks[port] & 2 /* ONWRITE */) {
        let char_str = "";
        try {
          const char = JSON.stringify(String.fromCodePoint(value));
          char_str = `'${char.substring(1, char.length - 1)}'`;
        } catch {
        }
        this.debug(`Written to port ${port} (${IO_Port[port]}) value=0x${value.toString(16)} ${char_str}`);
      }
      device(value);
    } catch (e) {
      this.error("" + e);
    }
  }
  burst(length, max_duration) {
    const start_length = length;
    const burst_length = 1024;
    const end = performance.now() + max_duration;
    for (; length >= burst_length; length -= burst_length) {
      for (let i = 0; i < burst_length; i++) {
        const res = this.step();
        if (res !== 0 /* Continue */) {
          return [res, start_length - length + i + 1];
        }
      }
      if (performance.now() > end) {
        return [0 /* Continue */, start_length - length + burst_length];
      }
    }
    for (let i = 0; i < length; i++) {
      const res = this.step();
      if (res !== 0 /* Continue */) {
        return [res, start_length - length + i + 1];
      }
    }
    return [0 /* Continue */, start_length];
  }
  run(max_duration) {
    const burst_length = 1024;
    const end = performance.now() + max_duration;
    let j = 0;
    do {
      for (let i = 0; i < burst_length; i++) {
        const res = this.step();
        if (res !== 0 /* Continue */) {
          return [res, j + i + 1];
        }
      }
      j += burst_length;
    } while (performance.now() < end);
    return [0 /* Continue */, j];
  }
  debug_reached = false;
  step() {
    const pc = this.pc++;
    if (this.do_debug_program && this.debug_info.program_breaks[pc] && !this.debug_reached) {
      this.debug_reached = true;
      this.debug(`Reached @DEBUG Before:`);
      this.pc--;
      return 3 /* Debug */;
    }
    this.debug_reached = false;
    if (pc >= this.program.opcodes.length) {
      return 1 /* Halt */;
    }
    this.pc_counters[pc]++;
    const opcode = this.program.opcodes[pc];
    if (opcode === 36 /* HLT */) {
      this.pc--;
      return 1 /* Halt */;
    }
    const [[op], func] = Opcodes_operants[opcode];
    if (func === void 0) {
      this.error(`unkown opcode ${opcode}`);
    }
    const op_types = this.program.operant_prims[pc];
    const op_values = this.program.operant_values[pc];
    const length = op_values.length;
    if (length >= 1 && op !== 0 /* SET */)
      this.a = this.read(op_types[0], op_values[0]);
    if (length >= 2)
      this.b = this.read(op_types[1], op_values[1]);
    if (length >= 3)
      this.c = this.read(op_types[2], op_values[2]);
    if (func(this)) {
      return 2 /* Input */;
    }
    if (length >= 1 && op === 0 /* SET */)
      this.write(op_types[0], op_values[0], this.a);
    if (this._debug_message !== void 0) {
      return 3 /* Debug */;
    }
    return 0 /* Continue */;
  }
  m_set(addr, value) {
    if (addr >= this.memory.length) {
      this.error(`Heap overflow on store: 0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
    }
    if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & 2 /* ONWRITE */) {
      this.debug(`Written memory[0x${addr.toString(16)}] which was 0x${this.memory[addr].toString(16)} to 0x${value.toString(16)}`);
    }
    this.memory[addr] = value;
  }
  m_get(addr) {
    if (addr >= this.memory.length) {
      this.error(`Heap overflow on load: #0x${addr.toString(16)} >= 0x${this.memory.length.toString(16)}`);
    }
    if (this.do_debug_memory && this.debug_info.memory_breaks[addr] & 1 /* ONREAD */) {
      this.debug(`Read memory[0x${addr.toString(16)}] = 0x${this.memory[addr].toString(16)}`);
    }
    return this.memory[addr];
  }
  finish_step_in(port, result) {
    const pc = this.pc++;
    const type = this.program.operant_prims[pc][0];
    const value = this.program.operant_values[pc][0];
    this.write(type, value, result);
    this.options.on_continue?.();
  }
  write(target, index, value) {
    switch (target) {
      case 0 /* Reg */:
        {
          this.write_reg(index, value);
        }
        return;
      case 1 /* Imm */:
        return;
      default:
        this.error(`Unknown operant target ${target}`);
    }
  }
  write_reg(index, value) {
    if (this.do_debug_registers && this.debug_info.register_breaks[index] & 2 /* ONWRITE */) {
      const old = this.registers[index];
      this.registers[index] = value;
      const register_name = Register[index] ?? `r${index - register_count + 1}`;
      this.debug(`Written ${register_name} which was ${old} to 0x${this.registers[index].toString(16)}`);
    }
    this.registers[index] = value;
  }
  read(source, index) {
    switch (source) {
      case 1 /* Imm */:
        return index;
      case 0 /* Reg */: {
        return this.read_reg(index);
      }
      default:
        this.error(`Unknown operant source ${source}`);
    }
  }
  read_reg(index) {
    if (this.do_debug_registers && this.debug_info.register_breaks[index] & 1 /* ONREAD */) {
      this.debug(`Read r${index - register_count + 1} = 0x${this.registers[index].toString(16)}`);
    }
    return this.registers[index];
  }
  error(msg) {
    const { pc_line_nrs, lines, file_name } = this.debug_info;
    const line_nr = pc_line_nrs[this.pc - 1];
    const trace = this.decode_memory(this.stack_ptr, this.memory.length, false);
    const content = `${file_name ?? "eval"}:${line_nr + 1} - ERROR - ${msg}
    ${lines[line_nr]}

${indent(registers_to_string(this), 1)}

stack trace:
${trace}`;
    if (this.options.error) {
      this.options.error(content);
    }
    throw Error(content);
  }
  get_line_nr(pc = this.pc) {
    return this.debug_info.pc_line_nrs[pc - 1] || -2;
  }
  get_line(pc = this.pc) {
    const line = this.debug_info.lines[this.get_line_nr(pc)];
    if (line == void 0) {
      return "";
    }
    return `
	${line}`;
  }
  format_message(msg, pc = this.pc) {
    const { lines, file_name } = this.debug_info;
    const line_nr = this.get_line_nr(pc);
    return `${file_name ?? "eval"}:${line_nr + 1} - ${msg}
	${lines[line_nr] ?? ""}`;
  }
  warn(msg) {
    const content = this.format_message(`warning - ${msg}`);
    if (this.options.warn) {
      this.options.warn(content);
    } else {
      console.warn(content);
    }
  }
  debug(msg) {
    this._debug_message = (this._debug_message ?? "") + this.format_message(`debug - ${msg}`) + "\n";
  }
  decode_memory(start, end, reverse) {
    const w = 8;
    const headers = ["hexaddr", "hexval", "value", "*value", "linenr", "*opcode"];
    let str = headers.map((v) => pad_center(v, w)).join("|");
    let view = this.memory.slice(start, end);
    if (reverse) {
      view = view.reverse();
    }
    for (const [i, v] of view.entries()) {
      const j = reverse ? end - i : start + i;
      const index = hex(j, w, " ");
      const h = hex(v, w, " ");
      const value = pad_left("" + v, w);
      const opcode = pad_left(Opcode[this.program.opcodes[v]] ?? ".", w);
      const linenr = pad_left("" + (this.debug_info.pc_line_nrs[v] ?? "."), w);
      const mem = pad_left("" + (this.memory[v] ?? "."), w);
      str += `
${index}|${h}|${value}|${mem}|${linenr}|${opcode}`;
    }
    return str;
  }
};

// src/emulator/parser.ts
function try_parse_int(x) {
  const int = my_parse_int(x);
  return Number.isInteger(int) ? int : void 0;
}
function my_parse_int(x) {
  x = x.replace(/\_/g, "");
  if (x.startsWith("0b")) {
    return parseInt(x.slice(2), 2);
  }
  return parseInt(x);
}
function my_parse_float(x) {
  x = x.replace(/\_/g, "");
  const float = parseFloat(x);
  if (isNaN(float)) {
    return void 0;
  }
  return float;
}
function my_parse_f32(x) {
  x = x.replace(/\_/g, "");
  const float = parseFloat(x);
  if (isNaN(float)) {
    return void 0;
  }
  return f32_encode(float);
}
var Parser_output = class {
  errors = [];
  warnings = [];
  data = [];
  lines = [];
  headers = {};
  constants = {};
  labels = {};
  instr_line_nrs = [];
  opcodes = [];
  operant_strings = [];
  operant_types = [];
  operant_values = [];
  register_breaks = {};
  data_breaks = {};
  heap_breaks = {};
  program_breaks = {};
  port_breaks = {};
};
function parse(source, options = {}) {
  const out = new Parser_output();
  Object.assign(out.constants, options.constants ?? {});
  out.lines = source.split("\n").map((line) => line.replace(/,/g, "").replace(/\s+/g, " ").replace(/\/\/.*/g, "").trim());
  for (let i = 0; i < enum_count(URCL_Header); i++) {
    out.headers[i] = { value: urcl_headers[i].def };
    out.headers[i].operant = urcl_headers[i].def_operant;
  }
  let label;
  let last_label;
  let labeled = 0 /* None */;
  const inst_is = [];
  for (let line_nr = 0, inst_i = 0; line_nr < out.lines.length; line_nr++) {
    inst_is.push(inst_i);
    const line = out.lines[line_nr];
    if (line === "") {
      continue;
    }
    ;
    last_label = label;
    if (label = parse_label(line, line_nr, inst_i, out, out.warnings)) {
      continue;
    }
    if (parse_header(line, line_nr, out.headers, out.warnings)) {
      continue;
    }
    if (split_instruction(line, line_nr, inst_i, out, out.errors)) {
      if (last_label && labeled === 2 /* DW */) {
      }
      labeled = 1 /* INST */;
      inst_i++;
      continue;
    }
    if (line.startsWith("@")) {
      const [macro, ...parts] = line.split(" ");
      if (macro.toLowerCase() === "@define") {
        if (parts.length < 2) {
          out.warnings.push(warn(line_nr, `Expected 2 arguments for @define macro, got [${parts}]`));
          continue;
        }
        const [name, value] = parts;
        if (out.constants[name.toUpperCase()] !== void 0) {
          out.warnings.push(warn(line_nr, `Redefinition of macro ${name}`));
        }
        out.constants[name.toUpperCase()] = value;
        continue;
      }
      if (macro.toLowerCase() === "@debug") {
        continue;
      }
      out.warnings.push(warn(line_nr, `Unknown marco ${macro}`));
      continue;
    }
    if (line.toUpperCase().startsWith("DW")) {
      let [_, ...value_strs] = line.split(" ");
      if (value_strs.length > 1) {
        if (value_strs[0][0] !== "[" || value_strs.at(-1)?.at(-1) !== "]") {
          out.warnings.push(warn(line_nr, `Omitting square brackets around a value list is not standard`));
        }
        value_strs[0] = value_strs[0].replace("[", "").trim();
        if (value_strs[0].length === 0) {
          value_strs.shift();
        }
        value_strs[value_strs.length - 1] = value_strs.at(-1)?.replaceAll("]", "").trim() ?? "";
        if (value_strs.at(-1)?.length === 0) {
          value_strs.pop();
        }
      }
      if (last_label) {
        if (labeled === 1 /* INST */) {
        }
        last_label.type = 1 /* DW */;
        last_label.index = out.data.length;
      }
      labeled = 2 /* DW */;
      let i = 0;
      while (i < value_strs.length) {
        const res = parse_operant(() => value_strs[i++], line_nr, -1, out.labels, out.constants, out.data, [], []);
        if (res?.[0] !== 6 /* String */) {
          out.data.push(res ? res[1] : -1);
        }
      }
      continue;
    }
    out.errors.push(warn(line_nr, `Unknown identifier ${line.split(" ")[0]}`));
  }
  out.data.length = 0;
  for (let inst_i = 0; inst_i < out.opcodes.length; inst_i++) {
    parse_instructions(out.instr_line_nrs[inst_i], inst_i, out, out.errors, out.warnings);
  }
  for (let line_nr = 0; line_nr < out.lines.length; line_nr++) {
    const line = out.lines[line_nr];
    const [start, ...parts] = line.split(" ");
    if (start.toUpperCase() === "DW") {
      if (parts.length > 1) {
        parts[0] = parts[0].replace("[", "").trim();
        if (parts[0].length === 0) {
          parts.shift();
        }
        parts[parts.length - 1] = parts.at(-1)?.replaceAll("]", "").trim() ?? "";
        if (parts.at(-1)?.length === 0) {
          parts.pop();
        }
      }
      let i = 0;
      while (i < parts.length) {
        const res = parse_operant(() => parts[i++], line_nr, -1, out.labels, out.constants, out.data, out.errors, out.warnings);
        if (res?.[0] !== 6 /* String */) {
          out.data.push(res ? res[1] : -1);
        }
      }
    }
    if (start.toUpperCase() === "@DEBUG") {
      const inst_i = inst_is[line_nr];
      const flag_arr = [];
      const targets = [];
      for (const part of parts) {
        const flag = enum_from_str(Break, part);
        if (flag !== void 0) {
          flag_arr.push(flag);
        } else {
          targets.push(part);
        }
      }
      if (targets.length == 0) {
        flag_arr.push(1 /* ONREAD */);
        out.program_breaks[inst_i] = break_flag(flag_arr);
        continue;
      }
      if (flag_arr.length == 0) {
        flag_arr.push(1 /* ONREAD */, 2 /* ONWRITE */);
      }
      const flags = break_flag(flag_arr);
      for (let i = 0; i < targets.length; i++) {
        const target = resolve_macro(targets[i], out.constants, line_nr, out.errors);
        if (target == void 0) {
          continue;
        }
        switch (target[0]) {
          case "r":
          case "R":
          case "$":
            {
              const n = try_parse_int(target.slice(1));
              if (n === void 0) {
                out.errors.push(warn(line_nr, `${target} is not a valid register`));
                continue;
              }
              out.register_breaks[my_parse_int(target.slice(1)) + register_count - 1] = flags;
            }
            break;
          case "m":
          case "M":
          case "#":
            {
              const [base_str, add_str] = target.slice(1).split("+");
              let index = try_parse_int(base_str);
              if (index === void 0) {
                out.errors.push(warn(line_nr, `${base_str} is not a valid integer`));
                continue;
              }
              if (add_str) {
                const add = try_parse_int(add_str);
                if (add === void 0) {
                  out.errors.push(warn(line_nr, `${add_str} is not a valid integer`));
                  continue;
                }
                index += add;
              }
              out.heap_breaks[index] = flags;
            }
            break;
          case ".":
            {
              const [label_str, add_str] = target.split("+");
              const label2 = out.labels[label_str];
              if (label2 === void 0) {
                out.errors.push(warn(line_nr, `Undefined label ${label_str}`));
                continue;
              }
              let index = label2.index;
              if (add_str) {
                const add = try_parse_int(add_str);
                if (add === void 0) {
                  out.errors.push(warn(line_nr, `${add_str} is not a valid integer`));
                  continue;
                }
                index += add;
              }
              if (label2.type === 1 /* DW */) {
                out.data_breaks[index] = flags;
              } else {
                out.program_breaks[index] = flags;
              }
            }
            break;
          case "%":
            {
              const port = resolve_port(target, line_nr, out.errors);
              if (port === void 0) {
                continue;
              }
              out.port_breaks[port] = flags;
            }
            break;
          default:
            {
              if (target.toUpperCase() === "PC") {
                out.register_breaks[0 /* PC */] = flags;
                continue;
              }
              if (target.toUpperCase() === "SP") {
                out.register_breaks[1 /* SP */] = flags;
                continue;
              }
              out.warnings.push(warn(line_nr, `Unknown debug target/flag, expected register, heap location or label or one of [${enum_strings(Break)}]`));
            }
            break;
        }
      }
    }
  }
  return out;
}
function parse_header(line, line_nr, headers, errors) {
  const [header_str, opOrVal_str, val_str] = line.split(" ");
  if (header_str === void 0) {
    return false;
  }
  const header = enum_from_str(URCL_Header, header_str.toUpperCase());
  if (header === void 0) {
    return false;
  }
  const header_def = urcl_headers[header];
  if (header_def.def_operant !== void 0 && val_str) {
    if (opOrVal_str === void 0) {
      errors.push(warn(line_nr, `Missing operant for header ${header_str}, must be ${enum_strings(Header_Operant)}`));
    }
    const operant = enum_from_str(Header_Operant, opOrVal_str || "");
    if (operant === void 0 && opOrVal_str !== void 0) {
      errors.push(warn(line_nr, `Unknown operant ${opOrVal_str} for header ${header_str}, must be ${enum_strings(Header_Operant)}`));
    }
    const value = check_value(val_str);
    if (operant !== void 0 && value !== void 0) {
      headers[header] = { line_nr, operant, value };
    }
  } else {
    let value = check_value(opOrVal_str);
    if (value !== void 0) {
      headers[header] = { line_nr, value };
    }
  }
  return true;
  function check_value(value) {
    if (value === void 0) {
      errors.push(warn(line_nr, `Missing value for header ${header_str}`));
      return void 0;
    }
    if (header_def.in) {
      const num = enum_from_str(header_def.in, value.toUpperCase());
      if (num === void 0) {
        errors.push(warn(line_nr, `Value ${value} for header ${header_str} most be one of: ${enum_strings(header_def.in)}`));
        return void 0;
      }
      return num;
    } else {
      const num = my_parse_int(value);
      if (!Number.isInteger(num)) {
        errors.push(warn(line_nr, `Value ${value} for header ${header_str} must be an integer`));
        return void 0;
      }
      return num;
    }
  }
}
function parse_label(line, line_nr, inst_i, out, warnings) {
  if (!line.startsWith(".")) {
    return void 0;
  }
  ;
  const name = str_until(str_until(line, " ").slice(0), "//");
  if (name === ".") {
    warnings.push(warn(line_nr, `Empty label`));
  }
  if (out.labels[name] !== void 0) {
    warnings.push(warn(line_nr, `Duplicate label ${name}`));
  }
  const label = { type: 0 /* Inst */, index: inst_i };
  out.labels[name] = label;
  return label;
}
function split_instruction(line, line_nr, inst_i, out, errors) {
  const [opcode_str, ...ops] = line.replace(/' /g, "'\xA0").replace(/,/g, "").split(" ");
  const opcode = enum_from_str(Opcode, opcode_str.toUpperCase().replace("@", "__"));
  if (opcode === void 0) {
    return false;
  }
  const operant_count = Opcodes_operant_lengths[opcode];
  if (ops.length != operant_count) {
    errors.push(warn(line_nr, `Expected ${operant_count} operants but got [${ops}] for opcode ${opcode_str}`));
  }
  out.opcodes[inst_i] = opcode;
  out.operant_strings[inst_i] = ops;
  out.instr_line_nrs[inst_i] = line_nr;
  return true;
}
function parse_instructions(line_nr, inst_i, out, errors, warnings) {
  const types = out.operant_types[inst_i] = [];
  const values = out.operant_values[inst_i] = [];
  let i = 0;
  const strings = out.operant_strings[inst_i];
  while (i < strings.length) {
    const [type, value] = parse_operant(() => strings[i++], line_nr, inst_i, out.labels, out.constants, out.data, errors, warnings) ?? [];
    if (type === 6 /* String */) {
      errors.push(warn(line_nr, "Strings are not allowed in instructions"));
    } else if (type !== void 0) {
      types.push(type);
      values.push(value);
    }
  }
  return 0;
}
function resolve_macro(operant, macro_constants, line_nr, errors) {
  for (let i = 0; i < 10; i++) {
    const macro = macro_constants[operant.toUpperCase()];
    if (macro !== void 0) {
      operant = macro;
    } else {
      break;
    }
    if (i >= 9) {
      errors.push(warn(line_nr, `Recursive macro (${operant} -> ${macro})`));
      return void 0;
    }
  }
  return operant;
}
function resolve_port(operant, line_nr, errors) {
  let port;
  if (is_digit(operant, 1)) {
    port = try_parse_int(operant.slice(1));
    if (port === void 0) {
      errors.push(warn(line_nr, `Invalid port number ${operant}`));
      return void 0;
    }
  } else {
    port = enum_from_str(IO_Port, operant.slice(1).toUpperCase());
    if (port === void 0) {
      errors.push(warn(line_nr, `Unkown port ${operant}`));
      return void 0;
    }
  }
  return port;
}
function parse_operant(get_operant, line_nr, inst_i, labels, macro_constants, data, errors, warnings) {
  let operant = get_operant();
  if (operant === void 0) {
    return void 0;
  }
  for (let i = 0; i < 10; i++) {
    const macro = macro_constants[operant.toUpperCase()];
    if (macro !== void 0) {
      operant = macro;
    } else {
      break;
    }
    if (i >= 9) {
      errors.push(warn(line_nr, `Recursive macro (${operant} -> ${macro})`));
      return void 0;
    }
  }
  switch (operant.toUpperCase()) {
    case "R0":
    case "$0":
      return [1 /* Imm */, 0];
    case "PC":
      return [0 /* Reg */, 0 /* PC */];
    case "SP":
      return [0 /* Reg */, 1 /* SP */];
  }
  switch (operant[0]) {
    case ".": {
      const label = labels[operant];
      if (label === void 0) {
        errors.push(warn(line_nr, `Undefined label ${operant}`));
        return void 0;
      }
      const { type, index } = label;
      if (type === 0 /* Inst */) {
        return [3 /* Label */, index];
      }
      if (type === 1 /* DW */) {
        return [4 /* Data_Label */, index];
      }
    }
    case "~": {
      const value = my_parse_int(operant.slice(1));
      if (!Number.isInteger(value)) {
        errors.push(warn(line_nr, `Invalid relative address ${operant}`));
        return void 0;
      }
      return [3 /* Label */, value + inst_i];
    }
    case "R":
    case "r":
    case "$": {
      const value = my_parse_int(operant.slice(1));
      if (!Number.isInteger(value)) {
        errors.push(warn(line_nr, `Invalid register ${operant}`));
        return void 0;
      }
      return [0 /* Reg */, value + register_count - 1];
    }
    case "M":
    case "m":
    case "#": {
      const value = my_parse_int(operant.slice(1));
      if (!Number.isInteger(value)) {
        errors.push(warn(line_nr, `Invalid memory address ${operant}`));
        return void 0;
      }
      return [2 /* Memory */, value];
    }
    case "%": {
      const port = resolve_port(operant, line_nr, errors) ?? NaN;
      return [1 /* Imm */, port];
    }
    case "'": {
      let char_lit;
      if (operant.length === 1) {
        operant += " " + get_operant();
      }
      try {
        char_lit = JSON.parse(operant.replace(/"/g, '\\"').replace(/'/g, '"'));
      } catch (e) {
        errors.push(warn(line_nr, `Invalid character ${operant}
  ${e}`));
        return void 0;
      }
      return [1 /* Imm */, char_lit.codePointAt(0) ?? char_lit.charCodeAt(0)];
    }
    case '"': {
      let i = 1;
      const value = data.length;
      while (true) {
        i = operant.indexOf('"', 1);
        if (i > 0 && operant[i - 1] !== "\\" || operant[i - 2] === "\\") {
          let string = "";
          try {
            string = JSON.parse(operant);
          } catch (e) {
            errors.push(warn(line_nr, `Invalid string ${operant}
  ${e}`));
            return void 0;
          }
          for (let i2 = 0; i2 < string.length; i2++) {
            data.push(string.codePointAt(i2) ?? 0);
          }
          return [6 /* String */, value];
        }
        const next = get_operant();
        if (next === void 0) {
          errors.push(warn(line_nr, `missing end of string`));
          return [6 /* String */, value];
        }
        operant += " " + next;
      }
    }
    case "&":
      warnings.push(warn(line_nr, `Compiler constants with & are deprecated`));
    case "@": {
      const constant = enum_from_str(Constants, operant.slice(1).toUpperCase());
      if (constant === void 0) {
        errors.push(warn(line_nr, `Unkown Compiler Constant ${operant}`));
        return void 0;
      }
      return [5 /* Constant */, constant];
    }
    default: {
      if (operant.endsWith("f32")) {
        const value = my_parse_f32(operant);
        if (value === void 0) {
          errors.push(warn(line_nr, `Invalid immediate float ${operant}`));
          return void 0;
        }
        return [1 /* Imm */, value];
      } else if (operant.endsWith("f16")) {
        const value = my_parse_float(operant);
        if (value === void 0) {
          errors.push(warn(line_nr, `Invalid immediate float ${operant}`));
          return void 0;
        }
        return [1 /* Imm */, f16_encode(value)];
      } else {
        const value = my_parse_int(operant);
        if (!Number.isInteger(value)) {
          errors.push(warn(line_nr, `Invalid immediate int ${operant}`));
          return void 0;
        }
        return [1 /* Imm */, value];
      }
    }
  }
}
function str_until(string, sub_string) {
  const end = string.indexOf(sub_string);
  if (end < 0) {
    return string;
  }
  return string.slice(0, end);
}

// src/index.ts
var animation_frame;
var running = false;
var started = false;
var input = false;
var last_step = performance.now();
var clock_speed = 0;
var clock_count = 0;
var source_input = document.getElementById("urcl-source");
var output_element = document.getElementById("output");
var debug_output_element = document.getElementById("debug-output");
var memory_view = document.getElementById("memory-view");
var register_view = document.getElementById("register-view");
var console_input = document.getElementById("stdin");
var console_output = document.getElementById("stdout");
var null_terminate_input = document.getElementById("null-terminate");
var share_button = document.getElementById("share-button");
var auto_run_input = document.getElementById("auto-run-input");
var storage_input = document.getElementById("storage-input");
var storage_msg = document.getElementById("storage-msg");
var storage_little = document.getElementById("storage-little");
var storage_update = document.getElementById("storage-update");
var storage_download = document.getElementById("storage-download");
var clock_speed_input = document.getElementById("clock-speed-input");
var clock_speed_output = document.getElementById("clock-speed-output");
var memory_update_input = document.getElementById("update-mem-input");
var url = new URL(location.href, location.origin);
var srcurl = url.searchParams.get("srcurl");
var storage_url = url.searchParams.get("storage");
var width = parseInt(url.searchParams.get("width") ?? "");
var height = parseInt(url.searchParams.get("height") ?? "");
var color = enum_from_str(Color_Mode, url.searchParams.get("color") ?? "");
memory_update_input.oninput = () => update_views();
var max_clock_speed = 4e7;
var max_its = 1.2 * max_clock_speed / 16;
clock_speed_input.oninput = change_clockspeed;
function change_clockspeed() {
  clock_speed = Math.min(max_clock_speed, Math.max(0, Number(clock_speed_input.value) || 0));
  clock_speed_output.value = "" + clock_speed;
  last_step = performance.now();
}
change_clockspeed();
share_button.onclick = (e) => {
  const srcurl2 = `data:text/plain;base64,${btoa(source_input.value)}`;
  const share = new URL(location.href);
  share.searchParams.set("srcurl", srcurl2);
  share.searchParams.set("width", "" + canvas.width);
  share.searchParams.set("height", "" + canvas.height);
  share.searchParams.set("color", Color_Mode[display.color_mode]);
  navigator.clipboard.writeText(share.href);
};
var storage_uploaded;
var storage_device;
var storage_loads = 0;
function load_array_buffer(buffer) {
  storage_uploaded = new Uint8Array(buffer);
  const bytes = storage_uploaded.slice();
  emulator.add_io_device(storage_device = new Storage(emulator.bits, storage_little.checked, bytes.length));
  storage_device.set_bytes(bytes);
  storage_msg.innerText = `loaded storage device with ${0 | bytes.length / (emulator.bits / 8)} words`;
}
storage_little.oninput = storage_input.oninput = async (e) => {
  storage_msg.classList.remove("error");
  const files = storage_input.files;
  if (files === null || files.length < 1) {
    storage_msg.classList.add("error");
    storage_msg.innerText = "No file specified";
    return;
  }
  const file = files[0];
  try {
    load_array_buffer(await file.arrayBuffer());
  } catch (error) {
    storage_msg.classList.add("error");
    storage_msg.innerText = "" + error;
  }
};
storage_update.onclick = (e) => {
  if (storage_device === void 0) {
    storage_msg.innerText = `No storage to update`;
    return;
  }
  storage_uploaded = storage_device.get_bytes();
  storage_msg.innerText = `Updated storage`;
};
storage_download.onclick = (e) => {
  if (storage_device === void 0 && storage_uploaded === void 0) {
    storage_msg.innerText = `No storage to download`;
    return;
  }
  if (storage_device !== void 0) {
    storage_uploaded = storage_device.get_bytes();
  }
  const url2 = URL.createObjectURL(new Blob([storage_uploaded]));
  const a = document.createElement("a");
  const file_name = storage_input.value.split(/\\|\//).at(-1);
  a.download = file_name || "storage.bin";
  a.href = url2;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url2), 1e3);
};
var input_callback;
console_input.addEventListener("keydown", (e) => {
  if (!e.shiftKey && e.key === "Enter" && input_callback) {
    e.preventDefault();
    if (null_terminate_input.checked) {
      console_input.value += "\0";
    } else {
      console_input.value += "\n";
    }
    input_callback();
  }
});
var console_io = new Console_IO({
  read(callback) {
    input_callback = callback;
  },
  get text() {
    return console_input.value;
  },
  set text(value) {
    console_input.value = value;
  }
}, (text) => {
  console_output.write(text);
}, () => {
  console_output.clear();
  input_callback = void 0;
});
var canvas = document.getElementsByTagName("canvas")[0];
var gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("Unable to get webgl rendering context");
}
canvas.width = width || 32;
canvas.height = height || 32;
var display = new Gl_Display(gl, color);
var color_mode_input = document.getElementById("color-mode");
if (color !== void 0)
  color_mode_input.value = Color_Mode[color];
color_mode_input.addEventListener("change", change_color_mode);
function change_color_mode() {
  const color_mode = enum_from_str(Color_Mode, color_mode_input.value);
  display.color_mode = color_mode ?? display.color_mode;
  display.update_display();
}
var width_input = document.getElementById("display-width");
var height_input = document.getElementById("display-height");
var fullscreen_button = document.getElementById("display-fullscreen");
fullscreen_button.onclick = () => {
  canvas.requestPointerLock();
  canvas.requestFullscreen();
};
width_input.value = "" + canvas.width;
height_input.value = "" + canvas.height;
width_input.addEventListener("input", resize_display);
height_input.addEventListener("input", resize_display);
resize_display();
function resize_display() {
  const width2 = parseInt(width_input.value) || 16;
  const height2 = parseInt(height_input.value) || 16;
  display.resize(width2, height2);
}
var emulator = new Emulator({ on_continue: frame, warn: (msg) => output_element.innerText += `${msg}
` });
emulator.add_io_device(new Sound());
emulator.add_io_device(console_io);
emulator.add_io_device(display);
emulator.add_io_device(new Clock());
var gamepad = new Pad();
gamepad.add_pad(new KeyboardPad());
emulator.add_io_device(gamepad);
emulator.add_io_device(new RNG());
emulator.add_io_device(new Keyboard());
emulator.add_io_device(new Mouse(canvas));
source_input.oninput = oninput;
auto_run_input.onchange = oninput;
function oninput() {
  if (started) {
    const size = 8;
    localStorage.setItem("history-size", "" + size);
    const offset = (Math.max(0, 0 | (Number(localStorage.getItem("history-offset")) || 0)) + 1) % size;
    localStorage.setItem("history-offset", "" + offset);
    localStorage.setItem(`history-${offset}`, source_input.value);
  }
  if (auto_run_input.checked) {
    compile_and_run();
  }
}
var compile_and_run_button = document.getElementById("compile-and-run-button");
var pause_button = document.getElementById("pause-button");
var compile_and_reset_button = document.getElementById("compile-and-reset-button");
var step_button = document.getElementById("step-button");
compile_and_run_button.addEventListener("click", compile_and_run);
compile_and_reset_button.addEventListener("click", compile_and_reset);
pause_button.addEventListener("click", pause);
step_button.addEventListener("click", step);
function step() {
  process_step_result(emulator.step(), 1);
  clock_speed_output.value = `stepping, executed ${format_int(clock_count)} instructions`;
  console_output.flush();
}
function pause() {
  if (running) {
    if (animation_frame) {
      cancelAnimationFrame(animation_frame);
    }
    animation_frame = void 0;
    pause_button.textContent = "Start";
    running = false;
    step_button.disabled = running || input;
  } else {
    animation_frame = requestAnimationFrame(frame);
    pause_button.textContent = "Pause";
    running = true;
    step_button.disabled = running;
  }
}
function compile_and_run() {
  if (!compile_and_reset()) {
    return;
  }
  pause_button.textContent = "Pause";
  pause_button.disabled = false;
  if (!running) {
    running = true;
    step_button.disabled = running;
    frame();
  }
}
function compile_and_reset() {
  clock_count = 0;
  output_element.innerText = "";
  try {
    const source = source_input.value;
    const parsed = parse(source, {
      constants: Object.fromEntries([
        ...enum_strings(Gamepad_Key).map((key) => [`@${key}`, `${1 << Gamepad_Key[key]}`]),
        ...enum_strings(Gamepad_Exes).map((key) => [`@${key}`, `${Gamepad_Exes[key]}`])
      ])
    });
    if (parsed.errors.length > 0) {
      output_element.innerText = parsed.errors.map((v) => expand_warning(v, parsed.lines) + "\n").join("");
      output_element.innerText += parsed.warnings.map((v) => expand_warning(v, parsed.lines) + "\n").join("");
      return false;
    }
    output_element.innerText += parsed.warnings.map((v) => expand_warning(v, parsed.lines) + "\n").join("");
    const [program, debug_info] = compile(parsed);
    emulator.load_program(program, debug_info);
    if (storage_uploaded) {
      const bytes = storage_uploaded.slice();
      emulator.add_io_device(storage_device = new Storage(emulator.bits, storage_little.checked, bytes.length));
      storage_device.set_bytes(bytes);
      storage_msg.innerText = `loaded storage device with ${0 | bytes.length / (emulator.bits / 8)} words, ${storage_loads++ % 2 === 0 ? "flip" : "flop"}`;
    }
    const bits = emulator.bits;
    const total_register_count = emulator.registers.length;
    const memory_size = emulator.memory.length;
    const instruction_count = emulator.program.opcodes.length;
    output_element.innerText += `
compilation done
bits: ${bits} /8
register-count: ${total_register_count} /12
memory-size: ${memory_size} /256
instruction-count: ${instruction_count} /256
`;
    if (bits == 8 && total_register_count <= 10 + register_count && memory_size <= 256 && instruction_count <= 256) {
      output_element.innerText += "Program follows competition limitations \u{1F38A}\n";
    }
    if (animation_frame) {
      cancelAnimationFrame(animation_frame);
    }
    animation_frame = void 0;
    pause_button.textContent = "Start";
    pause_button.disabled = false;
    step_button.disabled = false;
    running = false;
    update_views();
    return true;
  } catch (e) {
    output_element.innerText += e.message;
    throw e;
  }
}
function frame() {
  if (running) {
    try {
      if (clock_speed > 0) {
        const start_time = performance.now();
        const dt = start_time - last_step;
        const its = Math.min(max_its, 0 | dt * clock_speed / 1e3);
        const [res, steps] = emulator.burst(its, 16);
        process_step_result(res, steps);
        if (its === max_its || res === 0 /* Continue */ && steps !== its) {
          last_step = start_time;
          clock_speed_output.value = `${format_int(clock_speed)}Hz slowdown to ${format_int(steps * 1e3 / 16)}Hz, executed ${format_int(clock_count)} instructions`;
        } else {
          last_step += its * 1e3 / clock_speed;
          clock_speed_output.value = `${format_int(clock_speed)}Hz, executed ${format_int(clock_count)} instructions`;
        }
      } else {
        const start_time = performance.now();
        const [res, steps] = emulator.run(16);
        const end_time = performance.now();
        const dt = Math.max(0.1, end_time - start_time);
        process_step_result(res, steps);
        clock_speed_output.value = `${format_int(steps * 1e3 / dt)}Hz, executed ${format_int(clock_count)} instructions`;
      }
    } catch (e) {
      output_element.innerText += e.message + "\nProgram Halted";
      update_views();
      throw e;
    }
  } else {
    step_button.disabled = false;
    pause_button.disabled = false;
  }
}
function process_step_result(result, steps) {
  clock_count += steps;
  animation_frame = void 0;
  input = false;
  debug_output_element.innerText = "";
  switch (result) {
    case 0 /* Continue */:
      {
        if (running) {
          animation_frame = requestAnimationFrame(frame);
          running = true;
          step_button.disabled = running;
          pause_button.disabled = false;
        }
      }
      break;
    case 2 /* Input */:
      {
        step_button.disabled = true;
        pause_button.disabled = false;
        input = true;
      }
      break;
    case 1 /* Halt */:
      {
        output_element.innerText += "Program halted";
        step_button.disabled = true;
        pause_button.disabled = true;
        pause_button.textContent = "Start";
        running = false;
      }
      break;
    case 3 /* Debug */:
      {
        if (running) {
          pause();
        }
        const msg = emulator.get_debug_message();
        if (msg !== void 0) {
          debug_output_element.innerText = msg;
        } else {
          throw new Error("Debug not handled");
        }
      }
      break;
    default: {
      console.warn("unkown step result");
    }
  }
  update_views();
}
function update_views() {
  if (memory_update_input.checked) {
    memory_view.memory = emulator.memory;
    memory_view.update();
  }
  register_view.innerText = registers_to_string(emulator);
  const lines = emulator.debug_info.pc_line_nrs;
  const line = lines[Math.min(emulator.pc, lines.length - 1)];
  source_input.set_pc_line(line);
  source_input.set_line_profile(emulator.pc_counters.map((v, i) => [lines[i], v]));
  console_output.flush();
}
change_color_mode();
started = true;
if (srcurl) {
  fetch(srcurl).then((res) => res.text()).then((text) => {
    if (source_input.value) {
      return;
    }
    source_input.value = text;
    compile_and_run();
  });
} else
  autofill: {
    const offset = Number(localStorage.getItem("history-offset"));
    if (!Number.isInteger(offset)) {
      break autofill;
    }
    source_input.value = localStorage.getItem(`history-${offset}`) ?? "";
  }
if (storage_url) {
  fetch(storage_url).then((res) => res.arrayBuffer()).then((buffer) => {
    console.log(storage_uploaded, buffer);
    if (storage_uploaded != null) {
      return;
    }
    load_array_buffer(buffer);
  });
}
//# sourceMappingURL=index.js.map
