// Plugin creato da elixir
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const isCreator = m.sender?.replace(/[^0-9]/g, '') === '447529461874';
    if (!isCreator && !(global.rowner || global.owner)) {
        return conn.reply(m.chat, '❌ Accesso negato: solo il creatore può usare questo comando.', m);
    }

    if (!text) {
        return conn.reply(m.chat, '`[!] Specifica il nome del plugin da eliminare.`', m);
    }

    const pluginsDir = path.join(process.cwd(), 'plugins');
    const filename = `${text.trim().replace('.js', '')}.js`;
    const filePath = path.join(pluginsDir, filename);

    try {
        if (!fs.existsSync(filePath)) {
            return conn.reply(m.chat, '`[!] File non trovato nella cartella plugins.`', m);
        }

        fs.unlinkSync(filePath);

        const key = Object.keys(global.plugins).find(k => k.endsWith(filename));
        if (key) delete global.plugins[key];

        await conn.reply(
            m.chat,
            `*───「 ELIMINATO 」───*\n\n` +
            `*🗑️ FILE:* \`${filename}\`\n` +
            `*STATUS:* \`Rimosso dal sistema\`\n` +
            `*────────────────*`,
            m
        );
    } catch (e) {
        return conn.reply(m.chat, `\`[ERRORE]: ${e.message}\``, m);
    }
};

handler.help = ['deleteplugin'];
handler.tags = ['owner'];
handler.command = /^(deleteplugin|dp)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;
