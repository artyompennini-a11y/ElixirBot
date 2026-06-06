let handler = async (m, { conn, command }) => {
    const isOpening = command === 'aperto'
    const status = isOpening ? 'not_announcement' : 'announcement'
    
    // Reazione immediata per dare feedback del comando ricevuto
    await conn.sendMessage(m.chat, { react: { text: isOpening ? '🔓' : '🔒', key: m.key } })

    await conn.groupSettingUpdate(m.chat, status)

    const message = isOpening 
        ? "« 🔓 »  *L'ARENA È APERTA*\n\n> *Il silenzio è rotto. La parola torna al popolo. Esprimetevi con saggezza.*"
        : "« 🔒 »  *SILENZIO DI STATO*\n\n> *Le porte si chiudono. Solo le divinità regnano in questo spazio.*"

    await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: isOpening ? '〔 ACCESS GRANTED 〕' : '〔 ACCESS DENIED 〕',
                body: 'Gestionale Sistema 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃',
                thumbnailUrl: 'https://telegra.ph/file/your-image-link.jpg', // Opzionale: aggiungi un'immagine figa
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: false
            },
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363426482335068@newsletter',
                newsletterName: `✦ ${global.db.data.nomedelbot || '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃'} ✦`,
                serverMessageId: 143
            }
        }
    }, { quoted: m })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler
