// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]
    
    let perc = Math.floor(Math.random() * 100) + 1
    let msg = perc > 80 ? "SIMPO MASSIMO, vai a prenderle i fiori" :
              perc > 50 ? "Simp di livello avanzato" : "Poco simp, quasi normale"

    await conn.reply(m.chat, `╔══ *SIMP METER* ══╗\n\n` +
                           `@${username}\n` +
                           `Simp Level: ${perc}%\n\n` +
                           `${msg}\n` +
                           `╚════════════════╝`, m, { mentions: [menzione] })
}

handler.command = /^simp$/i
handler.tags = ['fun']
handler.group = true
export default handler
