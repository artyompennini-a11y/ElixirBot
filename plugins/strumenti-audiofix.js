import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

// ═══════════════════════════════════════════════════════
// 🎤 AUDIO FX — Effetti Vocali per Messaggi Audio
// ═══════════════════════════════════════════════════════

const handler = async (m, { conn, command, usedPrefix }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!/audio/.test(mime)) {
        return m.reply(`🎤 *Effetti Audio THE PUNISHER-BOT*\n\n`
            + `📍 *Rispondi a un messaggio vocale o audio*\n\n`
            + `✦ *Effetti disponibili:*\n`
            + `  ▸ ${usedPrefix}robot → Voce robotica\n`
            + `  ▸ ${usedPrefix}bambino → Voce da bambino\n`
            + `  ▸ ${usedPrefix}eco → Effetto eco\n`
            + `  ▸ ${usedPrefix}lento → Rallentato\n`
            + `  ▸ ${usedPrefix}veloce → Accelerato\n`
            + `  ▸ ${usedPrefix}distorto → Voce distorta\n`
            + `  ▸ ${usedPrefix}subwoofer → Effetto grave\n\n`
            + `📌 *Esempio:* \`${usedPrefix}robot\` rispondendo a un vocale`)
    }

    const media = await q.download()
    if (!media) return m.reply('❌ Errore nel download dell\'audio.')

    const tmpDir = path.join(tmpdir(), 'audiofx')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const inputPath = path.join(tmpDir, `input_${Date.now()}.mp3`)
    const outputPath = path.join(tmpDir, `output_${Date.now()}.mp3`)
    
    fs.writeFileSync(inputPath, media)

    let filterCmd = ''
    let effectName = ''

    switch (command) {
        case 'robot':
            filterCmd = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
            effectName = '🤖 Robot'
            break
        case 'bambino':
            filterCmd = '-af "asetrate=44100*1.3,aresample=44100"'
            effectName = '👶 Bambino'
            break
        case 'eco':
            filterCmd = '-af "aecho=0.8:0.7:40|100:0.4|0.2"'
            effectName = '🔊 Eco'
            break
        case 'lento':
            filterCmd = '-af "atempo=0.7,asetrate=44100"'
            effectName = '🐢 Lento'
            break
        case 'veloce':
            filterCmd = '-af "atempo=1.4,asetrate=44100"'
            effectName = '⚡ Veloce'
            break
        case 'distorto':
            filterCmd = '-af "acrusher=.1:1:64:0:log"'
            effectName = '🌀 Distorto'
            break
        case 'subwoofer':
            filterCmd = '-af "equalizer=f=60:width_type=h:width=100:g=15,equalizer=f=120:width_type=h:width=100:g=10"'
            effectName = '🔊 Subwoofer'
            break
        default:
            return m.reply('❌ Effetto non valido.')
    }

    try {
        await execAsync(`ffmpeg -i "${inputPath}" ${filterCmd} "${outputPath}" -y`, { timeout: 30000 })
        
        if (!fs.existsSync(outputPath)) {
            return m.reply('❌ Errore nella generazione dell\'effetto audio.')
        }

        const audioBuffer = fs.readFileSync(outputPath)
        
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `🎤 Effetto: ${effectName}`,
                    body: 'ELIXIR BOT — Audio FX',
                    thumbnailUrl: 'https://i.imgur.com/8K9qY1G.png',
                    sourceUrl: 'https://github.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        // Pulizia
        try {
            fs.unlinkSync(inputPath)
            fs.unlinkSync(outputPath)
        } catch {}
        
    } catch (e) {
        console.error('[AUDIOFX] Errore:', e)
        m.reply('❌ Errore durante l\'elaborazione audio. Assicurati che ffmpeg sia installato.')
    }
}

handler.command = /^(robot|bambino|eco|lento|veloce|distorto|subwoofer)$/i
handler.tags = ['strumenti']
handler.help = ['robot', 'bambino', 'eco', 'lento', 'veloce', 'distorto', 'subwoofer']

export default handler
