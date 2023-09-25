import { IntArray, Step_Result, UintArray } from "../IEmu";
import { Debug_Info, Program } from "../compiler";
import { Opcode, Operant_Prim, Register, URCL_Header, register_count } from "../instructions";
import { Export_Type, Section_Type, WASM_Opcode, WASM_Type, magic, version } from "./wasm";
import { WASM_Writer } from "./wasm_writer";

export interface WASM_Exports {
    run(max: number): [Step_Result, number],
}

export type WASM_Imports = WebAssembly.Imports & {
    env: {
        in(port: number, pc: number): number,
        out(port: number, value: number): void;
        now(): number;
        memory: WebAssembly.Memory
    }
}

export enum Run_Type {
    Uninterrupted,
    Count_Instrutions,
    Count_Jumps,
}

enum Locals {
    MAX_TIME,
    COUNTER,
    MAX_COUNTER,
    Registers
}

const burst_length = 1024 * 64;
const jump_burst_length = 1024 * 64;

export interface URCL_Memory {
    wasm_memory: WebAssembly.Memory,
    block_count: number,
    memory: UintArray,
    memory_s: IntArray,
    registers: UintArray,
    registers_s: IntArray,
    pc_counters: Uint32Array,
}

export function create_urcl_memory(program: Program): URCL_Memory {
    const bits = program.headers[URCL_Header.BITS].value;
    let IntArray, WordArray;
    if (bits <= 8){
        WordArray = Uint8Array;
        IntArray = Int8Array;
    } else if (bits <= 16){
        WordArray = Uint16Array;
        IntArray = Int16Array;
    } else if (bits <= 32){
        WordArray = Uint32Array;
        IntArray = Int32Array;
    } else {
        throw new Error(`BITS = ${bits} exceeds 32 bits`);
    }
    const memory_offset = 0;
    const static_length = program.data.length;
    const heap_length = program.headers[URCL_Header.MINHEAP].value;
    const stack_length = program.headers[URCL_Header.MINSTACK].value;
    const memory_length =  static_length + heap_length + stack_length;
    
    const register_offset = memory_offset + memory_length * WordArray.BYTES_PER_ELEMENT;
    const register_length = program.headers[URCL_Header.MINREG].value + register_count;
    const register_end = register_offset + register_length * WordArray.BYTES_PER_ELEMENT;
    const counter_offset =  (register_end + 3) & ~3;
    const counter_length = program.opcodes.length;
    
    const size = counter_offset + counter_length * Uint32Array.BYTES_PER_ELEMENT;
    const block_size = 64 * 1024;
    const block_count = Math.ceil(size / block_size);
    
    const wasm_memory = new WebAssembly.Memory({initial: block_count});
    const buffer = wasm_memory.buffer;
    const memory = new WordArray(buffer, memory_offset, memory_length);
    const memory_s = new IntArray(buffer, memory_offset, memory_length);
    
    const registers = new WordArray(buffer, register_offset, register_length);
    const registers_s = new IntArray(buffer, register_offset, register_length);

    const pc_counters = new Uint32Array(buffer, counter_offset, counter_length);

    return {
        wasm_memory,
        block_count,
        memory,
        memory_s,
        registers,
        registers_s,
        pc_counters
    };
}

