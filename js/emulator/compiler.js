import { Header_Run, Operant_Prim, Operant_Type, URCL_Header } from "./instructions.js";
export function compile(parsed, inst_sizeof = (opcode) => parsed.headers[URCL_Header.RUN]?.value === Header_Run.RAM ? 4 : 1) {
    const { headers, opcodes, operant_types, operant_values, instr_line_nrs, lines } = parsed;
    const in_ram = parsed.headers[URCL_Header.RUN]?.value === Header_Run.RAM;
    const new_operant_types = operant_types.map((types) => types.map((t) => {
        switch (t) {
            case Operant_Type.Reg: return Operant_Prim.Reg;
            case Operant_Type.Imm: return Operant_Prim.Imm;
            case Operant_Type.Label: return Operant_Prim.Imm;
            case Operant_Type.Memory: return Operant_Prim.Imm;
            default: throw new Error("unkown opperant type");
        }
    }));
    if (!in_ram) {
        return [
            { headers, opcodes, operant_prims: new_operant_types, operant_values },
            { pc_line_nrs: instr_line_nrs, lines }
        ];
    }
    const pc_line_nrs = [];
    const instr_pc = [];
    const new_operant_values = operant_values.slice();
    let pc = 0;
    for (let inst_i = 0; inst_i < parsed.opcodes.length; inst_i++) {
        pc_line_nrs[pc] = parsed.instr_line_nrs[inst_i];
        instr_pc[inst_i] = pc;
        const opcode = parsed.opcodes[inst_i];
        pc += inst_sizeof(opcode);
    }
    const heap_start = pc;
    for (let inst_i = 0; inst_i < parsed.opcodes.length; inst_i++) {
        const types = operant_types[inst_i];
        const value = new_operant_values[inst_i];
        for (let i = 0; i < types.length; i++) {
            switch (types[i]) {
                case Operant_Type.Label:
                    value[i] = instr_pc[value[i]];
                    break;
                case Operant_Type.Memory:
                    value[i] += heap_start;
                    break;
            }
        }
    }
    return [
        {
            headers, opcodes,
            operant_prims: new_operant_types,
            operant_values: new_operant_values,
        },
        { pc_line_nrs, lines }
    ];
}
//# sourceMappingURL=compiler.js.map