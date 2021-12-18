import fs from "fs/promises";
import ds, { MessageAttachment } from "discord.js";
import {emu_reply, emu_start} from "./bots/bot-emu.js";


console.log("starting...");
let token = process.env.DISCORD_TOKEN;
if (!token){
    const env = (await fs.readFile(".env")).toString();
    token = env.split("=")[1].replace(/\s/g, '');
}

const client = new ds.Client({intents: ds.Intents.FLAGS.GUILDS | ds.Intents.FLAGS.GUILD_MESSAGES});

await client.login(token);

function parse_code_block(str: string): undefined | string {
    const quote = str.indexOf("```");
    if (quote < 0){return;}
    const start = str.indexOf("\n", quote) + 1;
    if (start <= 0){return;}
    const end = str.indexOf("```", start);
    if (end < 0){return;}
    return str.substring(start, end);
}
function then<T>(v: T | Promise<T>, cb: (v: T) => void){
    if (v instanceof Promise){
        v.then(cb);
    } else {
        cb(v);
    }
}
const max_info = 500;
const max_total = 2000;
function code_block(str: string, max: number){
    if (str.length + 10 > max){
        str = "..." + str.substring(str.length + 10 - max);
    }
    return "```\n" + str + "```";
}

client.on("messageCreate", (msg) => {
    if (msg.author.bot || !(msg.channel instanceof ds.TextChannel)) return;
    if (msg.channel.name !== "bots" && msg.channel.name !== "urcl-bot") return;
    const {content} = msg;
    if (content.startsWith("!urcx-emu")){
        const argv = content.split("\n")[0].split(" ");
        let source = parse_code_block(content);
        if (!source){
            const source_attach = msg.attachments.find(v=> !!v.name?.endsWith?.(".urcl"));
            if (source_attach){
                argv.push(source_attach.url);
            }
        }


        const res = emu_start(msg.channelId, argv, source);
        reply(res);
    }
    if (content.startsWith("?")){
        const res = emu_reply(msg.channelId, content.substring(1)+"\n");
        reply(res);
    }

    function reply(res: ReturnType<typeof emu_start>){
        then(res, ({out, info, screens}) => {
            let content = "";
            let files: MessageAttachment[] = [];
            if (info.length + 7 > max_info){
                const buf = Buffer.from(info)
                files.push(new MessageAttachment(buf, "info.txt"));
            } else {
                content += code_block(info, max_info)
            }
            if (out.length + 7 > max_total - content.length){
                const buf = Buffer.from(out);
                files.push(new MessageAttachment(buf, "out.txt"));
            } else {
                content += code_block(out, max_total - content.length);
            }
            for (const [i, screen] of screens.entries()){
                files.push(new MessageAttachment(screen, `screen${i}.png`));
            }
            msg.reply({content, files});
        });
    }
})

console.log("started");
