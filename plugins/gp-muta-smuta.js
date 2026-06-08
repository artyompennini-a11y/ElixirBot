import { createCanvas } from 'canvas'

function normalizeJid(jid = '') {
  if (!jid) return null
  if (jid.includes('@s.whatsapp.net')) return jid
  if (jid.includes('@lid')) return jid

  const clean = String(jid).replace(/[^0-9]/g, '')
  if (clean.length > 5) return clean + '@s.whatsapp.net'

  return null
}

function cleanJid(jid = '') {
  return String(jid || '').replace(/[^0-9]/g, '')
}

function isOwnerJid(jid = '') {
  const num = cleanJid(jid)
  return (global.owner || []).some(owner => {
    const ownerNum = Array.isArray(owner) ? cleanJid(owner[0]) : cleanJid(owner)
    return ownerNum === num
  })
}

function getMentioned(m) {
  return (
    m.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.msg?.contextInfo?.mentionedJid?.[0] ||
    null
  )
}

function resolveTarget(m, text = '') {
  const mentioned = getMentioned(m)
  if (mentioned) return normalizeJid(mentioned)
  if (m.quoted?.sender) return normalizeJid(m.quoted.sender)

  const clean = String(text || '').replace(/[^0-9]/g, '')
  if (clean.length > 5) return normalizeJid(clean)

  return null
}

