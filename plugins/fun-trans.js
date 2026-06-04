// Plug-in creato da elixir
let handler = async (m, { conn, command, text }) => {
    // Calcolo della percentuale di "transgender"
    let percentage = Math.floor(Math.random() * 101);

    // Frase finale basata sulla percentuale
    let finalPhrase = percentage >= 50 
        ? "🏳️‍⚧️ *Ci avrei scommesso che li sotto c'era la sorpresa!*"
        : "😅 *C'è ancora un po' di strada da fare*";

    // Messaggio completo
    let message = `
━━━━━━━━━━━━━━━━━━━━━
🏳️‍⚧️ *CALCOLATORE DI TRANS* 🏳️‍⚧️
━━━━━━━━━━━━━━━━━━━━━
🌈 *${text} è trans al:*  
⚡ *${percentage}%* di livello! ⚡
━━━━━━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    m.reply(message, null, { mentions: conn.parseMention(message) });
};

handler.command = /^(trans)$/i;

export default handler;
