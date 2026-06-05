// Plug-in creato da elixir
import os from 'os'
import { performance } from 'perf_hooks'

let handler = async (m, { conn, usedPrefix }) => {

    const used = process.memoryUsage()
    const ramUsed  = (used.heapUsed  / 1024 / 1024).toFixed(1)
    const ramTotal = (used.heapTotal / 1024 / 1024).toFixed(1)

    const _uptime = process.uptime() * 1000
    const uptime  = clockString(_uptime)

    const totalUsers = Object.keys(global.db.data.users).length
    const chats      = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    const totalGroups = chats.filter(([id]) => id.endsWith('@g.us')).length

    const start = performance.now()
    const ping  = (performance.now() - start).toFixed(2)

    const separatore = '─'.repeat(30)

    const info = `
╔══════════════════════════════╗
║   ✦  P A N N E L L O  ✦    ║
║      𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃       ║
╚══════════════════════════════╝

🚫 *Accesso Negato, Mortale!*
Questo comando è riservato agli *Eletti* — e tu, caro plebeo, non sei tra loro. 😏

${separatore}
📊 *Statistiche in Tempo Reale*
${separatore}
⏱️  *Uptime:*       \`${uptime}\`
⚡  *Ping:*         \`${ping} ms\`
💾  *RAM:*          \`${ramUsed} / ${ramTotal} MB\`
👥  *Utenti:*       \`${totalUsers}\`
💬  *Gruppi:*       \`${totalGroups}\`
${separatore}

_Torna quando avrai dimostrato il tuo valore... se mai accadrà._ 👑
`.trim()

    await conn.reply(m.chat, info, m)
}

handler.help    = ['autoadmin']
handler.tags    = ['info']
handler.command = /^(autoadmin)$/i

export default handler

function clockString(ms) {
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor(ms /    60_000) % 60
    const s = Math.floor(ms /     1_000) % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
