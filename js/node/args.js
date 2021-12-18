import * as path from "path";
export function parse_argv(argv, defs) {
    if (argv.length < 2) {
        throw new Error(`Argv needs at least 2 elements but got [${argv}]`);
    }
    const command = argv[0] + " " + path.relative("./", argv[1]);
    const args = [];
    const flags = Object.assign({}, defs);
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
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
                    if (i + 1 >= argv.length) {
                        throw Error(`Missing argument value for ${arg} of type string`);
                    }
                    flags[key] = argv[++i];
                }
                break;
            case "boolean":
                {
                    flags[key] = true;
                }
                break;
            case "number":
                {
                    if (i + 1 >= argv.length) {
                        console.error(`Missing argument value for ${arg} of type number`);
                        break;
                    }
                    const str = argv[++i];
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
export function read_all(stream) {
    let string = "";
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => string += chunk);
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(string));
    });
}
//# sourceMappingURL=args.js.map