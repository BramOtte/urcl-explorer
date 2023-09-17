import { Debug_Info, Program } from "../compiler";
import { Opcode, Operant_Prim, Register, URCL_Header, register_count } from "../instructions";
import { Export_Type, Section_Type, WASM_Opcode, WASM_Type, magic, version } from "./wasm";
import { WASM_Writer } from "./wasm_writer";

export function urcl2wasm(program: Program, debug?: Debug_Info): Uint8Array {
    const s = new Context(program, debug);
    s.bytes(magic).u32(version)
        .u8(Section_Type.type)
            .size_start() // section size
            .uvar(2)    // type count
                .u8(0x60)   // function
                    .uvar(1)    // argument count
                        .uvar(WASM_Type.i32)
                    .uvar(1)    // result count
                        .uvar(WASM_Type.i32)
                .u8(0x60)   // function
                    .uvar(2)    // argument count
                        .uvar(WASM_Type.i32)
                        .uvar(WASM_Type.i32)
                    .uvar(0)    // result count
            .size_end()
        .u8(Section_Type.import)
            .size_start()
            .uvar(1)
                .str("env")
                .str("what")
                .u8(Export_Type.func)
                .uvar(1)
            .size_end()
        .u8(Section_Type.function)
            .size_start()   // section size
            .uvar(1)        // function count
                .uvar(0)    // function type
            .size_end()
        .u8(Section_Type.export)
            .size_start()
            .uvar(1)        // export count
                .str("run")             // export name
                .u8(Export_Type.func)   // export type
                .uvar(1)                // export value
            .size_end()
        .u8(Section_Type.code)
            .size_start()
            .uvar(1)    // function count
                generate_run(s);
            s.size_end();

    return s.finish();
}

function generate_run(s: Context) {
    s.size_start();  // function length
    
    const program_length = s.program.opcodes.length;
    const min_reg = s.program.headers[URCL_Header.MINREG].value;
    s.uvar(1) // local count
        .uvar(min_reg + register_count - 1) // local repeat
        .u8(WASM_Type.i32);             // local type
    
    s.u8(WASM_Opcode.loop).uvar(64);
    for (let i = 0; i < program_length; ++i) {
        s.u8(WASM_Opcode.block).uvar(64);
    }
    s.u8(WASM_Opcode.block).uvar(64);
    s.read_reg(Register.PC);
    s.u8(WASM_Opcode.br_table)
        .uvar(program_length);
    for (let i = program_length; i >= 1; --i) {
        s.uvar(program_length - i)
    }
    s.uvar(program_length);
    s.u8(WASM_Opcode.end);
    s.pc = 0;
    for (let i = 0; i < program_length; ++i) {
        stuff[s.program.opcodes[i]](s);
        s.u8(WASM_Opcode.end);
        s.pc += 1;
    }
    s.read_reg(1);
    s.u8(WASM_Opcode.return);
    s.end();
    s.read_reg(1);
    s.end();
    s.size_end()
}

class Context extends WASM_Writer {
    bits: number
    pc = 0;
    private load_opcode_u: number;
    private load_opcode_s: number;
    private store_opcode: number;
    private size_shift?: number;
    private bit_mask?: number;
    private allign: number;

    private get depth() {
        return this.program.opcodes.length - this.pc;
    }

    constructor(
        public program: Program,
        public debug?: Debug_Info,
    ) {
        super();
        this.bits = this.program.headers[URCL_Header.BITS].value;
        if (this.bits < 32) {
            this.bit_mask = (1 << this.bits) - 1;
        }
        if (this.bits <= 8) {
            this.allign = 1;
            this.load_opcode_u = WASM_Opcode.i32_load8_u;
            this.load_opcode_s = WASM_Opcode.i32_load8_s;
            this.store_opcode = WASM_Opcode.i32_store8;
        } else if (this.bits <= 16) {
            this.allign = 2;
            this.load_opcode_u = WASM_Opcode.i32_load16_u;
            this.load_opcode_s = WASM_Opcode.i32_load8_s;
            this.store_opcode = WASM_Opcode.i32_store8;
            this.size_shift = 1;
        } else if (this.bits <= 32) {
            this.allign = 4;
            this.load_opcode_u = this.load_opcode_s = WASM_Opcode.i32_load;
            this.store_opcode = WASM_Opcode.i32_store;
            this.size_shift = 2;
        } else {
            throw new Error(`bits ${this.bits} > 32`);
        }
    }
    
