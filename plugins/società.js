// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!global.db.data.societa) global.db.data.societa = []

    const items = {
        mansion: { name: 'Mansion Hollywood', price: 5000000, income: 60000 },
        moderna: { name: 'Villa Ultra-Moderna', price: 12000000, income: 150000 },
        castello: { name: 'Castello Reale', price: 50000000, income: 600000 },
        banca: { name: 'Banca Privata', price: 100000000, income: 4000000 }
    }

    if (command === 'socio') {
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
        let itemKey = args[1]?.toLowerCase()

        if (!who || !itemKey || !items[itemKey]) {
            let list = `🤝 *SOCIETÀ ELIXIR*\n━━━━━━━━━━━━━━━━━━━━\n\n`
            list += `Usa: \`${usedPrefix + command} @tag <id>\`\n\n`
            for (let k in items) list += `▫️ \`${k}\` - ${(items[k].price / 2).toLocaleString()} 🪙 (Quota 50%)\n`
            return m.reply(list)
        }

        if (who === m.sender) return m.reply("❌ Non puoi fare società con te stesso.")
        let half = items[itemKey].price / 2
        if (user.money < half) return m.reply("💰 Non hai abbastanza soldi per la tua quota.")

        global.db.data.societa.push({ p1: m.sender, p2: who, item: items[itemKey], key: itemKey, price: half, status: 'pending', time: Date.now() })
        return m.reply(`📩 *PROPOSTA INVIATA*\n\n@${m.sender.split('@')[0]} vuole comprare *${items[itemKey].name}* con te.\n\n✅ Scrivi \`.accettasocio\` per confermare.`, null, { mentions: [who, m.sender] })
    }

    if (command === 'accettasocio') {
        let i = global.db.data.societa.findIndex(s => s.p2 === m.sender && s.status === 'pending')
        if (i === -1) return m.reply("❌ Nessuna proposta in sospeso.")
        
        let s = global.db.data.societa[i]
        let userP1 = global.db.data.users[s.p1]
        
        if (user.money < s.price || userP1.money < s.price) return m.reply("💰 Uno dei due non ha più i soldi necessari.")

        user.money -= s.price
        userP1.money -= s.price
        
        let prop = { ...s.item, key: s.key, socio: s.p1, level: 1, lastClaim: Date.now() }
        if (!user.properties) user.properties = []
        if (!userP1.properties) userP1.properties = []
        
        user.properties.push({ ...prop, socio: s.p1 })
        userP1.properties.push({ ...prop, socio: m.sender })

        global.db.data.societa.splice(i, 1)
        return conn.sendMessage(m.chat, { text: `🤝 *AFFARE CONCLUSO*\n\nComproprietari: @${s.p1.split('@')[0]} & @${m.sender.split('@')[0]}\nOggetto: *${s.item.name}*`, mentions: [s.p1, m.sender] })
    }

    if (command === 'scioglisocio') {
        let itemName = args.join(' ').toLowerCase()
        if (!itemName) return m.reply("✍️ Specifica l'immobile da vendere.")

        let propIdx = user.properties.findIndex(p => p.socio && (p.name.toLowerCase().includes(itemName) || p.key === itemName))
        if (propIdx === -1) return m.reply("❌ Non hai questo immobile in società.")

        let prop = user.properties[propIdx]
        let socio = prop.socio
        let userSocio = global.db.data.users[socio]

        let refundHalf = Math.floor((prop.price * 0.6) / 2)
        user.money += refundHalf
        userSocio.money += refundHalf

        user.properties.splice(propIdx, 1)
        userSocio.properties = userSocio.properties.filter(p => !(p.key === prop.key && p.socio === m.sender))

        return conn.sendMessage(m.chat, { text: `💔 *SOCIETÀ SCIOLTA*\n\nVenduta: *${prop.name}*\nRicavato diviso: +${refundHalf.toLocaleString()} 🪙 a testa.`, mentions: [m.sender, socio] })
    }
}

handler.help = ['socio', 'accettasocio', 'scioglisocio']
handler.tags = ['economy']
handler.command = /^(socio|accettasocio|scioglisocio)$/i

export default handler
