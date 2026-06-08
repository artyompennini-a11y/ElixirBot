let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke || false
  const sender = m.sender
  
  // 1. CONTROLLI DI SICUREZZA E PERMESSI
  if (!isOwner) {
    // Se l'antinuke è attivo, solo l'owner o la whitelist possono agire
    const whitelist = chat?.whitelist || []
    if (isAntinukeOn && !whitelist.includes(sender)) {
      return conn.reply(m.chat, '⚠️ *[ ANTINUKE ]* Azione bloccata dal sistema di sicurezza.', m)
    }

    // I moderatori semplici non possono usare questo comando se non sono Owner
    const mods = chat?.moderatori || []
    if (mods.includes(sender)) {
      return conn.reply(m.chat, '❌ *[ DENIED ]* I moderatori non hanno i privilegi per questa azione.', m)
    }

    // L'utente deve essere un amministratore nativo del gruppo
    if (!isAdmin) {
      return conn.reply(m.chat, '❌ *[ DENIED ]* Accesso negato. Comando riservato agli Admin.', m)
    }
  }

  // 2. ESTRAZIONE E VALIDAZIONE DEL TARGET
  let rawNumber = m.mentionedJid?.[0] || m.quoted?.sender
  if (!rawNumber && text) {
    const cleanText = text.replace(/[^0-9]/g, '')
    if (cleanText.length >= 10) {
      rawNumber = cleanText + '@s.whatsapp.net'
    }
  }

  if (!rawNumber) {
    return conn.reply(m.chat, '⚠️ *[ ERROR ]* Rispondi a un messaggio, menziona un utente o inserisci un numero valido.', m)
  }

  // Impedisce azioni contro se stessi o contro il bot stesso
  if (rawNumber === conn.user.jid) {
    return conn.reply(m.chat, '⚠️ Non posso modificare i miei stessi permessi di sistema.', m)
  }

  const isPromote = ['promote', 'promuovi', 'p'].includes(command)
  const action = isPromote ? 'promote' : 'demote'

  // 3. CONFIGURAZIONE GRAFICA (METADATI EXTENDED)
  const imgElixir = 'https://percorso-tua-immagine-quadrata.jpg' 
  const titleText = '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁'
  const bodyText = isPromote ? 'NUOVO ADMIN PROMOSSO' : 'ADMIN RETROCESSO'
  
  const decorativeText = `╔════════════════════════╗
  🛡️  *MODIFICA PRIVILEGI* 🛡️
╚════════════════════════╝

• 👤 *Target:* @${rawNumber.split('@')[0]}
• 👑 *Eseguito da:* @${sender.split('@')[0]}
• ⚙️ *Azione:* \`${isPromote ? 'PROMOZIONE ↑' : 'RETROCESSIONE ↓'}\`

> *THE PUNISHER-BOT*`

  // 4. ESECUZIONE DELLA MODIFICA NEL GRUPPO
  try {
    await conn.groupParticipantsUpdate(m.chat, [rawNumber], action)
    
    await conn.sendMessage(m.chat, {
      text: decorativeText,
      contextInfo: {
        mentionedJid: [sender, rawNumber],
        externalAdReply: {
          title: titleText,
          body: bodyText,
          thumbnailUrl: imgElixir,
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ *[ ERROR ]* Impossibile completare l\'operazione. Verifica i permessi del bot.', m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = /^(promote|promuovi|p|demote|retrocedi|r)$/i
handler.group = true
handler.botAdmin = true 

export default handler
