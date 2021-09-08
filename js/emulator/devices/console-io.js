export class Console_IO {
    input;
    write;
    constructor(input, write) {
        this.input = input;
        this.write = write;
    }
    async read() {
        return new Promise((res) => {
            this.input.read(() => {
                res();
            });
        });
    }
    async text_in() {
        if (this.input.text) {
            await this.read();
        }
        const char_code = this.input.text.charCodeAt(0);
        return char_code;
    }
    text_out(value) {
        this.write(String.fromCharCode(value));
    }
    async numb_in() {
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