import { Step_Result } from "./emulator.js";
import { IO_Port, Opcode, Opcodes_operants, Operant_Operation, Operant_Prim, Register, register_count, URCL_Header } from "./instructions.js";
const { SET, GET, GET_RAM: GAM, SET_RAM: SAM, RAM_OFFSET: RAO } = Operant_Operation;
export class Emu {
    m_set(a, v) {
        this.memory[a] = v;
    }
    m_get(a) {
        return this.memory[a];
    }
    push(value) {
        this.memory[--this.stack_pointer] = value;
    }
    pop() {
        return this.memory[this.stack_pointer++];
    }
    warn(msg) {
        console.warn(msg);
    }
    error(msg) {
        throw new Error(msg);
    }
    registers;
    registers_s;
    memory;
    step;
    pc = 0;
    bits;
    max_value;
    max_signed;
    sign_bit;
    get stack_pointer() {
        return this.registers[Register.SP];
    }
    set stack_pointer(value) {
        this.registers[Register.SP] = value;
    }
    program;
    load_program(program, debug_info) {
        this.program = program;
        const reg_count = program.headers[URCL_Header.MINREG].value + register_count;
        const static_data = program.data;
        const heap = program.headers[URCL_Header.MINHEAP].value;
        const stack = program.headers[URCL_Header.MINSTACK].value;
        this.bits = program.headers[URCL_Header.BITS].value;
        this.max_value = 0xffff_ffff >>> (32 - this.bits);
        this.max_signed = this.max_value >>> 1;
        this.sign_bit = 1 << (this.bits - 1);
        let UintArray;
        let IntArray;
        switch (this.bits) {
            case 8:
                UintArray = Uint8Array;
                IntArray = Int8Array;
                break;
            case 16:
                UintArray = Uint16Array;
                IntArray = Int16Array;
                break;
            case 32:
                UintArray = Uint32Array;
                IntArray = Int32Array;
                break;
            default: throw new Error(">:(");
        }
        this.registers = new UintArray(reg_count);
        this.registers_s = new IntArray(this.registers.buffer);
        const memory_size = heap + stack + static_data.length;
        this.memory = new UintArray(memory_size);
        this.memory.set(static_data);
        console.log(program);
        let src = "switch(this.pc) {\n";
        for (let i = 0; i < program.opcodes.length; i++) {
            const opcode = program.opcodes[i];
            const [operations, alu] = Opcodes_operants[opcode];
            let inst = alu.toString();
            const start = inst.indexOf("=>") + 2;
            inst = inst.substring(start);
            const prims = program.operant_prims[i];
            const values = program.operant_values[i];
            for (let j = 0; j < values.length; j++) {
                const letter = "abc"[j];
                const prim = prims[j];
                const value = values[j];
                console.log("->", prim, value);
                // TODO: make sure signed and unsigned values are always handled properly
                if (prim === Operant_Prim.Imm) {
                    inst = inst
                        .replaceAll(`s.${letter}`, `${value}`)
                        .replaceAll(`s.s${letter}`, `${value}`);
                }
                else {
                    inst = inst
                        .replaceAll(`s.${letter}`, `s.registers[${value}]`)
                        .replaceAll(`s.s${letter}`, `s.registers_s[${value}]`);
                }
            }
            inst = inst.replaceAll("s.", "this.");
            if (inst.includes("pc")) {
                inst = `this.pc = ${i + 1};\n${inst}`;
                inst += `\nreturn ${Step_Result.Continue};\n`;
            }
            src += `case ${i}: // ${Opcode[opcode]}\n${inst}\n`;
        }
        src += `}\nreturn ${Step_Result.Halt}`;
        console.log(src);
        this.step = new Function(src);
    }
    burst(length, max_duration) {
        const start_length = length;
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        for (; length >= burst_length; length -= burst_length) {
            for (let i = 0; i < burst_length; i++) {
                const res = this.step();
                if (res !== Step_Result.Continue) {
                    return [res, start_length - length + i + 1];
                }
            }
            if (performance.now() > end) {
                return [Step_Result.Continue, start_length - length + burst_length];
            }
        }
        for (let i = 0; i < length; i++) {
            const res = this.step();
            if (res !== Step_Result.Continue) {
                return [res, start_length - length + i + 1];
            }
        }
        return [Step_Result.Continue, start_length];
    }
    run(max_duration) {
        const burst_length = 1024;
        const end = performance.now() + max_duration;
        let j = 0;
        do {
            for (let i = 0; i < burst_length; i++) {
                const res = this.step();
                if (res !== Step_Result.Continue) {
                    return [res, j + i + 1];
                }
            }
            j += burst_length;
        } while (performance.now() < end);
        return [Step_Result.Continue, j];
    }
    device_inputs = {};
    device_outputs = {};
    device_resets = [];
    devices = [];
    add_io_device(device) {
        this.devices.push(device);
        if (device.inputs) {
            for (const port in device.inputs) {
                const input = device.inputs[port];
                this.device_inputs[port] = input.bind(device);
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
    ins = [];
    outs = [];
    in(port) {
        throw new Error(">:(");
    }
    supported = 0;
    out(port, value) {
        try {
            const device = this.device_outputs[port];
            if (device === undefined) {
                if (port === IO_Port.SUPPORTED) {
                    this.supported = value;
                    return;
                }
                if (this.outs[port] === undefined) {
                    this.warn(`unsupported output device port ${port} (${IO_Port[port]}) value=0x${value.toString(16)}`);
                    this.outs[port] = value;
                }
                return;
            }
            device(value);
        }
        catch (e) {
            this.error("" + e);
        }
    }
    // not used
    a;
    b;
    c;
    sa;
    sb;
    sc;
}
//# sourceMappingURL=to_js.js.map