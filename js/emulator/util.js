export function warn(line_nr, message) {
    return { line_nr, message };
}
export function expand_warning(warning, lines) {
    const { message, line_nr } = warning;
    return message + `\n  on line ${line_nr}: ${lines[line_nr]}`;
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
export function hex(num, size, pad = "_") {
    return pad_left(num.toString(16), size, pad).toUpperCase();
}
export function hex_size(bits) {
    return Math.ceil(bits / 4);
}
export function object_map(obj, callback) {
    const res = {};
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
//# sourceMappingURL=util.js.map