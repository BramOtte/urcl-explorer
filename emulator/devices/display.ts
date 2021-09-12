export enum Color_Mode {
    RGB, Mono, Bin
}

export class Display {
    private ctx: CanvasRenderingContext2D
    private image: ImageData;
    private get data(){
        return this.image.data;
    }
    private buffer_enabled: 1 | 0 = 0;
    private x = 0;
    private y = 0;
    reset(){
        this.x = 0;
        this.y = 0;
        this.clear();
        this.buffer_enabled = 0;
    }
    
    constructor (
        canvas: HTMLCanvasElement,
        width: number,
        height: number,
        public bits: number,
        private _color_mode = Color_Mode.Bin
    ){
        const ctx = canvas.getContext("2d");
        if (!ctx){throw new Error("unable to get 2d rendering context");}
        canvas.width = width; canvas.height = height;
        this.ctx = ctx;
        this.image = ctx.createImageData(width, height);
    }
    resize(width: number, height: number){
        this.image = this.ctx.getImageData(0, 0, width, height);
        this.width = width; this.height = height;
        this.ctx.putImageData(this.image, 0, 0);
    }
    clear() {
        for (let i = 0; i < this.data.length; i+=4){
            this.data[i] = 0x00;
            this.data[i+1] = 0x00;
            this.data[i+2] = 0x00;
            this.data[i+3] = 0xff;
        }
    }
    set color_mode(mode: Color_Mode){
        const displayed = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = displayed.data;
        for (let i = 0; i < data.length; i+=4){
            const [r, g, b] = this.short_to_full(this.full_to_short(data[i], data[i+1], data[i+2]), mode);
            data[i] = r;
            data[i+1] = g;
            data[i+2] = b;
            data[i+3] = 0xff;
        }
        this._color_mode = mode;
    }
    x_in(){
        return this.width;
    }
    y_in(){
        return this.height;
    }

    x_out(value: number){
        this.x = value;
    }
    y_out(value: number){
        this.y = value;
    }
    color_in(){
        if (!this.in_bounds(this.x, this.y)){
            return 0;
        }
        const i = (this.x + this.y * this.width) * 4;
        return this.full_to_short(this.data[i], this.data[i+1], this.data[i+2]);
    }
    // rrrgggbb
    // rrrrrggggggbbbbb
    // rrrrrrrrggggggggbbbbbbbb
    color_out(color: number){
        if (!this.in_bounds(this.x, this.y)){
            return;
        }
        const i = (this.x + this.y * this.width) * 4;
        this.data.set(this.short_to_full(color), i);
        if (!this.buffer_enabled){
            this.ctx.putImageData(this.image, 0, 0);
        }
    }
    buffer_in(): number {
        return this.buffer_enabled;
    }
    buffer_out(value: number){
        switch (value){
            case 0: {
                this.ctx.putImageData(this.image, 0, 0);
                this.clear();
                this.buffer_enabled = 0;
            }; break;
            case 1: {
                this.buffer_enabled = 1;
            } break;
            case 2: {
                this.ctx.putImageData(this.image, 0, 0);
            } break;
        }
    }


    private in_bounds(x: number, y: number){
        return x >= 0 && x < this.width
            && y >= 0 && y < this.height;
    }
    private get used_bits(){
        return Math.min(this.bits, 24);
    }
    private short_to_full(short: number, color_mode = this._color_mode): [r: number, g: number, b: number]{
        switch (color_mode){
        case Color_Mode.RGB: {
            const blue_bits = 0| this.used_bits / 3;
            const blue_mask = (1 << blue_bits) - 1;
            const red_bits = 0| (this.used_bits - blue_bits) / 2;
            const red_mask = (1 << red_bits) - 1;
            const green_bits = this.used_bits - blue_bits - red_bits;
            const green_mask = (1 << green_bits) - 1;
            
            const green_offset = blue_bits;
            const red_offset = green_offset + green_bits;
            return [
                ((short >>> red_offset   ) & red_mask) * 255 / red_mask,
                ((short >>> green_offset ) & green_mask) * 255 / green_mask,
                ((short                  ) & blue_mask) * 255 / blue_mask,
            ];
        }
        case Color_Mode.Mono: {
            return [short, short, short];
        }
        case Color_Mode.Bin: {
            const value = short > 0 ? 0xff : 0;
            return [value, value, value];
        }
        default: return [0xff, 0x00, 0xff];
        }
    }
    private full_to_short(r: number, g: number, b: number): number {
        switch (this._color_mode){
        case Color_Mode.RGB: {
            const blue_bits = 0| this.used_bits / 3;
            const blue_mask = (1 << blue_bits) - 1;
            const red_bits = 0| (this.used_bits - blue_bits) / 2;
            const red_mask = (1 << red_bits) - 1;
            const green_bits = this.used_bits - blue_bits - red_bits;
            const green_mask = (1 << green_bits) - 1;
            
            const green_offset = blue_bits;
            const red_offset = green_offset + green_bits;
            return (((r * red_mask / 255)  & red_mask) << red_offset) 
                | (((g * green_mask / 255) & green_mask) << green_offset)
                | ((b * blue_mask / 255) & blue_mask);
        }
        case Color_Mode.Mono: {
            return 0| g * ((1 << this.bits)-1) / ((1 << 24)-1);
        }
        case Color_Mode.Bin: {
            return g > 0 ? 1 : 0;
        }
        default: return 0;
        }
    }

    get width(){
        return this.ctx.canvas.width;
    }
    private set width(value: number){
        this.ctx.canvas.width = value;
    }
    get height(){
        return this.ctx.canvas.height;
    }
    private set height(value: number){
        this.ctx.canvas.height = value;
    }
}
