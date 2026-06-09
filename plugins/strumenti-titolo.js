import { webp2png, webp2mp4 } from '../lib/webp2png.js'
import { tmpdir } from 'os'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'

// Funzione ausiliaria per forzare l'escape dei caratteri speciali nei filtri di testo di FFmpeg
function escapeFFmpegText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:')
    .replace(/%/g, '\\%')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!m.quoted) throw `『 📎 』 \`Rispondi a un'immagine, video, GIF o sticker\`\n\n\`Esempio:\`\n*${usedPrefix + command} my honest reaction*`

    const mime = m.quoted.mimetype || ''
    if (!mime) throw '⚠️ \`Impossibile determinare il tipo di file.\`'

    const media = await m.quoted.download()
    if (!media || media.length === 0) throw '⚠️ \`Errore nel download del file.\`'

    const textParts = text ? text.split('|').map(s => s.trim()) : []
    const [posRaw, ...rest] = textParts
    
    const posizioni = ['alto', 'basso', 'sinistra', 'destra']
    const posizione = posizioni.includes(posRaw?.toLowerCase()) ? posRaw.toLowerCase() : 'alto'
    
    let titolo = ''
    if (rest.length > 0) {
      titolo = rest.join(' ')
    } else if (posRaw && !posizioni.includes(posRaw?.toLowerCase())) {
      titolo = posRaw
    } else {
      titolo = 'MY HONEST REACTION'
    }
    
    titolo = titolo.toUpperCase().substring(0, 200)
    const escapedTitolo = escapeFFmpegText(titolo)

    // Configurazione dei percorsi temporanei per l'elaborazione
    const inputPath = path.join(tmpdir(), `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    const outputPath = path.join(tmpdir(), `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`)
    const finalImgPath = path.join(tmpdir(), `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`)

    const isVideo = /video|gif|webp/.test(mime) && (mime.includes('video') || mime.includes('gif') || (mime.includes('webp') && m.quoted.seconds))
    
    let mediaBuffer
    if (/webp/.test(mime)) {
      mediaBuffer = isVideo ? await webp2mp4(media) : await webp2png(media)
    } else {
      mediaBuffer = media
    }

    fs.writeFileSync(inputPath, mediaBuffer)

    // Generazione del filtro complesso di FFmpeg basato sulla posizione scelta
    let filterComplex = ''
    switch (posizione) {
      case 'alto':
        filterComplex = `[0:v]pad=iw:ih+60:0:60:white[bg];[bg]drawtext=text='${escapedTitolo}':x=(w-text_w)/2:y=(60-text_h)/2:fontsize=24:fontcolor=black
