import { Export_Type, RefType, Section_Type, WASM_Opcode, WASM_Type } from "./wasm";

const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

export class WASM_Reader {
    cursor = 0;
    view: DataView;
    constructor(buffer: DataView) {
        this.view = buffer;
    }
    bytes(len: number): Uint8Array {
        const start = this.cursor;
        this.cursor += len;
        return new Uint8Array(this.view.buffer, start, len);
    }
    u8(): number {
        return this.view.getUint8(this.cursor++);
    }
    u32(): number {
        const value = this.view.getUint32(this.cursor, true);
        this.cursor += 4;
        return value;
    }
    f32(): number {
        const value = this.view.getFloat32(this.cursor, true);
        this.cursor += 4;
        return value;
    }
    f64(): number {
        const value = this.view.getFloat64(this.cursor, true);
        this.cursor += 8;
        return value;
    }
    // LEB128
    uvar(): number {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = this.u8();
            value |= (byte & 0x7F) << shift;
            shift += 7;
        } while (byte & 0x80)
        return value;
    }
    ivar(): number {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = this.u8();
            value |= (byte & 0x7F) << shift;
            shift += 7;
        } while (byte & 0x80)
        if (value & (1 << (shift - 1))) {
            value |= -1 << shift;
        }
        return value;
    }
    str(): string {
        const length = this.uvar()
        const bytes = new Uint8Array(this.view.buffer, this.cursor, length);
        this.cursor += length;
        return text_decoder.decode(bytes);
    }
    str_a(end: number) {
        const bytes = new Uint8Array(this.view.buffer, this.cursor, end - this.cursor);
        return text_decoder.decode(bytes);
    }

    has_next(): boolean {
        return this.cursor < this.view.byteLength;
    }

    debug(end = this.view.byteLength) {
        console.log(new Uint8Array(this.view.buffer, this.cursor, end - this.cursor));
    }

    wasm() {
        const _magic = this.bytes(4);
        const version = this.u32();
        console.log(_magic, version);
        while (this.has_next()) {
            const section_type = this.u8();
            const section_size = this.uvar();
            const section_end = this.cursor + section_size;
            console.log();
            console.log(section_type, section_size, Section_Type[section_type]);
            console.log("------------------------------------------");

            switch (section_type) {
                case Section_Type.type: {
                    const def_count = this.uvar();
                    for (let def_i = 0; def_i < def_count; def_i++) {
                        // x60 indicates a function
                        const x60 = this.u8();
                        const param_count = this.uvar();
                        for (let i = 0; i < param_count; i++) {
                            const param_type = this.u8();
                            console.log(`(param ${param_type} ${WASM_Type[param_type]})`);
                        }
                        const result_count = this.uvar();
                        for (let i = 0; i < result_count; i++) {
                            const param_type = this.u8();
                            console.log(`(result ${param_type} ${WASM_Type[param_type]})`);
                        }
                    }
                } break;
                case Section_Type.table: {
                    const table_count = this.uvar();
                    for (let i = 0; i < table_count; ++i) {
                        const type = this.u8();
                        const x1 = this.u8();
                        const min = this.uvar();
                        const max = this.uvar();
                        console.log("table", RefType[type], x1, min, max);
                    }
                    this.debug(section_end);
                } break;
                case Section_Type.memory: {
                    const x1 = this.u8();
                    const x0 = this.u8()
                    const initial_size_in_blocks = this.uvar();
                    console.log("memory", initial_size_in_blocks);
                } break;
                case Section_Type.export: {
                    const export_count = this.uvar();
                    for (let i = 0; i < export_count; i++) {
                        const name = this.str();
                        const export_type = this.u8();
                        const export_value = this.uvar();
                        console.log("export", name, export_type, Export_Type[export_type], export_value);
                    }
                } break;
                case Section_Type.import: {
                    const import_count = this.uvar();
                    for (let i = 0; i < import_count; i++) {
                        const mod_name = this.str();
                        const name = this.str();
                        const import_type = this.u8();
                        const type = this.uvar();
                        console.log("export", mod_name, name, Export_Type[import_type], type);
                    }
                } break;
                case Section_Type.global: {
                    const global_count = this.uvar();
                    for (let i = 0; i < global_count; ++i) {
                        const type = this.u8();
                        const x0 = this.u8();
                        const x65 = this.u8();
                        let value;
                        if (type === WASM_Type.f32) {
                            value = this.f32();
                        } else if (type === WASM_Type.f64) {
                            value = this.f64();
                        } else {
                            value = this.ivar();
                        }
                        const xret = this.u8();
                        console.log("global", type, WASM_Type[type], value, x0, x65);
                    }
                    this.debug(section_end);
                } break;
                case Section_Type.function: {
                    const def_count = this.uvar();
                    for (let i = 0; i < def_count; i++) {
                        const type_index = this.uvar();
                        console.log("func decl", type_index);
                    }
                } break;
                case Section_Type.code: {
                    const func_count = this.uvar();
                    for (let i = 0; i < func_count; i++) {
                        const func_length = this.uvar();
                        const func_end = this.cursor + func_length;
                        const local_type_count = this.uvar();
                        console.log(`func ${i} ${func_length} ${local_type_count} ${local_type_count}`);
                        
                        for (let i = 0; i < local_type_count; ++i) {
                            const local_repeat = this.uvar();
                            const local_type = this.u8();
                            console.log("local", local_repeat, local_type, WASM_Type[local_type]);
                        }
                        let inst_count = 0;
                        func_loop:
                        while (this.cursor < func_end) {
                            inst_count += 1;
                            const opcode = this.u8();
                            switch (opcode) {
                                case WASM_Opcode.block:
                                case WASM_Opcode.loop:
                                case WASM_Opcode.if:
                                case WASM_Opcode.br:
                                case WASM_Opcode.br_if:
                                {
                                    const value = this.uvar();
                                    console.log(WASM_Opcode[opcode], value);
                                } break;
                                case WASM_Opcode.br_table: {
                                    const length = this.uvar();
                                    const values: number[] = [];
                                    for (let i = 0; i < length; ++i) {
                                        values.push(this.uvar());
                                    }
                                    const def = this.uvar();
                                    console.log("br_table", values, def);
                                } break;
                                case WASM_Opcode.call: {
                                    const index = this.uvar();
                                    console.log("call", index);
                                } break;
                                case WASM_Opcode.call_indirect: {
                                    const type_index = this.uvar();
                                    const table_index = this.uvar();
                                    console.log("call_indirect", type_index, table_index);
                                } break;
                                case WASM_Opcode.local_get:
                                case WASM_Opcode.local_set:
                                case WASM_Opcode.local_tee:
                                case WASM_Opcode.global_get:
                                case WASM_Opcode.global_set:
                                case WASM_Opcode.table_get:
                                case WASM_Opcode.table_set:
                                {
                                    const index = this.uvar();
                                    console.log(WASM_Opcode[opcode], index);
                                } break;
                                case WASM_Opcode.i32_load: 
                                case WASM_Opcode.i64_load: 
                                case WASM_Opcode.f32_load: 
                                case WASM_Opcode.f64_load: 
                                case WASM_Opcode.i32_load8_s: 
                                case WASM_Opcode.i32_load8_u: 
                                case WASM_Opcode.i32_load16_s: 
                                case WASM_Opcode.i32_load16_u: 
                                case WASM_Opcode.i64_load8_s: 
                                case WASM_Opcode.i64_load8_u: 
                                case WASM_Opcode.i64_load16_s: 
                                case WASM_Opcode.i64_load16_u: 
                                case WASM_Opcode.i64_load32_s: 
                                case WASM_Opcode.i64_load32_u: 
                                case WASM_Opcode.i32_store: 
                                case WASM_Opcode.i64_store: 
                                case WASM_Opcode.f32_store: 
                                case WASM_Opcode.f64_store: 
                                case WASM_Opcode.i32_store8: 
                                case WASM_Opcode.i32_store16: 
                                case WASM_Opcode.i64_store8: 
                                case WASM_Opcode.i64_store16: 
                                case WASM_Opcode.i64_store32: 
                                {
                                    const allign = this.u8();
                                    const offset = this.uvar();
                                    console.log(WASM_Opcode[opcode], allign, offset);
                                } break;
                                case WASM_Opcode.memory_size: {
                                    const x0 = this.u8();
                                    console.log("memory.size", x0);
                                } break;
                                case WASM_Opcode.memory_grow: {
                                    const x0 = this.u8()
                                    console.log("memory.grow", x0);
                                } break;
                                case WASM_Opcode.i32_const: {
                                    const value = this.ivar();
                                    console.log("i32.const", value);
                                } break;
                                case WASM_Opcode.i64_const: {
                                    const value = this.ivar();
                                    console.log("i64.const", value);
                                } break;
                                case WASM_Opcode.f32_const: {
                                    const value = this.f32();
                                    console.log("f32.const", value);
                                } break;
                                case WASM_Opcode.f64_const: {
                                    const value = this.f64();
                                    console.log("f64.const", value);
                                } break;
                                case WASM_Opcode.ref_null: {
                                    const type = this.u8();
                                    console.log("ref.null", RefType[type]);
                                } break;
                                case WASM_Opcode.ref_func: {
                                    const index = this.uvar();
                                    console.log("ref.func", index);
                                } break;
                                default: {
                                    const name = WASM_Opcode[opcode];
                                    if (name === undefined) {
                                        console.log(`unknown opcode ${opcode} at ${inst_count + 8}`);
                                        console.log(new Uint8Array(this.view.buffer, this.cursor, func_end - this.cursor));
                                        break func_loop;
                                    }
                                    console.log(name);
                                }
                            }
                        }
                        this.cursor = func_end;
                    }
                } break;
                case Section_Type.custom: {
                    const type = this.str();
                    console.log(type);
                    console.log([this.str_a(section_end)]);
                    this.debug(section_end);
                } break;
                default: {
                    this.debug(section_end);
                }
            }

            this.cursor = section_end;
        }
        console.log(this.cursor, this.view.byteLength);
    }
}


