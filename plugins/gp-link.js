const handler = async (m, { conn }) => {
    try {
        // Recupera i metadati completi del gruppo
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const memberCount = metadata.participants.length; // Conteggio dei membri
        
        // Recupera il codice di invito
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;

        // Recupera l'immagine del gruppo, o null se non presente
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(m.chat, 'image');
        } catch {
            ppUrl = null; // Gestione nel caso non ci sia immagine o il bot non possa vederla
        }

        // Prepara il testo del messaggio
        const messageText = `*[🔗] \`Link Gruppo:\`*\n\n` +
                          `• *Gruppo:* *${groupName}*\n` +
                          `• *Membri presenti:* *${memberCount}*`;

        // Prepara il pulsante per copiare
        const interactiveButtons = [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: '📎 Copia Link',
                copy_code: linkgruppo
            })
        }];

        // Sceglie come inviare il messaggio in base alla presenza dell'immagine
        if (ppUrl) {
            // Invia come immagine con didascalia e pulsante
            await conn.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: messageText,
                interactiveButtons
            }, { quoted: m });
        } else {
            // Se non c'è immagine, invia solo il testo con il pulsante (come fallback)
            await conn.sendMessage(m.chat, {
                text: messageText,
                interactiveButtons
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Errore invio messaggio link completo:', error);
        // Fallback in caso di errore critico
        await conn.reply(m.chat, '*[✖] Impossibile recuperare i dettagli completi del gruppo.*', m);
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true; // Necessario per generare il link di invito

export default handler;
