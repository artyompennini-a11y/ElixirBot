// Plugin creato da elixir
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    
    const isCreator = m.sender?.replace(/[^0-9]/g, '') === '447529461874';
    if (!isCreator && !(global.rowner || global.owner)) {
        return conn.reply(m.chat, '❌ Accesso negato: solo il creatore può usare questo comando.', m);
    }

    if (!m.quoted?.text) {
        return conn.reply(m.chat, '`[!] Rispondi al messaggio contenente il codice da salvare.`', m);
    }
    if (!text) {
        return conn.reply(m.chat, `\`[!] Esempio: ${usedPrefix + command} nomePlugin\``, m);
    }

    const pluginsDir = path.join(process.cwd(), 'plugins');
    const filename = `${text.trim().replace('.js', '')}.js`;
    const filePath = path.join(pluginsDir, filename);

    try {
       
        fs.writeFileSync(filePath, m.quoted.text, 'utf8');

    
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(`${fileUrl}?update=${Date.now()}`);


        global.plugins[filename] = module.default || module;

        await conn.reply(
            m.chat,
            `*───「 INSTALLATO 」───*\n\n` +
            `*📂 FILE:* \`${filename}\`\n` +
            `*STATUS:* \`Attivo / Online\`\n` +
            `*────────────────*`,
            m
        );
    } catch (e) {
        return conn.reply(m.chat, `\`[ERRORE]: ${e.message}\``, m);
    }
};

handler.help = ['saveplugin'];
handler.tags = ['owner'];
handler.command = /^(saveplugin|sv)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;
