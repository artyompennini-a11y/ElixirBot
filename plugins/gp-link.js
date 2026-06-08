const handler = async (m, { conn }) => {
    try {
        // Recupera solo il nome del gruppo e il codice di invito
        const metadata = await conn.groupMetadata(m.chat);
        const groupName = metadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const linkgruppo = 'https://chat.whatsapp.com/' + inviteCode;

        // Prepara solo il testo del messaggio (minimo contesto)
        const messageText = `*[🔗] \`Link Gruppo:\`*\n- *${groupName}*`;

        // Prepara solo il pulsante per copiare
        const interactiveButtons = [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: '📎 Copia Link',
                copy_code: linkgruppo
            })
        }];

        // Invia il messaggio semplificato
        await conn.sendMessage(m.chat, {
            text: messageText,
            interactiveButtons
        }, { quoted: m });

    } catch (error) {
        console.error('Errore invio messaggio link:', error);
        // Fallback pulito in caso di errore
        await conn.reply(m.chat, '*[✖] Impossibile recuperare il link del gruppo.*', m);
    }
};

handler.help = ['link'];
handler.tags = ['gruppo'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true; // Mantieni per sicurezza

export default handler;
