// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const oroscopi = [
        `Oggi @${username} prenderà tanti cazzi 🥳`,
        `Fortuna oggi: @${username} verrà inculato/a`,
        `Le stelle dicono che @${username} farà schifo a letto`,
        `Oggi è il giorno perfetto per @${username} per essere una troia`,
        `@${username} oggi troverà l'amore... o almeno un bel cazzo`
    ]

    await conn.reply(m.chat, `🔮 *OROSCOPO DEL GIORNO*\n\n` + oroscopi[Math.floor(Math.random() * oroscopi.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^fortuna|oroscopo$/i
handler.tags = ['fun']
handler.group = true
export default handler
