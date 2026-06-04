import fetch from 'node-fetch'
import { FormData } from 'formdata-node'

async function readQRCode(imageBuffer) {
  try {
    const form = new FormData()
    form.append('file', imageBuffer, 'image.jpg')
    const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
      method: 'POST',
      body: form
    })
    if (!res.ok) throw new Error('Errore API QR Server')
    const json = await res.json()
    return json[0]?.symbol?.[0]?.data || null
  } catch (e) {
    console.error(e)
    return null
  }
}

async function shortenURL(url) {
  const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error('TinyURL failed')
  return await res.text()
}

async function unshortenURL(url) {
  const res = await fetch(`https://unshorten.me/json/${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error('Unshorten.me API failed')
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.resolved_url || json.url
}

async function handler(m, { conn, usedPrefix, command, args }) {
  try {
    const cmd = command.toLowerCase()

    if (cmd === 'readqr' || cmd === 'leggiqr') {
      if (!m.quoted || !m.quoted.mimetype?.startsWith('image/'))
        throw 'Rispondi a un’immagine contenente un QR code'
      const media = await m.quoted.download()
      const data = await readQRCode(media)
      if (!data) throw '`Nessun QR rilevato nell’immagine`'
      return m.reply(data)
    }

    if (cmd === 'shorturl' || cmd === 'urlbreve') {
      const [url] = args
      if (!url) {
        return m.reply(
          `\`Esempio:\`\n*${usedPrefix + command}* https://example.com`
        )
      }
      if (!/^https?:\/\//.test(url))
        throw 'Specifica un URL valido da abbreviare'
      const short = await shortenURL(url)
      if (!short) throw `Errore: TinyURL non ha restituito un link`
      return m.reply(short)
    }

    if (cmd === 'unshorten' || cmd === 'espandiurl' || cmd === 'urlcompleto' || cmd === 'verourl' || cmd === 'verolink') {
      const [url] = args
      if (!url) {
        return m.reply(
          `\`Esempio:\`\n*${usedPrefix + command}* https://bit.ly/example`
        )
      }
      if (!/^https?:\/\//.test(url))
        throw 'Specifica un URL valido da espandere'
      const full = await unshortenURL(url)
      if (!full) throw `Errore: Unshorten.me non ha restituito un link`
      return m.reply(full)
    }

    if (cmd === 'qrcode' || cmd === 'codiceqr') {
      const txt = args.join(' ')
      if (!txt) throw 'Specifica un testo per generare il QR code'
      const qrurl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(txt)}`
      return conn.sendMessage(m.chat, { image: { url: qrurl } }, { quoted: m })
    }

    throw 'Comando non riconosciuto'
  } catch (e) {
    console.error(`[${command.toUpperCase()} ERROR]`, e)
    return await m.reply(typeof e === 'string' ? e : 'Errore interno')
  }
}

handler.help = ['leggiqr', 'shorturl', 'unshorten', 'qrcode']
handler.tags = ['strumenti']
handler.command = ['readqr', 'leggiqr', 'shorturl', 'urlbreve', 'unshorten', 'espandiurl', 'urlcompleto', 'verourl', 'verolink', 'qrcode', 'codiceqr']
handler.register = false

export default handler
