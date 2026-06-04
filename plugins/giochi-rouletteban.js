let handler = async (m, { conn, text, participants, usedPrefix }) => {
    const botId = conn.user.jid
    const gNoAdmins = participants.filter(p => p.id !== botId && !p.admin)

    if (gNoAdmins.length === 0) return m.reply('⚠️ *Errore:* Non ci sono utenti comuni da selezionare.')

    const randomUser = gNoAdmins[Math.floor(Math.random() * gNoAdmins.length)].id
    const probability = (100 / gNoAdmins.length).toFixed(2)
    
    const listMessage = {
        text: `*┳━━━━━━━━━━━━━━━━┓*
*┃ 🎰 ROULETTE RUSSA 🎰 ┃*
*┻━━━━━━━━━━━━━━━━┛*

*🎯 BERSAGLIO:* @${randomUser.split('@')[0]}
*🎲 PROBABILITÀ:* ${probability}%
*💀 DESTINO:* In bilico...

_Admin, decidi il suo futuro._`,
        footer: "ᴇʟɪxɪʀ ʙᴏᴛ • ꜱʏꜱᴛᴇᴍ ɢᴀᴍᴇ",
        mentions: [randomUser],
        buttons: [
            { buttonId: `${usedPrefix}kick ${randomUser}`, buttonText: { displayText: '✅ SÌ, ELIMINALO' }, type: 1 },
            { buttonId: `${usedPrefix}grazie_utente ${randomUser}`, buttonText: { displayText: '❌ NO, GRAZIA' }, type: 1 }
        ],
        headerType: 1
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: m })
}

// Handler per la conferma della grazia (da aggiungere come comando separato o nello stesso file)
handler.before = async (m, { conn }) => {
    if (!m.text) return
    if (m.text.includes('grazie_utente')) {
        const user = m.text.split(' ')[1]
        await conn.reply(m.chat, `✨ @${user.split('@')[0]} è stato graziato dal destino. Per questa volta resta nel gruppo!`, m, { mentions: [user] })
    }
}

handler.help = ['rouletteban']
handler.tags = ['giochi']
handler.command = /^(kickrandom|rouletterussa|rban|rouletteban)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
