// https://github.com/benjaminadk/gif-encoder-2
import fsp from "fs/promises";
import ds, { Message, MessageAttachment } from "discord.js";
import {emu_reply, emu_start} from "./bots/bot-emu.js";
import GivEncoder from "gifencoder";
import Canvas from "canvas";
import { Step_Result } from "../emulator/emulator.js";
import { my_exec } from "./exec.js";
import { preprocess } from "../emulator/preprocessor.js";
import { expand_warnings, Warning } from "../emulator/util.js";
import https from "https"
import { Token, tokenize } from "../editor/tokenizer.js";
import { token_to_ansi } from "../editor/ansi.js";

process.on('unhandledRejection', error => {
    console.error(`unhandledRejection! are you missing an await?\n${error}`);
});


console.log("starting...");
let token = process.env.DISCORD_TOKEN;
if (!token){
    const env = (await fsp.readFile(".env")).toString();
    token = env.split("=")[1].replace(/\s/g, '');
}

const client = new ds.Client({intents: ds.Intents.FLAGS.GUILDS | ds.Intents.FLAGS.GUILD_MESSAGES});

const max_msg = 2000;
const max_file = 8_000_000;

function reply_text(msg: ds.Message, text: string, file = false) {
    if (text.length == 0){
        return msg;
    }
    if (!file && text.length <= max_msg){
        return msg.reply("```\n"+text.replaceAll("`", "\\`")+"```");
    }
    const buffer = Buffer.from(text, "utf8")
    if (buffer.length <= max_file){
        return msg.reply({files: [new MessageAttachment(buffer, "text.txt")]});
    }
    const from_sides = max_file / 2
    const top = buffer.subarray(0, from_sides)
    const bottom = buffer.subarray(-from_sides)
    const cut = Buffer.concat([top, Buffer.from("\n...\n", "utf-8"), bottom])

    const error_msg = `File to big leaving out the middle part`;

    return msg.reply({content: error_msg, files: [new MessageAttachment(cut, "text.txt")]});
}



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

const channels = new Set(["bots", "urcl-bot", "counting", "chains"]);
const filter_servers = new Set(["758395778376532059", "921425770293911573"]);
const urcl_start = "```urcx\n";
const ansi_start = "```ansi\n";
const code_block_end = "```";

function errorMessage(error: unknown){
    if (error instanceof Error){
        return error.message;
    } else {
        return "" + error;
    }
}

client.on("messageCreate", async (msg) => {
    try {
        await onmessage(msg);
    } catch (error1) {
        const err_msg = errorMessage(error1);
        await msg.reply({"content": err_msg.substring(0, max_total)});
    }
}); 

async function onmessage (msg: Message) {
    if (msg.content.toLowerCase().includes("!lol")){
        const text =  msg.content.replace(/!lol/gi, ":regional_indicator_l::regional_indicator_o::regional_indicator_l:")
        if (text.length > max_msg){
            await msg.reply("Message too large");
            return;
        }
        await msg.reply(text);
        return;
    }
    if (msg.content.includes(urcl_start)) {
        let result = "";
        let i = 0;
        while (i >= 0 && i < msg.content.length){
            const start = msg.content.indexOf(urcl_start, i);
            if (i == -1){break;}
            result += msg.content.substring(i, start);
            i = start + urcl_start.length;
            const end = msg.content.indexOf(code_block_end, i);
            if (end == -1){break;}
            const tokens: Token[] = [];
            const source = msg.content.substring(i, end);
            tokenize(source, 0, tokens);
            i = end + code_block_end.length;
            for (const {type, start, end} of tokens){
                const ansi = token_to_ansi[type];
                const text = source.substring(start, end);
                result += `${ansi}${text}`;
            }
        }
        result += msg.content.substring(i);
        const lines = result.split("\n");
        let lex = "";
        for (const line of lines){
            if (line.length + 1 + ansi_start.length+code_block_end.length > max_total){
                if (lex.length > 0){
                    msg = await msg.reply({content: `${ansi_start}${lex}${code_block_end}`});
                }
                lex = "";
                msg = await msg.reply({content: `Line too long starting with: ${line.substring(0, 20)}`});
                continue;
            }
            if (lex.length + line.length + 1 + ansi_start.length+code_block_end.length > max_total ){
                msg = await msg.reply({content: `${ansi_start}${lex}${code_block_end}`});
                lex = "";
            }
            lex += line + "\n";
        }
        if (lex.length > 0){
            msg = await msg.reply({content: `${ansi_start}${lex}${code_block_end}`});
        }
    }
    if (msg.author.bot || !(msg.channel instanceof ds.TextChannel)) return;
    if (filter_servers.has(msg.channelId) && !channels.has(msg.channel.name)) return;
    const {content} = msg;
    if (content.startsWith("!urclpp")){
        let source = parse_code_block(content);
        if (source === undefined){
            await msg.reply("no source specified");
            return;
        }

        const {code, out, errors} = await my_exec("python3", "URCLpp-compiler/compiler.py", `imm:${source}`);
        const rep_msg = `exit code ${code}` + (errors ? `\nerrors: \`\`\`\n${errors}\`\`\`` : "");
        
        msg = await reply_text(msg, rep_msg);
        msg = await reply_text(msg, out);

        const urcx = content.indexOf("emu");
        if (urcx < 0){
            return;
        }
        const end = content.indexOf(" ", urcx);
        const argv = content.substring(end).split("\n")[0].split(" ");
        const res = emu_start(msg.channelId, argv, out + "\nHLT");
        await reply(msg, res);
    } else
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
        await reply(msg, res);
    }
    else if (content.startsWith("!lower")){
        let source = parse_code_block(content);
        if (source === undefined){
            await msg.reply("no source specified");
            return;
        }
        const errors: Warning[] = [];
        const out = preprocess(source, errors);
        const code = errors.length > 0 ? 1 : 0;
        const rep_msg = `exit code ${code}` + (errors ? `\nerrors: \`\`\`\n${expand_warnings(errors, source.replaceAll("\r", "").split("\n"))}\`\`\`` : "");
        
        await msg.reply({files: [new MessageAttachment(Buffer.from(out, "utf8"), "output.txt")], content: rep_msg});
    }
    else if (content.startsWith("!")){
        const reply = `unknown command ${JSON.stringify(content)} try sending one of:\n`
            + `!urcx-emu --help\n`
            + `!urclpp\n`
            + `!urclpp | urcx-emu\n`
            + `!lower`;
        await msg.reply({content: reply});
    }
    if (content.startsWith("?")){
        const res = emu_reply(msg.channelId, content.substring(1));
        await reply(msg, res);
    }

    async function reply(msg: ds.Message, res: ReturnType<typeof emu_start>){
        let {out, info, screens, all_screens, scale, state, quality, storage} = await res;
        let files: MessageAttachment[] = [];
        let screen_at: undefined | MessageAttachment;
        const to_draw = state == Step_Result.Halt ? all_screens : screens;
        if (to_draw.length > 0){
            const w = to_draw[0].width, h =  to_draw[0].height
            const width = w * scale, height = h * scale;
            const max_images = 0| 1_000_000 / (width * height);
            
            const canvas = Canvas.createCanvas(width, height);
            const ctx = canvas.getContext("2d", {alpha: false});
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = "black";
            if (to_draw.length > 1){
                const encoder = new GivEncoder(width, height);
                encoder.setQuality(quality);
                encoder.setDelay(1/6);
                encoder.setRepeat(0);
                encoder.start()
                const skip = Math.max(0, to_draw.length - max_images);
                if (skip > 0){
                    info = `${to_draw.length} Images are too much for a resolution of ${width}, ${height}\n`
                        + `only the last ${to_draw.length - skip} images are drawn\n` 
                        + info;
                } else {
                    info = `Drew gif of ${to_draw.length} images \n` + info;
                }
                for (const screen of to_draw.slice(skip)){
                    ctx.fillRect(0, 0, width, height);
                    ctx.putImageData(screen, 0, 0);
                    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
                    encoder.addFrame(ctx as CanvasRenderingContext2D);
                }
                encoder.finish();
                const buf = encoder.out.getData();
                screen_at = new MessageAttachment(buf, "screen.gif");
            } else {
                ctx.fillRect(0,0, width, height);
                ctx.putImageData(to_draw[0], 0, 0, 0, 0, width, height);
                ctx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
                const buf = canvas.toBuffer();
                screen_at = new MessageAttachment(buf, "screen.png");
            }
        }
        msg = await reply_text(msg, info)
        msg = await reply_text(msg, out)
        if (screen_at){
            files.push(screen_at);
        }
        if (storage){
            files.push(new MessageAttachment(Buffer.from(storage), "storage.bin"));
        }
        
        if (files.length > 0){
            return msg.reply({files});
        }
    }
}

// const port = Number(process.env.PORT) || 5000;

// const bogus_server = https.createServer();
// bogus_server.listen(port, undefined, undefined, () => {
//     console.log(`started bogus server at port ${port}`);
// })

// bogus_server.on("error", e => {
//     console.error(e);
// })

console.log("started");
