global.navale = global.navale || {}
const footer = 'THE PUNISHER-BOT'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender

    // Inizializzazione Database
    global.db.data.users[user] = global.db.data.users[user] || {}
    let dbUser = global.db.data.users[user]

    // --- 1. INIZIO SFIDA ---
    if (command === 'battaglia') {
        if (global.navale[chat]) return m.reply('⚠️ Una battaglia è già in corso!')
        
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('⚓ *Tagga l\'avversario che vuoi affondare!*')
        if (target === user) return m.reply('🤔 Non puoi sparare alle tue stesse navi!')

        // Costo sfida: 100€
        if (dbUser.euro < 100) return m.reply(`📉 Non hai abbastanza euro! Ti servono 100€ per armare la flotta.`)

        global.navale[chat] = {
            p1: user,
            p2: target,
            status: 'WAITING',
            turno: user,
            board1: generateBoard(),
            board2: generateBoard(),
            hits1: [], 
            hits2: [],
            scommessa: 100
        }

        let intro = `ㅤ⋆｡˚『 ╭ \`⚓ BATTAGLIA NAVALE HD ⚓\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 ⚔️ 』 *SFIDANTE:* @${user.split('@')[0]}\n`
        intro += `│ 『 🎯 』 *AVVERSARIO:* @${target.split('@')[0]}\n`
        intro += `│ 『 💰 』 *POSTA IN GIOCO:* 200€\n`
        intro += `│ ──────────────────\n`
        intro += `│ 『 🛡️ 』 \`Accetti lo scontro?\`\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ACCETTA ✅', id: `${usedPrefix}accetta` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'RIFIUTA ❌', id: `${usedPrefix}rifiuta` }) }
        ]

        return conn.sendMessage(chat, { text: intro, footer, mentions: [user, target], interactiveButtons: buttons }, { quoted: m })
    }

    if (command === 'rifiuta') {
        if (!global.navale[chat] || user !== global.navale[chat].p2) return
        delete global.navale[chat]
        return m.reply('🏳️ La sfida è stata rifiutata. Codardi!')
    }

    if (command === 'endgame' || command === 'fine') { 
        if (!global.navale[chat]) return
        delete global.navale[chat]
        return m.reply('🏁 *Battaglia terminata forzatamente.*') 
    }

    if (command === 'accetta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING' || user !== game.p2) return
        
        // Controllo soldi avversario
        if (global.db.data.users[game.p2].euro < 100) {
            delete global.navale[chat]
            return m.reply('📉 L\'avversario non ha abbastanza euro per giocare!')
        }

        // Detrazione soldi
        global.db.data.users[game.p1].euro -= 100
        global.db.data.users[game.p2].euro -= 10
