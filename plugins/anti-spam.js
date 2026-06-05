// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
const handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return
    const chat = global.db.data.chats[m.chat] || {}

    if (!chat.antispam) return
    if (isAdmin || isOwner || isSam) return

    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage'].includes(m.mtype)) return

    const msgTimestamp = (m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now())
    if (Date.now() - msgTimestamp > 15000) return

    const sender = m.sender
    const decodedSender = conn.decodeJid(sender)
    if (!decodedSender || decodedSender.endsWith('@lid')) return

    const now = Date.now()

    if (!global.gp_antispam) global.gp_antispam = new Map()
    if (!global.gp_antispam.has(decodedSender)) {
        global.gp_antispam.set(decodedSender, {
            messages: [],
            lastWarnTime: 0,
            warningCount: 0,
            mutedUntil: 0
        })
    }

    const userData = global.gp_antispam.get(decodedSender)

    if (userData.mutedUntil > now) {
        return
    }

    userData.messages = userData.messages.filter(t => now - t < 10000)
    userData.messages.push(now)

    let content = ''
    try {
        if (m.text) content = m.text
        else if (m.caption) content = m.caption
        else if (m.msg?.caption) content = m.msg.caption
        else if (m.msg?.text) content = m.msg.text
    } catch (e) {
        content = ''
    }

    let shouldDelete = false
    let reason = ''

    if (userData.messages.length >= 8) {
        shouldDelete = true
        reason = `FLOOD RAPIDO (${userData.messages.length} msg in 10s)`
    }

    if (content && content.length > 10) {
        const similarCount = userData.messages.filter((_, i) => {
            return i >= userData.messages.length - 5
        }).length

        if (similarCount >= 4) {
            shouldDelete = true
            reason = `SPAM DUPLICATO (${similarCount}x)`
        }
    }

    if (content && content.length > 15) {
        const specialChars = (content.match(/[^a-zA-Z0-9\s]/g) || []).length
        const specialPercent = specialChars / content.length
        if (specialPercent > 0.8) {
            shouldDelete = true
            reason = `CARATTERI SPECIALI (${(specialPercent * 100).toFixed(0)}%)`
        }
    }

    if (content) {
        const mentionCount = (content.match(/@/g) || []).length
        if (mentionCount > 5) {
            shouldDelete = true
            reason = `MENTION SPAM (${mentionCount} mention)`
        }
    }

    if (shouldDelete) {
        if (isBotAdmin) {
            try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) {}
        }

        if (!global.db.data.users[decodedSender]) global.db.data.users[decodedSender] = {}
        const userDb = global.db.data.users[decodedSender]
        userDb.warn = (userDb.warn || 0) + 1

        const tag = '@' + decodedSender.split('@')[0]

        if (userDb.warn >= 5) {
            userDb.warn = 0
            userData.mutedUntil = 0
            userData.messages = []

            try {
                await conn.groupParticipantsUpdate(m.chat, [decodedSender], 'remove')
            } catch (e) {}

            await conn.sendMessage(m.chat, {
                text: `\`\`\`╔══════════════════════════════════╗
║      ESPULSIONE AUTOMATICA       ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`⚡\` *Motivo:* \`${reason}\`
\`🔨\` *Azione:* \`ESPULSIONE [ 5/5 WARN ]\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`,
                mentions: [decodedSender]
            }).catch(() => {})
        } else {
            userData.warningCount++

            if (userData.warningCount >= 3) {
                userData.mutedUntil = now + 600000
                userData.warningCount = 0
                userData.messages = []

                await conn.sendMessage(m.chat, {
                    text: `\`\`\`╔══════════════════════════════════╗
║      MUTO TEMPORANEO             ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`⚡\` *Motivo:* \`${reason}\`
\`🔇\` *Muto:* \`10 minuti\`
\`⚠️\` *Warn DB:* \`${userDb.warn}/5\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`,
                    mentions: [decodedSender]
                }).catch(() => {})
            } else if (userData.warningCount >= 2 && now - userData.lastWarnTime < 60000) {
                await conn.sendMessage(m.chat, {
                    text: `\`\`\`╔══════════════════════════════════╗
║      AMMONIZIONE ANTISPAM        ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`⚡\` *Motivo:* \`${reason}\`
\`⚠️\` *Warn DB:* \`${userDb.warn}/5\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`,
                    mentions: [decodedSender]
                }).catch(() => {})
            }
            userData.lastWarnTime = now
        }
        return
    }

    global.gp_antispam.set(decodedSender, userData)
}

export default handler
