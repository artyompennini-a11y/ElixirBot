// Rimosso import di canvas e crypto perché inutilizzati ora

let handler = async (m, { conn }) => {
  try {
    // Identificazione del Target (Menzione > Citazione > Mittente)
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    // Recupero del nome pulito (non più strettamente necessario per il testo ma utile per formattazione)
    let rawName = conn.getName(target);
    // Rimuove caratteri speciali non ASCII per pulizia, se il nome diventa vuoto usa l'ID
    let cleanName = rawName.replace(/[^\x00-\x7F]/g, "").trim(); 
    if (!cleanName || cleanName.length < 1) {
      cleanName = target.split('@')[0]; 
    }
    
    // Messaggio di attesa
    await m.reply('🌀 *Sincronizzazione biometrica in corso...*');

    // Calcolo del valore dell'Aura (0 - 999.999)
    const auraValue = Math.floor(Math.random() * 1000000); 

    // Determinazione del Rank in base all'Aura
    // Rimosse le definizioni dei colori perché non usate nel testo semplice
    let rank, emoji;
    if (auraValue >= 900000) { rank = "DIVINITÀ"; emoji = "👑"; }
    else if (auraValue >= 750000) { rank = "ELITE"; emoji = "🟣"; }
    else if (auraValue >= 500000) { rank = "CAMPIONE"; emoji = "🔴"; }
    else if (auraValue >= 250000) { rank = "GUERRIERO"; emoji = "🔵"; }
    else { rank = "RECLUTA"; emoji = "🟢"; }

    // Formattazione del valore numerico (es. 123.456)
    const formattedAura = auraValue.toLocaleString('it-IT');

    // Preparazione del testo del messaggio
    let outputText = `.\n` +
`-------  aura system identification -------`.toUpperCase() + `\n\n` +
`👤 *SUBJECT IDENTIFIED:* ${cleanName.toUpperCase()}\n` +
`📊 *POWER POINTS:* ${formattedAura}\n` +
`🏆 *RANK:* ${emoji} ${rank}\n\n` +
`⚠️ *Analisi completata via terminale.*\n` +
`-------------------------------------------`;

    // INVIO DEL MESSAGGIO DI TESTO CON TAG FUNZIONANTE
    // Nota: Il tag nel testo è fatto tramite la caption o semplicemente scrivendo l'id e passandolo nelle mentions
    // Qui formattiamo il testo finale per includere il tag reale all'inizio o alla fine per assicurarci che funzioni
    
    await conn.sendMessage(m.chat, { 
      text: outputText,
      contextInfo: {
        mentionedJid: [target] // Assicura che il tag funzioni anche se non esplicito nel testo
      }
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Errore critico nel modulo Aura System.');
  }
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
