// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
let handler = async (m, { conn }) => {
    try {
        let allChats = global.db.data.chats
        if (!allChats) return m.reply('`[!] Database non disponibile.`')

        let groups = []
        for (let [jid, chat] of Object.entries(allChats)) {
            if (!jid.endsWith('@g.us')) continue
            if (!chat.totalMessages || chat.totalMessages === 0) continue

            let name = 'Sconosciuto'
            try {
                name = await conn.getName(jid)
            } catch (e) {
                name = `Gruppo ${jid.split('@')[0]}`
            }

            groups.push({
                jid,
                name,
                total: chat.totalMessages
            })
        }

        if (groups.length === 0) {
            return m.reply('`[!] Nessun gruppo con messaggi tracciati.`')
        }

        groups.sort((a, b) => b.total - a.total)

        let output = `\`\`\`╔══════════════════════════════════╗
║       TOP GRUPPI GLOBALI         ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`📁\` *Totale Gruppi:* \`${groups.length}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
`

        for (let i = 0; i < groups.length; i++) {
            let g = groups[i]
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📁'
            output += `\`${medal} #${i + 1}\` *${g.name}* \`[ ${g.total.toLocaleString()} msgs ]\`
`
        }

        output += `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`

        await conn.sendMessage(m.chat, {
            text: output,
            mentions: groups.map(g => g.jid)
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA ELIXIR*`)
    }
}

handler.before = async (m) => {
    if (!m.isGroup) return
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (typeof global.db.data.chats[m.chat].totalMessages !== 'number') global.db.data.chats[m.chat].totalMessages = 0
    global.db.data.chats[m.chat].totalMessages += 1
    await global.db.write()
}

handler.help = ['topgruppi']
handler.tags = ['owner']
handler.command = /^(topgruppi)$/i
handler.owner = true

export default handler
