// Plug-in creato da elixir
const apiKey = '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'
const url = 'https://openrouter.ai/api/v1/chat/completions'
const euroCost = 50

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return
  if (user.euro < euroCost) return m.reply(`💰 Ti servono *${euroCost}€* per avviare l'interrogatorio.\nHai solo *${user.euro}€*`)

  let target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
  if (!target) return m.reply(`🎭 *INTERROGATORIO AI*\n\nMenziona l'indagato e descrivi il crimine!\n\n*Esempio:* \`.${command} @utente ha rubato 500€ alla banca\``)

  const crimine = text.replace(/@\d+/g, '').trim() || 'un crimine misterioso'
  const nomeAccusato = await conn.getName(target) || 'Sconosciuto'

  user.euro -= euroCost

  let key = await m.reply(`🎭 *INTERROGATORIO IN CORSO*\n\n🔍 Detective AI sta interrogando *${nomeAccusato}*...\n📋 Crimine: _${crimine}_`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://elixirbot.x',
        'X-Title': 'ElixirBot'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3',
        messages: [{
          role: 'system',
          content: `Sei un detective spietato italiano. Stai interrogando ${nomeAccusato} accusato di: "${crimine}". Fa' 3 domande incalzanti e poi emetti un verdetto FINALE in italiano. Se sembra colpevole, multa l'utente. Formato risposta: domande separate da [DOMANDA], verdetto finale con [VERDETTO].`
        }],
        max_tokens: 600
      })
    })

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta.'

    // Verdetto: se contiene parole come "colpevole" o "multa", sottrai euro
    const isColpevole = /colpevole|multa|condannato/i.test(aiResponse)
    if (isColpevole) {
      const targetUser = global.db.data.users[target]
      if (targetUser) {
        const multa = Math.floor(Math.random() * 100) + 50
        targetUser.euro = Math.max(0, (targetUser.euro || 0) - multa)
        await conn.sendMessage(m.chat, {
          text: `*🎭 INTERROGATORIO AI*\n\n${aiResponse}\n\n⚖️ *VERDETTO:* Colpevole!\n💰 Multa: *-${multa}€* a @${target.split('@')[0]}\n\n━━━━━━━━━━━\n💰 Costo: ${euroCost}€ | Saldo: ${user.euro}€`,
          mentions: [target],
          edit: key
        })
        return
      }
    }

    await conn.sendMessage(m.chat, {
      text: `*🎭 INTERROGATORIO AI*\n\n${aiResponse}\n\n⚖️ *VERDETTO:* Innocente!\n\n━━━━━━━━━━━\n💰 Costo: ${euroCost}€ | Saldo: ${user.euro}€`,
      edit: key
    })

  } catch (e) {
    console.error('[AI-INTERROGA] Errore:', e)
    await conn.sendMessage(m.chat, { text: `❌ Errore nell'interrogatorio AI.\n${e.message}`, edit: key })
  }
}

handler.help = ['interroga']
handler.tags = ['ai']
handler.command = /^(interroga|investiga)$/i
handler.group = true

export default handler
