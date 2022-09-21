import { bound, memoryToString } from "../emulator/util.js";
import { l } from "../l.js";
export class BufferView extends HTMLElement {
    content;
    scroll_div;
    char;
    memory = new Uint8Array();
    width = 16;
    constructor() {
        super();
        l(this, {
            style: { whiteSpace: "pre", fontFamily: "monospace", position: "relative", overflow: "auto", display: "block" }
        }, this.content = l("div", { style: { position: "absolute" } }), this.scroll_div = l("div"), this.char = l("div", { style: { position: "absolute", visibility: "hidden" } }, "a"));
        this.onscroll = this.update;
        const observer = new ResizeObserver(() => this.update());
        observer.observe(this);
    }
    update() {
        const ch = this.char.clientHeight;
        const H = Math.ceil(this.memory.length / this.width);
        const height = H * ch;
        this.scroll_div.style.height = `${height}px`;
        const y = Math.floor(this.scrollTop / ch);
        const h = Math.ceil((this.clientHeight + 2) / ch);
        const sy = bound(y, 0, H), ey = bound(y + h, 0, H);
        this.content.style.top = `${sy * ch}px`;
        this.content.innerText = memoryToString(this.memory, sy * this.width, (ey - sy) * this.width, this.memory.BYTES_PER_ELEMENT * 8);
    }
}
customElements.define("buffer-view", BufferView);
//# sourceMappingURL=buffer_view.js.map