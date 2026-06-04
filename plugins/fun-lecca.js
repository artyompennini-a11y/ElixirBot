// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const azioni = [
        `lecca il collo di @${username} lentamente... 😏`,
        `lecca l'orecchio di @${username} e sussurra porcate`,
        `sta leccando la schiena di @${username} fino al culo`,
        `lecca i capezzoli di @${username} con passione`,
        `lecca tra le gambe di @${username} come un gelato`,
        `sta facendo un leccata profonda a @${username} 💦`,
        `lecca i piedi di @${username} da bravo cagnolino`
    ]

    await conn.reply(m.chat, `👅 *LECCA MODE*\n\n` + azioni[Math.floor(Math.random() * azioni.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^lecca$/i
handler.tags = ['fun']
handler.group = true
export default handler
