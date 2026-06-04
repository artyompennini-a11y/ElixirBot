// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]
    
    let lunghezza = Math.floor(Math.random() * 25) + 1
    let commento = lunghezza > 20 ? "🐘 Mostro leggendario" :
                   lunghezza > 15 ? "Grande e grosso" :
                   lunghezza > 10 ? "Nella media" : "Piccolo ma combattivo 😂"

    await conn.reply(m.chat, `╔══ *PP METER* ══╗\n\n` +
                           `@${username}\n` +
                           `Pisello: ${lunghezza} cm\n\n` +
                           `${commento}\n` +
                           `╚════════════════╝`, m, { mentions: [menzione] })
}

handler.command = /^pp$/i
handler.tags = ['fun']
handler.group = true
export default handler
