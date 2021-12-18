import { Console_IO } from "../emulator/devices/console-io.js";
import { Emulator, Step_Result } from "../emulator/emulator.js";
import { compile } from "../emulator/compiler.js";
import { parse } from "../emulator/parser.js";
import { parse_argv } from "./args.js";
import { expand_warnings, registers_to_string } from "../emulator/util.js";
import fetch from "node-fetch";
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
function discord_emu() {
    let running = false;
    let busy = false;
    let stdout = "";
    let text_cb = () => { };
    const emulator = new Emulator({ on_continue });
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
            const res = emulator.run(5);
            switch (res) {
                case Step_Result.Continue:
                    {
                        stdout += "\n---------------------\n" +
                            "Exceeded time quota of 5ms\n";
                        running = false;
                    }
                    break;
                case Step_Result.Input:
                    {
                        stdout += "\n---------------------\n" +
                            "type a message starting with ? to input\n";
                    }
                    break;
                case Step_Result.Halt:
                    {
                        stdout += "\n---------------------\n"
                            + "Program Halted!\n";
                        running = false;
                    }
                    break;
                default: {
                    throw new Error("\nunknown step result");
                }
            }
        }
        catch (e) {
            stdout += `[ERROR]: ${e}`;
            running = false;
        }
        stdout += "\nregisters:\n" + registers_to_string(emulator);
    }
    function o() {
        const o = stdout;
        stdout = "";
        return o;
    }
    function start(argv, source) {
        if (busy) {
            return "Emulator is still busy loading the previous program";
        }
        busy = true;
        const res = _start(argv, source);
        res.then(() => busy = false).catch(() => busy = false);
        return res;
    }
    async function _start(argv, source) {
        try {
            stdout = "";
            const { args, flags } = parse_argv(["node", ...argv], {
                __storage: "",
                __storage_size: 0,
                __text_file: "",
            });
            const file_name = args[0];
            if (!(source?.length)) {
                if (file_name === undefined) {
                    return `ERROR: no source specified`;
                }
                source = await (await fetch(file_name)).text();
            }
            const code = parse(source);
            if (code.errors.length > 0) {
                stdout += "ERRORS:\n"
                    + expand_warnings(code.errors, code.lines)
                    + "\n------------------------------\n";
            }
            if (code.warnings.length > 0) {
                stdout += "warnings:\n"
                    + expand_warnings(code.warnings, code.lines);
                +"\n------------------------------\n";
            }
            if (code.errors.length > 0) {
                return stdout;
            }
            const [program, debug_info] = compile(code);
            emulator.load_program(program, debug_info);
            running = true;
            on_continue();
            return o();
        }
        catch (e) {
            stdout += `\nERROR: ${e}`;
            return o();
        }
    }
    function reply(msg) {
        try {
            if (!running) {
                return `No Program running`;
            }
            console_io.input.text += msg;
            text_cb();
            return o();
        }
        catch (e) {
            stdout += `\nERROR: ${e}`;
            return o();
        }
    }
    function stop() {
        return "not implemented";
    }
}
//# sourceMappingURL=bot-emu.js.map