export function urcl2wasm(program: Program, memory: URCL_Memory, run_type: Run_Type, debug?: Debug_Info): Uint8Array {
    const s = new Context(memory, run_type, program, debug);
    s.bytes(magic).u32(version)
        .u8(Section_Type.type)
            .size_start() // section size
            .uvar(4)    // type count
                .u8(0x60)   // function
                    .uvar(1)    // argument count
                        .uvar(WASM_Type.i32) // max time
                    .uvar(2)    // result count
                        .uvar(WASM_Type.i32) // instruction count
                        .uvar(WASM_Type.i32) // step result
                .u8(0x60)   // function
                    .uvar(2)    // argument count
                        .uvar(WASM_Type.i32)
                        .uvar(WASM_Type.i32)
                    .uvar(1)    // result count
                        .uvar(WASM_Type.i32)
                .u8(0x60)   // function
                    .uvar(2)    // argument count
                        .uvar(WASM_Type.i32)
                        .uvar(WASM_Type.i32)
                    .uvar(0)    // result count
                .u8(0x60)
                    .uvar(0)
                    .uvar(1)
                        .uvar(WASM_Type.i32)
            .size_end()
        .u8(Section_Type.import)
            .size_start()
            .uvar(4)
                .str("env")
                    .str("in")
                    .u8(Export_Type.func)
                    .uvar(1)
                .str("env")
                    .str("out")
                    .u8(Export_Type.func)
                    .uvar(2)
                .str("env")
                    .str("now")
                    .u8(Export_Type.func)
                    .uvar(3)
                .str("env")
                    .str("memory")
                    .u8(Export_Type.memory)
                    .uvar(0).uvar(s.mem.block_count)
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
                .uvar(3)                // export value
            .size_end()
        .u8(Section_Type.code)
            .size_start()
            .uvar(1)    // function count
                generate_run(s, run_type);
            s.size_end();    

    return s.finish();
}

function generate_run(s: Context, run_type: Run_Type) {
    s.size_start();  // function length
    
    const program_length = s.program.opcodes.length;
    const min_reg = s.program.headers[URCL_Header.MINREG].value;
    s.uvar(1) // local count
        .uvar(min_reg + register_count + Locals.Registers) // local repeat
        .u8(WASM_Type.i32);             // local type
    
    s.load_regfile();
    if (run_type === Run_Type.Count_Instrutions) {
        s.const(burst_length).set_local(Locals.MAX_COUNTER);
    } 
    if (run_type === Run_Type.Count_Jumps) {
        s.const(jump_burst_length).set_local(Locals.MAX_COUNTER);
    }

    s.u8(WASM_Opcode.loop).uvar(64);
    for (let i = 0; i < program_length; ++i) {
        s.u8(WASM_Opcode.block).uvar(64);
    }
    s.u8(WASM_Opcode.block).uvar(64);
    s.pc = -1;
    
    if (run_type === Run_Type.Count_Instrutions) {
        s.get_local(Locals.COUNTER).get_local(Locals.MAX_COUNTER).u8(WASM_Opcode.i32_ge_u).if()
            s.get_local(Locals.MAX_COUNTER).const(burst_length).u8(WASM_Opcode.i32_add).set_local(Locals.MAX_COUNTER);
            s.u8(WASM_Opcode.call).uvar(2).get_local(Locals.MAX_TIME).u8(WASM_Opcode.i32_gt_u).if()
                s.const(Step_Result.Continue).break_ret()
            .end()
        .end()
    }
    if (run_type === Run_Type.Count_Jumps) {
        s.get_local(Locals.COUNTER).const(1).u8(WASM_Opcode.i32_add).tee_local(Locals.COUNTER)
        s.get_local(Locals.MAX_COUNTER).u8(WASM_Opcode.i32_ge_u).if()
            s.get_local(Locals.MAX_COUNTER).const(jump_burst_length).u8(WASM_Opcode.i32_add).set_local(Locals.MAX_COUNTER);
            s.u8(WASM_Opcode.call).uvar(2).get_local(Locals.MAX_TIME).u8(WASM_Opcode.i32_gt_u).if()
                s.const(Step_Result.Continue).break_ret()
            .end()
        .end()
    }

    s._read_reg(Register.PC);

    s.pc = 0;
    s.u8(WASM_Opcode.br_table)
        .uvar(program_length);
    for (let i = program_length; i >= 1; --i) {
        s.uvar(program_length - i)
    }
    s.uvar(program_length);
    s.u8(WASM_Opcode.end);
    s.pc = 0;
    for (let i = 0; i < program_length; ++i) {
        stuff[s.program.opcodes[i]]?.(s);
        s.after_instruction();
        s.u8(WASM_Opcode.end);
        s.pc += 1;
    }
    
    s.end();

    s.store_regfile();
    s.const(Step_Result.Halt);
    s.get_local(Locals.COUNTER);

    s.end();
    s.size_end()
}

