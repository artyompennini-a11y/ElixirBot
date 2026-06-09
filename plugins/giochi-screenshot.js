// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

let handler = async (m, { conn, text, command }) => {
    try {
        if (!m.isGroup) throw '`[!] Comando utilizzabile solo nei gruppi.`'

        let targetJid = null
        let fakeText = ''

        if (m.quoted) {
            targetJid = m.quoted.sender
            fakeText = m.quoted.text || m.quoted.msg || text || 'Nessun testo presente.'
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
            let parts = text ? text.split('|').map(s => s.trim()) : ['']
            if (parts.length > 1) {
                fakeText = parts.slice(1).join(' ').trim()
            } else {
                fakeText = parts[0].replace(/@\d+/g, '').trim() || 'Messaggio intercettato.'
            }
        } else {
            throw '`[!] Rispondi a un messaggio o tagga un utente con \`.screenshot @tag | testo\``'
        }

        let userName = await conn.getName(targetJid)

        // Calcolo dell'orario corrente nel formato HH:MM
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const timeStr = `${hours}:${minutes}`

        // Tronca il testo se è eccessivamente lungo per preservare l'estetica del log
        let displayName = userName.length > 28 ? userName.substring(0, 28) + '...' : userName
        let displayText = fakeText.length > 150 ? fakeText.substring(0, 150) + '...' : fakeText

        // Generazione del layout testuale che simula l'intercettazione del messaggio
        let screenshotLog = `┌──  *CHAT LOG INTERCEPTOR* ──┐\n`
        screenshotLog += `│\n`
        screenshotLog += `│ 👤 *Utente:* ${displayName}\n`
        screenshotLog += `│ 🕒 *Orario:* ${timeStr}\n`
        screenshotLog += `│ 💬 *Messaggio:* _"${displayText}"_\n`
        screenshotLog += `│ 🟢 *Stato:* Ricevuto (1)\n`
        screenshotLog += `│\n`
        screenshotLog += `└──────────────────────────────┘`

        // Invia il log formattato taggando l'utente bersaglio
        await conn.sendMessage(m.chat, {
            text: screenshotLog,
            mentions: [targetJid]
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || e || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA ELIXIR*`)
    }
}

handler.help = ['screenshot']
handler.tags = ['admin']
handler.command = /^(screenshot)$/i
handler.admin = true
handler.group =
