// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const odio = [
        `Odio @${username} più della sveglia alle 6`,
        `Se @${username} sparisse, farei una festa`,
        `@${username} è come la diarrea: inutile e fastidioso`,
        `L'unica cosa che odio più di @${username} è svegliarmi`,
    ]

    await conn.reply(m.chat, `💔 *ODIO MODE*\n\n` + odio[Math.floor(Math.random() * odio.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^odio$/i
handler.tags = ['fun']
handler.group = true
export default handler
