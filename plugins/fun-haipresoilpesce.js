import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
    // Percorso del file audio
    const audioPath = './media/haipresoilpesce.mp3'

    // Controlla se il file esiste per evitare errori nel bot
    if (!fs.existsSync(audioPath)) {
        return m.reply(`❌ Errore: Il file audio non è stato trovato in ${audioPath}`)
    }

    // Invia l'audio
    await conn.sendMessage(m.chat, {
        audio: { url: audioPath },
        mimetype: 'audio/mpeg',
        ptt: true // Imposta a false se vuoi che appaia come un file audio e non come nota vocale
    }, { quoted: m })
}

handler.help = ['pesce']
handler.tags = ['fun']
handler.command = /^pesce$/i

export default handler
