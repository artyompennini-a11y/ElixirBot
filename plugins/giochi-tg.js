import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { createCanvas, loadImage } from 'canvas'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
const execPromise = promisify(exec)

// Utility: Stream audio in Buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// Utility: Divide il testo in righe per il canvas
function splitText(text, maxLength) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })
  if (currentLine) lines.push(currentLine)
  return lines
}

// Genera URL immagine (nuovo endpoint Pollinations)
async function generateImageUrl(prompt) {
  const seed = Math.floor(Math.random() * 1000000)
  const query = encodeURIComponent("professional news studio, tv news background, high definition, 4k")
  return `https://pollinations.ai{query}?width=1280&height=720&seed=${seed}&model=flux&nologo=true`
}

async function createNewsImage(newsTitle, backgroundUrl) {
  const canvas = createCanvas(1280, 720)
  const ctx = canvas.getContext('2d')
  
  // Tenta di caricare l'immagine con User-Agent per evitare blocchi
  let image;
  try {
    image = await loadImage(backgroundUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  } catch (e) {
    // Secondo tentativo con URL alternativo se il primo fallisce
    const fallbackUrl = `https://pollinations.ai{encodeURIComponent("tv news studio")}`
    image = await loadImage(fallbackUrl).catch(() => {
        throw new Error('Servizio immagini non disponibile al momento.')
    })
  }
  
  ctx.drawImage(image, 0, 0, 1280, 720)
  
  // Overlay Grafica TG
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillRect(0, 550, 1280, 170)
  ctx.fillStyle = '#CC0000'
  ctx.fillRect(0, 550, 1280, 55)
  
  // Testo Notizia
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'left'
  const lines = splitText(newsTitle.toUpperCase(), 45)
  lines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 40, 635 + i * 55))
  
  // Data e Branding
  const now = new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  ctx.font = '24px sans-serif'
  ctx.fillText(now, 40, 700)
  ctx.textAlign = 'right'
  ctx.fillText('VAREBOT NEWS 24', 1240, 700)
  
  return canvas.toBuffer('image/jpeg')
}

async function uploadImage(buffer) {
  const formData = new FormData()
  formData.append('key', '8ef100e30039c258e3029366f3af03c8')
  formData.append('image', buffer.toString('base64'))
  
  const response = await fetch('https://imgbb.com', {
    method: 'POST',
    body: formData
  })
  const json = await response.json()
  if (!json.success) throw new Error('Errore caricamento su ImgBB')
  return json
}

async function createNewsAudio(newsTitle) {
  const tempDir = path.join(__dirname, 'temp')
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
  
  const ttsFile = path.join(tempDir, `tts_${Date.now()}.mp3`)
  const finalAudioFile = path.join(tempDir, `final_${Date.now()}.mp3`)
  const bgAudioPath = path.join(__dirname, 'media/audio/tg.mp3')
  
  const tts = new MsEdgeTTS()
  await tts.setMetadata('it-IT-GianniNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  const result = await tts.toStream(newsTitle)
  const ttsBuffer = await streamToBuffer(result.audioStream)
  fs.writeFileSync(ttsFile, ttsBuffer)
  
  if (!fs.existsSync(bgAudioPath)) return { ttsFile, finalAudioFile: ttsFile }
  
  try {
    await execPromise(`ffmpeg -i "${ttsFile}" -i "${bgAudioPath}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first" -c:a mp3 "${finalAudioFile}"`)
    return { ttsFile, finalAudioFile }
  } catch (e) {
    return { ttsFile, finalAudioFile: ttsFile }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*⚠️ Inserisci il titolo della notizia!*\n\n*Esempio:* ${usedPrefix + command} Varebot ha vinto il premio come miglior bot!`
  
  try {
    await m.reply('🎥 *Preparazione edizione straordinaria...*')
    
    const url = await generateImageUrl(text)
    const imgBuffer = await createNewsImage(text, url)
    const upload = await uploadImage(imgBuffer)
    
    await conn.sendFile(m.chat, upload.data.url, 'news.jpg', `🔴 *LIVE - ULTIME NOTIZIE*\n\n${text}\n\n> vare ✧ bot`, m)
    
    const { ttsFile, finalAudioFile } = await createNewsAudio(text)
    await conn.sendFile(m.chat, finalAudioFile, 'news.mp3', null, m, true, { mimetype: 'audio/mp4', ptt: true })
    
    // Cleanup
    setTimeout(() => {
        if (fs.existsSync(ttsFile)) fs.unlinkSync(ttsFile)
        if (fs.existsSync(finalAudioFile) && finalAudioFile !== ttsFile) fs.unlinkSync(finalAudioFile)
    }, 5000)

  } catch (error) {
    console.error(error)
    await m.reply(`*❌ Errore:* ${error.message}`)
  }
}

handler.help = ['tg <testo>']
handler.tags = ['giochi']
handler.command = /^(tg|telegiornale|news)$/i
handler.group = true

export default handler
