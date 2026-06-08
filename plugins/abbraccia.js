import { createCanvas } from 'canvas';

// Inizializzo il ranking se non esiste
globalThis.abbracciRank = globalThis.abbracciRank || {};

let handler = async (m, { conn }) => {
  let sender = m.sender;
  let target = null;

  // Rilevo il target: menzione o citazione
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno a cui vuoi dare un abbraccio! 🤗🫂");
  }

  // --- CREAZIONE CANVAS STICKMAN HUG (Migliorato) ---
  const canvas = createCanvas(500, 400);
  const ctx = canvas.getContext('2d');

  // Gradiente morbido come sfondo
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, '#fffaf0'); // Bianco crema morbido
  gradient.addColorStop(1, '#ffebf2'); // Rosa chiaro
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 500, 400);

  // Impostazioni della linea (più spessa e definita)
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Funzione per disegnare un'espressione facciale semplice
  const drawFace = (x) => {
    // Occhi
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(x - 8, 95, 3, 0, Math.PI * 2); // Occhio sinistro
    ctx.arc(x + 8, 95, 3, 0, Math.PI * 2); // Occhio destro
    ctx.fill();

    // Sorriso
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, 105, 10, 0, Math.PI); // Sorriso
    ctx.stroke();
  };

  // Disegno gli stickman molto vicini (abbracciati)
  // Stickman Blu (Sinistra)
  const x1 = 230;
  ctx.strokeStyle = '#3498db';
  ctx.beginPath(); ctx.arc(x1, 100, 30, 0, Math.PI * 2); ctx.stroke(); // Testa
  ctx.beginPath(); ctx.moveTo(x1, 130); ctx.lineTo(x1, 250); ctx.stroke(); // Corpo
  ctx.beginPath(); ctx.moveTo(x1, 250); ctx.lineTo(x1 - 30, 330); ctx.moveTo(x1, 250); ctx.lineTo(x1 + 30, 330); ctx.stroke(); // Gambe
  // Braccia che avvolgono l'altro
  ctx.beginPath(); ctx.moveTo(x1, 160); ctx.lineTo(x1 + 70, 160); ctx.moveTo(x1, 190); ctx.lineTo(x1 + 60, 200); ctx.stroke();
  drawFace(x1);

  // Stickman Rosso (Destra, specchiato)
  const x2 = 270;
  ctx.strokeStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(x2, 100, 30, 0, Math.PI * 2); ctx.stroke(); // Testa
  ctx.beginPath(); ctx.moveTo(x2, 130); ctx.lineTo(x2, 250); ctx.stroke(); // Corpo
  ctx.beginPath(); ctx.moveTo(x2, 250); ctx.lineTo(x2 - 30, 330); ctx.moveTo(x2, 250); ctx.lineTo(x2 + 30, 330); ctx.stroke(); // Gambe
  // Braccia che avvolgono l'altro (specchiato)
  ctx.beginPath(); ctx.moveTo(x2, 160); ctx.lineTo(x2 - 70, 160); ctx.moveTo(x2, 190); ctx.lineTo(x2 - 60, 200); ctx.stroke();
  drawFace(x2);

  // Cuoricino morbido sopra le teste
  ctx.fillStyle = '#ff2e63';
  ctx.font = '50px serif';
  ctx.fillText('❤️', 230, 60);

  let buffer;
  try {
    buffer = canvas.toBuffer();
  } catch (e) {
    // Fallback se il canvas non è installato o non funziona
    console.error("Errore canvas: ", e);
    buffer = null; 
  }

  // --- LOGICA RANKING E FRASI ---
  // Estraggo i nomi utente (puliti) per le menzioni
  const senderName = `@${sender.split("@")[0]}`;
  const targetName = `@${target.split("@")[0]}`;

  const frasi = [
    `${senderName} stringe forte ${targetName}! 🤗💖`,
    `Un abbraccio scalda-cuore da ${senderName} per ${targetName}! ✨💖`,
    `${senderName} corre ad abbracciare ${targetName}! 🫂💖`,
    `Niente è meglio di un abbraccio tra ${senderName} e ${targetName}! 🥰💖`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];

  // Aggiorno il ranking degli abbracci ricevuti
  if (!globalThis.abbracciRank[target]) globalThis.abbracciRank[target] = 0;
  globalThis.abbracciRank[target] += 1;

  // Testo finale del messaggio
  const testoFinale = `✨ **Abbraccio Speciale!** ✨\n\n${fraseRandom}\n\n🏆 *Abbracci ricevuti da ${targetName}:* **${globalThis.abbracciRank[target]}** 🫂`;

  if (buffer) {
    // Invia come immagine con didascalia
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: testoFinale,
      mentions: [sender, target] // Assicura che le menzioni siano corrette
    }, { quoted: m });
  } else {
    // Fallback se l'immagine non è stata generata
    await conn.sendMessage(m.chat, {
      text: testoFinale,
      mentions: [sender, target]
    }, { quoted: m });
  }
};

handler.help = ['abbraccia', 'hug'];
handler.tags = ['giochi'];
handler.command = /^(abbraccia|hug)$/i;
handler.group = true;

export default handler;
