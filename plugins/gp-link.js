const handler = async (m, { conn }) => {
    try {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
        let ppUrl;
        
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-group-default.png';
        }

        const interactiveMessage = {
            body: { text: `*${groupName}*` },
            footer: { text: '𝓿𝓪𝓻𝓮𝓫𝓸𝓽' },
            header: {
                title: `『 🔗 』 *\`link gruppo:\`*`,
                hasMediaAttachment: true,
                imageMessage: (await conn.prepareMessageMedia({ image: { url: ppUrl } }, { upload: conn.waUploadToServer })).imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📎 Copia Link',
                            copy_code: linkgruppo
                        })
                    }
                ]
            }
        };

        const messageToSend = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: interactiveMessage
                }
            }
        };

        await conn.relayMessage(m.chat, messageToSend, { quoted: m });

    } catch (error) {
        console.error('Errore invio messaggio link:', error);
        try {
            const metadata = await conn.groupMetadata(m.chat);
            const groupName = metadata.subject;
            const inviteCode = await conn.groupInviteCode(m.chat);
            const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
            const messageText = `*${groupName}*\n\n『 🔗 』 *\`link gruppo:\`*\n- *${metadata.participants.length} Membri*\n- ${linkgruppo}`;
            
            await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
        } catch (e) {
            console.error('Errore fallback critico:', e);
        }
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;