import { IO_Port } from "../instructions.js";
import { read16, read32, write16, write32 } from "../util.js";
import { Device, Device_Input, Device_Output } from "./device.js";

export class Storage implements Device {
    constructor(public bits: number, private little_endian: boolean, private size: number){
    }
    public set_bytes(data: Uint8Array){
        const {bits, size, little_endian} = this;
        switch (bits){
            case 8: {
                this.address_mask = 0xff;
                this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
                if (size > this.data.length){
                    const old = this.data;
                    this.data = new Uint8Array(size);
                    this.data.set(old);
                }
            } break;
            case 16: {
                this.address_mask = 0xffff;
                this.data = read16(data, little_endian, size);
            } break;
            case 32: {
                this.address_mask = 0xffffffff;
                this.data = read32(data, little_endian, size);
            } break;
            default: throw new Error(`${bits} is not a supported word length for a Storage device`);
        }
    }
    public get word_count() {
        return this.data.length;
    }

    public get_bytes(){
        if (this.data instanceof Uint8Array){
            return new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
        } else if (this.data instanceof Uint16Array){
            return write16(this.data, this.little_endian);
        } else if (this.data instanceof Uint32Array){
            return write32(this.data, this.little_endian);
        } else {
            throw new Error(`${this.bits} is not a supported word length for a Storage device`);
        }
    }
    inputs: {[K in IO_Port]?: Device_Input} = {
        [IO_Port.ADDR]: this.address_in,
        [IO_Port.PAGE]: this.page_in,
        [IO_Port.BUS]: this.bus_in,
    }
    outputs: {[K in IO_Port]?: Device_Output} = {
        [IO_Port.ADDR]: this.address_out,
        [IO_Port.PAGE]: this.page_out,
        [IO_Port.BUS]: this.bus_out,
    }
    private data!: Uint8Array | Uint16Array | Uint32Array;
    private address_mask!: number;
    private address = 0;
    address_out(v: number){
        this.address = (this.address & ~this.address_mask) | v;
    }
    address_in(): number {
        return Math.min(2**this.bits, this.data.length - (this.address & ~this.address_mask));
    }
    page_out(v: number){
        this.address = (this.address & this.address_mask) | (v << this.bits);
    }
    page_in(): number {
        return Math.ceil(this.data.length / (2 ** this.bits));
    }
    bus_out(v: number){
        if (this.address > this.data.length){
            throw Error(`Storage address out of bounds ${this.address} > ${this.data.length}`);
        }
        this.data[this.address] = v;
    }
    bus_in(): number{
        if (this.address > this.data.length){
            throw Error(`Storage address out of bounds ${this.address} > ${this.data.length}`);
        }
        return this.data[this.address];
    }
    reset(){
        // console.log("storage reset");
    }
}
