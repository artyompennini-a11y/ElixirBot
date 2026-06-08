const handler = async (m, { conn }) => {
    try {
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://whatsapp.com' + inviteCode;
        let ppUrl;
        
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = 'https://ibb.co';
        }

        // 1. Prepariamo i media con il server WhatsApp prima di inviarli
        const mediaDoc = await conn.prepareMessageMedia({ image: { url: ppUrl } }, { upload: conn.waUploadToServer });

        // 2. Struttura interattiva identica ai top bot GitHub
        const interactiveMessage = {
            body: { text: `*${groupName}*\n\nPremi il bottone qui sotto per copiare istantaneamente il link del gruppo negli appunti.` },
            footer: { text: '𝓿𝓪𝓻𝓮𝓫𝓸𝓽' },
            header: {
                title: `『 🔗 』 *\`link gruppo:\`*`,
                hasMediaAttachment: true,
                imageMessage: mediaDoc.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_copy', // Tipo di bottone nativo per la copia
                        buttonParamsJson: JSON.stringify({
                            display_text: '📎 Copia Link',
                            id: 'copy_code', // ID dell'azione richiesto da WhatsApp
                            copy_code: linkgruppo // Il testo effettivo che verrà copiato negli appunti
                        })
                    }
                ],
                version: 1 // Versione del flusso nativo richiesta per iOS/Android
            }
        };

        // 3. Spediamo usando il relayMessage incapsulato correttamente
        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: interactiveMessage
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Errore invio messaggio link:', error);
        try {
            const metadata = await conn.groupMetadata(m.chat);
            const groupName = metadata.subject;
            const inviteCode = await conn.groupInviteCode(m.chat);
            const linkgruppo = 'https://whatsapp.com' + inviteCode;
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