const parole = [
  "gatto", "cane", "uccello", "elefante", "tigre", "balena", "farfalla", "tartaruga", "coniglio", "rana", "polpo", "scoiattolo", "giraffa", "coccodrillo", "pinguino", "corvo", "delfino", "serpente", "criceto", "zanzara", "ape",
  "televisione", "computer", "economia", "elettronica", "facebook", "whatsapp", "instagram", "tiktok", "telefono", "stampante", "microfono", "tastiera", "monitor", "processore", "batteria", "auricolari", "fotocamera", "proiettore", "router", "tablet",
  "milanese", "presidente", "bot", "insegnante", "studente", "avvocato", "architetto", "bibliotecario", "pediatra", "scienziato", "ricercatore", "musicista", "pittore", "scrittore", "giornalista", "regista", "attore", "attrice", "cuoco", "pasticcere",
  "anticonstituzionalmente", "precipitevolissimevolmente", "elettroencefalografista", "psiconeuroendocrinoimmunologia", "interscambiabilità", "transustanziazione", "incomprensibilità", "sovrappopolazione", "incommensurabilità", "inadeguatezza", "responsabilizzazione", "disinteressatamente", "inappuntabilità", "sovraccaricamento", "imprenditorialità", "riqualificazione", "sottosviluppato", "sovrintendenza", "incompatibilità", "contraddistinguere",
  "film", "matematica", "chimica", "fisica", "filosofia", "psicologia", "letteratura", "università", "biblioteca", "laboratorio", "esperimento", "viaggiatore", "astronauta", "astronomia", "costellazione", "galassia", "universo", "gravità", "orbita", "satellite"
];

const intentiMax = 6;
const gam = new Map();
const hintTimeout = 30; // secondi prima che si possa chiedere un indizio
const hintCost = 10; // euro per indizio

function scegliParolaCasuale() {
  return parole[Math.floor(Math.random() * parole.length)];
}

function mostraParola(p, lettere) {
  let out = "";
  for (const l of p) {
    if (lettere.includes(l)) {
      out += l + " ";
    } else if ("aeiou".includes(l)) {
      out += "+ "; // Più per le vocali non indovinate
    } else {
      out += "- "; // Meno per le consonanti non indovinate
    }
  }
  return out.trim();
}

/**
 * Genera lo stato dell'impiccato in formato testo (ASCII Art) invece di usare un Canvas.
 * @param {number} intenti Il numero di tentativi rimasti.
 * @returns {string} La rappresentazione testuale del patibolo.
 */
function ottieniTestoAhorcado(intenti) {
    const lost = intentiMax - intenti;
    const stadi = [
        "   +---+\n   |   |\n       |\n       |\n       |\n       |\n=========", // 0 errori
        "   +---+\n   |   |\n   O   |\n       |\n       |\n       |\n=========", // 1 errore (Testa)
        "   +---+\n   |   |\n   O   |\n   |   |\n       |\n       |\n=========", // 2 errori (Corpo)
        "   +---+\n   |   |\n   O   |\n  /|   |\n       |\n       |\n=========", // 3 errori (Braccio sin)
        "   +---+\n   |   |\n   O   |\n  /|\\  |\n       |\n       |\n=========", // 4 errori (Braccio destro)
        "   +---+\n   |   |\n   O   |\n  /|\\  |\n  /    |\n       |\n=========", // 5 errori (Gamba sin)
        "   +---+\n   |   |\n   O   |\n  /|\\  |\n  / \\  |\n       |\n========="  // 6 errori (Gamba destra - Game Over)
    ];
    return `\`\`\`\n${stadi[lost]}\n\`\`\``;
}

function lettereRestanti(p, lettere) {
  let vocali = 0, consonanti = 0;
  const lettereUniche = new Set(p.split(''));
  for (const l of lettereUniche) {
    if (!lettere.includes(l)) {
      if ("aeiou".includes(l)) vocali++;
      else consonanti++;
    }
  }
  return { vocali, consonanti };
}

