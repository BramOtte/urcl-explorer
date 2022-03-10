// https://github.com/benjaminadk/gif-encoder-2
import fsp from "fs/promises";
import ds, { MessageAttachment } from "discord.js";
import {emu_reply, emu_start} from "./bots/bot-emu.js";
import GivEncoder from "gifencoder";
import Canvas from "canvas";
import { Step_Result } from "../emulator/emulator.js";
import { my_exec } from "./exec.js";
import { preprocess } from "../emulator/preprocessor.js";
import { expand_warnings, Warning } from "../emulator/util.js";


console.log("starting...");
let token = process.env.DISCORD_TOKEN;
if (!token){
    const env = (await fsp.readFile(".env")).toString();
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

const channels = ["bots", "urcl-bot", "counting", "chains"];

client.on("messageCreate", async (msg) => {
    if (msg.content.toLowerCase().includes("!lol")){
        msg.reply("🇱🇴🇱")
        return
    }
    if (msg.author.bot || !(msg.channel instanceof ds.TextChannel)) return;
    if (!channels.includes(msg.channel.name)) return;
    try {
    const {content} = msg;
    if (content.startsWith("!urclpp")){
        let source = parse_code_block(content);
        if (source === undefined){
            msg.reply("no source specified");
            return;
        }

        const {code, out, errors} = await my_exec("python", "URCLpp-compiler/compiler2.py", `imm:${source}`);
        const rep_msg = `exit code ${code}` + (errors ? `\nerrors: \`\`\`\n${errors}\`\`\`` : "");
        
        await msg.reply({files: [new MessageAttachment(Buffer.from(out, "utf8"), "output.txt")], content: rep_msg});

        const urcx = content.indexOf("emu");
        if (urcx < 0){
            return;
        }
        const end = content.indexOf(" ", urcx);
        const argv = content.substring(end).split("\n")[0].split(" ");
        const res = emu_start(msg.channelId, argv, out + "\nHLT");
        reply(res);
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
        reply(res);
    }
    else if (content.startsWith("!lower")){
        let source = parse_code_block(content);
        if (source === undefined){
            msg.reply("no source specified");
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
            + `!urclpp | urcx-emu`
            + `!lower`;
        msg.reply({content: reply});
    }
    if (content.startsWith("?")){
        const res = emu_reply(msg.channelId, content.substring(1));
        reply(res);
    }
    } catch (e) {
        const buf = Buffer.from(("" + e).substring(0, 1_000_000), "utf8");
        msg.reply(`${new MessageAttachment(buf, "error.txt")}`);
    }

    async function reply(res: ReturnType<typeof emu_start>){
        let {out, info, screens, all_screens, scale, state, quality, storage} = await res;
        let content = "";
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
                    encoder.addFrame(ctx);
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
        if (info.length + 7 > max_info){
            const buf = Buffer.from(info, "utf8")
            files.push(new MessageAttachment(buf, "info.txt"));
        } else {
            content += code_block(info, max_info)
        }
        if (out.length + 7 > max_total - content.length){
            const buf = Buffer.from(out, "utf8");
            files.push(new MessageAttachment(buf, "out.txt"));
        } else {
            content += code_block(out, max_total - content.length);
        }
        if (screen_at){
            files.push(screen_at);
        }
        if (storage){
            files.push(new MessageAttachment(Buffer.from(storage), "storage.bin"));
        }

        await msg.reply({content, files});
    }
})

console.log("started");
