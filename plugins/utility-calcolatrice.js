// ╔═══════════════════════════════════════════╗
// ║      ELIXIR-BOT • Plugin Calcolatrice     ║
// ║      Nessuna API esterna necessaria       ║
// ╚═══════════════════════════════════════════╝

// Sostituisce parole chiave italiane con operatori
function parseItaliano(expr) {
  return expr
    .replace(/per/gi, '*')
    .replace(/diviso/gi, '/')
    .replace(/più/gi, '+')
    .replace(/meno/gi, '-')
    .replace(/elevato\s*a/gi, '**')
    .replace(/al\s*quadrato/gi, '**2')
    .replace(/al\s*cubo/gi, '**3')
    .replace(/radice(?:\s*di)?/gi, 'Math.sqrt')
    .replace(/pi(?:greco)?/gi, 'Math.PI')
    .replace(/mod/gi, '%')
}

// Gestisce la sintassi "X% di Y"
function parsePercentuale(expr) {
  return expr.replace(/(\d+(?:\.\d+)?)\s*%\s*di\s*(\d+(?:\.\d+)?)/gi, '($1/100*$2)')
             .replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)')
}

// Valuta l'espressione in modo sicuro (whitelist caratteri)
function valutaEspressione(expr) {
  const cleaned = expr.replace(/\s+/g, '')

  // Whitelist: solo caratteri matematici ammessi
  if (!/^[0-9+\-*/().%,Math.sqrtPIe\^]+$/.test(cleaned.replace(/Math\.(sqrt|PI|abs|round|floor|ceil|log|sin|cos|tan)/g, ''))) {
    throw new Error('Caratteri non ammessi')
  }

  // Rimpiazza ^ con ** per la potenza
  const safe = cleaned.replace(/\^/g, '**')

  // eslint-disable-next-line no-new-func
  const result = Function('"use strict"; return (' + safe + ')')()
  if (!isFinite(result)) throw new Error('Risultato non valido (divisione per zero?)')
  return result
}

function formatRisultato(num) {
  if (Number.isInteger(num)) return num.toLocaleString('it-IT')
  return parseFloat(num.toFixed(10)).toLocaleString('it-IT', { maximumFractionDigits: 8 })
}

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  if (!args[0]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - CALC 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🧮 *Comando:* ${usedPrefix}calc
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}calc <espressione>

*Operazioni base:*
  ${usedPrefix}calc 15 + 27
  ${usedPrefix}calc 100 - 43
  ${usedPrefix}calc 12 * 8
  ${usedPrefix}calc 144 / 12

*Operazioni avanzate:*
  ${usedPrefix}calc 2^10
  ${usedPrefix}calc 15% di 340
  ${usedPrefix}calc (25*4)/2 + 10
  ${usedPrefix}calc radice di 144

*In italiano:*
  ${usedPrefix}calc 5 per 8
  ${usedPrefix}calc 100 diviso 4
  ${usedPrefix}calc 3 elevato a 5

_☣️ Calcolatrice avanzata integrata._`, m)
  }

  const espressione = args.join(' ')
  if (espressione.length > 200) return conn.reply(m.chat, '❌ Espressione troppo lunga.', m)

  await m.react('🧮')

  try {
    let expr = parseItaliano(espressione)
    expr = parsePercentuale(expr)
    const risultato = valutaEspressione(expr)

    await conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - CALC 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🧮 *Espressione:*
 │ \`${espressione}\`
 └───────────────────

*Risultato:*
➤ *${formatRisultato(risultato)}*

_☣️ Calcolo completato._`
    }, { quoted: m })

  } catch (e) {
    console.error('[Calc Plugin] Errore:', e.message)
    conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - ERROR 💉
┗━━━━━━━━━━━━━━━━━━━━┛
❌ *Espressione non valida.*
_Controlla la sintassi e riprova._
_Esempio: \`${usedPrefix}calc 15% di 200\`_`, m)
  }
}

handler.help = ['calc <espressione>']
handler.tags = ['strumenti']
handler.command = ['calc', 'calcola', 'math']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
