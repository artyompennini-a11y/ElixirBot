// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

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

        // Output unificato in formato testuale (Canvas rimosso)
        let output = `\`\`\`╔══════════════════════════════════╗
║        TOP MESSAGGI GRUPPO       ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`📁\` *Gruppo:* \`${groupMetadata.subject}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n`

        for (let i = 0; i < leaderboard.length; i++) {
            let entry = leaderboard[i]
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
            output += `\`${medal} #${i + 1}\` *${entry.name}* \`[ ${entry.count.toLocaleString()} msgs ]\`\n`
        }

        output += `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n\`🔐\` *SISTEMA THE PUNISHER*`

        await conn.sendMessage(m.chat, {
            text: output,
            mentions: leaderboard.map(e => e.jid)
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA THE PUNISHER*`)
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
