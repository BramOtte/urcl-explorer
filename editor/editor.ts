import { pad_left, pad_right } from "../emulator/util.js";
import { regex_end, Token, tokenize } from "./tokenizer.js";

export class Editor_Window extends HTMLElement {
    private line_nrs = document.createElement("div")
    private code = document.createElement("div");
    private input = document.createElement("textarea");
    private colors = document.createElement("pre");
    tab_width = 4
    constructor(){
        super();
        this.append(this.line_nrs, this.code);
        this.code.append(this.input, this.colors);

        this.code.style.position = "relative";
        this.code.className = "code";
        this.colors.className = "colors";
        this.line_nrs.className = "line-nrs";
        this.input.addEventListener("input", this.input_cb.bind(this));
        this.input.spellcheck = false;

        this.input.addEventListener("keydown", this.keydown_cb.bind(this));

    }
    get value(){
        return this.input.value;
    }
    set value(value){
        this.input.value = value;
        this.input_cb()
    }
    private pc_line = 0;
    public set_pc_line(line: number){
        const old = this.line_nrs.children[this.pc_line];
        if (old){
            old.classList.remove("pc-line");
        }

        const child = this.line_nrs.children[line];
        if (child){
            child.classList.add("pc-line");
        }
        this.pc_line = line;
    }
    private keydown_cb(event: KeyboardEvent){
        if (event.key === "Tab"){
            event.preventDefault();
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            if (!event.shiftKey && start === end){
                const value = this.input.value;
                const line_offset = start - line_start(value, start);
                const add_count = this.tab_width - (line_offset % this.tab_width) || this.tab_width
                this.input.value = str_splice(value, start, 0, " ".repeat(add_count));
                this.input.selectionStart = this.input.selectionEnd = start + add_count;
            } else {
                let src = this.input.value;
                if (event.shiftKey){
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const delete_count = white_width === 0 ? 0 : white_width % this.tab_width || this.tab_width;
                        if (i < start){start -= delete_count;}
                        end -= delete_count;
                        src = str_splice(src, i, delete_count, "");
                        return src;
                    });
                    this.input.value = src;
                    this.input.selectionStart = start;
                    this.input.selectionEnd = end;
                } else {
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const add_count = this.tab_width - (white_width % this.tab_width) || this.tab_width;
                        if (i < start){start += add_count;}
                        end += add_count;
                        src = str_splice(src, i, 0, " ".repeat(add_count));
                        return src;
                    });
                    this.input.value = src;
                    this.input.selectionStart = start;
                    this.input.selectionEnd = end;
                }
            }
            this.input_cb();
        } else if (event.key === "/" && event.ctrlKey) {
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            let src = this.input.value;
            foreach_line_selected(src, start, end, (i) => {
                const white_end = regex_end(src, i, /^\s*/) ?? i;
                if (regex_end(src, white_end, /^\/\//) === undefined){
                    src = str_splice(src, white_end, 0, "// ");
                    if (i < start){start += 3;}
                    end += 3;
                } else {
                    const delete_count = src[white_end + 2] === " " ? 3 : 2;
                    src = str_splice(src, white_end, delete_count, "");
                    if (i < start){start -= delete_count;}
                    end -= delete_count;
                }
                return src;
            });
            this.input.value = src;
            this.input.selectionStart = start;
            this.input.selectionEnd = end;
            this.input_cb();
        }
    }
    private input_cb(){
        this.input.style.height = "1px";
        const height = this.input.scrollHeight;
        this.input.style.height = `${height}px`;
        this.colors.style.height = `${height}px`;

        const src = this.input.value;
        const lines = line_starts(src);
        const width = (lines.length+"").length
        this.line_nrs.innerHTML = lines.map((_,i) => `<div>${pad_left(""+(i+1), width)}</div>`).join("");

        const tokens: Token[] = [];
        const end = tokenize(src, 0, tokens);
        let span = this.colors.firstElementChild;
        for (const {type, start, end} of tokens){
            if (!span){
                span ??= document.createElement("span");
                this.colors.appendChild(span);
            }
            span.textContent = src.substring(start, end);
            span.className = type;
            span = span.nextElementSibling;
        }
        while (span){
            const next = span.nextElementSibling;
            this.colors.removeChild(span);
            span = next;
        }

        this.input.style.width = `${this.colors.scrollWidth}px`;

        for (const listener of this.input_listeners){
            listener.call(this, new Event("input"));
        }
    }
    private input_listeners: ((this: GlobalEventHandlers, event: Event) => void)[] = [];
    set oninput(cb: (this: GlobalEventHandlers, event: Event) => void){
        this.input_listeners.push(cb);
    }
}
customElements.define("editor-window", Editor_Window);

function line_starts(src: string): number[] {
    const starts: number[] = [];
    for (let i = 0; i >= 0 && i < src.length; i++){
        starts.push(i);
        const next = src.indexOf("\n", i);
        i = next >= i ? next: src.length;
    }
    return starts;
}

function str_splice(string: string, index: number, delete_count: number, insert: string){
    return string.slice(0, index) + insert + string.slice(index + delete_count);
}


function foreach_line_selected(string: string, start: number, end: number, callback: (i: number) => string) {
    const first_line = line_start(string, start);
    let i = string.indexOf("\n", first_line) + 1 || string.length;
    let line_count = 1;
    for (;i < end; i = string.indexOf("\n", i) + 1 || string.length){
        line_count++;
    }
    for (let line = 0, i = first_line; line < line_count; line++){
        string = callback(i);
        i = string.indexOf("\n", i) + 1 || string.length;
    }
    return string;
}

function line_start(string: string, index: number): number {
    let i = 0, line_start = 0;
    for (;i <= index; i = string.indexOf("\n", i) + 1 || string.length){
        line_start = i;
        if (i >= string.length){
            line_start+1;
            break;
        }
    }
    return line_start;
}
