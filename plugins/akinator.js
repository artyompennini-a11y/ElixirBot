import fetch from 'node-fetch';

// ═══════════════════════════════════════════════════════
// 🎮 AKINATOR — Indovina il Personaggio
// ═══════════════════════════════════════════════════════

const activeSessions = {};

const handler = async (m, { conn, command, usedPrefix }) => {
    const chatId = m.chat;
    let session = activeSessions[chatId];

    if (command === 'akinator' || command === 'aki') {
        if (session) return m.reply('⚠️ C\'è già una partita in corso in questo gruppo!');
        m.reply('🎮 *Avvio Akinator...* Attendere...');

        try {
            const res = await fetch('https://api.lolhuman.xyz/api/akinator/start?apikey=cafab732-5e98-4800-a083-ce118fb85caf');
            const json = await res.json();

            if (json.status !== 200) return m.reply('❌ Errore nel contattare il server Akinator.');

            session = {
                server: json.result.server,
                frontaddr: json.result.frontaddr,
                session: json.result.session,
                signature: json.result.signature,
                question: json.result.question,
                step: 0,
                progression: json.result.progression || 0,
                answers: []
            };
            activeSessions[chatId] = session;

            const text = `🎯 *AKINATOR* 🎯\n\n`
                + `❓ *Domanda ${session.step + 1}:*\n`
                + `📝 ${session.question}\n\n`
                + `*Risposte disponibili:*\n`
                + `0 → ✅ Sì\n`
                + `1 → ❌ No\n`
                + `2 → 🤷 Non lo so\n`
                + `3 → 🔵 Probabilmente sì\n`
                + `4 → 🔴 Probabilmente no\n\n`
                + `📌 *Rispondi con:* \`${usedPrefix}aki [numero]\``;

            await conn.sendMessage(m.chat, { text }, { quoted: m });
        } catch (e) {
            console.error('[AKINATOR] Errore:', e);
            m.reply('❌ Errore nel server Akinator. Riprova più tardi.');
            delete activeSessions[chatId];
        }
    }
};

handler.before = async (m, { conn, usedPrefix }) => {
    const chatId = m.chat;
    const session = activeSessions[chatId];
    if (!session) return;

    const text = m.text?.trim();
    if (!text) return;

    const args = text.split(' ');
    const cmd = args[0]?.toLowerCase();
    const num = parseInt(args[0]);

    // Risposta alla domanda
    if (!isNaN(num) && num >= 0 && num <= 4) {
        try {
            const res = await fetch('https://api.lolhuman.xyz/api/akinator/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apikey: 'cafab732-5e98-4800-a083-ce118fb85caf',
                    server: session.server,
                    frontaddr: session.frontaddr,
                    session: session.session,
                    signature: session.signature,
                    answer: num,
                    step: session.step
                })
            });
            const json = await res.json();

            if (json.status !== 200) {
                return m.reply('❌ Errore nella risposta. Riprova.');
            }

            session.step++;

            if (json.result.answer) {
                const answer = json.result.answer;
                const text = `🎉 *AKINATOR HA INDOVINATO!* 🎉\n\n`
                    + `👤 *Personaggio:* ${answer.name}\n`
                    + `📖 *Descrizione:* ${answer.description}\n`
                    + `🖼️ ${answer.image}\n\n`
                    + `🔍 *Probabilità:* ${Math.round(answer.probability * 100)}%\n\n`
                    + `✅ Se è corretto: \`${usedPrefix}akiend\`\n`
                    + `❌ Se è sbagliato: \`${usedPrefix}akiend\``;
                await conn.sendMessage(m.chat, { text, image: { url: answer.image } }, { quoted: m });
                delete activeSessions[chatId];
                return;
            }

            if (json.result.progression >= 90) {
                const res2 = await fetch('https://api.lolhuman.xyz/api/akinator/guess', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apikey: 'cafab732-5e98-4800-a083-ce118fb85caf',
                        server: session.server,
                        frontaddr: session.frontaddr,
                        session: session.session,
                        signature: session.signature,
                        step: session.step
                    })
                });
                const json2 = await res2.json();

                if (json2.status === 200 && json2.result) {
                    const answer = json2.result;
                    const text = `🎉 *AKINATOR HA INDOVINATO!* 🎉\n\n`
                        + `👤 *Personaggio:* ${answer.name}\n`
                        + `📖 *Descrizione:* ${answer.description}\n`
                        + `🖼️ ${answer.image}\n\n`
                        + `🔍 *Probabilità:* ${Math.round(answer.probability * 100)}%\n\n`
                        + `✅ *Rispondi:* \`${usedPrefix}akiend\``;
                    await conn.sendMessage(m.chat, { text, image: { url: answer.image } }, { quoted: m });
                    delete activeSessions[chatId];
                    return;
                }
            }

            session.question = json.result.question || json.result.step?.question;
            const text = `🎯 *AKINATOR* 🎯\n\n`
                + `❓ *Domanda ${session.step + 1}:*\n`
                + `📝 ${session.question}\n`
                + `📊 *Progresso:* ${Math.round(session.progression || 0)}%\n\n`
                + `*Risposte:*\n`
                + `0 → ✅ Sì\n`
                + `1 → ❌ No\n`
                + `2 → 🤷 Non lo so\n`
                + `3 → 🔵 Probabilmente sì\n`
                + `4 → 🔴 Probabilmente no\n\n`
                + `📌 *Rispondi:* \`${usedPrefix}aki [numero]\``;
            await conn.sendMessage(m.chat, { text }, { quoted: m });
        } catch (e) {
            console.error('[AKINATOR] Errore:', e);
            m.reply('❌ Errore nel server. Partita terminata.');
            delete activeSessions[chatId];
        }
        return;
    }

    // Comando akiend
    if (cmd === 'akiend' || cmd === '.akiend') {
        delete activeSessions[chatId];
        return m.reply('🛑 Partita terminata.');
    }
};

handler.command = /^(akinator|aki|akiend)$/i;
handler.tags = ['giochi'];
handler.help = ['akinator', 'aki', 'akiend'];
handler.group = true;

export default handler;
