const handler = async (m, { conn }) => {
    const metadata = await conn.groupMetadata(m.chat);
    const groupName = metadata.subject;
    const inviteCode = await conn.groupInviteCode(m.chat);
    const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;
    let ppUrl;
    
    try {
        ppUrl = await conn.profilePictureUrl(m.chat, 'image');
    } catch {
        ppUrl = 'https://ibb.co';
    }

    try {
        const linkCard = {
            image: { url: ppUrl },
            title: `『 🔗 』 *\`link gruppo:\`*`,
            body: `- *${metadata.participants.length} Membri* \n- *${linkgruppo}*`,
            footer: '',
            buttons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📎 Copia Link',
                        copy_code: linkgruppo
                    })
                },
            ]
        };

        await conn.sendMessage(m.chat, {
            text: `*${groupName}*`,
            footer: '𝓿𝓪𝓻𝓮𝓫𝓸𝓽',
            cards: [linkCard]
        }, { quoted: m });

    } catch (error) {
        console.error('Errore:', error);
        
        const interactiveButtons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "Copia link 📎",
                id: linkgruppo,
                copy_code: linkgruppo
            })
        }];

        const messageText = `*\`Link gruppo:\`*\n- *${groupName}*\n- *${linkgruppo}*`;
        const hasValidPp = ppUrl && !ppUrl.includes('avatar-group-default.png');

        if (hasValidPp) {
            await conn.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: messageText,
                interactiveButtons
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                text: messageText,
                interactiveButtons
            }, { quoted: m });
        }
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;