class Context extends WASM_Writer {
    bits: number
    pc = 0;
    in_func = 0;
    out_func = 1;

    private load_opcode_u: number;
    private load_opcode_s: number;
    private store_opcode: number;
    size_shift: number;
    private get should_mask() {
        return this.bits < 32;
    }
    private get max() {
        return 0xffffffff >>> (32 - this.bits);
    }
    private get max_s () {
        return (1 << (this.bits - 1)) - 1
    }
    private get sign_bit() {
        return (1 << (this.bits - 1));
    }
    private get n_max_s() {
        return ~this.max_s
    }
    private get sign_mult() {
        return 0xffffff << this.bits;
    }
    private allign: number;

    get memory_offset() {
        return this.mem.memory.byteOffset;
    }
    get register_offset() {
        return this.mem.registers.byteOffset;
    }
    get register_length() {
        return this.mem.registers.length;
    }
    get counters_offset() {
        return this.mem.pc_counters.byteOffset;
    }
    
    private get depth() {
        return this.program.opcodes.length - this.pc;
    }

    constructor(
        public mem: URCL_Memory,
        public run_type: Run_Type,
        public program: Program,
        public debug?: Debug_Info,
    ) {
        super();

        this.bits = this.program.headers[URCL_Header.BITS].value;

        
        if (this.bits == 8) {
            this.size_shift = 0;
            this.allign = 0;
            this.load_opcode_u = WASM_Opcode.i32_load8_u;
            this.load_opcode_s = WASM_Opcode.i32_load8_s;
            this.store_opcode = WASM_Opcode.i32_store8;
        } else if (this.bits == 16) {
            this.allign = 1;
            this.load_opcode_u = WASM_Opcode.i32_load16_u;
            this.load_opcode_s = WASM_Opcode.i32_load16_s;
            this.store_opcode = WASM_Opcode.i32_store16;
            this.size_shift = 1;
        } else if (this.bits == 32) {
            this.allign = 2;
            this.load_opcode_u = WASM_Opcode.i32_load;
            this.load_opcode_s = WASM_Opcode.i32_load;
            
            this.store_opcode = WASM_Opcode.i32_store;
            this.size_shift = 2;
        } else {
            throw new Error(`bits ${this.bits} > 32`);
        }
        this.allign = 0;
    }

    after_instruction() {
        // TODO: make flag to disable counter
        const counter_offset = this.counters_offset + this.pc * 4;
        this.const(counter_offset)
            .const(counter_offset).u8(WASM_Opcode.i32_load).memory_arg(0, 0)
            .const(1).u8(WASM_Opcode.i32_add)
            .u8(WASM_Opcode.i32_store).memory_arg(0, 0);
        
        if (this.run_type === Run_Type.Count_Instrutions) {
            this.get_local(Locals.COUNTER).const(1).u8(WASM_Opcode.i32_add).set_local(Locals.COUNTER);
        }

        return this;
    }

    load_reg(i: number) {
        return this.const(this.register_offset + (i << this.size_shift)).load_u()._write_reg(i);
    }
    store_reg(i: number) {
        return this.const(this.register_offset + (i << this.size_shift)).read_reg(i).store();
    }

    load_regfile() {
        for (let i = 0; i < this.register_length; i++) {
            this.load_reg(i);
        }
        return this;
    }

    store_regfile(){
        for (let i = 0; i < this.register_length; i++) {
            this.store_reg(i);
        }
        return this;
    }
    
    arg(index: number, signed: boolean) {
        const prim = this.program.operant_prims[this.pc][index];
        const value = this.program.operant_values[this.pc][index];
        if (prim === Operant_Prim.Reg) {
            if (signed) {
                this.read_reg_s(value);
            } else {
                this.read_reg(value);
            }
        } else {
            this.const(value);
        }

        return this;
    }
    read_reg_s(index: number) {
        return this.read_reg(index).sign_extend();
    }
    read_reg(index: number) {
        if (index === Register.PC && this.pc >= 0) {
            return this.const(this.pc);
        }

        return this._read_reg(index);
    }
    _read_reg(index: number) {
        return this.u8(WASM_Opcode.local_get).uvar(index + Locals.Registers);
    }

    write_reg(index: number) {
        this._write_reg(index);
        // TODO: check for if statements or post write code
        if (index === Register.PC) {
            this.u8(WASM_Opcode.br).uvar(this.depth)
        }
        return this;
    }

    _write_reg(index: number) {
        return this.mask_u().u8(WASM_Opcode.local_set).uvar(index + Locals.Registers);
        
    }
    tee_reg(index: number) {
        return this.mask_u().u8(WASM_Opcode.local_tee).uvar(index + Locals.Registers);
    }
    write_local(index: number) {
        return this.u8(WASM_Opcode.local_set).uvar(index);
    }
    get_local(index: number) {
        return this.u8(WASM_Opcode.local_get).uvar(index);
    }
    set_local(index: number) {
        return this.u8(WASM_Opcode.local_set).uvar(index);
    }
    tee_local(index: number) {
        return this.u8(WASM_Opcode.local_tee).uvar(index);
    }

    sign_extend() {
        if (this.should_mask) {
            this.const(this.max).u8(WASM_Opcode.i32_and)
                .const(~this.max).u8(WASM_Opcode.i32_or)
                .const(this.sign_bit).u8(WASM_Opcode.i32_add)
                .const(~this.max_s).u8(WASM_Opcode.i32_xor);
        }
        return this;
    }

    mask_u() {
        if (this.should_mask) {
            this.const(this.max)
                .u8(WASM_Opcode.i32_and);
        }
        return this;
    }