let handler = async (m, { conn }) => {
  if (gam.has(m.sender)) {
    return conn.reply(m.chat, "⚠️ Hai già una partita in corso. Termina quella prima di iniziarne una nuova!", m);
  }
  let parola = scegliParolaCasuale();
  let lettere = [];
  let intenti = intentiMax;
  let msg = mostraParola(parola, lettere);
  let startTime = Date.now();

  const { vocali, consonanti } = lettereRestanti(parola, lettere);
  const asciiArt = ottieniTestoAhorcado(intenti);

  const caption = `ㅤㅤ⋆｡˚『 ╭ \`IMPICCATO\` ╯ 』˚｡⋆\n\n${asciiArt}\n\n╭\n│ 『 📝 』 \`Parola:\` *${msg}*\n│ 『 ❤️ 』 \`Tentativi:\` *${intenti}*\n│ 『 ➕ 』 \`Vocali:\` *${vocali}*\n│ 『 ➖ 』 \`Consonanti:\` *${consonanti}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\nRispondi a questo messaggio per giocare!\n(Dopo ${hintTimeout} secondi puoi scrivere *indizio* per ottenere un aiuto, costa ${hintCost} 🌟)`;
  
  let sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  
  gam.set(m.sender, { parola, lettere, intenti, startTime, hintUsed: false, msgId: sent.key.id });
};

handler.before = async (m, { conn }) => {
  let gioco = gam.get(m.sender);
  if (!gioco) return;

  // Verifica che si stia rispondendo al messaggio del gioco
  if (!m.quoted || m.quoted.id !== gioco.msgId) return;

  let { parola, lettere, intenti, startTime, hintUsed, msgId } = gioco;
  let user = global.db.data.users[m.sender];
  let input = m.text.trim().toLowerCase();

  // Gestione comando "indizio"
  if (input === 'indizio') {
    let elapsed = (Date.now() - startTime) / 1000;
    if (hintUsed) {
      return conn.reply(m.chat, "❗ Hai già usato l'indizio per questa parola!", m);
    }
    if (elapsed < hintTimeout) {
      return conn.reply(m.chat, `⏳ Attendi ancora ${Math.ceil(hintTimeout - elapsed)} secondi per richiedere un indizio!`, m);
    }
    if (!user || user.euro < hintCost) {
      return conn.reply(m.chat, `❌ Non hai abbastanza euro! Servono almeno ${hintCost} 🌟 per un indizio.`, m);
    }
    let letterePossibili = parola.split('').filter(l => !lettere.includes(l));
    if (letterePossibili.length === 0) {
      return conn.reply(m.chat, "🤔 Non ci sono più lettere da suggerire!", m);
    }
    let suggerita = letterePossibili[Math.floor(Math.random() * letterePossibili.length)];
    lettere.push(suggerita);
    user.euro -= hintCost;
    gioco.hintUsed = true;
    
    let msg = mostraParola(parola, lettere);
    const completata = parola.split('').every(l => lettere.includes(l));
    
    if (completata) {
      let exp = Math.floor(Math.random() * 300) + 100;
      if (parola.length >= 8) exp = Math.floor(Math.random() * 3500) + 500;
      global.db.data.users[m.sender].exp += exp;
      gam.delete(m.sender);
      const winCaption = `💡 Indizio: la lettera *${suggerita.toUpperCase()}* è stata rivelata!\n\nㅤㅤ⋆｡˚『 ╭ \`HAI VINTO!\` ╯ 』˚｡⋆\n╭\n│ 『 🎉 』 \`Parola:\` *${parola}*\n│ 『  XP 』 \`Guadagnati:\` *${exp}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      return conn.reply(m.chat, winCaption, m);
    } else {
      const { vocali, consonanti } = lettereRestanti(parola, lettere);
      const asciiArt = ottieniTestoAhorcado(intenti);
      const caption = `💡 Indizio: la lettera *${suggerita.toUpperCase()}* è stata rivelata!\n\nㅤㅤ⋆｡˚『 ╭ \`IMPICCATO\` ╯ 』˚｡⋆\n\n${asciiArt}\n\n╭\n│ 『 📝 』 \`Parola:\` *${msg}*\n│ 『 ❤️ 』 \`Tentativi:\` *${intenti}*\n│ 『 ➕ 』 \`Vocali:\` *${vocali}*\n│ 『 ➖ 』 \`Consonanti:\` *${consonanti}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      
      let sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      gam.set(m.sender, { ...gi
