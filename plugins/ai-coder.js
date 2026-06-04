// Plug-in creato da elixir
const apiKey = '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'
const url = 'https://openrouter.ai/api/v1/chat/completions'

let handler = async (m, { conn, text, quoted, usedPrefix, command }) => {
  if (!text && !quoted?.text) {
    return m.reply(`🤖 *AI CODER — ELIXIR DEV TOOLS*\n\nIncolla l'errore o il codice da fixare.\n\n*Esempio:* \n\`.${command} SyntaxError: Unexpected token at line 42\`\n\n*Oppure:* Rispondi a un messaggio con l'errore e usa \`.${command}\``)
  }

  const codice = (quoted?.text || text).trim()

  let key = await m.reply('🤖 *Analizzando il codice con AI...*\n⏳ OpenRouter DeepSeek-V3 in azione...')

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
          content: `Sei un programmatore esperto. Analizza l'errore o il codice seguente e fornisci la soluzione. Fornisci SOLO il codice corretto pronto da copiare, formattato come handler del bot ElixirBot (export default handler, handler.command, handler.help, handler.tags). Commenta le modifiche fatte. Rispondi in italiano.`
        }, {
          role: 'user',
          content: codice
        }],
        max_tokens: 1500
      })
    })

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta.'

    await conn.sendMessage(m.chat, {
      text: `*🤖 AI CODER — SOLUZIONE*\n\n${aiResponse}\n\n━━━━━━━━━━━\n💡 *Suggerimento:* Rispondi a questo messaggio con \`.saveplugin nome_file\` per salvare il fix!`,
      edit: key
    })

  } catch (e) {
    console.error('[AI-CODER] Errore:', e)
    await conn.sendMessage(m.chat, { text: `❌ Errore nell'analisi AI.\n${e.message}`, edit: key })
  }
}

handler.help = ['aicix']
handler.tags = ['creator']
handler.command = /^(aicix|aifix|devfix)$/i
handler.rowner = true

export default handler
