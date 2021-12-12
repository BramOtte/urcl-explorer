import * as path from "path";
export function parse_argv(defs) {
    const command = process.argv0 + " " + path.relative("./", process.argv[1]);
    const args = [];
    const flags = Object.assign({}, defs);
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (!arg.startsWith("-")) {
            args.push(arg);
            continue;
        }
        const key = arg.replace(/-/g, "_");
        const value = defs[key];
        if (value === undefined) {
            console.error(`Unknown flag ${key}`);
        }
        const type = typeof value;
        switch (type) {
            case "string":
                {
                    if (i + 1 >= process.argv.length) {
                        throw Error(`Missing argument value for ${arg} of type string`);
                    }
                    flags[key] = process.argv[++i];
                }
                break;
            case "boolean":
                {
                    flags[key] = true;
                }
                break;
            case "number":
                {
                    if (i + 1 >= process.argv.length) {
                        console.error(`Missing argument value for ${arg} of type number`);
                        break;
                    }
                    const str = process.argv[++i];
                    const num = Number(str);
                    if (Number.isNaN(num)) {
                        console.error(`${str} is not a number`);
                    }
                    flags[key] = num || 0;
                }
                break;
        }
    }
    return { command, args, flags };
}
// export function parse_argv(): Args {
//     const command = process.argv0 + " " + path.relative("./", process.argv[1])
//     const args: string[] = [];
//     const flags: Record<string, undefined | boolean | string> = {};
//     for (let i = 2; i < process.argv.length; i++){
//         const arg = process.argv[i];
//         if (!arg.startsWith("-")){
//             args.push(arg);
//             continue
//         }
//         const equals_index = arg.indexOf(arg);
//         if (equals_index < 0){
//             flags[arg] = true;
//             continue;
//         }
//         const key = arg.substring(0, equals_index).replace(/-/g, "_");
//         const value = arg.substring(equals_index+1);
//         flags[key] = value;
//     }
//     return {command, args, flags};
// }
export function read_all(stream) {
    let string = "";
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => string += chunk);
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(string));
    });
}
//# sourceMappingURL=args.js.map