    arg(index: number) {
        const prim = this.program.operant_prims[this.pc][index];
        const value = this.program.operant_values[this.pc][index];
        console.log(prim);
        if (prim === Operant_Prim.Reg) {
            this.read_reg(value);
        } else {
            this.u8(WASM_Opcode.i32_const).ivar(value);
        }

        return this;
    }
    read_reg(index: number) {
        return this.u8(WASM_Opcode.local_get).uvar(index);
    }

    apply_mask() {
        if (this.bit_mask) {
            this.u8(WASM_Opcode.i32_const).ivar(this.bit_mask)
                .u8(WASM_Opcode.i32_and);
        }
        return this;
    }
    write_reg(index: number) {
        return this.apply_mask().u8(WASM_Opcode.local_set).uvar(index);
    }

    write_arg(index: number) {
        const value = this.program.operant_values[this.pc][index];
        return this.write_reg(value);        
    }
    address() {
        if (this.size_shift) {
            this.u8(WASM_Opcode.i32_const).ivar(this.size_shift)
                .u8(WASM_Opcode.i32_shl);
        }
        return this;
    }
    const(value: number) {
        return this.u8(WASM_Opcode.i32_const)
            .ivar(value);
    }
    // takes address
    store() {
        return this.apply_mask().u8(this.store_opcode);
    }
    load_u() {
        return this.u8(this.load_opcode_u).uvar(this.allign).uvar(0);
    }
    load_s() {
        return this.u8(this.load_opcode_s).uvar(this.allign).uvar(0);
    }

    branch() {
        return this.if().a().jump().end();
    }
    bbranch(cond: WASM_Opcode) {
        return this.b().c().u8(cond).branch();
    }
    if() {
        return this.u8(WASM_Opcode.if).uvar(64);
    }
    else() {
        return this.u8(WASM_Opcode.else);
    }
    end(){
        return this.u8(WASM_Opcode.end);
    }
    jump() {
        return this.write_reg(Register.PC).u8(WASM_Opcode.br)
            .uvar(this.depth + 1);
    }
    bin(code: WASM_Opcode) {
        return this.b().c().u8(code).wa();
    }

    wa(){return this.write_arg(0);}
    a() {return this.arg(0);}
    b() {return this.arg(1);}
    c() {return this.arg(2);}
}

