import fs from 'fs'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  let loveText = ''
  let partner2Jid = null
  
  try {
    const senderName = await (async () => {
      try { return await conn.getName(m.sender) } catch { return (m.pushName || m.sender.split('@')[0]) }
    })()

    let name1 = senderName
    let name2 = null

    if (m.quoted && m.quoted.sender) {
      partner2Jid = m.quoted.sender
      try { name2 = await conn.getName(partner2Jid) } catch { name2 = partner2Jid.split('@')[0] }
    }

    if (!name2 && Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
      partner2Jid = m.mentionedJid[0]
      try { name2 = await conn.getName(partner2Jid) } catch { name2 = partner2Jid.split('@')[0] }
    }

    if (!text && !name2) return conn.reply(m.chat, '✨ *Scrivi il nome della persona, menziona o rispondi a un messaggio*', m)

    if (text && !name2) {
      const parts = text.trim().split(/\s+/)
      if (parts.length === 1) {
        name2 = parts[0]
      } else {
        name1 = parts.shift()
        name2 = parts.join(' ')
      }
    }

    if (!name2) name2 = 'Amico/a'

    // Calcolo della percentuale di affinità
    let percentage = Math.floor(Math.random() * 101)

    // Generazione della barra di progressione visiva (10 blocchi totali)
    const barLength = 10
    const filledLength = Math.round((percentage / 100) * barLength)
    const emptyLength = barLength - filledLength
    const progressBar = '❤️'.repeat(filledLength) + '🖤'.repeat(emptyLength)

    let commento = ''
    if (percentage < 30) {
      commento = "Il destino ha in serbo altri piani... 🌌"
    } else if (percentage < 60) {
      commento = "C'è una scintilla, ma serve un po' di magia... ✨"
    } else if (percentage < 90) {
      commento = "Un’affinità romantica e inaspettata! ⚡"
    } else {
      commento = "Un legame destinato a durare per sempre! 💍"
    }

    // Creazione del layout testuale premium
    let cardTestuale = `ㅤㅤ  ⋆｡˚『 ╭ *LOVE TESTER* ╯ 』˚｡⋆\n\n`
    cardTestuale += `╭─────────────────────────╮\n`
    cardTestuale += `│  👤 *Partner 1:* ${name1}\n`
    cardTestuale += `│  👤 *Partner 2:* ${name2}\n`
    cardTestuale += `├─────────────────────────┤\n`
    cardTestuale += `│  📊 *Affinità:* [ ${percentage}% ]\n`
    cardTestuale += `│  [ ${progressBar} ]\n`
    cardTestuale += `├─────────────────────────┤\n`
    cardTestuale += `│  💬 _"${commento}"_\n`
    cardTestuale += `╰─────────────────────────╯\n\n`

    if (percentage < 50) {
      loveText = `💔 C'è un piccolo intoppo! Sembra che *${name1}* e *${name2}* abbiano solo il *${percentage}%* di affinità. Ma l'amore è un mistero...`
    } else if (percentage < 100) {
      loveText = `❤️ Wow, *${name1}* e *${name2}*! Il vostro amore brilla al *${percentage}%*. Un vero colpo di fulmine!`
    } else {
      loveText = `✨ Un legame magico! *${name1}* e *${name2}* sono anime gemelle, compatibili al *${percentage}%*! Il destino vi unisce.`
    }

    cardTestuale += loveText

    const buttons = [
      { buttonId: `${usedPrefix}coppia ${name1} ${name2}`, buttonText: { displayText: 'Ricalcola 🔄' }, type: 1 }
    ]

    // Invio del messaggio testuale completo
    await conn.sendMessage(m.chat, {
      text: cardTestuale,
      footer: 'vare ✧ bot',
      buttons,
      mentions: conn.parseMention(cardTestuale)
    }, { quoted: m })

    // Sistema di matrimonio (attivo solo con il 100% di affinità)
    if (percentage === 100) {
      m.reply(`💍 *WOW! ${name1} e ${name2} sono compatibili al 100%!* Volete sposarvi?`, null, { mentions: conn.parseMention(`@${m.sender.split('@')[0]} @${(partner2Jid)?.split('@')[0] || ''}`) })
      
      let filter = msg => {
        let txt = (msg.text || '').toLowerCase()
        return (txt === 'si' || txt === 'sì') && (msg.sender == m.sender || msg.sender == partner2Jid)
      }
      let timeout = 60000
      let collected = []

      await conn.reply(m.chat, `*${name1}* e *${name2}*, rispondete "sì" per accettare il matrimonio! (60s)`, m)

      while (collected.length < 2) {
        let res = await conn.awaitMessage(m.chat, filter, timeout).catch(() => null)
        if (!res) break
        if (!collected.includes(res.sender)) collected.push(res.sender)
      }

      if (collected.length === 2) {
        let file = './sposi.json'
        let sposi = []
        if (fs.existsSync(file)) {
          try { sposi = JSON.parse(fs.readFileSync(file)) } catch { sposi = [] }
        }
        sposi.push({ partner1: name1, partner2: name2, date: new Date().toISOString() })
        fs.writeFileSync(file, JSON.stringify(sposi, null, 2))
        return conn.reply(m.chat, `💞 *Congratulazioni! ${name1} e ${name2} sono ora ufficialmente sposati!*`, m)
      } else {
        return conn.reply(m.chat, `💔 Matrimonio annullato: non entrambi hanno accettato.`, m)
      }
    }
  } catch (e) {
    console.error('Errore comando coppia:', e)
    return conn.reply(m.chat, `Errore durante l'elaborazione del comando.\n\n${loveText}`, m)
  }
}

handler.help = ['coppia']
handler.tags = ['giochi']
handler.command = /^(ship|love|amore|coppia)$/i
handler.register = false

export default handler
