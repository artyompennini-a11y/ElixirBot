// ╔═══════════════════════════════════════════╗
// ║      ELIXIR-BOT • Plugin Password         ║
// ║      Nessuna API esterna necessaria       ║
// ╚═══════════════════════════════════════════╝

import { randomBytes } from 'crypto'

const CHARSET = {
  minuscole: 'abcdefghijklmnopqrstuvwxyz',
  maiuscole: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeri: '0123456789',
  simboli: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// Genera password crittograficamente sicura
function generaPassword(lunghezza, opzioni) {
  let charset = ''
  if (opzioni.minuscole) charset += CHARSET.minuscole
  if (opzioni.maiuscole) charset += CHARSET.maiuscole
  if (opzioni.numeri) charset += CHARSET.numeri
  if (opzioni.simboli) charset += CHARSET.simboli
  if (!charset) charset = CHARSET.minuscole + CHARSET.maiuscole + CHARSET.numeri

  let password = ''
  const bytes = randomBytes(lunghezza * 2)
  for (let i = 0; i < lunghezza; i++) {
    password += charset[bytes[i] % charset.length]
  }

  // Garantisce almeno un carattere per ogni tipo richiesto
  const chars = password.split('')
  let pos = 0
  if (opzioni.minuscole) { chars[pos++] = CHARSET.minuscole[randomBytes(1)[0] % CHARSET.minuscole.length] }
  if (opzioni.maiuscole) { chars[pos++] = CHARSET.maiuscole[randomBytes(1)[0] % CHARSET.maiuscole.length] }
  if (opzioni.numeri) { chars[pos++] = CHARSET.numeri[randomBytes(1)[0] % CHARSET.numeri.length] }
  if (opzioni.simboli) { chars[pos++] = CHARSET.simboli[randomBytes(1)[0] % CHARSET.simboli.length] }

  // Mescola
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

// Valuta la forza della password
function valutaForza(password) {
  let punteggio = 0
  if (password.length >= 8) punteggio++
  if (password.length >= 12) punteggio++
  if (password.length >= 16) punteggio++
  if (/[a-z]/.test(password)) punteggio++
  if (/[A-Z]/.test(password)) punteggio++
  if (/[0-9]/.test(password)) punteggio++
  if (/[^a-zA-Z0-9]/.test(password)) punteggio++

  if (punteggio <= 3) return { label: 'Debole', emoji: '🔴' }
  if (punteggio <= 5) return { label: 'Media', emoji: '🟡' }
  if (punteggio <= 6) return { label: 'Forte', emoji: '🟢' }
  return { label: 'Fortissima', emoji: '🛡️' }
}

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  // Parse argomenti: !password [lunghezza] [opzioni]
  let lunghezza = 16
  let opzioni = { minuscole: true, maiuscole: true, numeri: true, simboli: false }
  let quante = 1

  for (const arg of args) {
    if (/^\d+$/.test(arg)) {
      const n = parseInt(arg)
      if (n >= 4 && n <= 64) lunghezza = n
      else if (n >= 1 && n <= 5) quante = n
    }
    if (arg === '-s' || arg === '--simboli') opzioni.simboli = true
    if (arg === '-n' || arg === '--numeri') { opzioni = { minuscole: false, maiuscole: false, numeri: true, simboli: false } }
    if (arg === '-l' || arg === '--lower') opzioni.maiuscole = false
    if (arg === '--semplice') { opzioni = { minuscole: true, maiuscole: true, numeri: true, simboli: false } }
  }

  if (!args[0]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴘᴀꜱꜱ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🔑 *Comando:* ${usedPrefix}password
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}password [lunghezza] [opzioni]

*Esempi:*
  ${usedPrefix}password           → 16 caratteri standard
  ${usedPrefix}password 24        → 24 caratteri
  ${usedPrefix}password 20 -s     → con simboli
  ${usedPrefix}password 12 -n     → solo numeri (PIN)
  ${usedPrefix}password 16 3      → genera 3 password

*Opzioni:*
  \`-s\`  → includi simboli (!@#$...)
  \`-n\`  → solo numeri
  \`-l\`  → solo minuscole
  \`1-5\` → quante password generare

_☣️ Elixir Bot - Generazione sicura._`, m)
  }

  await m.react('🔑')

  const passwords = Array.from({ length: Math.min(quante, 5) }, () => generaPassword(lunghezza, opzioni))
  const forza = valutaForza(passwords[0])

  const lista = passwords.map((p, i) =>
    quante > 1 ? `│ ${i + 1}. \`${p}\`` : `│ \`${p}\``
  ).join('\n')

  const tipi = []
  if (opzioni.minuscole) tipi.push('a-z')
  if (opzioni.maiuscole) tipi.push('A-Z')
  if (opzioni.numeri) tipi.push('0-9')
  if (opzioni.simboli) tipi.push('!@#')

  await conn.sendMessage(m.chat, {
    text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴘᴀꜱꜱ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🔑 *Lunghezza:* ${lunghezza} caratteri
 │ 🔣 *Charset:* ${tipi.join(', ')}
 │ ${forza.emoji} *Forza:* ${forza.label}
 └───────────────────

${lista}

_☣️ Password generata da Elixir Bot._`
  }, { quoted: m })
}

handler.help = ['password [lunghezza] [opzioni]']
handler.tags = ['strumenti']
handler.command = ['password', 'pass', 'pwd', 'genera']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
