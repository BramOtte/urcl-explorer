import { pad_left, Warning } from "../emulator/util.js";
import { l } from "../l.js";
import { regex_end, Token, tokenize } from "./tokenizer.js";

export class Editor_Window extends HTMLElement {
    private line_nrs: HTMLElement;
    private code: HTMLElement;
    private input: HTMLTextAreaElement;
    private colors: HTMLElement;
    profile_check: HTMLInputElement;
    private profiled: boolean[] = [];
    private profile_present: boolean = false;
    private lines: string[] = [];
    private saved_marker: HTMLOutputElement;
    back_button: HTMLButtonElement;
    forward_button: HTMLButtonElement;


    tab_width = 4
    constructor(){
        super();
        l(this, {}, 
            this.line_nrs = l("div", {className: "line-nrs"}),
            this.code = l("div", {className: "code"},
                this.input = l("textarea", {spellcheck: false}),
                this.colors = l("code", {className: "colors"})
            ),
        );

        this.input.addEventListener("input", () => this.input_cb());
        
        this.input.addEventListener("keydown", this.keydown_cb.bind(this));

        
        this.saved_marker = l("output", {value: "saved"});
        this.forward_button = l("button", {disabled: false}, ">");
        this.back_button = l("button", {disabled: false}, "<");

        
        this.profile_check = l("input", {type: "checkbox"})
        const profile_text = l("span", {}, `Show line-profile`);
        this.parentElement?.insertBefore(l("div", {}, this.back_button, this.forward_button, this.saved_marker, this.profile_check, profile_text), this);

        // this.parentElement?.insertBefore(l("div", {}, this.profile_check, profile_text), this);


        const resize_observer = new ResizeObserver(() => this.render_lines());
        resize_observer.observe(this);


        this.onscroll = () => this.render_lines();
    }

    _errors: string[] = [];
    set_errors(errors: Warning[]) {
        this._errors.length = 0;
        for (const error of errors) {
            this._add_error(error.line_nr, error.message);
        }
        this.render_lines();
    }

    add_error(line_nr: number, msg: string) {
        this._add_error(line_nr, msg);
        this.render_lines();
    } 

    private _add_error(line_nr: number, message: string) {
        if (this._errors[line_nr]) {
            this._errors[line_nr] += "; " + message;
        } else {
            this._errors[line_nr] = "\t" + message;
        } 
    }

    get saved() {
        return this.saved_marker.value == "saved";
    }

    mark_saved() {
        this.saved_marker.value = "saved";
    }
    mark_modified() {
        this.saved_marker.value = "modified";
    }
    set_value_saved(value: string) {
        this.input.value = value;
        this.input_cb(false);
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
    public set_line_profile(pc_to_line: ArrayLike<number>, counts: ArrayLike<number>){
        const length = pc_to_line.length;
        if (!this.profile_check.checked){
            if (!this.profile_present){
                return;
            }
            this.profile_present = false;
        } else {
            this.profile_present = true;
        }
        const children = this.line_nrs.children;
        let last = 0;
        if (this.profile_check.checked){
            for (let pc = 0; pc < length; ++pc){
                const executed = counts[pc];
                const line_nr = pc_to_line[pc];
                for (; last < line_nr; last++){
                    const child = children[last];
                    child.textContent = `${last+1}`;
                }
                last += 1;
                const child = children[line_nr];
                child.textContent = `${executed} ${line_nr+1}`;
            }
        }
            
        for (; last < children.length; ++last) {
            const child = children[last];
            child.textContent = `${last+1}`;
        }
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
    private input_cb(modified = true) {
        if (modified) {
            this.mark_modified();
        } else {
            this.mark_saved();
        }
        this.render_lines();
        this.call_input_listeners();
    }

    private render_lines(){
        this.input.style.height = "0px";
        const height = this.input.scrollHeight
        this.input.style.height = height + "px";
        
        const lines = this.input.value.split("\n");
        this.lines = lines;
        {
            const width = (lines.length+"").length
            const start_lines = this.line_nrs.children.length
            const delta_lines = lines.length - start_lines;
            if (delta_lines > 0){
                for (let i = 0; i < delta_lines; i++){
                    const div = this.line_nrs.appendChild(document.createElement("div"));
                    div.textContent = pad_left(""+(start_lines+i+1), width);
                }
            } else {
                for (let i = 0; i < -delta_lines; i++){
                    this.line_nrs.lastChild?.remove()
                }
            }
        }

        const ch = this.input.scrollHeight / Math.max(1, this.lines.length);
    
        const pixel_start = this.scrollTop;
        const pixel_end = Math.min(pixel_start + this.clientHeight, this.input.scrollHeight);

        const start = Math.floor(pixel_start / ch);
        const end = Math.min(this.lines.length, Math.ceil(pixel_end / ch));

        this.colors.style.top = (start*ch) + "px";


        let div: Element | null = this.colors.firstElementChild;
        for (let i = start; i < end; i++) {
            const line = this.lines[i].replaceAll("\r", "");
            if (div === null) {
                div = document.createElement("div");
                this.colors.appendChild(div);
            }

            div.innerHTML = "";
            let span: Element | null = div.firstElementChild;
            if (line.length == 0) {
                div.innerHTML = "<span> </span>";
            } else {
                const tokens: Token[] = [];
                tokenize(line, 0, tokens);
                for (const {type, start, end} of tokens){
                    if (span === null){
                        span = document.createElement("span");
                        div.appendChild(span);
                    }
                    span.textContent = line.substring(start, end);
                    span.className = type;

                    span = span.nextElementSibling;
                }
                {
                    const error_mesage = this._errors[i];
                    if (span === null){
                        span = document.createElement("span");
                        div.appendChild(span);
                    }
                    span.textContent = error_mesage;
                    span.className = "error-text";

                    span = span.nextElementSibling;

                }
            }

            while (span !== null){
                const next = span.nextElementSibling;
                div.removeChild(span);
                span = next
            }
            div = div.nextElementSibling;
        }

        while (div !== null){
            const next = div.nextElementSibling;
            this.colors.removeChild(div);
            div = next;
        }


        this.input.style.width = "0px";
        this.input.style.width = this.code.scrollWidth + "px";
    }

    private call_input_listeners(){
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
