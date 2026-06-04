// by elixir
const handler = async (m, { conn }) => {
    try {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
        const memberCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = 'https://ibb.co';
        }

        const messageText = `> ⛓️‍💥 *LINK GENERATO CON SUCCESSO*\n\n` +
                            `*〢 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖹𝖨𝖮𝖭𝖨 𝖦𝖱𝖴𝖯𝖯𝖮*\n` +
                            `  » *Nome:* ${groupName}\n` +
                            `  » *Utenti all'interno:* ${memberCount}\n\n` +
                            `*〢 𝖢𝖮𝖭𝖭𝖤𝖲𝖲𝖨𝖮𝖭𝖤 𝖣𝖨𝖱𝖤𝖳𝖳𝖠*\n` +
                            `  ${linkgruppo}\n\n` +
                            `＿\n` +
                            `⌗ Richiesta elaborata per @${m.sender.split('@')[0]}`;

        await conn.sendMessage(
            m.chat,
            {
                image: { url: ppUrl },
                caption: messageText,
                mentions: [m.sender]
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply('❌ Errore nel recupero del link. Assicurati che il bot sia amministratore.');
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
