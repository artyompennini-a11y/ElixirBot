// ╔═══════════════════════════════════════════╗
// ║      ELIXIR-BOT • Plugin Dizionario       ║
// ║      API: Free Dictionary (gratis)        ║
// ╚═══════════════════════════════════════════╝

import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix }) => {

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  if (!args[0]) {
    return conn.reply(m.chat, `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - DIZIO 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 📖 *Comando:* ${usedPrefix}dizio
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:*
  ${usedPrefix}dizio <parola>

*Esempi:*
  ${usedPrefix}dizio serendipità
  ${usedPrefix}dizio effimero
  ${usedPrefix}dizio resilienza

_☣️ Definizioni in italiano e inglese._`, m)
  }

  const parola = args[0].toLowerCase().trim()
  if (parola.length > 50) return conn.reply(m.chat, '❌ Parola troppo lunga.', m)

  await m.react('📖')

  try {
    // Prova prima in italiano, poi inglese come fallback
    let data = null
    let lingua = 'it'

    try {
      const resIt = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/it/${encodeURIComponent(parola)}`,
        { timeout: 8000 }
      )
      data = resIt.data
    } catch {
      // Fallback inglese
      const resEn = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(parola)}`,
        { timeout: 8000 }
      )
      data = resEn.data
      lingua = 'en'
    }

    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('Parola non trovata')

    const entry = data[0]
    const parolaUfficiale = entry.word

    // Raccoglie tutte le definizioni per categoria grammaticale
    const sezioni = []
    for (const meaning of entry.meanings.slice(0, 3)) {
      const partOfSpeech = meaning.partOfSpeech || 'N/D'
      const defs = meaning.definitions.slice(0, 2).map((d, i) => {
        let line = `│ ${i + 1}. ${d.definition}`
        if (d.example) line += `\n│    _Es: "${d.example}"_`
        return line
      }).join('\n')

      const sinonimi = meaning.synonyms?.slice(0, 3).join(', ')
      const contrari = meaning.antonyms?.slice(0, 3).join(', ')

      let sezione = `├─ *${partOfSpeech.toUpperCase()}*\n${defs}`
      if (sinonimi) sezione += `\n│ 🔄 *Sinonimi:* ${sinonimi}`
      if (contrari) sezione += `\n│ ↔️ *Contrari:* ${contrari}`
      sezioni.push(sezione)
    }

    // Fonetica
    const fonetica = entry.phonetics?.find(p => p.text)?.text || ''
    const linguaLabel = lingua === 'it' ? '🇮🇹 Italiano' : '🇬🇧 Inglese'

    await conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - DIZIO 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 📖 *Parola:* ${parolaUfficiale}${fonetica ? `\n │ 🔊 *Fonetica:* ${fonetica}` : ''}
 │ 🌍 *Lingua:* ${linguaLabel}
 └───────────────────

${sezioni.join('\n│\n')}

_☣️ Definizione estratta._`
    }, { quoted: m })

  } catch (e) {
    console.error('[Dizio Plugin] Errore:', e.message)

    let msg = `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 - ERROR 💉
┗━━━━━━━━━━━━━━━━━━━━┛
`
    if (e.response?.status === 404 || e.message?.includes('non trovata')) {
      msg += `❌ *Parola non trovata:* \`${parola}\`\n_Controlla l'ortografia e riprova._`
    } else if (e.code === 'ECONNABORTED') {
      msg += '⏱️ *Timeout:* Il server non risponde. Riprova.'
    } else {
      msg += `☣️ *Errore:* ${e.message?.slice(0, 80)}`
    }

    conn.reply(m.chat, msg, m)
  }
}

handler.help = ['dizio <parola>']
handler.tags = ['strumenti']
handler.command = ['dizio', 'dizionario', 'def', 'definizione']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
