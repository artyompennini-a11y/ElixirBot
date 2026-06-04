// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const azioni = [
        `sta succhiando @${username} con passione 🔥`,
        `succhia il cazzo di @${username} come un professionista`,
        `fa un pompino epico a @${username}`,
        `@${username} si sta facendo succhiare da dio`,
        `succhia fino all'ultima goccia @${username} 💦`
    ]

    await conn.reply(m.chat, `👄 *SUCCHIA MODE*\n\n` + azioni[Math.floor(Math.random() * azioni.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^succhia|succhi$/i
handler.tags = ['fun', 'nsfw']
handler.group = true
export default handler
