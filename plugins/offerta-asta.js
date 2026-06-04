// Plug-in creato da elixir
import cron from 'node-cron'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let a = global.db.data.aste

    if (command === 'offerta') {
        if (!a) return m.reply("❌ Nessuna asta attiva al momento.")
        let bid = parseInt(args[0])
        if (isNaN(bid) || bid <= a.topBid) return m.reply(`📉 Offerta troppo bassa! Minimo: *${(a.topBid + 1).toLocaleString()}* 🪙.`)
        if (user.money < bid) return m.reply("💰 Non hai abbastanza liquidità.")

        a.topBid = bid
        a.topBidder = m.sender
        return conn.sendMessage(m.chat, { 
            text: `✨ *RILANCIO EFFETTUATO*\n👤 @${m.sender.split('@')[0]} è in testa con *${bid.toLocaleString()}* 🪙`, 
            mentions: [m.sender] 
        })
    }
}

cron.schedule('30 22 * * *', async () => {
    const conn = global.conn
    const users = global.db.data.users
    const groups = Object.keys(global.db.data.chats).filter(id => id.endsWith('@g.us'))

    let debitori = Object.keys(users).filter(id => users[id].money <= -10000 && ((users[id].properties?.length > 0) || (users[id].vehicles?.length > 0)))
    if (debitori.length === 0) return

    for (let id of debitori) {
        let user = users[id]
        let allAssets = [...(user.properties || []), ...(user.vehicles || [])]
        if (allAssets.length === 0) continue

        let item = allAssets[Math.floor(Math.random() * allAssets.length)]
        let startPrice = Math.floor(item.price / 4)

        global.db.data.aste = {
            item: item,
            seller: 'SYSTEM',
            owner: id,
            topBid: startPrice,
            topBidder: null,
            endTime: Date.now() + 60000 
        }

        let annuncio = `⚖️ *ASTA GIUDIZIARIA: SEQUESTRO*\n━━━━━━━━━━━━━━━━━━━━\n\n`
        annuncio += `Il cittadino @${id.split('@')[0]} è in bancarotta.\nLe autorità hanno pignorato un suo bene!\n\n`
        annuncio += `📦 *OGGETTO:* ${item.name.toUpperCase()}\n`
        annuncio += `💰 *BASE D'ASTA:* ${startPrice.toLocaleString()} 🪙\n`
        annuncio += `⏳ *DURATA:* 60 Secondi\n\n`
        annuncio += `👉 Partecipa con: \`.offerta <cifra>\`\n━━━━━━━━━━━━━━━━━━━━\n📢 @everyone`

        for (let gid of groups) {
            try {
                let meta = await conn.groupMetadata(gid)
                await conn.sendMessage(gid, { text: annuncio, mentions: [id, ...meta.participants.map(v => v.id)] })
            } catch (e) {}
        }

        await sleep(60000)

        let ast = global.db.data.aste
        if (!ast.topBidder) {
            for (let gid of groups) {
                await conn.sendMessage(gid, { text: `🔨 *ASTA CONCLUSA*\nNessuna offerta per *${item.name}*. L'oggetto è stato incamerato dallo Stato.` })
            }
        } else {
            let vincitore = global.db.data.users[ast.topBidder]
            vincitore.money -= ast.topBid
            users[id].money += ast.topBid 

            if (item.rent || item.income) {
                user.properties = user.properties.filter(p => p.name !== item.name)
                if (!vincitore.properties) vincitore.properties = []
                vincitore.properties.push({ ...item, lastClaim: Date.now() })
            } else {
                user.vehicles = user.vehicles.filter(v => v.name !== item.name)
                if (!vincitore.vehicles) vincitore.vehicles = []
                vincitore.vehicles.push({ ...item, boughtAt: Date.now() })
            }

            let finale = `🏆 *LOTTO AGGIUDICATO*\n━━━━━━━━━━━━━━━━━━━━\n\n`
            finale += `📦 *OGGETTO:* ${item.name}\n`
            finale += `👤 *VINCITORE:* @${ast.topBidder.split('@')[0]}\n`
            finale += `💰 *DEBITO RISANATO:* +${ast.topBid.toLocaleString()} 🪙`
            
            for (let gid of groups) {
                await conn.sendMessage(gid, { text: finale, mentions: [ast.topBidder, id] })
            }
        }
        global.db.data.aste = null
        await sleep(5000) 
    }
}, {
    scheduled: true,
    timezone: "Europe/Rome"
})

handler.help = ['offerta <cifra>']
handler.tags = ['economy']
handler.command = /^(offerta|bid)$/i

export default handler
