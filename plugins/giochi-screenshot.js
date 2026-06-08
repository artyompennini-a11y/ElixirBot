// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝
import { createCanvas, loadImage } from 'canvas'


function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ')
    let line = ''
    let lines = []

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' '
        let metrics = ctx.measureText(testLine)
        let testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
            lines.push(line)
            line = words[n] + ' '
        } else {
            line = testLine
        }
    }
    lines.push(line)

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i].trim(), x, y + (i * lineHeight))
    }
    return lines.length
}

let handler = async (m, { conn, text, command }) => {
    try {
        if (!m.isGroup) throw new Error('Comando utilizzabile solo nei gruppi.')

        let targetJid = null
        let fakeText = ''

      
        if (m.quoted) {
            targetJid = m.quoted.sender
            fakeText = text || 'Messaggio intercettato.'
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
            let parts = text ? text.split('|').map(s => s.trim()) : ['']
            if (parts.length > 1) {
                fakeText = parts.slice(1).join(' ').trim()
            } else {
                fakeText = parts[0].replace(/@\d+/g, '').trim() || 'Messaggio intercettato.'
            }
        } else {
            throw new Error('Rispondi a un messaggio o tagga un utente usando:\n`.screenshot @tag | testo`')
        }

        let userName = await conn.getName(targetJid)

       
        let ppUrl
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, 'image')
        } catch {
            ppUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/240px-Portrait_Placeholder.png'
        }

      a
        const baseWidth = 950
        const maxWidthText = 620
        const dummyCanvas = createCanvas(baseWidth, 200)
        const dummyCtx = dummyCanvas.getContext('2d')
        dummyCtx.font = '26px Arial, Helvetica, sans-serif'
        
        const words = fakeText.split(' ')
        let currentLine = ''
        let lineCount = 1
        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' '
            if (dummyCtx.measureText(testLine).width > maxWidthText && n > 0) {
                lineCount++
                currentLine = words[n] + ' '
            } else {
                currentLine = testLine
            }
        }

       
        const lineHeight = 36
        const padding = 60
        const calculatedHeight = Math.max(180, 110 + (lineCount * lineHeight))

        const canvas = createCanvas(baseWidth, calculatedHeight)
        const ctx = canvas.getContext('2d')

        // Sfondo fedele a WhatsApp Dark Mode (#111b21)
        ctx.fillStyle = '#111b21'
        ctx.fillRect(0, 0, baseWidth, calculatedHeight)

      
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
        ctx.font = 'bold 32px Arial, Helvetica, sans-serif'
        ctx.textAlign = 'left'
        let displayName = userName.length > 28 ? userName.substring(0, 28) + '...' : userName
        ctx.fillText(displayName, 180, 65)

        // Generazione del timestamp orario attuale
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const timeStr = `${hours}:${minutes}`
        
        ctx.fillStyle = '#8696a0'
        ctx.font = '22px Arial, Helvetica, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(timeStr, 900, 65)

        // Rendering del Testo del Messaggio con Wrap automatico (#d1d7db)
        ctx.textAlign = 'left'
        ctx.fillStyle = '#d1d7db'
        ctx.font = '26px Arial, Helvetica, sans-serif'
        wrapText(ctx, fakeText, 180, 115, maxWidthText, lineHeight)

       
        const badgeY = Math.min(calculatedHeight - 50, 120)
        ctx.beginPath()
        ctx.arc(890, badgeY, 18, 0, Math.PI * 2)
        ctx.fillStyle = '#00a884'
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial, Helvetica, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('1', 890, badgeY + 1)

        const buffer = canvas.toBuffer('image/png')

        
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '`[🎭] THE PUNISHER INTERCEPTOR ENGINE`',
            mentions: [targetJid]
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA THE PUNISHER*`)
    }
}

handler.help = ['screenshot']
handler.tags = ['admin']
handler.command = /^(screenshot)$/i
handler.admin = true
handler.group = true

export default handler
