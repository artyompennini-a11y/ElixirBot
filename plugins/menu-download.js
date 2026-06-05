import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-download.jpeg');

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃ ✧ 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - ᴅᴏᴡɴʟᴏᴀᴅ ✧  ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: %name
  🕒 𝚄𝚙𝚝𝚒𝚖𝚎: %uptime
  📥 𝚂𝚝𝚊𝚝𝚞𝚜: 𝚁𝚎𝚊𝚍𝚢
└───────────────────┘

*〘 ᴀᴄᴄᴇssɪɴɢ ᴅᴏᴡɴʟᴏᴀᴅ ɴᴏᴅᴇ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 📥  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 ɴᴇᴛᴡᴏʀᴋ ᴅᴀᴛᴀ_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'download': 'ᴅɪɢɪᴛᴀʟ ᴀssᴇᴛs'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, uptime, totalreg,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('📥')

    // --- INVIO COME IMMAGINE (SOSTITUITO VIDEO) ---
    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ ᴇʟɪxɪʀʙᴏᴛ ɢʀᴏᴜᴘ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Download Module: Check if menu-download.jpeg exists.', m)
  }
}

handler.help = ['menudl']
handler.tags = ['menu']
handler.command = ['menudl', 'menudownload']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
