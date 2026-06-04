// Plug-in creato da elixir
import { performance } from "perf_hooks";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (message, { conn, text }) => {
    let mentionedJid = [];

    if (message.mentionedJid && message.mentionedJid.length) {
        mentionedJid = message.mentionedJid;
    } else if (text && text.startsWith('@')) {
        let number = text.replace('@', '').replace(/\s+/g, '') + '@s.whatsapp.net';
        mentionedJid = [number];
    } else {
        mentionedJid = [message.sender];
    }

    let messages = [
        `🍣 Inizio a preparare un Sushi per @${mentionedJid[0].split('@')[0]}...`,
        `🔪 Sto tagliando il pesce fresco!`,
        `🍚 Preparo il riso con aceto di riso...`,
        `🥑 Aggiungo un tocco di avocado e altri ingredienti.`,
        `🌿 Un pizzico di alga nori per avvolgerlo perfettamente!`,
        `🍱 Sto impiattando con cura...`,
        `🎌 Voilà! Sushi servito per @${mentionedJid[0].split('@')[0]}!`
    ];

    for (let msg of messages) {
        await conn.reply(message.chat, msg, message, {
            mentions: mentionedJid
        });
        await delay(2000);
    }

    let start = performance.now();
    let end = performance.now();
    let time = (end - start).toFixed(3);

    let finalMessage = `🍣 Sushi preparato in *${time}ms*! Buon appetito, @${mentionedJid[0].split('@')[0]}!`;
    await conn.reply(message.chat, finalMessage, message, {
        mentions: mentionedJid
    });
};

handler.command = ['sushi'];
handler.tags = ['fun'];
handler.help = ['.sushi @utente'];

export default handler;
