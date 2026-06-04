// Plug-in creato da elixir
let handler = async (m, { conn, command, args }) => {
    let user = global.db.data.users[m.sender]
    if (!args[0]) return m.reply("📦 *COSA VUOI VENDERE?*\nUsa: `.sell <nome_oggetto>`\n*(Recuperi il 60% del valore originale)*")

    let itemName = args[0].toLowerCase()
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

    if (!item) return m.reply("❌ Non possiedi questo oggetto.")

    let refund = Math.floor(item.price * 0.6) // Rimborso del 60%
    user.money += refund

    if (type === 'prop') user.properties.splice(index, 1)
    else user.vehicles.splice(index, 1)

    m.reply(`💰 *VENDITA COMPLETATA*\nHai venduto: *${item.name}*\nGuadagno: +${refund.toLocaleString()} 🪙`)
}
handler.command = /^(sell|vendi)$/i
export default handler
