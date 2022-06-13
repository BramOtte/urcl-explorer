import { IO_Port } from "../instructions.js";
export class Mouse {
    canvas;
    constructor(canvas) {
        this.canvas = canvas;
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
    x = 0;
    y = 0;
    lastx = 0;
    lasty = 0;
    buttons = 0;
    oncontext = (e) => {
        if (!e.ctrlKey) {
            e.preventDefault();
        }
    };
    onup = (e) => {
        this.buttons = e.buttons;
        if (e.target === this.canvas) {
            e.preventDefault();
        }
    };
    ondown = this.onup;
    onmove = (e) => {
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
    cleanup() {
        removeEventListener("mousemove", this.onmove);
        removeEventListener("mouseup", this.onup);
        removeEventListener("mousedown", this.ondown);
    }
    inputs = {
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
    outputs = {};
}
//# sourceMappingURL=mouse.js.map