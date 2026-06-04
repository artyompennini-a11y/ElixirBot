// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  
  if (!chat?.antimedia) return false

  if (m.fromMe || isAdmin || isOwner || isSam) return false
  if (!isBotAdmin) return false

  const isViewOnce = m.message?.viewOnceMessage || 
                     m.message?.viewOnceMessageV2 || 
                     m.message?.viewOnceMessageV2Extension

  if (isViewOnce) return false

  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage
  
  if (hasNormalMedia) {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

    await conn.sendMessage(m.chat, {
      text: `> 『 ❌ 』 *Media rimosso*\n> In questo gruppo sono ammessi solo media *visualizzabili una volta*.`,
      mentions: [m.sender],
    }).catch(() => {})
    
    return true
  }

  return false
}

export async function handler(m, { conn, args, isAdmin, isOwner }) {
  if (!m.isGroup) return false
  if (!(isAdmin || isOwner)) return m.reply('❌ Comando riservato agli amministratori.')

  const chat = global.db.data.chats[m.chat]
  let active = args[0]?.toLowerCase()

  if (active === 'on' || active === 'attiva' || active === '1') {
    chat.antimedia = true
    m.reply('✅ *Anti-Media attivato.*\nSaranno ammessi solo i media "Visualizza una volta".')
  } else if (active === 'off' || active === 'disattiva' || active === '0') {
    chat.antimedia = false
    m.reply('✅ *Anti-Media disattivato.*')
  } else {
    m.reply(`💡 *Uso:* .antimedia on/off`)
  }
}

handler.command = ['antimedia']
handler.group = true
handler.admin = true
