// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let mentioned = m.mentionedJid
    // Controllo se sono state menzionate almeno 2 persone
    if (mentioned.length < 2) return m.reply('✨ *SHIP METER*\n\nDevi menzionare due persone!\nEs: `.ship @user1 @user2`')

    let user1 = mentioned[0]
    let user2 = mentioned[1]
    
    let percentuale = Math.floor(Math.random() * 100) + 1
    
    // Logica dei commenti
    let commento = ""
    if (percentuale > 90) commento = "💖 Destinati a stare insieme!"
    else if (percentuale > 70) commento = "❤️ Una coppia bellissima!"
    else if (percentuale > 50) commento = "✨ C'è del potenziale qui..."
    else if (percentuale > 30) commento = "🤔 Forse come amici?"
    else commento = "🚫 Meglio lasciar perdere 😂"

    let shipMsg = `
   *─── 「 💞 sʜɪᴘ ᴍᴇᴛᴇʀ 」 ────*

  💌 *@${user1.split('@')[0]}*
  ➕
  💌 *@${user2.split('@')[0]}*

  📊 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛà:* \`${percentuale}%\`
  ${commento}

   *────────────────────────*
`.trim()

    await conn.sendMessage(m.chat, { 
        text: shipMsg, 
        mentions: [user1, user2] 
    }, { quoted: m })
}

handler.command = /^ship$/i
handler.tags = ['fun']
handler.group = true

export default handler
