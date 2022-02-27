import { warn } from "./util.js";
export function preprocess(str, errors) {
    const macros = {};
    const lines = str.replaceAll("\r", "").split("\n");
    let source = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const [start, name, ...rest] = line.split(/[ \t]+/);
        if (start.toLowerCase() !== "@define") {
            source += line;
            continue;
        }
        if (!name) {
            errors.push(warn(i, `no name specified for macro`));
            continue;
        }
        if (macros[name]) {
            errors.push(warn(i, `redefinition of macro ${name}`));
            continue;
        }
        macros[name] = rest.join(" ");
    }
    let last = "";
    while (source !== last) {
        last = source;
        for (const [name, macro] of Object.entries(macros)) {
            source = source.replaceAll(name, macro);
        }
    }
    console.log(source);
    return source;
}
//# sourceMappingURL=preprocessor.js.map