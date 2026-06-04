// Plug-in creato da elixir

const handler = async (m, { conn, text }) => {
  // Determina chi è il bersaglio (risposta al messaggio, tag, o se stesso)
  let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender)

  // Genera una percentuale casuale tra 0 e 100
  const percentage = Math.floor(Math.random() * 101)

  // Sceglie un'icona e un commento in base alla percentuale
  let comment = ''
  if (percentage <= 20) {
    comment = '🧠 Un vero genio, quasi impossibile da ingannare!'
  } else if (percentage <= 50) {
    comment = '👍 Tutto sommato normale, te la cavi.'
  } else if (percentage <= 80) {
    comment = '🥴 Inizi a preoccuparmi... un po\' distratto?'
  } else {
    comment = '🤡 Livello critico! Sei ufficialmente 100% DUMB!'
  }

  // Costruisce il messaggio menzionando il bersaglio
  const responseText = `*🤪 DUMB DETECTOR 🤪*\n\n🎯 *Bersaglio:* @${target.split('@')[0]}\n📊 *Percentuale:* ${percentage}%\n\n> ${comment}`

  // Invia il messaggio con la menzione attiva
  await conn.sendMessage(m.chat, {
    text: responseText,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['dumb']
handler.tags = ['fun']
handler.command = /^(dumb)$/i

export default handler
