import fs from "fs/promises";
import ds from "discord.js";
import { emu_reply, emu_start } from "./bots/bot-emu.js";
console.log("starting...");
let token = process.env.DISCORD_TOKEN;
if (!token) {
    const env = (await fs.readFile(".env")).toString();
    token = env.split("=")[1].replace(/\s/g, '');
}
const client = new ds.Client({ intents: ds.Intents.FLAGS.GUILDS | ds.Intents.FLAGS.GUILD_MESSAGES });
await client.login(token);
function parse_code_block(str) {
    const quote = str.indexOf("```");
    if (quote < 0) {
        return;
    }
    const start = str.indexOf("\n", quote) + 1;
    if (start <= 0) {
        return;
    }
    const end = str.indexOf("```", start);
    if (end < 0) {
        return;
    }
    return str.substring(start, end);
}
function then(v, cb) {
    if (v instanceof Promise) {
        v.then(cb);
    }
    else {
        cb(v);
    }
}
const max_info = 500;
const max_total = 2000;
function code_block(str, max) {
    if (str.length + 10 > max) {
        str = "..." + str.substring(str.length + 10 - max);
    }
    return "```\n" + str + "```";
}
client.on("messageCreate", (msg) => {
    if (msg.author.bot || !(msg.channel instanceof ds.TextChannel))
        return;
    if (msg.channel.name !== "bots" && msg.channel.name !== "urcl-bot")
        return;
    const { content } = msg;
    if (content.startsWith("!urcx-emu")) {
        const argv = content.split("\n")[0].split(" ");
        const source = parse_code_block(content);
        const res = emu_start(msg.channelId, argv, source);
        reply(res);
    }
    if (content.startsWith("?")) {
        const res = emu_reply(msg.channelId, content.substring(1) + "\n");
        reply(res);
    }
    function reply(res) {
        then(res, ({ out, info }) => {
            info = code_block(info, max_info);
            out = code_block(out, max_total - info.length);
            msg.reply(info + out);
        });
    }
});
console.log("started");
//# sourceMappingURL=urcx-bot.js.map