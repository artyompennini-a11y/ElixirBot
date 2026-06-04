// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const commenti = [
        `Il culo di @${username} è così bello che ci mangerei`,
        `@${username} ha il culo più sfondato del gruppo`,
        `Quel culo di @${username} merita un premio Nobel`,
        `@${username} ha due chiappe che sembrano due pianeti`,
        `Il culo di @${username} è più famoso di OnlyFans`
    ]

    await conn.reply(m.chat, `🍑 *CULO METER*\n\n` + commenti[Math.floor(Math.random() * commenti.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^culo$/i
handler.tags = ['fun']
handler.group = true
export default handler
