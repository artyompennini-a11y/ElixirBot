// Plug-in creato da elixir
import { toVideo } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  // 1. Controllo se l'utente ha citato un media
  if (!m.quoted) throw `⚠️ Rispondi a un video o sticker animato con *${usedPrefix + command}*`
  
  let q = m.quoted
  let mime = (q.msg || q).mimetype || ''
  
  // 2. Controllo che il file sia compatibile (video, audio o immagine/sticker)
  if (!/video|audio|image/.test(mime)) throw `⚠️ Il file deve essere un video o uno sticker animato.`

  await m.reply('⏳ Elaborazione in corso...')

  try {
    let media = await q.download()
    let out = await toVideo(media, mime.split('/')[1])

    // 3. Invio del file come GIF
    await conn.sendMessage(m.chat, {
      video: out.data,
      caption: `✅ Convertito in GIF`,
      gifPlayback: true // Questa opzione lo rende una GIF su WhatsApp
    }, { quoted: m })

    // Pulizia file temporaneo se il converter lo prevede
    if (out.delete) await out.delete()
    
  } catch (e) {
    console.error(e)
    throw `❌ Si è verificato un errore durante la conversione.`
  }
}

handler.help = ['togif (rispondi a video/sticker)']
handler.tags = ['tools']
handler.command = /^(togif|tovideo2)$/i // Funzionerà sia con .togif che .tovideo2

export default handler