    write_arg(index: number) {
        const prim = this.program.operant_prims[this.pc][index];
        const value = this.program.operant_values[this.pc][index];
        if (prim == Operant_Prim.Reg) {
            this.write_reg(value)
        } else {
            this.u8(WASM_Opcode.drop)
        }
        return this;
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
    const64(value: number) {
        return this.u8(this.bits <= 16 ? WASM_Opcode.i32_const : WASM_Opcode.i64_const)
            .ivar(value);
    }
    // takes address then value
    store() {
        return this.mask_u().u8(this.store_opcode).memory_arg(this.allign, 0);
    }
    load_u() {
        return this.u8(this.load_opcode_u).memory_arg(this.allign, 0);
    }
    load_s() {
        return this.u8(this.load_opcode_s).memory_arg(this.allign, 0);
    }

    branch() {
        return this.if().a().jump(1).end();
    }
    bbranch(cond: WASM_Opcode) {
        return this.b().c().u8(cond).branch();
    }
    sbbranch(cond: WASM_Opcode) {
        return this.sb().sc().u8(cond).branch();
    }
    sbranch(cond: WASM_Opcode) {
        return this.sb().sc().u8(cond).branch();
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

    extend_u() {
        if (this.bits > 16) {
            this.u8(WASM_Opcode.i64_extend_i32_u);
        }

        return this;
    }
    extend_s() {
        if (this.bits > 16) {
            this.u8(WASM_Opcode.i64_extend_i32_s);
        }

        return this;
    }
    wrap() {
        if (this.bits > 16) {
            this.u8(WASM_Opcode.i32_wrap_i64);
        }
        return this;
    }

    break_ret() {
        return this.after_instruction().store_regfile().get_local(Locals.COUNTER).u8(WASM_Opcode.return);
    }
    jump(offset: number) {
        return this._write_reg(Register.PC).after_instruction().u8(WASM_Opcode.br).uvar(this.depth + offset);
    }
    bin(code: WASM_Opcode) {
        return this.b().c().u8(code).wa();
    }
    sbin(code: WASM_Opcode) {
        return this.sb().sc().u8(code).wa();
    }
    
    wa(){return this.write_arg(0);}
    a() {return this.arg(0, false);}
    sa() {return this.arg(0, true);}

    b() {return this.arg(1, false);}
    sb() {return this.arg(1, true);}
    
    c() {return this.arg(2, false);}
    sc() {return this.arg(2, true);}

}

const stuff: Record<Opcode, undefined | ((s: Context) => void)> = {
    [Opcode.ADD]: s => {s.bin(WASM_Opcode.i32_add)},
    [Opcode.RSH]: s => {s.b().const(1).u8(WASM_Opcode.i32_shr_u).wa()},
    [Opcode.LOD]: s => {s.b().address().load_u().wa()},
    [Opcode.STR]: s => {s.a().address().b().store()},
    [Opcode.BGE]: s => {s.bbranch(WASM_Opcode.i32_ge_u)},
    [Opcode.NOR]: s => {s.b().c().u8(WASM_Opcode.i32_or).const(-1).u8(WASM_Opcode.i32_xor).wa()},
    [Opcode.IMM]: s => {s.b().wa()},
    [Opcode.SUB]: s => {s.bin(WASM_Opcode.i32_sub)},
    [Opcode.JMP]: s => {s.a().jump(0)},
    [Opcode.MOV]: s => {s.b().wa()},
    [Opcode.NOP]: s => {},
    [Opcode.LSH]: s => {s.b().const(1).u8(WASM_Opcode.i32_shl).wa()},
    [Opcode.INC]: s => {s.b().const(1).u8(WASM_Opcode.i32_add).wa()},
    [Opcode.DEC]: s => {s.b().const(1).u8(WASM_Opcode.i32_sub).wa()},
    [Opcode.NEG]: s => {s.const(0).b().u8(WASM_Opcode.i32_sub).wa()},
    [Opcode.AND]: s => {s.bin(WASM_Opcode.i32_and)},
    [Opcode.OR]: s => {s.bin(WASM_Opcode.i32_or)},
    [Opcode.NOT]: s => {s.b().const(-1).u8(WASM_Opcode.i32_xor).wa()},
    [Opcode.XNOR]: s => {s.b().c().u8(WASM_Opcode.i32_xor).const(-1).u8(WASM_Opcode.i32_xor).wa()},
    [Opcode.XOR]: s => {s.bin(WASM_Opcode.i32_xor)},
    [Opcode.NAND]: s => {s.b().c().u8(WASM_Opcode.i32_and).const(-1).u8(WASM_Opcode.i32_xor).wa()},
    [Opcode.BRL]: s => {s.bbranch(WASM_Opcode.i32_lt_u)},
    [Opcode.BRG]: s => {s.bbranch(WASM_Opcode.i32_gt_u)},
    [Opcode.BRE]: s => {s.bbranch(WASM_Opcode.i32_eq)},
    [Opcode.BNE]: s => {s.bbranch(WASM_Opcode.i32_ne)},
    [Opcode.BOD]: s => {s.b().const(1).u8(WASM_Opcode.i32_and).const(0).u8(WASM_Opcode.i32_ne).branch()},
    [Opcode.BEV]: s => {s.b().const(1).u8(WASM_Opcode.i32_and).u8(WASM_Opcode.i32_eqz).branch()},
    [Opcode.BLE]: s => {s.bbranch(WASM_Opcode.i32_le_u)},
    [Opcode.BRZ]: s => {s.b().u8(WASM_Opcode.i32_eqz).branch()},
    [Opcode.BNZ]: s => {s.b().const(0).u8(WASM_Opcode.i32_ne).branch()},
    [Opcode.BRN]: s => {s.sb().const(0).u8(WASM_Opcode.i32_lt_s).branch()},
    [Opcode.BRP]: s => {s.sb().const(0).u8(WASM_Opcode.i32_ge_s).branch()},
    [Opcode.PSH]: s => {
        s.read_reg(Register.SP).const(1).u8(WASM_Opcode.i32_sub).tee_reg(Register.SP)
            .address().a().store()
    },
    [Opcode.POP]: s => {
        s.read_reg(Register.SP).address().load_u().wa()
            .read_reg(Register.SP).const(1).u8(WASM_Opcode.i32_add)._write_reg(Register.SP)
    },
    [Opcode.CAL]: s => {
        s.read_reg(Register.SP).const(1).u8(WASM_Opcode.i32_sub).tee_reg(Register.SP).address().const(s.pc+1).store()
        s.a().jump(0)
    },
    [Opcode.RET]: s => {
        s.read_reg(Register.SP).address().load_u()
        s.read_reg(Register.SP).const(1).u8(WASM_Opcode.i32_add)._write_reg(Register.SP)
        s.jump(0);
    },
    [Opcode.HLT]: s => {s.const(Step_Result.Halt).break_ret()},
    [Opcode.CPY]: s => {s.a().address().b().address().load_u().store()},
    [Opcode.BRC]: s => {s.b().c().u8(WASM_Opcode.i32_add).mask_u().b().u8(WASM_Opcode.i32_lt_u).branch()},
    [Opcode.BNC]: s => {s.b().c().u8(WASM_Opcode.i32_add).mask_u().b().u8(WASM_Opcode.i32_ge_u).branch()},
    [Opcode.MLT]: s => {s.bin(WASM_Opcode.i32_mul)},
    [Opcode.DIV]: s => {
        // TODO: make proper error reporting system for wasm
        s.b().u8(WASM_Opcode.i32_eqz).if()
            s.const(420).const(1).u8(WASM_Opcode.call).uvar(s.out_func)
            s.const(0).wa()
        .else()
            s.bin(WASM_Opcode.i32_div_u)
        .end()
    },
    [Opcode.MOD]: s => {s.bin(WASM_Opcode.i32_rem_u)},
    [Opcode.BSR]: s => {s.bin(WASM_Opcode.i32_shr_u)},
    [Opcode.BSL]: s => {s.bin(WASM_Opcode.i32_shl)},
    [Opcode.SRS]: s => {s.sb().const(1).u8(WASM_Opcode.i32_shr_s).wa()},
    [Opcode.BSS]: s => {s.sbin(WASM_Opcode.i32_shr_s)},
    [Opcode.SETE]: s => {s.const(-1).const(0).b().c()   .u8(WASM_Opcode.i32_eq)     .u8(WASM_Opcode.select).wa()},
    [Opcode.SETNE]: s => {s.const(-1).const(0).b().c()  .u8(WASM_Opcode.i32_ne)     .u8(WASM_Opcode.select).wa()},
    [Opcode.SETG]: s => {s.const(-1).const(0).b().c()   .u8(WASM_Opcode.i32_gt_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.SETL]: s => {s.const(-1).const(0).b().c()   .u8(WASM_Opcode.i32_lt_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.SETGE]: s => {s.const(-1).const(0).b().c()  .u8(WASM_Opcode.i32_ge_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.SETLE]: s => {s.const(-1).const(0).b().c()  .u8(WASM_Opcode.i32_le_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.SETC]: s => {s.const(-1).const(0).b().c()   .u8(WASM_Opcode.i32_add).mask_u().b().u8(WASM_Opcode.i32_lt_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.SETNC]: s => {s.const(-1).const(0).b().c()   .u8(WASM_Opcode.i32_add).mask_u().b().u8(WASM_Opcode.i32_ge_u)   .u8(WASM_Opcode.select).wa()},
    [Opcode.LLOD]: s => {s.b().c().u8(WASM_Opcode.i32_add).address().mask_u().load_u().wa()},
    [Opcode.LSTR]: s => {s.a().b().u8(WASM_Opcode.i32_add).address().mask_u().c().store()},
    [Opcode.IN]: s => {
        s.b().read_reg(Register.PC).u8(WASM_Opcode.call).uvar(s.in_func)
            .const(Step_Result.Input).u8(WASM_Opcode.i32_eq).if()
                .const(Step_Result.Input)
                .break_ret()
            .end();
        if (s.program.operant_prims[s.pc][0] === Operant_Prim.Reg) {
            s.load_reg(s.program.operant_values[s.pc][0]);
        }
    },
    [Opcode.OUT]: s => {s.a().b().u8(WASM_Opcode.call).uvar(s.out_func)},
    [Opcode.SDIV]: s => {
        s.b().u8(WASM_Opcode.i32_eqz).if()
            s.const(420).const(1).u8(WASM_Opcode.call).uvar(s.out_func)
            s.const(0).wa()
        .else()
            s.sbin(WASM_Opcode.i32_div_s)
        .end();
    },
    [Opcode.SBRL]: s => {s.sbbranch(WASM_Opcode.i32_lt_s)},
    [Opcode.SBRG]: s => {s.sbbranch(WASM_Opcode.i32_gt_s)},
    [Opcode.SBLE]: s => {s.sbbranch(WASM_Opcode.i32_le_s)},
    [Opcode.SBGE]: s => {s.sbbranch(WASM_Opcode.i32_ge_s)},
    [Opcode.SSETL]: s => {s.const(-1).const(0).sb().sc()   .u8(WASM_Opcode.i32_lt_s)     .u8(WASM_Opcode.select).wa()},
    [Opcode.SSETG]: s => {s.const(-1).const(0).sb().sc()   .u8(WASM_Opcode.i32_gt_s)     .u8(WASM_Opcode.select).wa()},
    [Opcode.SSETLE]: s => {s.const(-1).const(0).sb().sc()   .u8(WASM_Opcode.i32_le_s)     .u8(WASM_Opcode.select).wa()},
    [Opcode.SSETGE]: s => {s.const(-1).const(0).sb().sc()   .u8(WASM_Opcode.i32_ge_s)     .u8(WASM_Opcode.select).wa()},
    [Opcode.ABS]: s => {s.const(0).b().u8(WASM_Opcode.i32_sub)  .b()   .b().const(0).u8(WASM_Opcode.i32_lt_s).u8(WASM_Opcode.select).wa()},
    [Opcode.__ASSERT]: s => {s.a().u8(WASM_Opcode.i32_eqz); panic_if(s)},
    [Opcode.__ASSERT0]: s => {s.a().const(0).u8(WASM_Opcode.i32_ne); panic_if(s)},
    [Opcode.__ASSERT_EQ]: s => {s.a().b().u8(WASM_Opcode.i32_ne); panic_if(s)},
    [Opcode.__ASSERT_NEQ]: s => {s.a().b().u8(WASM_Opcode.i32_eq); panic_if(s)},
    [Opcode.UMLT]: s => {
        s.b().extend_u().c().extend_u().u8(s.bits <= 16 ? WASM_Opcode.i32_mul : WASM_Opcode.i64_mul)
            .const64(s.bits).u8(s.bits <= 16 ? WASM_Opcode.i32_shr_u : WASM_Opcode.i64_shr_u)
            .wrap().wa();
    },
    [Opcode.SUMLT]: s => {
        s.sb().extend_s().sc().extend_s().u8(s.bits <= 16 ? WASM_Opcode.i32_mul : WASM_Opcode.i64_mul)
            .const64(s.bits).u8(s.bits <= 16 ? WASM_Opcode.i32_shr_s : WASM_Opcode.i64_shr_s)
            .wrap().wa();
    },
};

function panic_if(s: Context) {
    return s.if().const(s.pc)._write_reg(Register.PC).const(420).const(s.pc).u8(WASM_Opcode.call).uvar(s.out_func).a().u8(WASM_Opcode.return).end()
}