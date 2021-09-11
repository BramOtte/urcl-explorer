export function warn(line_nr, message) {
    return { line_nr, message };
}
export function expand_warning(warning, lines) {
    const { message, line_nr } = warning;
    return message + `\n  on line ${line_nr}: ${lines[line_nr]}`;
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