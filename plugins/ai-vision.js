// Plug-in creato da elixir
const apiKey = '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'
const url = 'https://openrouter.ai/api/v1/chat/completions'
const euroCost = 50

let handler = async (m, { conn, quoted, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return
  if (user.euro < euroCost) return m.reply(`💰 Ti servono *${euroCost}€* per usare l'AI Vision.\nHai solo *${user.euro}€*`)

  // Determina il media da analizzare — sia diretto che citato
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let mtype = q.mtype || ''
  
  // Verifica se il messaggio o il messaggio citato contengono un media valido
  const isMedia = /image|video|sticker/i.test(mtype) || /image|video|webp/i.test(mime)
  
  if (!isMedia) {
    return m.reply(`📸 *Rispondi a un'immagine, uno sticker o un video* con \`.${command}\` per analizzarlo!\n\n*Esempio:* Rispondi a una foto e scrivi \`.${command}\``)
  }
  
  // Determina il tipo
  let tipo = ''
  if (/sticker/i.test(mtype) || /webp/i.test(mime)) tipo = 'sticker'
  else if (/video/i.test(mtype) || /video/i.test(mime)) tipo = 'video'
  else tipo = 'immagine'
  
  // Scarica il buffer dal messaggio corretto (q)
  let buffer
  try {
    if (tipo === 'sticker') {
      buffer = await q.download()
    } else if (tipo === 'video') {
      // Per i video prova il thumbnail, altrimenti download intero
      const frame = q.msg?.videoMessage?.jpegThumbnail
      if (frame) {
        buffer = Buffer.from(frame)
      } else {
        buffer = await q.download()
      }
    } else {
      buffer = await q.download()
    }
  } catch (e) {
    console.error('[AI-VISION] Download fallito:', e)
    return m.reply('❌ Impossibile scaricare il media. Riprova.')
  }

  if (!buffer || buffer.length === 0) {
    return m.reply('❌ Buffer vuoto. Il media potrebbe essere corrotto.')
  }

  // Keep
  let key = await m.reply('🔍 *Analizzando il contenuto con AI...*\n⏳ Caricamento su OpenRouter Vision...')
  
  try {
    // Converti in base64
    const base64 = buffer.toString('base64')
    const mimeType = tipo === 'sticker' ? 'image/webp' : tipo === 'video' ? 'image/jpeg' : 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${base64}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://elixirbot.x',
        'X-Title': '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analizza questo ${tipo} in italiano. Descrivi in modo dettagliato e ironico cosa vedi. Se è uno sticker, fa' una battuta divertente. Rispondi solo in italiano, massimo 400 caratteri.`
            },
            {
              type: 'image_url',
              image_url: { url: dataUri }
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || '🤖 Nessuna risposta ricevuta. Riprova.'
    
    user.euro -= euroCost
    await conn.sendMessage(m.chat, { 
      text: `*🔍 ANALISI AI* — ${tipo.toUpperCase()}\n\n${aiResponse}\n\n━━━━━━━━━━━\n💰 Costo: ${euroCost}€ | Saldo: ${user.euro}€`,
      edit: key
    })

  } catch (e) {
    console.error('[AI-VISION] Errore:', e)
    await conn.sendMessage(m.chat, { 
      text: `❌ Errore nell'analisi AI.\n${e.message}`,
      edit: key
    })
  }
}

handler.help = ['analizza', 'occhioai']
handler.tags = ['ai']
handler.command = /^(analizza|occhioai|vision)$/i
handler.group = true

export default handler
