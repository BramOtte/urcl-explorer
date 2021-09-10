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
export function starts_with_digit(str) {
    const char_code = str.charCodeAt(0);
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
//# sourceMappingURL=util.js.map