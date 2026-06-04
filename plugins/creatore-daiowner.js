// Plug-in creato da elixir
let handler = async (m, { conn, text, usedPrefix, command }) => {
    let isCreator = false
    try {
        const sender = m.sender.split('@')[0]
        isCreator = global.sam
            .map(entry => Array.isArray(entry) ? entry[0] : entry)
            .map(v => v.toString())
            .includes(sender)
    } catch (e) {
        console.error('Errore verifica creatore:', e)
    }

    if (!isCreator) return m.reply('*⚠️ Solo il creatore del bot può aggiungere nuovi owner*')
    if (!text && !m.quoted) return m.reply(`*⚠️ Specifica il numero da rendere owner*\n\n*Esempio:*\n${usedPrefix + command} @user`)

    let who
    if (m.isGroup) {
        who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (!who || who.length < 10) return m.reply('*⚠️ Tagga un utente o specifica un numero valido*')

    const targetNumber = who.split('@')[0]
    
    // Controllo se è già owner
    if (global.owner.map(([number]) => number).includes(targetNumber)) {
        return m.reply('*⚠️ Questo utente è già un owner*')
    }

    try {
        // Aggiunta all'array in memoria
        global.owner.push([targetNumber, 'Nuovo Owner', true])

        const fs = await import('fs')
        const path = await import('path')
        const configPath = path.join(process.cwd(), 'config.js')

        let configContent = await fs.promises.readFile(configPath, 'utf8')

        // Cerchiamo la posizione dell'array owner nel config.js per inserire il nuovo elemento
        const ownerArrayRegex = /global\.owner\s*=\s*\[/
        const newOwnerEntry = `['${targetNumber}', 'Nuovo Owner', true], `
        
        if (ownerArrayRegex.test(configContent)) {
            configContent = configContent.replace(ownerArrayRegex, `global.owner = [\n  ${newOwnerEntry}`)
            await fs.promises.writeFile(configPath, configContent, 'utf8')
        }

        // Aggiornamento database locale
        if (global.db.data.users[who]) {
            global.db.data.users[who].role = 'Owner'
            global.db.data.users[who].premium = true
            global.db.data.users[who].premiumTime = Infinity
        }

        await m.reply(`*✅ @${targetNumber} è ora un owner!*\n\n*Privilegi assegnati:*\n• Accesso comandi totali\n• Premium illimitato\n• Badge speciale\n\n*✓ Config.js aggiornato*`, null, {
            mentions: [who]
        })

    } catch (e) {
        console.error('Errore aggiungiowner:', e)
        m.reply('*❌ Errore durante l\'aggiunta dell\'owner nel file config*')
    }
}

handler.help = ['addowner @user']
handler.tags = ['creatore']
handler.command = /^(addowner|dadiowner|setowner)$/i
handler.creatorebot = true
handler.rowner = true 

export default handler
