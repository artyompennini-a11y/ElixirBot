import { performance } from 'perf_hooks'

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  }

  return number
    .toString()
    .split('')
    .map(d => map[d] || d)
    .join('')
}

const clockString = ms => {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)

  return `${toMathematicalAlphanumericSymbols(days.toString().padStart(2, '0'))}d ${toMathematicalAlphanumericSymbols(hours.toString().padStart(2, '0'))}h ${toMathematicalAlphanumericSymbols(minutes.toString().padStart(2, '0'))}m`
}

const handler = async (m, { conn }) => {
  const start = performance.now()
  
  // Calcolo dell'uptime del processo
  const uptime = clockString(process.uptime() * 1000)

  // Calcolo preciso della latenza di risposta del bot
  const end = performance.now()
  const speed = (end - start).toFixed(2)
  const speedWithFont = toMathematicalAlphanumericSymbols(speed)

  const messaggio = `╔════════════════════════╗
  📡  *𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁 STATUS* 📡
╚════════════════════════╝

• 🏓 *Pong:* \`Online\`
• 🚀 *Latenza:* \`${speedWithFont} ms\`
• ⏱️ *Uptime:* \`${uptime}\`

> *𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃*`

  await conn.sendMessage(m.chat, {
    text: messaggio
  }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
