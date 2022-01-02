import { Register, register_count } from "./instructions.js";
export function warn(line_nr, message) {
    return { line_nr, message };
}
export function expand_warnings(warnings, lines, file_name) {
    return warnings.map(w => expand_warning(w, lines, file_name)).join("\n\n");
}
export function expand_warning(warning, lines, file_name) {
    const { message, line_nr } = warning;
    return `${file_name ?? "urcl"}:${line_nr + 1} - ${message}\n   ${lines[line_nr]}`;
}
export function pad_left(str, size, char = " ") {
    const pad = Math.max(0, size - str.length);
    return char.repeat(pad) + str;
}
export function pad_right(str, size, char = " ") {
    const pad = Math.max(0, size - str.length);
    return str + char.repeat(pad);
}
export function pad_center(str, size, left_char = " ", right_char = left_char) {
    const pad = Math.max(0, size - str.length);
    const left = 0 | pad / 2;
    const right = pad - left;
    return left_char.repeat(left) + str + right_char.repeat(right);
}
export function hex(num, size, pad = " ") {
    return pad_left(num.toString(16), size, pad).toUpperCase();
}
export function hex_size(bits) {
    return Math.ceil(bits / 4);
}
export function registers_to_string(emulator) {
    const nibbles = hex_size(emulator.bits);
    return Array.from({ length: register_count }, (_, i) => pad_center(Register[i], nibbles) + " ").join("") +
        Array.from({ length: emulator.registers.length - register_count }, (_, i) => pad_left(`R${i + 1}`, nibbles) + " ").join("") + "\n" +
        Array.from(emulator.registers, (v) => hex(v, nibbles) + " ").join("");
}
export function memoryToString(view, from = 0x0, length = 0x1000, bits = 8) {
    const width = 0x10;
    const end = Math.min(from + length, view.length);
    const hexes = hex_size(bits);
    let lines = [
        " ".repeat(hexes) + Array.from({ length: width }, (_, i) => {
            return pad_left(hex(i, 1), hexes);
        }).join(" ")
    ];
    for (let i = from; i < end;) {
        const sub_end = Math.min(i + width, end);
        let subs = [];
        const addr = hex(0 | i / width, hexes - 1, " ");
        for (; i < sub_end; i++) {
            subs.push(hex(view[i], hexes));
        }
        const line = subs.join(" ");
        lines.push(addr + " ".repeat(hexes - addr.length) + line);
    }
    return lines.join("\n");
}
export function indent(string, spaces) {
    const left = " ".repeat(spaces);
    return string.split("\n").map(line => left + line).join("\n");
}
export function object_map(obj, callback, target = {}) {
    const res = target;
    for (const key in obj) {
        const value = obj[key];
        const [new_key, new_value] = callback(key, value);
        res[new_key] = new_value;
    }
    return res;
}
const char_code_0 = "0".charCodeAt(0);
const char_code_9 = char_code_0 + 9;
export function is_digit(str, index = 0) {
    const char_code = str.charCodeAt(index);
    return char_code >= char_code_0 && char_code <= char_code_9;
}
export function enum_last(enum_obj) {
    let last = -1;
    for (const key in enum_obj) {
        const value = enum_obj[key];
        if (typeof value === "number") {
            last = Math.max(last, value);
        }
    }
    return last;
}
export function enum_count(enum_obj) {
    return enum_last(enum_obj) + 1;
}
export function enum_strings(enum_obj) {
    const strings = [];
    for (const key in enum_obj) {
        const value = enum_obj[key];
        if (typeof value === "string") {
            strings.push(value);
        }
    }
    return strings;
}
export function enum_numbers(enum_obj) {
    const strings = [];
    for (const key in enum_obj) {
        const value = enum_obj[key];
        if (typeof value === "number") {
            strings.push(value);
        }
    }
    return strings;
}
export function enum_from_str(enum_obj, str) {
    if (is_digit(str)) {
        return undefined;
    }
    const value = enum_obj[str];
    return value;
}
export function with_defaults(defaults, options) {
    const with_defaults = { ...defaults };
    for (const name in options) {
        if (options[name] !== undefined) {
            with_defaults[name] = options[name];
        }
    }
    return with_defaults;
}
const conversion_buffer = new DataView(new ArrayBuffer(8));
export function f32_decode(int) {
    conversion_buffer.setInt32(0, int, true);
    return conversion_buffer.getFloat32(0, true);
}
export function f32_encode(float) {
    conversion_buffer.setFloat32(0, float, true);
    return conversion_buffer.getInt32(0, true);
}
//# sourceMappingURL=util.js.map