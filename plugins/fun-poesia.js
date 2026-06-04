// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let username = menzione.split('@')[0]

    const poesie = [
        `Roses are red,\nViolets are blue,\n@${username} ha il culo stretto,\nMa io lo allargo con più di due.`,
        `Sei come il WiFi,\nTutti ti vogliono ma nessuno ti paga.`,
        `@${username}, i tuoi occhi brillano,\nMa il tuo culo brilla di più quando lo sfondo.`,
        `Amore mio dolce e caro,\nLascia che ti rompa il culo come un barbaro.`,
        `Sei bello come il sole,\nMa io ti voglio solo per fare il buco.`,
    ]

    await conn.reply(m.chat, `📜 *POESIA DEDICATA*\n\n` + poesie[Math.floor(Math.random() * poesie.length)], m, {
        mentions: [menzione]
    })
}

handler.command = /^poesia|poema$/i
handler.tags = ['fun']
handler.group = true
export default handler
