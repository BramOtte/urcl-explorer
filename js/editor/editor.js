import { pad_left } from "../emulator/util.js";
import { l } from "../l.js";
import { regex_end, tokenize } from "./tokenizer.js";
export class Editor_Window extends HTMLElement {
    line_nrs;
    code;
    input;
    colors;
    profile_check = document.createElement("input");
    profiled = [];
    profile_present = false;
    lines = [];
    tab_width = 4;
    constructor() {
        super();
        l(this, {}, this.line_nrs = l("div", { className: "line-nrs" }), this.code = l("div", { className: "code" }, this.input = l("textarea", { spellcheck: false }), this.colors = l("code", { className: "colors" })));
        this.input.addEventListener("input", this.input_cb.bind(this));
        this.input.addEventListener("keydown", this.keydown_cb.bind(this));
        this.profile_check.type = "checkbox";
        const profile_text = document.createElement("span");
        this.parentElement?.insertBefore(this.profile_check, this);
        profile_text.textContent = `Show line-profile`;
        this.parentElement?.insertBefore(profile_text, this);
        const resize_observer = new ResizeObserver(() => this.render_lines());
        resize_observer.observe(this);
        this.onscroll = () => this.render_lines();
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
        this.input_cb();
    }
    pc_line = 0;
    set_pc_line(line) {
        const old = this.line_nrs.children[this.pc_line];
        if (old) {
            old.classList.remove("pc-line");
        }
        const child = this.line_nrs.children[line];
        if (child) {
            child.classList.add("pc-line");
        }
        this.pc_line = line;
    }
    set_line_profile(counts) {
        if (!this.profile_check.checked) {
            if (!this.profile_present) {
                return;
            }
            this.profile_present = false;
        }
        const children = this.line_nrs.children;
        let last = 0;
        for (const [line_nr, executed] of counts) {
            for (; last < line_nr; last++) {
                if (this.profiled[last]) {
                    const child = children[line_nr];
                    child.textContent = `${last + 1}`;
                }
            }
            if (this.profile_check.checked) {
                const child = children[line_nr];
                child.textContent = `${executed} ${line_nr + 1}`;
            }
        }
    }
    keydown_cb(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            if (!event.shiftKey && start === end) {
                const value = this.input.value;
                const line_offset = start - line_start(value, start);
                const add_count = this.tab_width - (line_offset % this.tab_width) || this.tab_width;
                this.input.value = str_splice(value, start, 0, " ".repeat(add_count));
                this.input.selectionStart = this.input.selectionEnd = start + add_count;
            }
            else {
                let src = this.input.value;
                if (event.shiftKey) {
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const delete_count = white_width === 0 ? 0 : white_width % this.tab_width || this.tab_width;
                        if (i < start) {
                            start -= delete_count;
                        }
                        end -= delete_count;
                        src = str_splice(src, i, delete_count, "");
                        return src;
                    });
                    this.input.value = src;
                    this.input.selectionStart = start;
                    this.input.selectionEnd = end;
                }
                else {
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const add_count = this.tab_width - (white_width % this.tab_width) || this.tab_width;
                        if (i < start) {
                            start += add_count;
                        }
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
        }
        else if (event.key === "/" && event.ctrlKey) {
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            let src = this.input.value;
            foreach_line_selected(src, start, end, (i) => {
                const white_end = regex_end(src, i, /^\s*/) ?? i;
                if (regex_end(src, white_end, /^\/\//) === undefined) {
                    src = str_splice(src, white_end, 0, "// ");
                    if (i < start) {
                        start += 3;
                    }
                    end += 3;
                }
                else {
                    const delete_count = src[white_end + 2] === " " ? 3 : 2;
                    src = str_splice(src, white_end, delete_count, "");
                    if (i < start) {
                        start -= delete_count;
                    }
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
    input_cb() {
        this.render_lines();
        this.call_input_listeners();
    }
    render_lines() {
        this.input.style.height = "0px";
        const height = this.input.scrollHeight;
        this.input.style.height = height + "px";
        this.input.style.width = "0px";
        this.input.style.width = this.input.scrollWidth + "px";
        const lines = this.input.value.split("\n");
        this.lines = lines;
        {
            const width = (lines.length + "").length;
            const start_lines = this.line_nrs.children.length;
            const delta_lines = lines.length - start_lines;
            if (delta_lines > 0) {
                for (let i = 0; i < delta_lines; i++) {
                    const div = this.line_nrs.appendChild(document.createElement("div"));
                    div.textContent = pad_left("" + (start_lines + i + 1), width);
                }
            }
            else {
                for (let i = 0; i < -delta_lines; i++) {
                    this.line_nrs.lastChild?.remove();
                }
            }
        }
        const ch = this.input.scrollHeight / Math.max(1, this.lines.length);
        const pixel_start = this.scrollTop;
        const pixel_end = Math.min(pixel_start + this.clientHeight, this.input.scrollHeight);
        const start = Math.floor(pixel_start / ch);
        const end = Math.min(this.lines.length, Math.ceil(pixel_end / ch));
        this.colors.style.top = (start * ch) + "px";
        let div = this.colors.firstElementChild;
        for (let i = start; i < end; i++) {
            const line = this.lines[i].replaceAll("\r", "");
            if (div === null) {
                div = document.createElement("div");
                this.colors.appendChild(div);
            }
            div.innerHTML = "";
            let span = div.firstElementChild;
            if (line.length == 0) {
                div.innerHTML = "<span> </span>";
            }
            else {
                const tokens = [];
                tokenize(line, 0, tokens);
                for (const { type, start, end } of tokens) {
                    if (span === null) {
                        span = document.createElement("span");
                        div.appendChild(span);
                    }
                    span.textContent = line.substring(start, end);
                    span.className = type;
                    span = span.nextElementSibling;
                }
            }
            while (span !== null) {
                const next = span.nextElementSibling;
                div.removeChild(span);
                span = next;
            }
            div = div.nextElementSibling;
        }
        while (div !== null) {
            const next = div.nextElementSibling;
            this.colors.removeChild(div);
            div = next;
        }
    }
    call_input_listeners() {
        for (const listener of this.input_listeners) {
            listener.call(this, new Event("input"));
        }
    }
    input_listeners = [];
    set oninput(cb) {
        this.input_listeners.push(cb);
    }
}
customElements.define("editor-window", Editor_Window);
function str_splice(string, index, delete_count, insert) {
    return string.slice(0, index) + insert + string.slice(index + delete_count);
}
function foreach_line_selected(string, start, end, callback) {
    const first_line = line_start(string, start);
    let i = string.indexOf("\n", first_line) + 1 || string.length;
    let line_count = 1;
    for (; i < end; i = string.indexOf("\n", i) + 1 || string.length) {
        line_count++;
    }
    for (let line = 0, i = first_line; line < line_count; line++) {
        string = callback(i);
        i = string.indexOf("\n", i) + 1 || string.length;
    }
    return string;
}
function line_start(string, index) {
    let i = 0, line_start = 0;
    for (; i <= index; i = string.indexOf("\n", i) + 1 || string.length) {
        line_start = i;
        if (i >= string.length) {
            line_start + 1;
            break;
        }
    }
    return line_start;
}
//# sourceMappingURL=editor.js.map