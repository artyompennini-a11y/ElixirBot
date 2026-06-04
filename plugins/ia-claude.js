import fetch from 'node-fetch';

const handler = async (m, { text, conn }) => {
  if (!text) return m.reply("❓ *Scrivi qualcosa dopo il comando:*\n.claude <domanda>");

  const apiKey = global.APIKeys.openrouter;
  if (!apiKey) return m.reply("🔑 Chiave OpenRouter non trovata in global.APIKeys.openrouter");

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/realvare',
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "user", content: text }
        ],
        max_tokens: 1000
      })
    });

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content;

    if (!reply) return m.reply("⚠️ Nessuna risposta ricevuta da Claude (OpenRouter)");

    await conn.reply(m.chat, `${reply}`, m);
  } catch (err) {
    console.error('[Claude Error]', err);
    m.reply("🚫 Errore nella richiesta a Claude.");
  }
};

handler.command = /^\.?claude$/i;
handler.help = ['claude'];
handler.tags = ['ai', 'strumenti', 'iatesto'];
handler.register = false;
export default handler;