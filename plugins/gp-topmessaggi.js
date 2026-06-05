// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import { createCanvas, loadImage } from 'canvas'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    try {
        let limit = 10
        if (args[0] && !isNaN(args[0])) {
            limit = parseInt(args[0])
        }

        let groupMetadata = await conn.groupMetadata(m.chat)
        let participants = groupMetadata.participants

        let leaderboard = []
        for (let p of participants) {
            let user = global.db.data.users[p.id]
            if (!user) continue
            let count = user.msgCount || 0
            if (count > 0) {
                leaderboard.push({
                    jid: p.id,
                    name: await conn.getName(p.id),
                    count
                })
            }
        }

        leaderboard.sort((a, b) => b.count - a.count)
        leaderboard = leaderboard.slice(0, limit)

        if (leaderboard.length === 0) {
            return m.reply('`[!] Nessun dato disponibile per questo gruppo.`')
        }

        if (limit <= 10) {
            const canvas = createCanvas(950, 650)
            const ctx = canvas.getContext('2d')

            ctx.fillStyle = '#0f111a'
            ctx.fillRect(0, 0, 950, 650)

            ctx.fillStyle = '#00ffcc'
            ctx.fillRect(0, 0, 15, 650)

            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 38px Arial, Verdana, Helvetica, sans-serif'
            ctx.fillText('TOP MESSAGGI', 280, 65)

            ctx.fillStyle = '#8f9cae'
            ctx.font = '20px Arial, Verdana, Helvetica, sans-serif'
            ctx.fillText(`Gruppo: ${groupMetadata.subject}`, 280, 110)

            ctx.fillStyle = '#3f475f'
            ctx.fillRect(280, 145, 620, 1)

            for (let i = 0; i < leaderboard.length; i++) {
                let entry = leaderboard[i]
                let y = 170 + i * 55

                let rankColor = '#00ffcc'
                if (i === 0) rankColor = '#ffd700'
                else if (i === 1) rankColor = '#c0c0c0'
                else if (i === 2) rankColor = '#cd7f32'

                ctx.fillStyle = rankColor
                ctx.font = 'bold 28px Arial, Verdana, Helvetica, sans-serif'
                ctx.fillText(`${i + 1}.`, 280, y)

                let ppUrl
                try {
                    ppUrl = await conn.profilePictureUrl(entry.jid, 'image')
                } catch {
                    ppUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/240px-Portrait_Placeholder.png'
                }

                let avatar
                try {
                    avatar = await loadImage(ppUrl)
                } catch {
                    avatar = null
                }

                ctx.save()
                ctx.beginPath()
                ctx.arc(330, y + 20, 22, 0, Math.PI * 2, true)
                ctx.closePath()
                ctx.clip()
                if (avatar) {
                    ctx.drawImage(avatar, 308, y - 2, 44, 44)
                } else {
                    ctx.fillStyle = '#3f475f'
                    ctx.fill()
                }
                ctx.restore()

                let displayName = entry.name.length > 20 ? entry.name.substring(0, 20) + '...' : entry.name
                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 22px Arial, Verdana, Helvetica, sans-serif'
                ctx.fillText(displayName, 370, y)

                ctx.fillStyle = '#8f9cae'
                ctx.font = '18px Arial, Verdana, Helvetica, sans-serif'
                ctx.fillText(`${entry.count.toLocaleString()} messaggi`, 370, y + 25)
            }

            const buffer = canvas.toBuffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: '`[⚡] ELIXIR ANALYTICS CORE`'
            }, { quoted: m })
        } else {
            let output = `\`\`\`╔══════════════════════════════════╗
║       TOP MESSAGGI GRUPPO        ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`📁\` *Gruppo:* \`${groupMetadata.subject}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
`

            for (let i = 0; i < leaderboard.length; i++) {
                let entry = leaderboard[i]
                let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
                output += `\`${medal} #${i + 1}\` *${entry.name}* \`[ ${entry.count.toLocaleString()} msgs ]\`
`
            }

            output += `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`

            await conn.sendMessage(m.chat, {
                text: output,
                mentions: leaderboard.map(e => e.jid)
            }, { quoted: m })
        }
    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA ELIXIR*`)
    }
}

handler.before = async (m) => {
    if (!m.isGroup) return
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    if (typeof global.db.data.users[m.sender].msgCount !== 'number') global.db.data.users[m.sender].msgCount = 0
    global.db.data.users[m.sender].msgCount += 1
    await global.db.write()
}

handler.help = ['topmessaggi', 'top']
handler.tags = ['gruppo']
handler.command = /^(topmessaggi|top)$/i
handler.group = true

export default handler
