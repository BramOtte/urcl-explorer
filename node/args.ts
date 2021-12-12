import * as path from "path"
interface Args<T> {
    command: string,
    args: string[];
    flags: T;
}
type ArgsDef = Record<string, boolean | string | number>

export function parse_argv<T extends ArgsDef>(defs: T): Args<T> {
    const command = process.argv0 + " " + path.relative("./", process.argv[1])
    const args: string[] = [];
    const flags: T = Object.assign({}, defs);
    for (let i = 2; i < process.argv.length; i++){
        const arg = process.argv[i];
        if (!arg.startsWith("-")){
            args.push(arg);
            continue
        }
        const key = arg.replace(/-/g, "_");
        const value = defs[key];
        if (value === undefined){
            console.error(`Unknown flag ${key}`);
        }
        const type = typeof value;
        switch (type){
        case "string": {
            if (i + 1 >= process.argv.length){
                throw Error(`Missing argument value for ${arg} of type string`);
            }
            (flags as any)[key] = process.argv[++i];
        } break;
        case "boolean": {
            (flags as any)[key] = true;
        } break;
        case "number": {
            if (i + 1 >= process.argv.length){
                console.error(`Missing argument value for ${arg} of type number`);
                break;
            }
            const str = process.argv[++i];
            const num = Number(str);
            if (Number.isNaN(num)){
                console.error(`${str} is not a number`);
            }
            (flags as any)[key] = num || 0;
        } break;
        }
    }
    return {command, args, flags};
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

export function read_all(stream: NodeJS.ReadStream): Promise<string>{
    let string = "";
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => string += chunk);
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(string));
    });
}
