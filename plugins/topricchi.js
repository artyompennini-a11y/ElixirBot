// Plug-in creato da elixir
let handler = async (m, { conn }) => {
    let users = Object.entries(global.db.data.users).map(([jid, data]) => {
        let propertyValue = (data.properties || []).reduce((acc, p) => acc + (p.price || 0), 0)
        let vehicleValue = (data.vehicles || []).reduce((acc, v) => acc + (v.price || 0), 0)
        return {
            jid,
            name: data.name || jid.split('@')[0],
            totalWealth: (data.money || 0) + (data.bank || 0) + propertyValue + vehicleValue
        }
    }).sort((a, b) => b.totalWealth - a.totalWealth)

    let top = `🏆 *TOP 10 MAGNATI DEL BOT*\n\n`
    users.slice(0, 10).forEach((u, i) => {
        top += `${i + 1}. @${u.jid.split('@')[0]} - *${u.totalWealth.toLocaleString()} 🪙*\n`
    })

    conn.reply(m.chat, top, m, { mentions: users.slice(0, 10).map(u => u.jid) })
}
handler.command = /^(leaderboard|ricchi)$/i
export default handler
