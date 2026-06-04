// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
let handler = async (m, { conn, args, isOwner }) => {
    try {
        if (!isOwner) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Comando riservato al proprietario\n\n`
            errorMsg += `> elixir ✧ bot`
            return m.reply(errorMsg)
        }
        if (!m.isGroup) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Utilizzabile solo nei gruppi\n\n`
            errorMsg += `> elixir ✧ bot`
            return m.reply(errorMsg)
        }
        if (!global.db.data) {
            global.db.data = {
                users: {},
                chats: {},
                stats: {},
                msgs: {},
                sticker: {},
                settings: {}
            }
        }
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {
                isBanned: false,
                welcome: false,
                detect: false,
                sWelcome: '',
                sBye: '',
                sPromote: '',
                sDemote: '',
                delete: true,
                antiLink: false,
                viewonce: false,
                antiToxic: false,
                expired: 0
            }
        }

        let chat = global.db.data.chats[m.chat]
        if (chat.isBanned) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Questo gruppo è già bannato\n\n`
            errorMsg += `> elixir ✧ bot`
            return m.reply(errorMsg)
        }

        chat.isBanned = true
        await global.db.write()
        let groupInfo = await conn.groupMetadata(m.chat)
        let memberCount = groupInfo.participants.length
        let adminCount = groupInfo.participants.filter(p => p.admin).length

        m.reply(`*🚫 GRUPPO BANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Bannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*👤 Membri:* ${memberCount}
*👑 Admin:* ${adminCount}
*🔒 Azione:* Ban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

*⚠️ Effetti:*
┌─⭓ Bot non risponde ai comandi
├─⭓ Solo owner possono usare il bot
└─⭓ Ban attivo fino a revoca

> elixir ✧ bot`)
        let admins = groupInfo.participants.filter(p => p.admin)
        let adminMsg = `*⚠️ NOTIFICA ADMIN*\n`
        adminMsg += `━━━━━━━━━━━━━━━━\n\n`
        adminMsg += `*📝 Info:*\n`
        adminMsg += `└─⭓ Questo gruppo è stato bannato\n\n`
        adminMsg += `*📌 Note:*\n`
        adminMsg += `└─⭓ Il bot non risponderà ai comandi\n\n`
        adminMsg += `> elixir ✧ bot`

        for (let admin of admins) {
            await conn.sendMessage(admin.id, { text: adminMsg })
        }
    } catch (e) {
        console.error(e)
        return m.reply(`*❌ ERRORE*\n` +
                      `━━━━━━━━━━━━━━━━\n\n` +
                      `*⚠️ Si è verificato un errore*\n` +
                      `*📝 Tipo:* ${e.message}\n\n` +
                      `> elixir ✧ bot`)
    }
}

handler.help = ['bangp']
handler.tags = ['creatore']
handler.command = /^bangp$/i
handler.rowner = true
handler.group = true

export default handler
