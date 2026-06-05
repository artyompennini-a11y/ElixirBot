import { promises } from 'fs'
import { join } from 'path'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-strumenti.jpeg');

const defmenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - ᴛᴏᴏʟꜱ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🧪 *Soggetto:* %name
 │ ⚙️ *Moduli:* Strumenti
 │ ⚠️ *Status:* Deep Scan
 └───────────────────
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '│ ⚡  %cmd',
  footer: '*╰━━━━━──ׄ──ׅ──ׄ──━━━━━*\n',
  after: `_☣️ Estrazione dati completata._`.trimEnd()
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'strumenti': 'LABORATORIO THE PUNISHER'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let name = await conn.getName(m.sender) || 'Soggetto Ignoto'
    
    // Filtro plugin per la categoria strumenti
    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin,
      }))

    // Costruzione del testo
    let _text = [
      defmenu.before.replace(/%name/g, name),
      defmenu.header.replace(/%category/g, tags['strumenti']),
      help.map(menu => menu.help.map(cmd => 
        defmenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defmenu.footer,
      defmenu.after
    ].join('\n')

    let fake = global.fake || {};

    await m.react('🧪')

    // --- INVIO COME IMMAGINE (SOSTITUITO VIDEO) ---
    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: _text.trim(),
      contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          ...fake.contextInfo?.forwardedNewsletterMessageInfo,
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🩸 Cyber Blood - Tools ☣️"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '☣️ ERRORE NEL SETTORE STRUMENTI: File immagine mancante o corrotto.', m)
  }
}

handler.help = ['menustrumenti']
handler.tags = ['menu']
handler.command = ['menutools', 'menustrumenti']

export default handler
