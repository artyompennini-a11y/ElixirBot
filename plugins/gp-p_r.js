let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke || false
  const sender = m.sender
  
  const mods = chat?.moderatori || []
  const isMod = mods.includes(sender)

  // Whitelist check: se l'utente e' in whitelist, puo' bypassare il blocco antinuke
  const whitelist = chat?.whitelist || []
  const isWhitelisted = whitelist.includes(sender)

  if (isMod && !isOwner) return conn.reply(m.chat, '[ DENIED ] Accesso Negato.', m)
  if (!isAdmin && !isOwner) return conn.reply(m.chat, '[ DENIED ] Accesso Negato.', m)
  if (isAntinukeOn && !isOwner && !isWhitelisted) return conn.reply(m.chat, '[ ANTINUKE ] Antinuke Attivo.', m)

  let number = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
  if (!number || number.length < 10) return conn.reply(m.chat, '[ ERROR ] Mentiona qualcuno.', m)

  const isPromote = ['promote', 'promuovi', 'p'].includes(command)
  const action = isPromote ? 'promote' : 'demote'

  const imgElixir = 'https://percorso-tua-immagine-quadrata.jpg' 

  const titleText = 'Elixir'
  const bodyText = isPromote ? 'NUOVO ADMIN PROMOSSO' : 'ADMIN RETROCESSO'
  
  const decorativeText = `* ${isPromote ? 'NUOVO ADMIN' : 'ADMIN RETRO'} *
  
┌   
│  👤  A: @${number.split('@')[0]}
│  🛠️  Da: @${sender.split('@')[0]}
└──────────────`

  try {
    await conn.groupParticipantsUpdate(m.chat, [number], action)
    
    await conn.sendMessage(m.chat, {
      text: decorativeText,
      contextInfo: {
        mentionedJid: [sender, number],
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
    conn.reply(m.chat, '[ ERROR ] Errore.', m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = /^(promote|promuovi|p|demote|retrocedi|r)$/i
handler.group = true
handler.botAdmin = true 

export default handler
