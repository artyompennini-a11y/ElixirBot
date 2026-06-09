// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const cavalliConfig = [
    { nome: 'ROSSO', emoji: '🔴' },
    { nome: 'BLU', emoji: '🔵' },
    { nome: 'VERDE', emoji: '🟢' },
    { nome: 'GIALLO', emoji: '🟡' }
]

const carteValori = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':10,'Q':10,'K':10,'A':11 }
const semi = ['♠', '♥', '♦', '♣']
const ranghi = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const mazzoBuild = () => {
    let m = []
    for (let s of semi) for (let r of ranghi) m.push({ r, s, v: carteValori[r] })
    return m
}
const calcolaPunteggio = (mano) => {
    let tot = mano.reduce((a,c) => a + c.v, 0)
    let assi = mano.filter(c => c.r === 'A').length
    while (tot > 21 && assi > 0) { tot -= 10; assi-- }
    return tot
}
const manoToString = (mano, nascondiPrima = false) => {
    if (nascondiPrima) return `🃏 ${mano.slice(1).map(c => `[${c.r}${c.s}]`).join(' ')}`
    return mano.map(c => `[${c.r}${c.s}]`).join(' ')
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 1000
    if (user.level === undefined) user.level = 1

    const checkMoney = (costo) => {
        if (user.euro < costo) {
            m.reply(`⚠️ Non hai abbastanza Euro! Ti servono ${costo}€ (Saldo: ${user.euro}€)`)
            return false
        }
        return true
    }

    if (!global.cooldownGames) global.cooldownGames = {}
    const checkCooldown = (tipo, durata) => {
        const key = `${m.sender}:${tipo}`
        const now = Date.now()
        if (global.cooldownGames[key] && now < global.cooldownGames[key]) {
            const rimanente = Math.ceil((global.cooldownGames[key] - now) / 1000)
            m.reply(`⏳ *Cooldown:* aspetta ${rimanente} secondi per usare \`${tipo}\` di nuovo.`)
            return false
        }
        global.cooldownGames[key] = now + durata
        return true
    }

    if (command === '
