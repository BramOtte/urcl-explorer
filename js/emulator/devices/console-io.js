import { IO_Port } from "../instructions.js";
export class Console_IO {
    input;
    write;
    _reset;
    constructor(input, write, _reset) {
        this.input = input;
        this.write = write;
        this._reset = _reset;
    }
    inputs = {
        [IO_Port.TEXT]: this.text_in,
        [IO_Port.NUMB]: this.numb_in,
    };
    outputs = {
        [IO_Port.TEXT]: this.text_out,
        [IO_Port.NUMB]: this.numb_out,
    };
    set_text(text) {
        this.input.text = text;
    }
    reset() {
        this.input.text = "";
        this._reset();
    }
    async read() {
        return new Promise((res) => {
            this.input.read(() => {
                res();
            });
        });
    }
    text_in(callback) {
        if (this.input.text.length === 0) {
            this.read().then(() => {
                const char_code = this.input.text.charCodeAt(0);
                this.input.text = this.input.text.slice(1);
                callback(char_code);
            });
            return undefined;
        }
        const char_code = this.input.text.charCodeAt(0);
        this.input.text = this.input.text.slice(1);
        return char_code;
    }
    text_out(value) {
        this.write(String.fromCharCode(value));
    }
    numb_in(callback) {
        if (this.input.text) {
            const num = parseInt(this.input.text);
            if (Number.isInteger(num)) {
                this.input.text = this.input.text.trimStart().slice(num.toString().length);
                return num;
            }
        }
        this._numb_in().then((value) => callback(value));
        return undefined;
    }
    async _numb_in() {
        let num = NaN;
        while (Number.isNaN(num)) {
            await this.read();
            num = parseInt(this.input.text);
        }
        this.input.text = this.input.text.trimStart().slice(num.toString().length);
        return num;
    }
    numb_out(value) {
        this.write("" + value);
    }
}
//# sourceMappingURL=console-io.js.map