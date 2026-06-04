// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const pestate = [
        `pesta la faccia di @${username} come un tappeto`,
        `sta pestando @${username} a calci nel culo`,
        `pesta la testa di @${username} contro il muro`,
        `sta facendo il tappeto con @${username}`,
        `pesta @${username} finché non chiede pietà`,
        `gli sta dando un pestaggio di livello epico`
    ]

    await conn.reply(m.chat, `👊 *PESTA MODE ACTIVATED*\n\n` + pestate[Math.floor(Math.random() * pestate.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^pesta$/i
handler.tags = ['fun']
handler.group = true
export default handler
