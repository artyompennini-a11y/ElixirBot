// Plug-in creato da elixir
const handler = async (m, { conn, text }) => {
    const users = global.db.data.users;
    
    if (!users || Object.keys(users).length === 0) {
        return conn.sendMessage(m.chat, { text: '📭 *Nessun utente trovato nel database.*' }, { quoted: m });
    }

    let count = 0;
    for (let userId in users) {
        if (users[userId]) {
            users[userId].money = 0;
            users[userId].bank = 0;
            users[userId].euro = 0;
            count++;
        }
    }

    conn.sendMessage(m.chat, { 
        text: `🔄 *Reset Globale Completato!*\n\n💰 Tutti i saldi sono stati azzerati.\n👥 Utenti coinvolti: *${count}*` 
    }, { quoted: m });
};

handler.help = ['resetwallet'];
handler.tags = ['creatore'];
handler.command = /^(resetwallet|resetall)$/i;
handler.owner = true;

export default handler;
