// Plug-in creato da elixir
import fs from 'fs'
import path from 'path'

const dbPath = path.resolve('./blacklist.json')

// Utility per leggere/scrivere il database
const getDB = () => {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}))
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let bl = getDB()
    
    // Identifica l'utente (tag, citato o numero nel testo)
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    if (!who && text) {
        let num = text.split('|')[0].replace(/[^0-9]/g, '')
        if (num.length > 8) who = num + '@s.whatsapp.net'
    }

    if (command === 'addblacklist' || command === 'abl') {
        if (!who) throw `*⚠️ Esempio:* ${usedPrefix}${command} @user | motivo`
        
        // Estrae il motivo dopo il separatore | o dopo il numero
        let reason = text.includes('|') ? text.split('|')[1].trim() : "Nessun motivo specificato"
        
        bl[who] = {
            reason: reason,
            addedBy: m.sender.split('@')[0],
            date: new Date().toLocaleString('it-IT')
        }
        saveDB(bl)
        
        // Bonus: Scansione immediata dei gruppi (Sceriffo Mode)
        await m.reply(`⏳ Utente @${who.split('@')[0]} bannato. Avvio scansione globale...`, null, { mentions: [who] })
        let groups = Object.values(await conn.groupFetchAllParticipating())
        for (let group of groups) {
            let botAdmin = group.participants.find(p => p.id === conn.user.jid)?.admin
            if (botAdmin && group.participants.some(p => p.id === who)) {
                await conn.groupParticipantsUpdate(group.id, [who], 'remove').catch(() => null)
            }
        }
        return m.reply(`✅ Pulizia completata.`)
    }

    if (command === 'delblacklist' || command === 'rbl') {
        if (!who) throw `*⚠️ Esempio:* ${usedPrefix}${command} @user`
        if (!bl[who]) throw "*L'utente non è in blacklist.*"
        
        delete bl[who]
        saveDB(bl)
        return m.reply(`🗑️ Utente @${who.split('@')[0]} rimosso dalla lista nera.`, null, { mentions: [who] })
    }

    if (command === 'listblacklist' || command === 'lbl') {
        let list = Object.keys(bl)
        if (list.length === 0) return m.reply("*Lista nera vuota.*")
        let txt = "📋 *UTENTI IN BLACKLIST:*\n\n"
        for (let i of list) {
            txt += `👤 @${i.split('@')[0]}\n motivo: ${bl[i].reason}\n\n`
        }
        return conn.reply(m.chat, txt, m, { mentions: list })
    }
}

handler.help = ['addblacklist', 'delblacklist', 'listblacklist']
handler.tags = ['owner']
handler.command = /^(add|del|list)blacklist|abl|rbl|lbl$/i
handler.owner = true 

export default handler
