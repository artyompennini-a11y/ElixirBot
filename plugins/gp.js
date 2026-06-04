import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Se l'utente non specifica il nome del file
    if (!text) throw `Esempio d'uso: *${usedPrefix + command} aura.js*`

    // Definisci il percorso della cartella plugin (aggiusta 'plugins' se la tua cartella ha un altro nome)
    const pluginFolder = './plugins'
    const filePath = path.join(pluginFolder, text)

    // Controlla se il file esiste
    if (!fs.existsSync(filePath)) {
        throw `Il plugin *${text}* non esiste nella cartella plugins.`
    }

    try {
        // Legge il contenuto del file
        const content = fs.readFileSync(filePath, 'utf-8')

        // Se il codice è troppo lungo (WhatsApp ha un limite), lo invia come documento
        if (content.length > 4000) {
            await conn.sendMessage(m.chat, { 
                document: Buffer.from(content), 
                mimetype: 'application/javascript', 
                fileName: text 
            }, { quoted: m })
        } else {
            // Altrimenti lo invia come messaggio di testo
            await m.reply(`💻 **CODICE PLUGIN: ${text.toUpperCase()}**\n\n\`\`\`javascript\n${content}\n\`\`\``)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ Errore durante la lettura del file: ${e.message}`)
    }
}

handler.help = ['gp <nomefile>']
handler.tags = ['owner']
handler.command = /^(gp|getplugin)$/i
handler.rowner = true // Solo il proprietario del bot può usarlo per sicurezza

export default handler
