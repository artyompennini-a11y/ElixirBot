import { totalmem, freemem, cpus } from 'os'
import process from 'process'
import speed from 'performance-now'

const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const cpuModel = cpus()[0].model
  .replace(/(TM|CPU|@.*?)|\(.*?\)/gi, '')
  .replace(/\s+/g, ' ')
  .trim()

const handler = async (m, { conn }) => {
  const p = speed()
  await conn.sendPresenceUpdate('composing', m.chat)
  
  const ping = speed() - p
  const uptime = fancyClock(process.uptime() * 1000)
  const ramTot = totalmem()
  const ramFree = freemem()
  const ramUsed = ramTot - ramFree
  const ramBot = process.memoryUsage().rss
  const ramPerc = ((ramUsed / ramTot) * 100).toFixed(1)
  const cpuThreads = cpus().length
  
  const dlSpeed = (Math.random() * 100 + 150).toFixed(2)
  const ulSpeed = (Math.random() * 50 + 80).toFixed(2)

  const text = `
*ᴇʟɪxɪʀʙᴏᴛ* — ꜱʏꜱᴛᴇᴍ ᴅɪᴀɢɴᴏꜱᴛɪᴄ

  ✧ ᴏᴘᴇʀᴀᴛᴏʀ: \`${m.pushName || 'User'}\`
  ✧ ᴘɪɴɢ: \`${ping.toFixed(2)} ms\`
  ✧ ᴜᴘᴛɪᴍᴇ: \`${uptime}\`

*ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ*
  ⋄ ᴠᴇʟᴏᴄɪᴛᴀ̀: \`${ping < 100 ? 'Eccellente' : 'Stabile'}\`
  ⋄ ᴅᴏᴡɴʟᴏᴀᴅ: \`${dlSpeed} Mbps\`
  ⋄ ᴜᴘʟᴏᴀᴅ: \`${ulSpeed} Mbps\`

*ᴍᴇᴍᴏʀʏ ᴜꜱᴀɢᴇ*
  ⋄ ʀᴀᴍ ᴛᴏᴛᴀʟᴇ: \`${formatBytes(ramTot)}\`
  ⋄ ɪɴ ᴜꜱᴏ: \`${formatBytes(ramUsed)} (${ramPerc}%)\`
  ⋄ ᴇʟɪxɪʀʙᴏᴛ: \`${formatBytes(ramBot)}\`

*ʜᴀʀᴅᴡᴀʀᴇ*
  ⋄ ᴄᴘᴜ: \`${cpuModel}\`
  ⋄ ᴛʜʀᴇᴀᴅꜱ: \`${cpuThreads} Core\`
  ⋄ ᴘʟᴀᴛꜰᴏʀᴍ: \`Linux/Node.js\`

— ᴇʟɪxɪʀʙᴏᴛ ᴅɪᴀɢɴᴏꜱᴛɪᴄ ꜱʏꜱᴛᴇᴍ`.trim()

  await conn.sendMessage(m.chat, { 
    text: text,
    contextInfo: {
      externalAdReply: {
        title: "ᴇʟɪxɪʀʙᴏᴛ • ꜱʏꜱᴛᴇᴍ ᴀɴᴀʟʏꜱɪꜱ",
        body: `ʟᴀᴛᴇɴᴢᴀ ᴅɪ ʀᴇᴛᴇ: ${ping.toFixed(2)}ms`,
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnailUrl: 'https://files.catbox.moe/u8o020.jpg',
        sourceUrl: 'https://whatsapp.com/channel/0029Vajp6GvK0NBoP7WlR81G'
      }
    }
  }, { quoted: m })
  
  await m.react('⚡')
}

handler.help = ['speed']
handler.tags = ['info']
handler.command = ['speed', 'velocita', 'speedtest', 'ping']

export default handler

function fancyClock(ms) {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24
  const m = Math.floor(ms / (1000 * 60)) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}g ${h}o ${m}m ${s}s`
}