class Writer {
    private buffer = new DataView(new ArrayBuffer(1024*1024*64));
    private _bytes = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    private cursor = 0;
    private size_stack: number[] =  [];

    size_start() {
        this.cursor += 8;
        this.size_stack.push(this.cursor);
        return this;
    }
    size_end() {
        const start = this.size_stack.pop();
        if (start === undefined) {
            throw new Error("no size end");
        }
        const end = this.cursor;
        const length = end - start;
        this.cursor = start - 8;
        this.uvar(length);
        const new_start = this.cursor;
        this._bytes.copyWithin(new_start, start, end);
        this.cursor += length;
        return this;
    }

    bytes(bytes: ArrayLike<number>) {
        this._bytes.set(bytes, this.cursor);
        this.cursor += bytes.length;
        return this;
    }
    array(bytes: ArrayLike<number>) {
        this.uvar(bytes.length);
        this.bytes(bytes);
        return this;
    }
    u8(x: number) {
        this.buffer.setUint8(this.cursor++, x);
        return this;
    }
    u32(x: number) {
        this.buffer.setUint32(this.cursor, x, true);
        this.cursor += 4;
        return this;
    }
    f32(x: number) {
        this.buffer.setFloat32(this.cursor, x, true);
        return this;
    }
    f64(x: number) {
        this.buffer.setFloat64(this.cursor, x, true);
        return this;
    }
    uvar(x: number) {
        while (x > 127) {
            this.u8((x & 127) | 128);
            x >>>= 7;
        }
        this.u8(x);
        return this;
    }
    ivar(x: number) {
        let more = true;
        const negative = x < 0;
        while (more) {
            let byte = x & 127;
            x >>= 7;
            if ((x === 0 && !(byte & 64)) || (x === -1 && (byte & 64))) {
                more = false
            } else {
                byte |= 128;
            }
            this.u8(byte);
        }
        return this;
    }
    str(str: string) {
        return this.array(text_encoder.encode(str));
    }
    finish() {
        return new DataView(this.buffer.buffer, 0, this.cursor);
    }
}