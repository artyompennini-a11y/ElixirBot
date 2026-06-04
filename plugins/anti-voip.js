let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false
  
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antivoip) return false

  if (!isBotAdmin) return false

  // --- LISTA NUMERI AUTORIZZATI ---
  const allowedNumbers = [
    '6282364029306', 
    '5491172448896', 
    '15819750206', 
    '19784821382',
    '962770035395' // Nuovo numero aggiunto
  ]
  // --------------------------------

  let decodedSender = conn.decodeJid(m.sender)
  let senderNumber = decodedSender.split('@')[0].split(':')[0]
  let domain = decodedSender.split('@')[1]
  let decodedBotJid = conn.decodeJid(conn.user.jid)

  // 1. Controllo se l'utente è nella Whitelist
  if (allowedNumbers.includes(senderNumber)) {
    if (global.allowedNotified?.has(m.sender)) return false
    if (!global.allowedNotified) global.allowedNotified = new Set()
    
    const utente = formatPhoneNumber(senderNumber, true)
    await conn.sendMessage(m.chat, { 
      text: `✅ *ACCESSO AUTORIZZATO*\n\nL'utente ${utente} è presente nella whitelist del sistema. Protocollo di espulsione sospeso.`,
      mentions: [m.sender]
    })
    
    global.allowedNotified.add(m.sender)
    return false
  }

  // 2. Immunità standard
  if (decodedSender === decodedBotJid || isAdmin || isOwner || isSam || domain === 'lid') return false

  // 3. Controllo prefisso internazionale
  if (!senderNumber.startsWith('39')) {
    
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTIVOIP\` ╯ 』˚｡⋆`
    const utente = formatPhoneNumber(senderNumber, true)

    const text = `${header}
╭
┃ 🛡️ \`Stato:\` *Protocollo Elixir Attivo*
┃
┃ 『 👤 』 \`Target:\` ${utente}
┃ 『 🌍 』 \`Origine:\` *Estera / VOIP*
┃ 『 🚫 』 \`Azione:\` *ESPULSIONE IMMEDIATA*
┃
┃ ⚠️ \`Nota:\` In questo gruppo l'accesso è 
┃ consentito esclusivamente a numeri italiani.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

    await conn.sendMessage(m.chat, { 
      text, 
      mentions: [decodedSender],
      contextInfo: {
        externalAdReply: {
          title: 'ELIXIR BORDER CONTROL',
          body: 'Accesso negato: Numero non autorizzato',
          thumbnailUrl: 'https://qu.ax',
          mediaType: 1
        }
      }
    })

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
    return true
  }

  return false
}

function formatPhoneNumber(number, includeAt = false) {
  if (!number || number === '?' || number === 'sconosciuto') return includeAt ? '@Sconosciuto' : 'Sconosciuto';
  return includeAt ? '@' + number : number;
}

export default handler
