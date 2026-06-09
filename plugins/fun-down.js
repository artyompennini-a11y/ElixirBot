let handler = async (m, { conn }) => {
  try {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    let rawName = conn.getName(target);
    let cleanName = rawName.replace(/[^\x00-\x7F]/g, "").trim(); 
    if (!cleanName || cleanName.length < 1) {
      cleanName = target.split('@')[0]; 
    }
    
    await m.reply('`[⚠️] Scansione vulnerabilità in corso...`');

    // Valore percentuale 0-100
    const downValue = Math.floor(Math.random() * 101); 

    let status;
    if (downValue >= 90) status = "CRITICAL FAILURE 🔴";
    else if (downValue >= 70) status = "SYSTEM OVERHEAT 🟠";
    else if (downValue >= 40) status = "STABLE DECLINE 🟡";
    else if (downValue >= 10) status = "LOW IMPACT 🟢";
    else status = "OPTIMAL ⚪";

    // Creazione di una barra di progresso testuale (es: [████░░░░░░])
    const totalBars = 10;
    const filledBars = Math.round((downValue / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);

    // MESSAGGIO FINALE (Solo Testo)
    const caption = `\`[⚡] ANALISI DOWN COMPLETATA\`\n\n` +
                    `┌─ ▼ SYSTEM DOWN ANALYSIS ────────┐\n` +
                    `│ 👤 *TARGET:* ${cleanName.toUpperCase()}\n` +
                    `│ 🆔 *ID:* @${target.split('@')[0]}\n` +
                    `├─────────────────────────────────┤\n` +
                    `│ 📊 *RATE:* [ ${progressBar} ] ${downValue}%\n` +
                    `│ ⚠️ *STATUS:* ${status}\n` +
                    `└─────────────────────────────────┘`;

    await conn.sendMessage(m.chat, { 
      text: caption,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('`[!] ERROR: Glitch nel modulo di scansione .down`');
  }
};

handler.help = ['down'];
handler.tags = ['giochi'];
handler.command = /^(down)$/i;
handler.group = true;

export default handler;
