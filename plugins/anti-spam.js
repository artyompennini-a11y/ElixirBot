// Plugin Anti-Spam Avanzato per Elixir Bot
// Attivabile/disattivabile via .attiva gp-antispam / .disattiva gp-antispam

const handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return
    const chat = global.db.data.chats[m.chat] || {}
    
    // === CHECK FEATURE STATUS ===
    // Usa chat.antispam (stessa variabile di anti-spam.js per coerenza)
    if (!chat.antispam) return
    if (isAdmin || isOwner || isSam) return
    
    // Escludi reazioni, sondaggi, messaggi di sistema
    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage'].includes(m.mtype)) return
    
    const msgTimestamp = (m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now())
    if (Date.now() - msgTimestamp > 15000) return // Ignora messaggi vecchi
    
    const sender = m.sender
    const decodedSender = conn.decodeJid(sender)
    if (!decodedSender || decodedSender.endsWith('@lid')) return
    
    const now = Date.now()
    
    // Inizializza struttura dati per l'utente
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
    
    // Se l'utente è in muto, ignora
    if (userData.mutedUntil > now) {
        console.log(`[GP-ANTISPAM] Utente ${decodedSender.split('@')[0]} in muto fino al ${new Date(userData.mutedUntil).toLocaleTimeString()}`)
        return
    }
    
    // Pulisci messaggi più vecchi di 10 secondi
    userData.messages = userData.messages.filter(t => now - t < 10000)
    
    // Aggiungi timestamp corrente
    userData.messages.push(now)
    
    // Ottieni il contenuto del messaggio per rilevamento duplicati
    let content = ''
    try {
        if (m.text) content = m.text
        else if (m.caption) content = m.caption
        else if (m.msg?.caption) content = m.msg.caption
        else if (m.msg?.text) content = m.msg.text
    } catch (e) {
        content = ''
    }
    
    // === REGOLE ANTI-SPAM ===
    let shouldDelete = false
    let reason = ''
    
    // REGOLA 1: Flood rapido (>8 messaggi in 10 secondi)
    if (userData.messages.length >= 8) {
        shouldDelete = true
        reason = `FLOOD RAPIDO (${userData.messages.length} msg in 10s)`
    }
    
    // REGOLA 2: Messaggi identici ripetuti (copia-incolla spam)
    if (content && content.length > 10) {
        const similarCount = userData.messages.filter((_, i) => {
            // Check solo gli ultimi 5 messaggi per similarità
            return i >= userData.messages.length - 5
        }).length
        
        // Se è il 4+ messaggio identico, è spam
        if (similarCount >= 4) {
            shouldDelete = true
            reason = `SPAM DUPLICATO (${similarCount}x)`
        }
    }
    
    // REGOLA 3: Caratteri speciali ripetuti (>80% del messaggio sono caratteri non alfanumerici)
    if (content && content.length > 15) {
        const specialChars = (content.match(/[^a-zA-Z0-9\s]/g) || []).length
        const specialPercent = specialChars / content.length
        if (specialPercent > 0.8) {
            shouldDelete = true
            reason = `CARATTERI SPECIALI IN SERIE (${(specialPercent * 100).toFixed(0)}%)`
        }
    }
    
    // REGOLA 4: Mention spam (>5 mention in un messaggio)
    if (content) {
        const mentionCount = (content.match(/@/g) || []).length
        if (mentionCount > 5) {
            shouldDelete = true
            reason = `MENTION SPAM (${mentionCount} mention)`
        }
    }
    
    if (shouldDelete) {
        // Elimina il messaggio
        if (isBotAdmin) {
            try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) {}
        }
        
        // Warn progressivo
        userData.warningCount++
        
        if (userData.warningCount >= 3) {
            // Alla terza violazione: muto 10 minuti
            userData.mutedUntil = now + 600000 // 10 minuti
            userData.warningCount = 0
            userData.messages = []
            
            const muteText = `━━━━━━━━━━━━━━━━━━━━
╭─《 🛡️ GP-ANTISPAM 》─╮
┃
┃ 👤 @${decodedSender.split('@')[0]}
┃ ⚡ ${reason}
┃ 🔇 MUTO per 10 minuti
┃
╰─━━━━━━━━━━━━━━━─╯
━━━━━━━━━━━━━━━━━━━━`
            
            await conn.sendMessage(m.chat, {
                text: muteText,
                mentions: [decodedSender]
            }).catch(() => {})
        } else if (userData.warningCount >= 2 && now - userData.lastWarnTime < 60000) {
            // Seconda violazione entro 1 minuto: ultimatum
            const warnText = `━━━━━━━━━━━━━━━━━━━━
╭─《 🛡️ GP-ANTISPAM 》─╮
┃
┃ 👤 @${decodedSender.split('@')[0]}
┃ ⚡ ${reason}
┃ ⚠️ ATTENZIONE: ${userData.warningCount}/3
┃ Prossima violazione = MUTO 10 min
┃
╰─━━━━━━━━━━━━━━━─╯
━━━━━━━━━━━━━━━━━━━━`
            
            await conn.sendMessage(m.chat, {
                text: warnText,
                mentions: [decodedSender]
            }).catch(() => {})
        } else {
            // Primo warn silenzioso (solo eliminazione)
            userData.lastWarnTime = now
        }
        
        return
    }
    
    // Aggiorna i dati utente
    global.gp_antispam.set(decodedSender, userData)
}

export default handler
