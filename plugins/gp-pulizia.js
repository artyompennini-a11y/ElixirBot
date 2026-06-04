// Plugin creato da elixir
let handler = async (m, { conn, usedPrefix, command }) => {
    // ── 1. Controllo Permessi Utente ───────────────────────────
    const isCreator = m.sender?.replace(/[^0-9]/g, '') === '447529461874';
    const isOwner = isCreator || global.rowner || global.owner;
    
    // Verifica se siamo in un gruppo
    const isGroup = m.isGroup;
    let isAdmin = false;
    
    if (isGroup) {
        const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}));
        const participants = groupMetadata.participants || [];
        const user = participants.find(p => p.id === m.sender);
        isAdmin = user && (user.admin === 'admin' || user.admin === 'superadmin');
    }

    // Se non è owner e non è admin del gruppo, nega l'accesso
    if (!isOwner && !isAdmin) {
        return conn.reply(m.chat, '❌ *Accesso negato.* Questo comando può essere utilizzato solo dagli amministratori o dal creatore del bot.', m);
    }

    // ── 2. Controllo Permessi Bot (Solo per i gruppi) ───────────
    if (isGroup) {
        const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}));
        const participants = groupMetadata.participants || [];
        
        // Estrae il numero pulito del bot in modo sicuro
        const myNumber = conn.user.id ? conn.user.id.replace(/[^0-9]/g, '').split('')[0] : conn.user.jid.replace(/[^0-9]/g, '');
        const botJid = `${myNumber}@s.whatsapp.net`;
        
        // Cerca il bot nella lista dei partecipanti del gruppo
        const bot = participants.find(p => p.id.replace(/[^0-9]/g, '') === myNumber);
        const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
        
        if (!isBotAdmin) {
            return conn.reply(m.chat, '⚠️ *Errore:* Per cancellare i messaggi degli altri utenti, il bot deve essere impostato come *Amministratore* del gruppo.', m);
        }
    }

    // ── 3. Recupero e Cancellazione Messaggi ───────────────────
    try {
        // Recupera gli ultimi messaggi memorizzati nella cache della chat (fino a 20)
        const storeFetch = conn.chats[m.chat]?.messages;
        if (!storeFetch || Object.keys(storeFetch).length === 0) {
            return conn.reply(m.chat, '⚠️ *Nessun messaggio trovato* nella cache recente di questa chat da poter eliminare.', m);
        }

        const messagesArray = Object.values(storeFetch).map(v => v.message || v);
        // Prende gli ultimi 20 messaggi ordinati per tempo (escluso il comando appena inviato)
        const targets = messagesArray
            .filter(msg => msg && msg.key && msg.key.id !== m.key.id)
            .slice(-20);

        if (targets.length === 0) {
            return conn.reply(m.chat, '⚠️ Non ci sono abbastanza messaggi recenti da eliminare.', m);
        }

        const waitMsg = `⋆｡˚『 ╭ \`CHAT CLEANER\` ╯ 』˚｡⋆
╭
┃ 🧹 *Pulizia della chat avviata...*
┃ 📄 Target: _Eliminazione degli ultimi ${targets.length} messaggi_
┃ 
┃ _Attendi il completamento delle eliminazioni._
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
        await conn.sendMessage(m.chat, { text: waitMsg }, { quoted: m });

        // Ciclo di eliminazione forzata per ogni messaggio trovato
        for (let msg of targets) {
            try {
                await conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: msg.key.fromMe,
                        id: msg.key.id,
                        participant: msg.key.participant || msg.key.remoteJid
                    }
                });
                // Piccolo delay di sicurezza per evitare blocchi o ban da WhatsApp rate-limits
                await new Promise(res => setTimeout(res, 200));
            } catch {
                // Ignora singoli fallimenti (es. messaggi già eliminati a mano)
                continue;
            }
        }

        // Messaggio finale di successo elegante
        const successText = `⋆｡˚『 ╭ \`✅ CHAT PULITA\` ╯ 』˚｡⋆
╭
┃ ✨ *La chat è stata igienizzata con successo!*
┃ 🗑️ Messaggi rimossi: *${targets.length}*
┃ 👤 Eseguito da: @${m.sender.split('@')[0]}
┃
> 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;

        await conn.sendMessage(m.chat, { 
            text: successText, 
            contextInfo: { mentionedJid: [m.sender] } 
        });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '❌ *Errore critico:* Si è verificato un problema interno durante la cancellazione di massa.', m);
    }
};

handler.help = ['chatcl'];
handler.tags = ['moderation', 'group'];
handler.command = /^(chatcl|pulisci|antispamclear)$/i;

export default handler;
