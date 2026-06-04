// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]
    
    let percentuale = Math.floor(Math.random() * 100) + 1
    
    let commento = percentuale > 85 ? "🏳️‍🌈 GAY LEGGENDARIO" :
                   percentuale > 65 ? "Molto gay, complimenti" :
                   percentuale > 40 ? "Gay nella media" : "Etero ma con qualche dubbio 👀"

    await conn.reply(m.chat, `╔══ *GAY METER* ══╗\n\n` +
                           `@${username}\n` +
                           `Gay Level: ${percentuale}%\n\n` +
                           `${commento}\n` +
                           `╚════════════════╝`, m, { mentions: [menzione] })
}

handler.command = /^(gay|gaymeter)$/i
handler.tags = ['fun']
handler.group = true
export default handler
