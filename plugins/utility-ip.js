// ╔═══════════════════════════════════════════╗
// ║       ELIXIR-BOT • Plugin IP Info         ║
// ║       API: ip-api.com (gratis, no key)    ║
// ╚═══════════════════════════════════════════╝

import axios from 'axios'

// Mappa emoji bandiere da country code
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  return [...countryCode.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('')
}

// Valida un indirizzo IPv4 o IPv6 o dominio
function isValidTarget(input) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6 = /^[0-9a-fA-F:]+$/
  const domain = /^[a-zA-Z0-9][a-zA-Z0-9\-\.]{1,253}[a-zA-Z]{2,}$/
  return ipv4.test(input) || ipv6.test(input) || domain.test(input)
}

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  if (!args[0]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - IP INFO 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🌐 *Comando:* ${usedPrefix}ip
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}ip <indirizzo IP o dominio>

*Esempi:*
  ${usedPrefix}ip 8.8.8.8
  ${usedPrefix}ip 1.1.1.1
  ${usedPrefix}ip google.com
  ${usedPrefix}ip youtube.com

_☣️ Geolocalizzazione IP gratuita via ip-api.com_`, m)
  }

  const target = args[0].toLowerCase().trim()

  if (!isValidTarget(target)) {
    return conn.reply(m.chat, `❌ *Input non valido:* \`${target}\`\n_Inserisci un IP (es. \`8.8.8.8\`) o un dominio (es. \`google.com\`)._`, m)
  }

  // Blocca IP privati / riservati
  const privateRanges = [
    /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
    /^127\./, /^0\./, /^localhost$/i
  ]
  if (privateRanges.some(r => r.test(target))) {
    return conn.reply(m.chat, `❌ *IP privato o locale:* \`${target}\`\n_Gli indirizzi privati non sono geolocalizzabili._`, m)
  }

  await m.react('🌐')

  try {
    // ip-api.com - gratuita, 45 req/min, no API key
    const res = await axios.get(
      `http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query,mobile,proxy,hosting`,
      { timeout: 8000 }
    )

    const d = res.data
    if (d.status !== 'success') {
      throw new Error(d.message || 'Lookup fallito')
    }

    const flag = getFlagEmoji(d.countryCode)
    const tags = []
    if (d.mobile) tags.push('📱 Mobile')
    if (d.proxy) tags.push('🕵️ Proxy/VPN')
    if (d.hosting) tags.push('🖥️ Hosting/Datacenter')
    const tagLine = tags.length > 0 ? tags.join(' • ') : '👤 Utente normale'

    await conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - IP INFO 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🌐 *Target:* \`${d.query}\`
 │ ${flag} *Paese:* ${d.country || 'N/A'}
 │ 🏙️ *Città:* ${d.city || 'N/A'}
 │ 📍 *Regione:* ${d.regionName || 'N/A'}
 │ 📮 *CAP:* ${d.zip || 'N/A'}
 └───────────────────
 ┌───────────────────
 │ 📡 *ISP:* ${d.isp || 'N/A'}
 │ 🏢 *Org:* ${d.org || 'N/A'}
 │ 🔢 *AS:* ${d.as || 'N/A'}
 └───────────────────
 ┌───────────────────
 │ 🕐 *Fuso orario:* ${d.timezone || 'N/A'}
 │ 📌 *Coordinate:* ${d.lat}, ${d.lon}
 │ 🔍 *Tipo:* ${tagLine}
 └───────────────────

_☣️ Scansione completata._`
    }, { quoted: m })

  } catch (e) {
    console.error('[IP Plugin] Errore:', e.message)

    let msg = `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - ERROR 💉
┗━━━━━━━━━━━━━━━━━━━━┛
`
    if (e.code === 'ECONNABORTED') msg += '⏱️ *Timeout:* Il server non risponde. Riprova.'
    else if (e.response?.status === 429) msg += '🚫 *Limite raggiunto:* Troppe richieste. Riprova tra un minuto.'
    else msg += `☣️ *Errore:* ${e.message?.slice(0, 80)}`

    conn.reply(m.chat, msg, m)
  }
}

handler.help = ['ip <indirizzo o dominio>']
handler.tags = ['strumenti']
handler.command = ['ip', 'ipinfo', 'geoip', 'whois']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
