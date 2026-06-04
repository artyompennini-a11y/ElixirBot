// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const frasi = [
        `mandi @${username} a fanculo con stile`,
        `@${username} vai a fanculo, sei insopportabile`,
        `@${username} ti mando affanculo con amore ❤️`,
        `Vai a fanculo @${username}, e porta pure tua madre`,
        `Fanculo a te e a tutta la tua stirpe @${username}`
    ]

    await conn.reply(m.chat, `🖕 *FANCULO MODE*\n\n` + frasi[Math.floor(Math.random() * frasi.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^fanculo$/i
handler.tags = ['fun']
handler.group = true
export default handler
