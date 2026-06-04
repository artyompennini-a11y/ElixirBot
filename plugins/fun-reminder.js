// ╔═══════════════════════════════════════════╗
// ║       ELIXIR-BOT • Plugin Remind          ║
// ║       Promemoria temporizzato in chat     ║
// ╚═══════════════════════════════════════════╝

// Mappa dei promemoria attivi: id → timeout handle
// Serve per poter cancellare un remind prima che scatti
const activeReminders = new Map()
let reminderCounter = 0

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  // ─── Sottocomando: !remind list ──────────────────────────────────────────
  if (args[0] === 'list') {
    const userReminders = [...activeReminders.values()].filter(r => r.sender === m.sender)
    if (userReminders.length === 0) {
      return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ʀᴇᴍɪɴᴅ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
📋 *Nessun promemoria attivo.*
_Usa ${usedPrefix}remind <tempo> <testo> per crearne uno!_`, m)
    }

    const list = userReminders.map(r => {
      const rimasti = Math.max(0, Math.round((r.fireAt - Date.now()) / 1000 / 60))
      return `│ 🔔 *[${r.id}]* ${r.testo}\n│     ⏱️ tra ~${rimasti} min`
    }).join('\n')

    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ʀᴇᴍɪɴᴅ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 📋 *I tuoi promemoria:*
 └───────────────────
${list}

_Usa ${usedPrefix}remind cancel <id> per cancellarne uno._`, m)
  }

  // ─── Sottocomando: !remind cancel <id> ───────────────────────────────────
  if (args[0] === 'cancel') {
    const id = parseInt(args[1])
    const reminder = activeReminders.get(id)

    if (!reminder) {
      return conn.reply(m.chat, `❌ Nessun promemoria con ID *${id}* trovato.`, m)
    }
    if (reminder.sender !== m.sender) {
      return conn.reply(m.chat, `❌ Non puoi cancellare i promemoria degli altri!`, m)
    }

    clearTimeout(reminder.timeout)
    activeReminders.delete(id)
    await m.react('✅')
    return conn.reply(m.chat, `✅ Promemoria *[${id}]* cancellato.`, m)
  }

  // ─── Uso normale: !remind <tempo> <testo> ────────────────────────────────
  if (!args[0] || !args[1]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ʀᴇᴍɪɴᴅ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🔔 *Comando:* ${usedPrefix}remind
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}remind <tempo> <testo>
  ${usedPrefix}remind list
  ${usedPrefix}remind cancel <id>

*Formati tempo supportati:*
  \`30s\`  → 30 secondi
  \`5m\`   → 5 minuti
  \`2h\`   → 2 ore
  \`1d\`   → 1 giorno

*Esempi:*
  ${usedPrefix}remind 30m Prendere il caffè
  ${usedPrefix}remind 2h Chiamare la mamma
  ${usedPrefix}remind 1d Pagare la bolletta

_☣️ Max 5 promemoria attivi per utente._`, m)
  }

  // Parse del tempo (es: 30s, 5m, 2h, 1d)
  const tempoRaw = args[0].toLowerCase()
  const match = tempoRaw.match(/^(\d+)(s|m|h|d)$/)

  if (!match) {
    return conn.reply(m.chat, `❌ *Formato tempo non valido:* \`${tempoRaw}\`\n_Esempi validi: \`30s\`, \`5m\`, \`2h\`, \`1d\`_`, m)
  }

  const valore = parseInt(match[1])
  const unita = match[2]
  const moltiplicatori = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  const ms = valore * moltiplicatori[unita]

  // Limiti
  if (ms < 10000) return conn.reply(m.chat, `❌ Tempo minimo: *10 secondi*.`, m)
  if (ms > 86400000 * 7) return conn.reply(m.chat, `❌ Tempo massimo: *7 giorni*.`, m)

  // Max 5 promemoria per utente
  const userReminders = [...activeReminders.values()].filter(r => r.sender === m.sender)
  if (userReminders.length >= 5) {
    return conn.reply(m.chat, `❌ Hai già *5 promemoria attivi*. Cancellane uno con ${usedPrefix}remind cancel <id>.`, m)
  }

  const testo = args.slice(1).join(' ')
  if (testo.length > 200) return conn.reply(m.chat, `❌ Testo troppo lungo. Massimo *200 caratteri*.`, m)

  const id = ++reminderCounter
  const fireAt = Date.now() + ms

  // Formatta il tempo per la conferma
  const nomiUnita = { s: 'second', m: 'minut', h: 'or', d: 'giorn' }
  const suffisso = { s: valore === 1 ? 'o' : 'i', m: valore === 1 ? 'o' : 'i', h: valore === 1 ? 'a' : 'e', d: valore === 1 ? 'o' : 'i' }
  const tempoLeggibile = `${valore} ${nomiUnita[unita]}${suffisso[unita]}`

  // Programma il promemoria
  const timeout = setTimeout(async () => {
    activeReminders.delete(id)
    try {
      const nome = await conn.getName(m.sender) || 'Soggetto'
      await conn.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ʀᴇᴍɪɴᴅ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🔔 *PROMEMORIA [${id}]*
 │ 👤 *Per:* ${nome}
 └───────────────────

📌 *${testo}*

_☣️ Promemoria scattato come richiesto._`,
        mentions: [m.sender]
      })
    } catch (e) {
      console.error('[Remind Plugin] Errore invio promemoria:', e.message)
    }
  }, ms)

  activeReminders.set(id, { id, timeout, sender: m.sender, testo, fireAt, chat: m.chat })

  await m.react('🔔')
  conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ʀᴇᴍɪɴᴅ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ ✅ *Promemoria impostato!*
 │ 🆔 *ID:* ${id}
 │ ⏱️ *Tra:* ${tempoLeggibile}
 └───────────────────

📌 *${testo}*

_Usa ${usedPrefix}remind cancel ${id} per annullarlo._
_☣️ Ti avviserò in questa chat._`, m)
}

handler.help = ['remind <tempo> <testo>']
handler.tags = ['strumenti']
handler.command = ['remind', 'promemoria', 'timer']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
