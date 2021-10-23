import { tokenize } from "./tokenizer.js";
export class Editor_Window extends HTMLElement {
    line_nrs = document.createElement("div");
    code = document.createElement("div");
    input = document.createElement("textarea");
    colors = document.createElement("pre");
    constructor() {
        super();
        this.append(this.line_nrs, this.code);
        this.code.append(this.input, this.colors);
        this.code.style.position = "relative";
        this.code.className = "code";
        this.colors.className = "colors";
        this.line_nrs.className = "line-nrs";
        this.input.addEventListener("input", this.input_cb.bind(this));
        this.input.spellcheck = false;
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
        this.input_cb();
    }
    input_cb() {
        this.input.style.height = "1px";
        const height = this.input.scrollHeight;
        this.input.style.height = `${height}px`;
        this.colors.style.height = `${height}px`;
        const src = this.input.value;
        const lines = line_starts(src);
        this.line_nrs.innerText = lines.map((_, i) => i).join("\n");
        const tokens = [];
        const end = tokenize(src, 0, tokens);
        console.log(end, tokens);
        let span = this.colors.firstElementChild;
        for (const { type, start, end } of tokens) {
            if (!span) {
                span ??= document.createElement("span");
                this.colors.appendChild(span);
            }
            span.textContent = src.substring(start, end);
            span.className = type;
            span = span.nextElementSibling;
        }
        while (span) {
            const next = span.nextElementSibling;
            this.colors.removeChild(span);
            span = next;
        }
    }
    set oninput(cb) {
        this.input.oninput = cb;
    }
}
customElements.define("editor-window", Editor_Window);
function line_starts(src) {
    const starts = [];
    for (let i = 0; i >= 0 && i < src.length; i++) {
        starts.push(i);
        const next = src.indexOf("\n", i);
        i = next >= i ? next : src.length;
    }
    return starts;
}
//# sourceMappingURL=editor.js.map