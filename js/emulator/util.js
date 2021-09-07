export function object_map(obj, callback) {
    const res = {};
    for (const key in obj) {
        const value = obj[key];
        const [new_key, new_value] = callback(key, value);
        res[new_key] = new_value;
    }
    return res;
}
//# sourceMappingURL=util.js.map