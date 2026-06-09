// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║   Sviluppato da:The Punisher              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝
import fetch from 'node-fetch'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
const execPromise = promisify(exec)

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function generateImageUrl(prompt) {
  const seed = Math.floor(Math.random() * 1000000)
  const query = encodeURIComponent("professional news studio, tv news background, high definition, 4k")
  return `https://image.pollinations.ai/prompt/${query}?width=1280&height=720&seed=${seed}&model=flux&nologo=true`
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
    
    // Genera l'URL dell'immagine di sfondo del TG
    const url = await generateImageUrl(text)
    
    // Invia direttamente l'immagine generata tramite URL con la didascalia testuale
    await conn.sendFile(m.chat, url, 'news.jpg', `🔴 *LIVE - ULTIME NOTIZIE*\n\n${text.toUpperCase()}\n\n> vare ✧ bot`, m)
    
    // Generazione e invio dell'audio del telegiornale
    const { ttsFile, finalAudioFile } = await createNewsAudio(text)
    await conn.sendFile(m.chat, finalAudioFile, 'news.mp3', null, m, true, { mimetype: 'audio/mp4', ptt: true })

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
