import fetch from "node-fetch";
import { compile } from "../../emulator/compiler.js";
import { Console_IO } from "../../emulator/devices/console-io.js";
import { Emulator, Step_Result } from "../../emulator/emulator.js";
import { parse } from "../../emulator/parser.js";
import { expand_warnings, registers_to_string } from "../../emulator/util.js";
import { parse_argv } from "../args.js";
import Canvas from "canvas";
import { Color_Mode, Display } from "../../emulator/devices/display.js";
import { URCL_Header } from "../../emulator/instructions.js";
const emus = new Map();
function get_emu(id) {
    let emu = emus.get(id);
    if (!emu) {
        emu = discord_emu();
        emus.set(id, emu);
    }
    return emu;
}
export function emu_start(id, argv, source) {
    const emu = get_emu(id);
    return emu.start(argv, source);
}
export function emu_reply(id, msg) {
    const emu = get_emu(id);
    return emu.reply(msg);
}
export function emu_stop(id) {
    let emu = emus.get(id);
    if (!emu) {
        return "There is not emulator running for this channel";
    }
    return emu.stop();
}
const max_time = 1000;
function discord_emu() {
    let state = Step_Result.Halt;
    let busy = false;
    let stdout = "";
    let std_info = "";
    let text_cb;
    let scale = 1;
    let rendered_count = 0;
    let quality = 10;
    const emulator = new Emulator({ on_continue, warn: (str) => std_info += str + "\n" });
    let display = new Display(Canvas.createCanvas(1, 1).getContext("2d"), 8, Color_Mode.PICO8, true);
    const console_io = new Console_IO({
        read(callback) {
            text_cb = callback;
        },
        text: "",
    }, (text) => { stdout += text; }, () => { });
    emulator.add_io_device(console_io);
    const pub = { start, stop, reply };
    return pub;
    function on_continue() {
        try {
            const res = emulator.run(max_time);
            state = res;
            switch (res) {
                case Step_Result.Continue:
                    {
                        std_info += `\nProgram took more than ${max_time}ms and is paused.\n`
                            + "Continue the program by sending a ?";
                    }
                    break;
                case Step_Result.Input:
                    {
                        std_info += "\nSend a message starting with ? to input\n";
                    }
                    break;
                case Step_Result.Halt:
                    {
                        std_info += "\nProgram Halted!\n";
                    }
                    break;
                default: {
                    state = Step_Result.Halt;
                    throw new Error("\nunknown step result");
                }
            }
        }
        catch (e) {
            std_info += `[ERROR]: ${e}`;
            state = Step_Result.Halt;
        }
        std_info += "\nregisters:\n" + registers_to_string(emulator);
    }
    function o() {
        const out = stdout;
        const info = std_info;
        const all_screens = display.buffers.slice();
        const screens = all_screens.slice(rendered_count);
        stdout = "";
        std_info = "";
        rendered_count = all_screens.length;
        return { out, info, screens, all_screens, scale, state, quality };
    }
    function start(argv, source) {
        if (busy) {
            std_info += "Emulator is still busy loading the previous program";
            return o();
        }
        busy = true;
        const res = _start(argv, source);
        res.then(() => busy = false).catch(() => busy = false);
        return res;
    }
    async function _start(argv, source) {
        try {
            stdout = "";
            const { args, flags: { __width, __height, __color, __scale, __quality } } = parse_argv(["", ...argv], {
                __storage: "",
                __storage_size: 0,
                __width: 32,
                __height: 32,
                __color: { val: Color_Mode.PICO8, in: Color_Mode },
                __scale: 1,
                __quality: 10,
            });
            scale = __scale;
            quality = __quality;
            const file_name = args[0];
            let s_name;
            if (!(source?.length)) {
                if (file_name === undefined) {
                    std_info += `ERROR: no source specified`;
                    return o();
                }
                source = await (await fetch(file_name)).text();
                s_name = file_name.split("/").at(-1);
            }
            const code = parse(source);
            if (code.errors.length > 0) {
                std_info += "ERRORS:\n"
                    + expand_warnings(code.errors, code.lines, s_name)
                    + "\n------------------------------\n";
            }
            if (code.warnings.length > 0) {
                std_info += "warnings:\n"
                    + expand_warnings(code.warnings, code.lines, s_name);
                +"\n------------------------------\n";
            }
            if (code.errors.length > 0) {
                return o();
            }
            const [program, debug_info] = compile(code);
            emulator.load_program(program, debug_info);
            const canvas = Canvas.createCanvas(__width, __height);
            const ctx = canvas.getContext("2d", { alpha: false });
            display = new Display(ctx, program.headers[URCL_Header.BITS].value, __color.val, true);
            emulator.add_io_device(display);
            state = Step_Result.Continue;
            on_continue();
            return o();
        }
        catch (e) {
            std_info += `\nERROR: ${e}`;
            return o();
        }
    }
    function reply(msg) {
        try {
            if (state === Step_Result.Halt) {
                std_info += `No Program running`;
                return o();
            }
            if (!text_cb) {
                std_info += "Continuing program without adding input";
                on_continue();
                return o();
            }
            console_io.input.text += msg;
            const cb = text_cb;
            text_cb = undefined;
            cb();
            return o();
        }
        catch (e) {
            std_info += `\nERROR: ${e}`;
            return o();
        }
    }
    function stop() {
        return "not implemented";
    }
}
//# sourceMappingURL=bot-emu.js.map