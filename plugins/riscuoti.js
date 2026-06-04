// Plug-in creato da elixir
let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let now = Date.now()
    let cooldown = 86400000 
    
    if (!user.properties) user.properties = []
    if (!user.vehicles) user.vehicles = []
    
    let totalIncome = 0
    let totalExpenses = 0
    let baseBills = 200 
    let claimCount = 0

    let stipendio = user.job ? (user.salary || 0) : 0
    totalIncome += stipendio

    if (user.properties.length > 0) {
        user.properties.forEach(p => {
            if (!p.lastClaim || (now - p.lastClaim) > cooldown) {
                let multiplier = p.level || 1
                let income = (p.rent || p.income || 0) * (1 + (multiplier - 1) * 0.5)
                totalIncome += income
                totalExpenses += (p.tax || 0)
                p.lastClaim = now
                claimCount++
            }
        })
    }

    if (user.vehicles.length > 0) {
        user.vehicles.forEach(v => {
            totalExpenses += (v.maintenance || 0)
        })
    }

    if (claimCount === 0 && user.properties.length > 0 && !user.job) {
        return m.reply('⏳ *OPERAZIONE NEGATA*\n\nHai già riscosso i profitti oggi.')
    }
    
    let netto = totalIncome - totalExpenses - baseBills
    user.money += netto
    if (user.job) user.workExp = (user.workExp || 0) + 1

    let imprevistoMsg = ''
    if (Math.random() < 0.15) {
        let eventi = [
            { msg: "🚔 Multa per eccesso di velocità!", cost: 800 },
            { msg: "💧 Allagamento in una proprietà!", cost: 2500 },
            { msg: "📉 Crollo del mercato locale!", cost: 5000 },
            { msg: "🎉 Bonus statale per le imprese!", cost: -4000 },
            { msg: "🔧 Guasto improvviso al motore!", cost: 1500 }
        ]
        let ev = eventi[Math.floor(Math.random() * eventi.length)]
        user.money -= ev.cost
        imprevistoMsg = `\n\n❗ *IMPREVISTO*\n└ ${ev.msg} (${ev.cost > 0 ? '-' : '+'}${Math.abs(ev.cost).toLocaleString()} 🪙)`
    }

    let report = `🏦 *ESTRATTO CONTO ELIXIR*\n`
    report += `━━━━━━━━━━━━━━━━━━━━\n\n`
    if (user.job) report += `💼 *STIPENDIO:* +${stipendio.toLocaleString()} 🪙\n`
    report += `📈 *RENDITE ASSET:* +${(totalIncome - stipendio).toLocaleString()} 🪙\n`
    report += `📉 *TASSE/COSTI:* -${totalExpenses.toLocaleString()} 🪙\n`
    report += `🔌 *UTENZE:* -${baseBills} 🪙\n`
    report += `────────────────────\n`
    report += `💵 *BILANCIO NETTO:* ${netto >= 0 ? '▲' : '▼'} ${netto.toLocaleString()} 🪙\n`
    report += `💰 *SALDO TOTALE:* ${user.money.toLocaleString()} 🪙`
    report += imprevistoMsg

    if (user.money < 0) {
        report += `\n\n⚠️ *STATO CRITICO: DEBITO*\nIl tuo saldo è in rosso. Rischi pignoramenti!`
    }

    m.reply(report)
}

handler.help = ['riscuoti']
handler.tags = ['economy']
handler.command = /^(riscuoti|claim)$/i

export default handler
