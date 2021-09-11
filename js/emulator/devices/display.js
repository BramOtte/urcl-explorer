export class Display {
    bits;
    ctx;
    image;
    ints;
    buffer = 0;
    x = 0;
    y = 0;
    constructor(canvas, width, height, bits) {
        this.bits = bits;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("unable to get 2d rendering context");
        }
        canvas.width = width;
        canvas.height = height;
        this.ctx = ctx;
        this.image = ctx.createImageData(width, height);
        const data = this.image.data;
        this.ints = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    }
    resize(width, height) {
        this.image = this.ctx.getImageData(0, 0, width, height);
        const data = this.image.data;
        this.ints = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT);
        this.width = width;
        this.height = height;
        this.ctx.putImageData(this.image, 0, 0);
    }
    x_in() {
        return this.width;
    }
    y_in() {
        return this.height;
    }
    x_out(value) {
        this.x = value;
        console.log(value);
    }
    y_out(value) {
        this.y = value;
    }
    color_in() {
        if (!this.in_bounce(this.x, this.y)) {
            return 0;
        }
        return this.full_to_short(this.ints[this.x + this.y * this.width]);
    }
    // bbbgggrr
    // bbbbbggggggrrrrr
    // bbbbbbbbggggggggrrrrrrrr????????
    color_out(color) {
        if (!this.in_bounce(this.x, this.y)) {
            return;
        }
        this.ints[this.x + this.y * this.width] = this.short_to_full(color);
        if (!this.buffer) {
            this.ctx.putImageData(this.image, 0, 0);
        }
    }
    in_bounce(x, y) {
        return x >= 0 && x < this.width
            && y >= 0 && y < this.height;
    }
    get used_bits() {
        return Math.min(this.bits, 24);
    }
    short_to_full(short) {
        const red_bits = 0 | this.used_bits / 3;
        const red_mask = (1 << red_bits) - 1;
        const blue_bits = 0 | (this.used_bits - red_bits) / 2;
        const blue_mask = (1 << blue_bits) - 1;
        const green_bits = this.used_bits - red_bits - blue_bits;
        const green_mask = (1 << green_bits) - 1;
        const green_offset = red_bits;
        const blue_offset = green_offset + green_bits;
        return ((short & red_mask) * 255 / red_mask)
            | ((((short >>> green_offset) & green_mask) * 255 / green_mask) << 8)
            | ((((short >>> blue_offset) & blue_mask) * 255 / blue_mask) << 16)
            | 0xff_00_00_00;
    }
    full_to_short(full) {
        const red_bits = 0 | this.used_bits / 3;
        const red_mask = (1 << red_bits) - 1;
        const blue_bits = 0 | (this.used_bits - red_bits) / 2;
        const blue_mask = (1 << blue_bits) - 1;
        const green_bits = this.used_bits - red_bits - blue_bits;
        const green_mask = (1 << green_bits) - 1;
        const green_offset = red_bits;
        const blue_offset = green_offset + green_bits;
        return (full & red_mask)
            | (((full >>> 8) & green_mask) << green_offset)
            | (((full >>> 16) & blue_mask) << blue_offset);
    }
    get width() {
        return this.ctx.canvas.width;
    }
    set width(value) {
        this.ctx.canvas.width = value;
    }
    get height() {
        return this.ctx.canvas.height;
    }
    set height(value) {
        this.ctx.canvas.height = value;
    }
}
//# sourceMappingURL=display.js.map