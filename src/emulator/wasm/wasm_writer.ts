const text_encoder = new TextEncoder();

export class WASM_Writer {
    private buffer = new DataView(new ArrayBuffer(1024*1024*64));
    private _bytes = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    private cursor = 0;
    private size_stack: number[] =  [];

    memory_arg(allign: number, offset: number) {
        return this.uvar(allign).uvar(offset);
    }

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
        return new Uint8Array(this.buffer.buffer, 0, this.cursor);
    }
}