function resolveAction(m, command = '') {
  const cmd = String(command || '').toLowerCase().replace(/^[.!/#]/, '')
  const body = String(m.text || m.body || m.message?.conversation || '').toLowerCase().trim()

  if (cmd === 'muta') return true
  if (cmd === 'smuta') return false

  if (/^[.!/#]smuta(\s|$)/i.test(body)) return false
  if (/^[.!/#]muta(\s|$)/i.test(body)) return true

  return null
}

function ensureChatMuteStore(chat) {
  global.db.data.chats ||= {}
  global.db.data.chats[chat] ||= {}
  global.db.data.chats[chat].mutedUsers ||= {}
  return global.db.data.chats[chat].mutedUsers
}

function parseDuration(text = '') {
  const match = String(text)
    .toLowerCase()
    .match(/(?:^|\s)(\d+)\s*(m|min|minuti|h|ore|ora|d|giorni|giorno)?(?:\s|$)/)

  if (!match) return null

  const value = Number(match[1])
  const unit = match[2] || 'm'

  if (!value || value <= 0) return null

  if (['h', 'ora', 'ore'].includes(unit)) {
    return {
      ms: value * 60 * 60 * 1000,
      label: `${value} ${value === 1 ? 'ora' : 'ore'}`
    }
  }

  if (['d', 'giorno', 'giorni'].includes(unit)) {
    return {
      ms: value * 24 * 60 * 60 * 1000,
      label: `${value} ${value === 1 ? 'giorno' : 'giorni'}`
    }
  }

  return {
    ms: value * 60 * 1000,
    label: `${value} ${value === 1 ? 'minuto' : 'minuti'}`
  }
}

// Funzione dedicata alla generazione della card Canvas
async function drawMuteCard(statusTitle, targetID, themeColor) {
  const width = 800
  const height = 400
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Sfondo scuro opaco
  ctx.fillStyle = '#0d0f14'
  ctx.fillRect(0, 0, width, height)

  // Griglia geometrica di sfondo cibernetica
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
  ctx.lineWidth = 1
  const gridSize = 40
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Cornice decorativa esterna basata sul colore dell'azione
  ctx.strokeStyle = themeColor
  ctx.lineWidth = 6
  ctx.strokeRect(25, 25, width - 50, height - 50)

  // Titolo dell'operazione (Stato attuale del firewall)
  ctx.font = 'bold 44px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(statusTitle, width / 2, 140)

  // Stringa identificativa dell'utente colpito o liberato
  ctx.font = '700 28px monospace'
  ctx.fillStyle = themeColor
  ctx.fillText(`ID TARGET: @${targetID}`, width / 2, 220)

  // Watermark fisso a piè di pagina
  ctx.font = 'italic 18px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillText('SECURITY CORE SYSTEM • THE PUNISHER-BOT', width / 2, 330)

  return canvas.toBuffer('image/jpeg')
}

let handler = async (m, { conn, text, command, isOwner, isROwner }) => {
  try {
    const isMute = resolveAction(m, command)
    const target = resolveTarget(m, text || '')

    if (isMute === null) return

    if (!target) {
      return conn.reply(
        m.chat,
        '⚠️ *Devi menzionare o rispondere al messaggio di un utente.*\n\n> *THE PUNISHER-BOT*',
        m
      )
    }

    const executorIsOwner = !!(isOwner || isROwner || isOwnerJid(m.sender))
    const targetIsOwner = isOwnerJid(target)

    if (isMute && targetIsOwner) {
      return conn.reply(
        m.chat,
        '⛔ *Non è possibile applicare restrizioni ai creatori/owner.*\n\n> *THE PUNISHER-BOT*',
        m
      )
    }

    const mutedUsers = ensureChatMuteStore(m.chat)
    const oldMuteData = mutedUsers[target]

    if (!isMute && oldMuteData?.mutedByOwner && !executorIsOwner) {
      return conn.reply(
        m.chat,
        '⛔ *Questo utente è stato mutato direttamente da un Owner. Solo un Owner può revocare la sanzione.*\n\n> *THE PUNISHER-BOT*',
        m
      )
    }

    const duration = isMute ? parseDuration(text || '') : null
    const expiresAt = duration ? Date.now() + duration.ms : null

    if (isMute) {
      mutedUsers[target] = {
        active: true,
        expiresAt,
        mutedBy: m.sender,
        mutedByOwner: executorIsOwner
      }
    } else {
      delete mutedUsers[target]
    }

    const targetNumber = target.split('@')[0]
    const targetTag = `@${targetNumber}`
    const executorTag = `@${m.sender.split('@')[0]}`

    let messaggio = ''
    let canvasTitle = ''
    let canvasColor = ''

    if (isMute) {
      canvasTitle = '🔴 ACCESS RESTRICTION ACTIVE'
      canvasColor = '#ff3838'
      messaggio = `╔════════════════════════╗\n` +
                  `🔇   *UTENTE MUTATO* 🔇\n` +
                  `╚════════════════════════╝\n\n` +
                  `• 👤 *Target:* ${targetTag}\n` +
                  `• 👑 *Eseguito da:* ${executorTag}\n` +
                  `• ⏳ *Durata:* \`${duration?.label || 'Permanente'}\`\n\n` +
                  `_I messaggi inviati dall'utente verranno intercettati ed eliminati automaticamente._\n\n` +
                  `> *THE PUNISHER-BOT*`
    } else {
      canvasTitle = '🟢 ACCESS RESTRICTION LIFTED'
      canvasColor = '#2ed573'
      messaggio = `╔════════════════════════╗\n` +
                  `🔊  *MUTING REVOCATO* 🔊\n` +
                  `╚════════════════════════╝\n\n` +
                  `• 👤 *Target:* ${targetTag}\n` +
                  `• 👑 *Sbloccato da:* ${executorTag}\n\n` +
                  `_L'utente può riprendere regolarmente l'attività all'interno della chat._\n\n` +
                  `> *THE PUNISHER-BOT*`
    }

    // Costruzione dinamica dell'immagine tramite Canvas
    const imageBuffer = await drawMuteCard(canvasTitle, targetNumber, canvasColor)

    // Spedizione del file multimediale con testo integrato come didascalia
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: messaggio,
      mentions: [target, m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error('[MUTA ERROR]', e)
    conn.reply(
      m.chat,
      '❌ *Errore critico durante l\'elaborazione del comando Mute.*',
      m
    )
  }
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender || m.fromMe) return

  const sender = normalizeJid(m.sender)
  if (!sender) return

  const mutedUsers = ensureChatMuteStore(m.chat)
  const muteData = mutedUsers[sender]

  if (!muteData) return

  if (muteData.expiresAt && Date.now() >= muteData.expiresAt) {
    delete mutedUsers[sender]
    return
  }

  const isMuted = muteData.active === true

  if (!isMuted) return

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch (err) {
    console.error('[MUTE DELETE ERROR]', err)
  }
}

handler.command = ['muta', 'smuta']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
