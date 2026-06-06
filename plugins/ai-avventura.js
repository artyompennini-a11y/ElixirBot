// Plug-in creato da elixir
const apiKey = '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'
const url = 'https://openrouter.ai/api/v1/chat/completions'
const euroCost = 50

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return
  if (user.euro < euroCost) return m.reply(`💰 Ti servono *${euroCost}€* per iniziare l'avventura.\nHai solo *${user.euro}€*`)

  // Sessione GDR
  const sessionId = m.chat + ':' + m.sender
  if (!global.gdrSessions) global.gdrSessions = {}

  // Se stato già esistente e utente risponde (A, B, C)
  const sceltePossibili = ['a', 'b', 'c']
  const input = text?.trim().toLowerCase()

  if (global.gdrSessions[sessionId] && input && sceltePossibili.includes(input)) {
    const sess = global.gdrSessions[sessionId]
    user.euro -= euroCost

    let key = await m.reply('🎲 *Elaborando la tua scelta...*')

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://elixirbot.x',
          'X-Title': '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v3',
          messages: [{
            role: 'system',
            content: `Sei un Dungeon Master italiano epico. Continua la storia ${sess.ambientazione} partendo dalla scelta dell'utente: "${input}". Scrivi cosa succede dopo (max 500 caratteri). Poi offri 3 nuove opzioni (A, B, C). Alla fine, assegna casualmente una ricompensa (tra 0 e 200 euro) o una penalità (tra -50 e -150 euro) in base alla scelta. Formato: [STORIA]... [OPZIONI] A) ... B) ... C) ... [RICONOSCIMENTO] Guadagni X euro.`
          }, {
            role: 'user',
            content: `La scelta dell'avventuriero è: ${input}`
          }],
          max_tokens: 600
        })
      })

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'Continua...'

      // Estrai ricompensa
      const euroMatch = aiResponse.match(/[+-]?\d+\s*euro/i)
      if (euroMatch) {
        const amount = parseInt(euroMatch[0].replace(/[^0-9-]/g, ''))
        if (!isNaN(amount)) user.euro += amount
      }

      global.gdrSessions[sessionId] = { ambientazione: sess.ambientazione, storia: aiResponse }

      await conn.sendMessage(m.chat, {
        text: `*🎲 AVVENTURA AI — ${sess.ambientazione.toUpperCase()}*\n\n${aiResponse}\n\n━━━━━━━━━━━\n💰 Costo turno: ${euroCost}€ | Saldo: ${user.euro}€\n✍️ Scrivi *A*, *B* o *C* per continuare!`,
        edit: key
      })

    } catch (e) {
      console.error('[AI-AVVENTURA] Errore:', e)
      await conn.sendMessage(m.chat, { text: `❌ Errore nell'avventura.\n${e.message}`, edit: key })
    }
    return
  }

  // Nuova avventura - determina ambientazione
  const ambientazioniValide = ['fantasy', 'cyberpunk', 'horror', 'spazio', 'apocalisse']
  const ambientazione = ambientazioniValide.includes(input) ? input : pickRandom(ambientazioniValide)

  user.euro -= euroCost

  let key = await m.reply(`🎲 *Generando avventura ${ambientazione}...*\n⏳ Il Dungeon Master AI sta preparando la storia...`)

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
          content: `Sei un Dungeon Master italiano epico. Crea l'inizio di un'avventura "${ambientazione}" (max 400 caratteri). Poi offri 3 opzioni di scelta (A, B, C) per il giocatore. Rispondi solo in italiano.`
        }],
        max_tokens: 500
      })
    })

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'La tua avventura inizia...'
    
    global.gdrSessions[sessionId] = { ambientazione, storia: aiResponse }

    await conn.sendMessage(m.chat, {
      text: `*🎲 AVVENTURA AI — ${ambientazione.toUpperCase()}*\n\n${aiResponse}\n\n━━━━━━━━━━━\n💰 Costo: ${euroCost}€ | Saldo: ${user.euro}€\n✍️ Scrivi *A*, *B* o *C* per continuare!\n⏹️ Scrivi *.stopgdr* per terminare.`,
      edit: key
    })

  } catch (e) {
    console.error('[AI-AVVENTURA] Errore:', e)
    await conn.sendMessage(m.chat, { text: `❌ Errore nella generazione dell'avventura.\n${e.message}`, edit: key })
  }
}

handler.help = ['avventura', 'gdr']
handler.tags = ['ai']
handler.command = /^(avventura|avventuraai|gdr)$/i
handler.group = true

export default handler

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }
