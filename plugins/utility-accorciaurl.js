// ╔═══════════════════════════════════════════╗
// ║       ELIXIR-BOT • Plugin Accorcia URL    ║
// ║       API: TinyURL (gratis, no key)       ║
// ╚═══════════════════════════════════════════╝

import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  if (!args[0]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴜʀʟ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🔗 *Comando:* ${usedPrefix}accorcia
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}accorcia <url>

*Esempi:*
  ${usedPrefix}accorcia https://google.com
  ${usedPrefix}accorcia https://youtube.com/watch?v=dQw4w9WgXcQ

_☣️ Accorcia qualsiasi link via TinyURL._`, m)
  }

  let url = args[0]

  // Aggiunge https:// se manca
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url

  // Validazione URL base
  try { new URL(url) } catch {
    return conn.reply(m.chat, `❌ *URL non valido:* \`${url}\`\n_Assicurati di inserire un link completo._`, m)
  }

  await m.react('🔗')

  try {
    // TinyURL API - completamente gratuita, no API key
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
      timeout: 8000
    })

    const shortUrl = res.data?.trim()
    if (!shortUrl || !shortUrl.startsWith('http')) throw new Error('Risposta non valida')

    // Calcola risparmio caratteri
    const risparmio = url.length - shortUrl.length
    const percentuale = Math.round((risparmio / url.length) * 100)

    await conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴜʀʟ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ ✅ *URL Accorciato!*
 │ 📉 *Ridotto del:* ${percentuale}%
 └───────────────────

*Originale:*
_${url}_

*Accorciato:*
${shortUrl}

_☣️ Link generato via TinyURL._`
    }, { quoted: m })

  } catch (e) {
    console.error('[Accorcia Plugin] Errore:', e.message)

    let msg = `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴇʀʀᴏʀᴇ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
`
    if (e.code === 'ECONNABORTED') msg += '⏱️ *Timeout:* Il server non risponde. Riprova.'
    else if (e.response?.status === 422) msg += '❌ *URL non accettato:* Link non valido o bloccato.'
    else msg += `☣️ *Errore:* ${e.message?.slice(0, 80)}`

    conn.reply(m.chat, msg, m)
  }
}

handler.help = ['accorcia <url>']
handler.tags = ['strumenti']
handler.command = ['accorcia', 'shorten', 'short', 'tinyurl']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
