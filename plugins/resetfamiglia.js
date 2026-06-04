// Plug-in creato da elixir
import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/database/sposi.json');

let handler = async (m, { conn, command, isOwner }) => {
    if (!isOwner) return

    // RESET GLOBALE
    if (command === 'resetallfamiglia' || command === 'purgatree') {
        fs.writeFileSync(marriagesFile, JSON.stringify({}, null, 2))
        let users = global.db.data.users
        Object.keys(users).forEach(jid => {
            users[jid].p = []
            users[jid].s = null
        })
        return m.reply('✅ *Reset globale completato.*')
    }

    // RESET SINGOLO
    if (command === 'resetfamiglia') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('⚠️ Tagga o rispondi a un messaggio.')

        let marriages = JSON.parse(fs.readFileSync(marriagesFile, 'utf8'))
        let partner = marriages[target]
        if (partner) {
            delete marriages[target]; delete marriages[partner]
            fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2))
        }

        let u = global.db.data.users[target]
        if (u) {
            if (u.p) u.p.forEach(f => { if(global.db.data.users[f]) global.db.data.users[f].s = null })
            if (u.s && global.db.data.users[u.s]) {
                global.db.data.users[u.s].p = global.db.data.users[u.s].p.filter(id => id !== target)
            }
            u.p = []; u.s = null
        }
        return m.reply(`🧹 Dinastia di @${target.split('@')[0]} azzerata.`, null, { mentions: [target] })
    }
}

handler.command = /^(resetfamiglia|resetallfamiglia|purgatree)$/i
handler.owner = true
export default handler
