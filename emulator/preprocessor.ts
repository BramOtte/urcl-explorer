import { warn, Warning } from "./util.js";

export function preprocess(str: string, errors: Warning[]){
    const macros: Record<string, string> = {};
    for (const [i, line] of str.replaceAll("\r", "").split("\n").entries()){
        const [start, name, ...rest] = line.split(/[ \t]+/);
        if (!name){
            errors.push(warn(i, `no name specified for macro`));
        }
        if (start.toLowerCase() === "@define"){
            if (macros[name]){
                errors.push(warn(i, `redefinition of macro ${name}`));
            }
            continue;
        }
    }
    let last = "";
    while (str !== last){
        last = str;
        for (const [name, macro] of Object.entries(macros)){
            str = str.replaceAll(name, macro);
        }
    }
    return str;
}
