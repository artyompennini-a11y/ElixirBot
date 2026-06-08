let handler = async (m, { conn, text }) => {
   
    let mentioned = m.mentionedJid || [];
    
    let user1 = '';
    let user2 = '';

    
    if (mentioned.length >= 2) {
        user1 = mentioned[0];
        user2 = mentioned[1];
    } else if (mentioned.length === 1 && m.quoted) {
        user1 = m.quoted.sender;
        user2 = mentioned[0];
    } else if (m.quoted) {
        user1 = m.sender;
        user2 = m.quoted.sender;
    } else {
        return m.reply('✨ *SHIP METER*\n\nDevi menzionare due persone o rispondere al messaggio di un utente menzionandone un altro!\nEs: `.ship @user1 @user2` o rispondi a un messaggio scrivendo `.ship @user` ');
    }

   
    let percentuale = Math.floor(Math.random() * 100) + 1;
    
    // Generazione della barra di progresso visiva (10 blocchi totali)
    let boccoCount = Math.round(percentuale / 10);
    let bar = '█'.repeat(boccoCount) + '░'.repeat(10 - boccoCount);
    
   
    let commento = "";
    if (percentuale > 90) commento = "💖 *Destinati a stare insieme!*";
    else if (percentuale > 75) commento = "❤️ *Una coppia assolutamente bellissima!*";
    else if (percentuale > 50) commento = "✨ *C'è dell'ottimo potenziale qui...*";
    else if (percentuale > 30) commento = "🤔 *Forse funziona meglio come amicizia?*";
    else commento = "🚫 *Sintonia non rilevata. Meglio lasciar perdere!* 😂";

  
    let shipMsg = `┌─── 「 💞 *ꜱʜɪᴘ ᴍᴇᴛᴇʀ* 」 ───┐\n` +
                  `│\n` +
                  `│ 👤 *User 1:* @${user1.split('@')[0]}\n` +
                  `│ ➕\n` +
                  `│ 👤 *User 2:* @${user2.split('@')[0]}\n` +
                  `│\n` +
                  `├───────────────────────────\n` +
                  `│\n` +
                  `│ 📊 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛà:* \`${percentuale}%\`\n` +
                  `│ 📟 *Progress:* \`[${bar}]\`\n` +
                  `│\n` +
                  `│ 💬 ${commento}\n` +
                  `│\n` +
                  `└───────────────────────────┘`.trim();

    
    await conn.sendMessage(m.chat, { 
        text: shipMsg, 
        mentions: [user1, user2] 
    }, { quoted: m });
};

handler.command = /^ship$/i;
handler.tags = ['fun'];
handler.group = true;

export default handler;
