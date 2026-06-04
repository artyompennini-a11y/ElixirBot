// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.properties) user.properties = []
    if (!user.vehicles) user.vehicles = []

    if (command === 'investi') {
        let amount = parseInt(args[0])
        if (isNaN(amount) || amount <= 0) return m.reply(`💰 *MERCATO AZIONARIO*\nUsa: \`${usedPrefix + command} <quantità>\` per investire i tuoi soldi.`)
        if (user.money < amount) return m.reply("❌ Non hai abbastanza soldi per questo investimento.")

        let chance = Math.random()
        if (chance > 0.5) {
            let profit = Math.floor(amount * (Math.random() * 1.5))
            user.money += profit
            return m.reply(`📈 *INVESTIMENTO RIUSCITO*\n\nIl mercato è salito alle stelle!\nHai guadagnato: +${profit.toLocaleString()} 🪙`)
        } else {
            user.money -= amount
            return m.reply(`📉 *CRASH DEL MERCATO*\n\nL'investimento è fallito miseramente.\nHai perso: -${amount.toLocaleString()} 🪙`)
        }
    }

    if (command === 'assets' || command === 'inventario') {
        if (user.money < -10000 && (user.properties.length > 0 || user.vehicles.length > 0)) {
            if (Math.random() < 0.3) {
                let item
                if (user.properties.length > 0) {
                    item = user.properties.splice(Math.floor(Math.random() * user.properties.length), 1)[0]
                } else {
                    item = user.vehicles.splice(Math.floor(Math.random() * user.vehicles.length), 1)[0]
                }
                user.money += Math.floor(item.price * 0.5)
                return m.reply(`🚨 *PIGNORAMENTO ESECUTIVO*\n\nA causa dei tuoi debiti troppo elevati, le autorità hanno confiscato e venduto all'asta: *${item.name}*.\nIl ricavato è stato usato per risanare parte del debito.`)
            }
        }

        let totalValue = 0
        const countItems = (arr) => {
            let counts = {}
            arr.forEach(item => {
                let key = `${item.name.toUpperCase()}${item.level > 1 ? ' [Lvl ' + item.level + ']' : ''}`
                counts[key] = (counts[key] || 0) + 1
                totalValue += (item.price || 0)
            })
            return counts
        }

        let text = `🏦 *PATRIMONIO DI @${m.sender.split('@')[0]}*\n`
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`
        text += `🏘️ *IMMOBILI:* ${user.properties.length > 0 ? '' : '_Nessuno_'}\n`
        let props = countItems(user.properties)
        for (let name in props) text += ` ├ ${name} (x${props[name]})\n`

        text += `\n🏎️ *GARAGE:* ${user.vehicles.length > 0 ? '' : '_Nessuno_'}\n`
        let vehs = countItems(user.vehicles)
        for (let name in vehs) text += ` ├ ${name} (x${vehs[name]})\n`

        text += `\n━━━━━━━━━━━━━━━━━━━━\n`
        text += `💎 *VALORE ASSET:* ${totalValue.toLocaleString()} 🪙\n`
        text += `💵 *SALDO:* ${user.money.toLocaleString()} 🪙\n`
        if (user.money < 0) text += `🚨 *DEBITO:* ${Math.abs(user.money).toLocaleString()} 🪙\n`

        return conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
    }
}

handler.help = ['investi', 'assets']
handler.tags = ['economy']
handler.command = /^(investi|assets|inventario)$/i

export default handler
