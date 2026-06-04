// Plugin creato da elixir 
const handler = async (m, { conn, participants }) => {
    // 1. Vincolo di contesto: Solo all'interno dei gruppi
    if (!m.isGroup) {
        return m.reply('🔮𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ | Questo comando può essere evocato solo all\'interno di un gruppo.');
    }

    // 2. Acquisizione dell'astrazione gerarchica della chat
    const chat = await conn.groupMetadata(m.chat);
    const meId = conn.user.jid; // ID del bot (𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ)
    const senderId = m.sender; // ID del Master (ᴇʟɪxɪʀ)

    // 3. Autenticazione dei poteri di amministrazione del Bot
    const botParticipant = participants.find(p => p.id === meId);
    if (!botParticipant?.admin) {
        return m.reply('⚠️ 𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ richiede privilegi di *Amministratore* per stabilire il suo dominio.');
    }

    try {
        // Apposizione del sigillo imperiale
        await m.react('👑');

        // 4. Isolamento degli amministratori da deporre (escludendo Elixir-Bot ed Elixir stesso)
        const adminsToDemote = participants
           .filter(p => p.admin && p.id!== meId && p.id!== senderId)
           .map(p => p.id);

        // 5. Esecuzione della purga gerarchica
        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote');
        }

        // 6. Elevazione ed incoronazione del Master (Elixir)
        const senderParticipant = participants.find(p => p.id === senderId);
        if (!senderParticipant?.admin) {
            await conn.groupParticipantsUpdate(m.chat, [senderId], 'promote');
        }

        // 7. Ridefinizione dell'identità visiva del gruppo (Defacement Elegante)
        const currentSubject = chat.subject;
        const newSubject = `👑 𝐄𝐋𝐈𝐗𝐈𝐑 𝐑𝐄𝐆𝐍𝐀 | ${currentSubject}`;
        await conn.groupUpdateSubject(m.chat, newSubject);

        // 8. Apposizione del manifesto di controllo nella descrizione
        await conn.groupUpdateDescription(m.chat, '🔮 *Sotto il controllo assoluto di 𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ. L\'ordine precedente è stato dissolto.*');

        await m.reply('✨ *DOMINIO STABILITO!*\nIl gruppo è ora sotto l\'egemonia di *Elixir* e la guida di 𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ. 🔮👑');

    } catch (error) {
        console.error(error);
        m.reply('⚡ *Interruzione energetica:* Limite di rate di WhatsApp raggiunto o permessi insufficienti.');
    }
};

handler.help = ['elixiregna', 'domina'];
handler.tags = ['owner'];
handler.command = /^(elixiregna|domina)$/i;
handler.group = true;
handler.owner = true;
handler.rowner = true;

export default handler;