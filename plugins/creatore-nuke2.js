let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | ꜱᴠᴛ ʙʏ ᴇʟɪxɪʀ`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "✧ 𝓔𝓵𝓲𝔁𝓲𝓻 𝓱𝓪 𝓹𝓻𝓮𝓼𝓸 𝓲𝓵 𝓬𝓸𝓷𝓽𝓻𝓸𝓵𝓵𝓸 ✧"
    });

    await conn.sendMessage(m.chat, {
        text: "𝒯𝓊𝓉𝓉𝒾 𝒾 𝓅𝒶𝓇𝓉𝑒𝒸𝒾𝓅𝒶𝓃𝓉𝒾 𝓈𝑜𝓃𝑜 𝒾𝓃𝓋𝒾𝓉𝒶𝓉𝒾 𝓆𝓊𝒾:\n\nhttps://chat.whatsapp.com/JOaqS04seMvFepBFp4Q4rL",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['caos'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
