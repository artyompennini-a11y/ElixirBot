// Plug-in creato da elixir
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    
    if (!text) throw `\`⚠️ Inserisci il link del gruppo.\`\n\`Esempio: ${usedPrefix + command} https://whatsapp.com...\``;

    let [ , code] = text.match(linkRegex) || [];
    if (!code) throw '`❌ Il link fornito non è un invito WhatsApp valido.`';

    // Messaggio estetico di attesa
    let waitingMsg = `  ⋆｡˚『 ╭ \`INFILTRAZIONE\` ╯ 』˚｡⋆\n\n`
    waitingMsg += `  │ 🤖 *Soggetto:* 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃\n`
    waitingMsg += `  │ 🎯 *Obiettivo:* Invasione Gruppo\n`
    waitingMsg += `  │ ⏳ *Stato:* Calcolo coordinate...\n`
    waitingMsg += `  ╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
    
    await m.reply(waitingMsg);

    // Effetto delay per realismo
    await delay(3000);

    try {
        await conn.groupAcceptInvite(code);
        
        let successMsg = `  ⋆｡˚『 ╭ \`SUCCESSO\` ╯ 』˚｡⋆\n\n`
        successMsg += `  │ ✅ *Stato:* Entrato nel gruppo\n`
        successMsg += `  │ 🛡️ *Protocollo:* Attivo\n`
        successMsg += `  ╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
        
        await m.reply(successMsg);
    } catch (e) {
        throw '`❌ Impossibile accedere: il bot potrebbe essere stato bannato o il link è scaduto.`';
    }
};

handler.help = ['join <link>'];
handler.tags = ['owner'];
handler.command = /^(join|entra)$/i;

// Accesso esclusivo ai creatori (config.js)
handler.rowner = true;

export default handler;
