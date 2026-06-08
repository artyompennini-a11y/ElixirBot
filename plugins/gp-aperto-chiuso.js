// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

let handler = async (m, { conn, command }) => {
    const isOpening = command === 'aperto'
    const status = isOpening ? 'not_announcement' : 'announcement'
    
    // Reazione immediata per dare feedback del comando ricevuto
    await conn.sendMessage(m.chat, { react: { text: isOpening ? '🔓' : '🔒', key: m.key } })

    // Aggiornamento effettivo delle impostazioni del gruppo su WhatsApp
    await conn.groupSettingUpdate(m.chat, status)

    const message = isOpening 
        ? "« 🔓 »  *L'ARENA È APERTA*\n\n> *Il silenzio è rotto. La parola torna al popolo. Esprimetevi con saggezza.*"
        : "« 🔒 »  *SILENZIO DI STATO*\n\n> *Le porte si chiudono. Solo le divinità regnano in questo spazio.*"

    // Definizione dei bottoni interattivi (Stato speculare rispetto al comando inviato)
    const buttons = [
        {
            buttonId: isOpening ? '.chiuso' : '.aperto',
            buttonText: { displayText: isOpening ? '🔒 Chiudi Gruppo' : '🔓 Apri Gruppo' },
            type: 1
        }
    ]

    // Costruzione del messaggio con template interattivo e metadati di inoltro simulati
    const buttonMessage = {
        text: message,
        footer: '⚙️ Pannello Rapido Amministrazione',
        buttons: buttons,
        headerType: 1,
        contextInfo: {
            externalAdReply: {
                title: isOpening ? '〔 ACCESS GRANTED 〕' : '〔 ACCESS DENIED 〕',
                body: 'Gestionale Sistema 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃',
                thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=500', 
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: false
            },
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363407063409735@newsletter',
                newsletterName: `✦ ${global.db?.data?.nomedelbot || '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃'} ✦`,
                serverMessageId: 143
            }
        }
    }

    // Invio della struttura finale come messaggio singolo visualizzabile
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler
