// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝
import { canLevelUp, xpRange } from '../lib/levelling.js'
import { roles } from './bot-ruoli.js'

let handler = async (m, { conn }) => {
  try {
    let name = await conn.getName(m.sender)
    let user = global.db.data.users[m.sender]

    let { min, xp, max } = xpRange(user.level, global.multiplier)

    let currentRole = Object.entries(roles)
      .sort((a, b) => b[1] - a[1])
      .find(([, minLevel]) => user.level >= minLevel)?.[0] || Object.keys(roles)[0]

    let nextRole = Object.entries(roles)
      .sort((a, b) => a[1] - b[1])
      .find(([, minLevel]) => user.level < minLevel)?.[0] || Object.keys(roles).slice(-1)[0]

    let currentXP = user.exp - min
    let neededXP = max - user.exp
    let totalXPforLevel = max - min
    let percentage = Math.min((currentXP / totalXPforLevel) * 100, 100)

    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
      const caption = `
ㅤㅤ⋆｡˚『 ╭ \`STATISTICHE\` ╯ 』˚｡⋆\n╭
│ 『 👤 』 \`Nome:\` *${name}*
│ 『 🎯 』 \`Ruolo:\` *${currentRole}*
│ 『 📈 』 \`Livello:\` *${user.level}*
│
│ 『 ✨ 』 _*Esperienza:*_
│ • \`EXP:\` *${formatNumber(currentXP)}/${formatNumber(totalXPforLevel)}*
│ • \`Progresso:\` *${percentage.toFixed(1)}%*
│
│ 『 🔼 』 _*Prossimo livello:*_
│ • \`Ruolo:\` *${nextRole}*
│ • \`Mancano:\` *${formatNumber(neededXP)} XP*
*╰⭒─瞬─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

      await conn.sendMessage(m.chat, {
        text: caption
      }, { quoted: m })

      return
    }

    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) {
      user.level++
    }

    if (before !== user.level) {
      let levelGain = user.level - before

      currentRole = Object.entries(roles)
        .sort((a, b) => b[1] - a[1])
        .find(([, minLevel]) => user.level >= minLevel)?.[0] || Object.keys(roles)[0]

      const caption = `
ㅤㅤ⋆｡˚『 ╭ \`LIVELLO\` ╯ 』˚｡⋆\n╭
│
│ 『 📈 』 _*Progresso: *_
│ • \`Da:\` Lvl *${before}*
│ • \`A:\` Lvl *${user.level}*
│ • \`Livelli saliti:\` *+${levelGain}*
│
│ 『 🎯 』 _*Nuovo Ruolo:*_
│ ${currentRole}
│
*╰⭒─瞬─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

      await conn.sendMessage(m.chat, {
        text: caption
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Errore comando lvl:', e)
    await conn.reply(m.chat, '⚠️ Errore durante il caricamento delle statistiche', m)
  }
}

function formatNumber(num) {
  return num.toLocaleString('it-IT')
}

handler.help = ['livello']
handler.tags = ['euro']
handler.command = ['livello', 'lvl', 'levelup']
handler.register = false
export default handler
