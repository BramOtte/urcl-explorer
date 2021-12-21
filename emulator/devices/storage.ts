import { IO_Port } from "../instructions.js";
import { Device, Device_Reset } from "./device.js";

export class Storage implements Device {
    constructor(public bits: number, data: ArrayBufferView){
        switch (bits){
            case 8: {
                this.address_mask = 0xff;
                this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
            } break;
            case 16: {
                this.address_mask = 0xffff;
                this.data = new Uint16Array(data.buffer, data.byteOffset, 0|data.byteLength/2);
            } break;
            case 32: {
                this.address_mask = 0xffffffff;
                this.data = new Uint32Array(data.buffer, data.byteOffset, 0|data.byteLength/4);
            } break;
            default: throw new Error(`${bits} is not a supported word length for a Storage device`);
        }
    }
    public get_bytes(){
        return new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
    }
    inputs = {
        [IO_Port.ADDR]: this.address_in,
        [IO_Port.PAGE]: this.page_in,
        [IO_Port.BUS]: this.bus_in,
    }
    outputs = {
        [IO_Port.ADDR]: this.address_out,
        [IO_Port.PAGE]: this.page_out,
        [IO_Port.BUS]: this.bus_out,
    }
    private data;
    private address_mask;
    private address = 0;
    address_out(v: number){
        this.address = (this.address & ~this.address_mask) | v;
    }
    address_in(): number {
        return this.address;
    }
    page_out(v: number){
        this.address = (this.address & this.address_mask) | (v << this.bits);
    }
    page_in(): number {
        return this.address >>> this.bits;
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
        console.log("storage reset");
    }
}
