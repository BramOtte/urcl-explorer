import { IO_Port } from "../instructions.js";
import { Word } from "../util.js";
import { Device } from "./device.js";

export class Console_IO implements Device {
    constructor(
        public input: {
            read: (callback: ()=>void) => void,
            text: string,
        },
        public write: (value: string) => void,
        private _reset: () => void
    ){
    }
    inputs = {
        [IO_Port.TEXT]: this.text_in,
        [IO_Port.NUMB]: this.numb_in,
    }
    outputs = {
        [IO_Port.TEXT]: this.text_out,
        [IO_Port.NUMB]: this.numb_out,
        [IO_Port.HEX]: (v: number) => this.write(v.toString(16)), 
        [IO_Port.BIN]: (v: number) => this.write(v.toString(2)),
    }
    set_text(text: string){
        this.input.text = text;
    }
    reset(){
        this.input.text = "";
        this._reset();
    }
    text_in(callback: (value: Word) => void): undefined | number {
        if (this.input.text.length === 0){
            this.input.read(()=>{
                const char_code = this.input.text.charCodeAt(0);
                this.input.text = this.input.text.slice(1);
                callback(char_code);
            });
            return undefined
        }
        const char_code = this.input.text.charCodeAt(0);
        this.input.text = this.input.text.slice(1);
        return char_code;
    }
    text_out(value: Word): void {
        this.write(String.fromCharCode(value));
    }
    numb_in(callback: (value: Word) => void): undefined | number {
        if (this.input.text.length !== 0){
            const num = parseInt(this.input.text);
            if (Number.isInteger(num)){
                this.input.text = this.input.text.trimStart().slice(num.toString().length);
                console.log(num)
                return num;
            }
        }
        this.input.read(()=>{
            const num = this.numb_in(callback);
            if (num !== undefined){
                callback(num);
            }
        });
    }
    numb_out(value: Word): void {
        this.write(""+value);
    }
}
