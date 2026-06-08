// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin }) => {
  try {
    // 1. Recupero iniziale e sicuro dei partecipanti al gruppo per i controlli di sicurezza
    let groupParticipants = participants || groupMetadata?.participants || []
    if (groupParticipants.length === 0) {
      try {
        const groupData = await conn.groupMetadata(m.chat)
        groupParticipants = groupData.participants || []
      } catch {
        return m.reply('❌ *Impossibile recuperare la lista dei partecipanti da WhatsApp.*')
      }
    }

    const adminJids = groupParticipants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
    const ownerGroup = m.chat.split('-')[0] + '@s.whatsapp.net'
    
    // Estrazione e normalizzazione sicura degli Owner globali del bot
    const globalOwners = []
    if (global.owner) {
      if (typeof global.owner === 'string') {
        global.owner.split(',').forEach((part, index) => {
          if (index % 3 === 0 && part && !isNaN(part)) globalOwners.push(part + '@s.whatsapp.net')
        })
      } else if (Array.isArray(global.owner)) {
        global.owner.forEach(o => {
          const num = Array.isArray(o) ? o[0] : o
          if (num) globalOwners.push(String(num).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        })
      }
    }

    // 2. BLOCCO DI SICUREZZA: Permetti l'accesso SOLO a Real Admin e Owner (Esclude i Moderatori)
    const isRealAdmin = adminJids.includes(m.sender) || m.sender === ownerGroup
    const isBotOwner = globalOwners.includes(m.sender) || m.sender === isSuperAdmin

    if (!isRealAdmin && !isBotOwner) {
      let noAuthMsg = `┌─── 「 ⛔ *ᴀᴄᴄᴇꜱꜱᴏ ɴᴇɢᴀᴛᴏ* 」 ───┐\n` +
                      `│\n` +
                      `│ 🔒 *Questo comando è altamente restrittivo.*\n` +
                      `│ _I permessi sono riservati esclusivamente agli_\n` +
                      `│ _Amministratori reali e agli Owner del sistema._\n` +
                      `│ _I moderatori non sono autorizzati._\n` +
                      `│\n` +
                      `└───────────────────────────┘\n` +
                      `> *THE PUNISHER-BOT*`
      return m.reply(noAuthMsg)
    }

    // 3. Validazione dell'argomento (prefisso paese)
    if (!args || !args[0] || isNaN(args[0].replace(/[+]/g, ''))) {
      let errorMsg = `┌─── 「 ❌ *ᴇʀʀᴏʀᴇ* 」 ───┐\n` +
                     `│\n` +
                     `│ ⚠️ *Inserisci un prefisso numerico valido.*\n` +
                     `│ 📝 *Esempio:* \`${usedPrefix + command} 39\`\n` +
                     `│\n` +
                     `└───────────────────────────┘\n` +
                     `> *THE PUNISHER-BOT*`
      return m.reply(errorMsg)
    }

    const prefix = args[0].replace(/[+]/g, '')
    const bot = global.db?.data?.settings?.[conn.user.jid] || {}
    
    // Filtraggio liste target basato sul prefisso
    const allWithPrefix = groupParticipants.filter(p => p.id && p.id.startsWith(prefix) && p.id !== conn.user.jid)
    
    // Lista degli utenti effettivamente kickabili (vengono esclusi tutti i ruoli protetti)
    const kickableUsers = allWithPrefix.map(p => p.id).filter(userId => {
      if (adminJids.includes(userId)) return false
      if (userId === ownerGroup) return false
      if (globalOwners.includes(userId)) return false
      if (userId === isSuperAdmin) return false
      return true
    })
    
    // Caso in cui non ci siano numeri associati a quel prefisso nel gruppo
    if (allWithPrefix.length === 0) {
      let msg = `┌─── 「 📍 *ʀɪꜱᴜʟᴛᴀᴛᴏ ʀɪᴄᴇʀᴄᴀ* 」 ───┐\n` +
                `│\n` +
                `│ ❌ *Nessun utente con prefisso +${prefix} trovato.*\n` +
                `│\n` +
                `├─ *<b>ꜱᴛᴀᴛɪꜱᴛɪᴄʜᴇ ɢʀᴜᴘᴘᴏ</b>*\n` +
                `│ ⭔ Membri totali: \`${groupParticipants.length}\`\n` +
                `│ ⭔ Admin rilevati: \`${adminJids.length}\`\n` +
                `│\n` +
                `└───────────────────────────┘\n` +
                `> *THE PUNISHER-BOT*`
      return m.reply(msg)
    }

    switch (command.toLowerCase()) {
      case 'listanum': 
      case 'listnum': {
        const listUsers = allWithPrefix.map(p => {
          const isAdmin = adminJids.includes(p.id)
          const isGlobalOwner = globalOwners.includes(p.id)
          const status = isGlobalOwner ? ' 👑' : isAdmin ? ' ⚡' : ''
          return ` ⭔ @${p.id.split('@')[0]}${status}`
        })
        
        let msg = `┌─── 「 📋 *ʟɪꜱᴛᴀ ɴᴜᴍᴇʀɪ +${prefix}* 」 ───┐\n` +
                  `│\n` +
                  `${listUsers.join('\n')}\n` +
                  `│\n` +
                  `├─ *ʀɪᴇᴘɪʟᴏɢᴏ ᴍᴇᴛʀɪᴄʜᴇ*\n` +
                  `│ 📊 *ᴛᴏᴛᴀʟᴇ:* \`${allWithPrefix.length}\`\n` +
                  `│ ⚡ *ᴀᴅᴍɪɴ:* \`${allWithPrefix.filter(p => adminJids.includes(p.id)).length}\`\n` +
                  `│ 👤 *ᴜᴛᴇɴᴛɪ:* \`${kickableUsers.length}\`\n` +
                  `│\n` +
                  `└───────────────────────────┘\n` +
                  `> *THE PUNISHER-BOT*`
        
        return conn.reply(m.chat, msg, m, { mentions: allWithPrefix.map(p => p.id) })
      }
      
      case 'kicknum': {
        if (kickableUsers.length === 0) {
          let msg = `┌─── 「 🛡️ *<b>ꜱɪꜱᴛᴇᴍᴀ ᴅɪ ᴘʀᴏᴛᴇᴢɪᴏɴᴇ</b>* 」 ───┐\n` +
                    `│\n` +
                    `│ ⚠️ *Rilevati ${allWithPrefix.length} utenti con prefisso +${prefix}.*\n` +
                    `│ _Tutti i target fanno parte dello staff (Admin/Owner)_\n` +
                    `│ _e sono stati protetti dal sistema di sicurezza._\n` +
                    `│\n` +
                    `└───────────────────────────┘\n` +
                    `> *THE PUNISHER-BOT*`
          return conn.reply(m.chat, msg, m, { mentions: allWithPrefix.map(p => p.id) })
        }
        
        if (!bot.restrict) return m.reply('❌ *Comando disabilitato nel database globale!* (Usa #on restrict per attivarlo)')
        if (!isBotAdmin) return m.reply('❌ *Azione fallita: Il bot deve essere elevato ad Admin per eseguire i kick.*')

        await m.react('⏳')
        await m.reply(`⏳ *Esecuzione del comando avviata...*\nRimozione di *${kickableUsers.length}* utenti con prefisso *+${prefix}* in corso.`)

        const kicked = []
        const failed = []
        
        for (let i = 0; i < kickableUsers.length; i++) {
          const user = kickableUsers[i]
          try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            kicked.push(user)
          } catch (e) {
            failed.push(user)
            console.error(`[KICKNUM ERROR] Impossibile rimuovere ${user}:`, e)
          }
          
          // Delay dinamico anti-ban (2 secondi) tra le richieste ai server
          if (i < kickableUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }

        // Generazione del report geometrico finale
        let report = `┌─── 「 ✅ *ᴏᴘᴇʀᴀᴢɪᴏɴᴇ ᴄᴏᴍᴘʟᴇᴛᴀᴛᴀ* 」 ───┐\n│\n`
        
        if (kicked.length > 0) {
          report += `├─ 🚫 *ᴜᴛᴇɴᴛɪ ʀɪᴍᴏꜱꜱɪ (${kicked.length}):*\n`
          report += kicked.map(v => `│  ⭔ @${v.split('@')[0]}`).join('\n') + '\n│\n'
        }
        
        if (failed.length > 0) {
          report += `├─ ⚠️ *ʀɪᴍᴏᴢɪᴏɴɪ ꜰᴀʟʟɪᴛᴇ (${failed.length}):*\n`
          report += failed.map(v => `│  ⭔ @${v.split('@')[0]}`).join('\n') + '\n│\n'
        }
        
        const protectedCount = allWithPrefix.length - kickableUsers.length
        if (protectedCount > 0) {
          report += `├─ 🔒 *🛡️ ᴀᴅᴍɪɴ/ᴏᴡɴᴇʀ ᴘʀᴏᴛᴇᴛᴛɪ (${protectedCount}):*\n`
          const protectedUsers = allWithPrefix.filter(p => !kickableUsers.includes(p.id))
          report += protectedUsers.map(p => {
            const status = globalOwners.includes(p.id) ? '👑' : '⚡'
            return `│  ⭔ @${p.id.split('@')[0]} ${status}`
          }).join('\n') + '\n│\n'
        }
        
        report += `├─ *ʙɪʟᴀɴᴄɪᴏ ꜰɪɴᴀʟᴇ*\n` +
                  `│ ✔️ Riscossi: \`${kicked.length}\`\n` +
                  `│ ❌ Falliti: \`${failed.length}\`\n` +
                  `│ 🛡️ Protetti: \`${protectedCount}\`\n` +
                  `│\n` +
                  `└───────────────────────────┘\n` +
                  `> *THE PUNISHER-BOT*`

        const allMentions = [...kicked, ...failed, ...allWithPrefix.filter(p => !kickableUsers.includes(p.id)).map(p => p.id)]
        await conn.reply(m.chat, report, m, { mentions: allMentions })
        await m.react(kicked.length > 0 ? '✅' : '❌')
        break
      }
    }
    
  } catch (e) {
    console.error('Errore globale handler:', e)
    await m.react('❌')
    return m.reply('❌ *Si è verificato un errore critico interno durante l\'esecuzione del comando.*')
  }
}

handler.help = ['listanum <prefisso>', 'kicknum <prefisso>']
handler.tags = ['gruppo']
handler.command = /^(listanum|listnum|kicknum)$/i
handler.group = true

// Lasciamo a false i controlli automatici della libreria per gestire l'errore personalizzato sopra
handler.admin = false 
handler.botAdmin = true

export default handler
