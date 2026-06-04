// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.properties) user.properties = []
    if (!user.vehicles) user.vehicles = []

    let itemName = args.join(' ').toLowerCase()
    if (!itemName) return m.reply(`🔍 *GESTIONE ASSETS*\nUsa: \`${usedPrefix + command} <nome/id>\``)

    let propertyIndex = user.properties.findIndex(p => p.name.toLowerCase().includes(itemName) || p.key === itemName)
    let vehicleIndex = user.vehicles.findIndex(v => v.name.toLowerCase().includes(itemName) || v.key === itemName)

    let item, index, type
    if (propertyIndex !== -1) {
        item = user.properties[propertyIndex]
        index = propertyIndex
        type = 'prop'
    } else if (vehicleIndex !== -1) {
        item = user.vehicles[vehicleIndex]
        index = vehicleIndex
        type = 'veh'
    }

    if (!item) return m.reply("❌ Oggetto non trovato nel tuo inventario.")

    if (command === 'sell' || command === 'vendi') {
        let refund = Math.floor(item.price * 0.6)
        user.money = (user.money || 0) + refund
        
        if (type === 'prop') user.properties.splice(index, 1)
        else user.vehicles.splice(index, 1)

        return m.reply(`💰 *VENDITA EFFETTUATA*\n━━━━━━━━━━━━━━━\n\nArticolo: *${item.name}*\nRimborso: +${refund.toLocaleString()} 🪙`)
    }

    if (command === 'upgrade' || command === 'potenzia') {
        let upCost = Math.floor(item.price * 0.4 * (item.level || 1))
        if (user.money < upCost) return m.reply(`⚠️ *Upgrade fallito!*\nCosto necessario: ${upCost.toLocaleString()} 🪙`)

        user.money -= upCost
        item.level = (item.level || 1) + 1
        
        if (item.rent) item.rent = Math.floor(item.rent * 1.5)
        if (item.income) item.income = Math.floor(item.income * 1.5)

        return m.reply(`🚀 *UPGRADE COMPLETATO*\n━━━━━━━━━━━━━━━\n\nOggetto: *${item.name}*\nNuovo Livello: *Lvl ${item.level}*\nRendimento aumentato del 50%!`)
    }
}

handler.help = ['vendi <nome>', 'potenzia <nome>']
handler.tags = ['economy']
handler.command = /^(sell|vendi|upgrade|potenzia)$/i

export default handler
