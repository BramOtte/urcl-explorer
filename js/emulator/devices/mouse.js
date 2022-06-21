import { IO_Port } from "../instructions.js";
export class Mouse {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.lastx = 0;
        this.lasty = 0;
        this.buttons = 0;
        this.oncontext = (e) => {
            if (!e.ctrlKey) {
                e.preventDefault();
            }
        };
        this.onup = (e) => {
            this.buttons = e.buttons;
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        };
        this.ondown = this.onup;
        this.onmove = (e) => {
            if (document.pointerLockElement === null) {
                [this.x, this.y] = this.translate(e.clientX, e.clientY);
            }
            else {
                // This might change in the future
                const { width, height } = this.canvas.getBoundingClientRect();
                this.x += e.movementX * this.canvas.width / width;
                this.y += e.movementY * this.canvas.height / height;
            }
        };
        this.inputs = {
            [IO_Port.MOUSE_X]: () => this.x,
            [IO_Port.MOUSE_Y]: () => this.y,
            [IO_Port.MOUSE_DX]: () => {
                const dx = 0 | this.x - this.lastx;
                this.lastx += dx;
                return dx;
            },
            [IO_Port.MOUSE_DY]: () => {
                const dy = 0 | this.y - this.lasty;
                this.lasty += dy;
                return dy;
            },
            [IO_Port.MOUSE_BUTTONS]: () => this.buttons,
        };
        this.outputs = {};
        addEventListener("mousemove", this.onmove);
        addEventListener("mousedown", this.ondown);
        addEventListener("mouseup", this.onup);
        addEventListener("contextmenu", this.oncontext);
    }
    translate(mousex, mousey) {
        const { x, y, width, height } = this.canvas.getBoundingClientRect();
        return [
            (mousex - x) * this.canvas.width / width,
            (mousey - y) * this.canvas.height / height,
        ];
    }
    cleanup() {
        removeEventListener("mousemove", this.onmove);
        removeEventListener("mouseup", this.onup);
        removeEventListener("mousedown", this.ondown);
        removeEventListener("contextmenu", this.oncontext);
    }
}
//# sourceMappingURL=mouse.js.map