const stuff: Record<Opcode, (s: Context) => void> = {
    [Opcode.ADD]: s => {s.bin(WASM_Opcode.i32_add)},
    [Opcode.RSH]: s => {s.bin(WASM_Opcode.i32_shr_u)},
    [Opcode.LOD]: s => {s.b().address().load_u().wa()},
    [Opcode.STR]: s => {s.a().address().b().store()},
    [Opcode.BGE]: s => {s.bbranch(WASM_Opcode.i32_ge_u)},
    [Opcode.NOR]: s => {s.b().c().u8(WASM_Opcode.i32_or).const(-1).u8(WASM_Opcode.i32_xor).wa()},
    [Opcode.IMM]: s => {s.b().wa()},
    [Opcode.SUB]: s => {throw new Error("todo");},
    [Opcode.JMP]: s => {throw new Error("todo");},
    [Opcode.MOV]: s => {throw new Error("todo");},
    [Opcode.NOP]: s => {throw new Error("todo");},
    [Opcode.LSH]: s => {throw new Error("todo");},
    [Opcode.INC]: s => {throw new Error("todo");},
    [Opcode.DEC]: s => {throw new Error("todo");},
    [Opcode.NEG]: s => {throw new Error("todo");},
    [Opcode.AND]: s => {throw new Error("todo");},
    [Opcode.OR]: s => {throw new Error("todo");},
    [Opcode.NOT]: s => {throw new Error("todo");},
    [Opcode.XNOR]: s => {throw new Error("todo");},
    [Opcode.XOR]: s => {throw new Error("todo");},
    [Opcode.NAND]: s => {throw new Error("todo");},
    [Opcode.BRL]: s => {throw new Error("todo");},
    [Opcode.BRG]: s => {throw new Error("todo");},
    [Opcode.BRE]: s => {throw new Error("todo");},
    [Opcode.BNE]: s => {throw new Error("todo");},
    [Opcode.BOD]: s => {throw new Error("todo");},
    [Opcode.BEV]: s => {throw new Error("todo");},
    [Opcode.BLE]: s => {throw new Error("todo");},
    [Opcode.BRZ]: s => {throw new Error("todo");},
    [Opcode.BNZ]: s => {throw new Error("todo");},
    [Opcode.BRN]: s => {throw new Error("todo");},
    [Opcode.BRP]: s => {throw new Error("todo");},
    [Opcode.PSH]: s => {throw new Error("todo");},
    [Opcode.POP]: s => {throw new Error("todo");},
    [Opcode.CAL]: s => {throw new Error("todo");},
    [Opcode.RET]: s => {throw new Error("todo");},
    [Opcode.HLT]: s => {throw new Error("todo");},
    [Opcode.CPY]: s => {throw new Error("todo");},
    [Opcode.BRC]: s => {throw new Error("todo");},
    [Opcode.BNC]: s => {throw new Error("todo");},
    [Opcode.MLT]: s => {throw new Error("todo");},
    [Opcode.DIV]: s => {throw new Error("todo");},
    [Opcode.MOD]: s => {throw new Error("todo");},
    [Opcode.BSR]: s => {throw new Error("todo");},
    [Opcode.BSL]: s => {throw new Error("todo");},
    [Opcode.SRS]: s => {throw new Error("todo");},
    [Opcode.BSS]: s => {throw new Error("todo");},
    [Opcode.SETE]: s => {throw new Error("todo");},
    [Opcode.SETNE]: s => {throw new Error("todo");},
    [Opcode.SETG]: s => {throw new Error("todo");},
    [Opcode.SETL]: s => {throw new Error("todo");},
    [Opcode.SETGE]: s => {throw new Error("todo");},
    [Opcode.SETLE]: s => {throw new Error("todo");},
    [Opcode.SETC]: s => {throw new Error("todo");},
    [Opcode.SETNC]: s => {throw new Error("todo");},
    [Opcode.LLOD]: s => {throw new Error("todo");},
    [Opcode.LSTR]: s => {throw new Error("todo");},
    [Opcode.IN]: s => {throw new Error("todo");},
    [Opcode.OUT]: s => {s.a().b().u8(WASM_Opcode.call).uvar(0)},
    [Opcode.SDIV]: s => {throw new Error("todo");},
    [Opcode.SBRL]: s => {throw new Error("todo");},
    [Opcode.SBRG]: s => {throw new Error("todo");},
    [Opcode.SBLE]: s => {throw new Error("todo");},
    [Opcode.SBGE]: s => {throw new Error("todo");},
    [Opcode.SSETL]: s => {throw new Error("todo");},
    [Opcode.SSETG]: s => {throw new Error("todo");},
    [Opcode.SSETLE]: s => {throw new Error("todo");},
    [Opcode.SSETGE]: s => {throw new Error("todo");},
    [Opcode.ABS]: s => {throw new Error("todo");},
    [Opcode.__ASSERT]: s => {throw new Error("todo");},
    [Opcode.__ASSERT0]: s => {throw new Error("todo");},
    [Opcode.__ASSERT_EQ]: s => {throw new Error("todo");},
    [Opcode.__ASSERT_NEQ]: s => {throw new Error("todo");},
    [Opcode.UMLT]: s => {throw new Error("todo");},
    [Opcode.SUMLT]: s => {throw new Error("todo");}
};