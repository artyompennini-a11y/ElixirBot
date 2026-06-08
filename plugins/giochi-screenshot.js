// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import { createCanvas, loadImage } from 'canvas'

let handler = async (m, { conn, text, command }) => {
    try {
        if (!m.isGroup) throw '`[!] Comando utilizzabile solo nei gruppi.`'

        let targetJid = null
        let fakeText = ''

        if (m.quoted) {
            targetJid = m.quoted.sender
            // Estrae il testo reale del messaggio a cui hai risposto
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

        let ppUrl
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, 'image')
        } catch {
            ppUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/240px-Portrait_Placeholder.png'
        }

        const canvas = createCanvas(950, 180)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#111b21'
        ctx.fillRect(0, 0, 950, 180)

        let avatar
        try {
            avatar = await loadImage(ppUrl)
        } catch {
            avatar = null
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(95, 90, 55, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()
        if (avatar) {
            ctx.drawImage(avatar, 40, 35, 110, 110)
        } else {
            ctx.fillStyle = '#2a3942'
            ctx.fill()
        }
        ctx.restore()

        ctx.fillStyle = '#e9edef'
        ctx.font = 'bold 32px Arial, Verdana, Helvetica, sans-serif'
        ctx.textAlign = 'left'
        let displayName = userName.length > 28 ? userName.substring(0, 28) + '...' : userName
        ctx.fillText(displayName, 180, 55)

        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const timeStr = `${hours}:${minutes}`
        ctx.fillStyle = '#8696a0'
        ctx.font = '22px Arial, Verdana, Helvetica, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(timeStr, 880, 55)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#d1d7db'
        ctx.font = '26px Arial, Verdana, Helvetica, sans-serif'
        let displayText = fakeText.length > 50 ? fakeText.substring(0, 50) + '...' : fakeText
        ctx.fillText(displayText, 180, 115)

        ctx.beginPath()
        ctx.arc(878, 115, 18, 0, Math.PI * 2)
        ctx.fillStyle = '#00a884'
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial, Verdana, Helvetica, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('1', 878, 116)

        const buffer = canvas.toBuffer('image/png')

        // Invia l'immagine senza testo di didascalia
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '', 
            mentions: [targetJid]
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA ELIXIR*`)
    }
}

handler.help = ['screenshot']
handler.tags = ['admin']
handler.command = /^(screenshot)$/i
handler.admin = true
handler.group = true

export default handler
