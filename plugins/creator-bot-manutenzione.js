// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
let handler = async (m, { conn, args, isOwner, isROwner }) => {
    try {
        if (!isOwner && !isROwner) {
            let errMsg = `*⛔ ERRORE COMANDO*\n`
            errMsg += `━━━━━━━━━━━━━━━━\n\n`
            errMsg += `\`⚠️\` *Motivo:*\n`
            errMsg += `└─⭓ Comando riservato al proprietario\n\n`
            errMsg += `> 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃`
            return m.reply(errMsg)
        }

        if (!global.db.data.settings) global.db.data.settings = {}
        if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {}
        let settings = global.db.data.settings[conn.user.jid]

        let command = m.text.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
        let isOn = command === 'onman' || command === 'manutenzionon'

        if (isOn) {
            settings.maintenance = true
            await global.db.write()
            let msg = `\`\`\`╔══════════════════════════════════╗
║     BOT IN MANUTENZIONE          ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`⚠️\` *Sistema in manutenzione*
\`🔧\` *Stato:* \`ATTIVO\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔒\` Solo il proprietario può operare
\`⏳\` Il bot non risponde ai comandi
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA THE PUNISHER*`
            return m.reply(msg)
        } else {
            settings.maintenance = false
            await global.db.write()
            let msg = `\`\`\`╔══════════════════════════════════╗
║    MANUTENZIONE DISATTIVATA      ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`✅\` *Sistema riattivato*
\`🔧\` *Stato:* \`DISATTIVO\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔓\` Operatività normale ripristinata
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA THE PUNISHER*`
            return m.reply(msg)
        }
    } catch (e) {
        console.error(e)
        let errMsg = `*⛔ ERRORE*\n`
        errMsg += `━━━━━━━━━━━━━━━━\n\n`
        errMsg += `\`⚠️\` *Si è verificato un errore*\n`
        errMsg += `\`📝\` *Tipo:* ${e.message}\n\n`
        errMsg += `> 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃`
        return m.reply(errMsg)
    }
}

handler.help = ['manutenzione']
handler.tags = ['creatore']
handler.command = /^(onman|offman|manutenzionon|manutenzioneoff)$/i
handler.rowner = true

export default handler
