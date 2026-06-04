// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix, command, text }) => {
    const isCreator = m.sender?.replace(/[^0-9]/g, '') === '447529461874';
    if (!isCreator && !(global.rowner || global.owner)) {
        return conn.reply(m.chat, '❌ Accesso negato: solo il creatore può usare questo comando.', m);
    }

    const pluginsDir = path.join(process.cwd(), 'plugins');

    if (/^(listaplugin|listapl)$/i.test(command)) {
        const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js')).sort();
        const list = pluginFiles.map((f, i) => `${i + 1}. ${f.replace('.js', '')}`).join('\n');
        const message = `*╭─「 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓 – ELENCO PLUGIN 」*\n` +
                        `*│*\n` +
                        `*│* 📂 *Plugin disponibili:* (${pluginFiles.length} totali)\n` +
                        `*│*\n` +
                        `${list.split('\n').map(l => `*│* ${l}`).join('\n')}\n` +
                        `*│*\n` +
                        `*╰─❝ ${usedPrefix + command} per dettagli ❞*`;
        return conn.reply(m.chat, message, m);
    }

    if (/^(getplugin|plugin|getpl)$/i.test(command)) {
        if (!text) {
            return conn.reply(m.chat, '💡 *Uso:* `.getplugin [nome_file]`\n\n_Esempio:_ `.getplugin menu-funzioni`', m);
        }

        const filename = text.trim().endsWith('.js') ? text.trim() : `${text.trim()}.js`;
        const filePath = path.join(pluginsDir, filename);

        if (!fs.existsSync(filePath)) {
            return conn.reply(m.chat, `❌ File “${filename.replace('.js', '')}” non trovato.`, m);
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');

            await conn.sendMessage(
                m.chat,
                {
                    document: Buffer.from(content, 'utf-8'),
                    mimetype: 'text/javascript',
                    fileName: filename
                },
                { quoted: m }
            );

            if (content.length < 4000) {
                await conn.reply(
                    m.chat,
                    `📄 *Contenuto di ${filename}:*\n\n\`\`\`js\n${content}\n\`\`\``,
                    m
                );
            } else {
                await conn.reply(
                    m.chat,
                    `📄 *${filename}* è troppo lungo (${content.length} caratteri).\nScarica il file per visualizzarne il contenuto completo.`,
                    m
                );
            }
        } catch (e) {
            return conn.reply(m.chat, `❌ Errore nella lettura del file: ${e.message}`, m);
        }
        return;
    }

    return conn.reply(m.chat, '❌ Comando non riconosciuto.', m);
};

handler.help = ['listaplugin', 'listapl', 'getplugin', 'plugin', 'getpl'];
handler.tags = ['owner'];
handler.command = /^(listaplugin|listapl|getplugin|plugin|getpl)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;
