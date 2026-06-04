import { createCanvas } from 'canvas';

globalThis.abbracciRank = globalThis.abbracciRank || {};

let handler = async (m, { conn }) => {
  let sender = m.sender;
  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno a cui vuoi dare un abbraccio! 🤗");
  }

  // --- CREAZIONE CANVAS STICKMAN HUG ---
  const canvas = createCanvas(500, 400);
  const ctx = canvas.getContext('2d');

  // Sfondo trasparente o bianco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 500, 400);

  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Funzione per disegnare uno stickman
  const drawStickman = (x, color, isRight) => {
    ctx.strokeStyle = color;
    
    // Testa
    ctx.beginPath();
    ctx.arc(x, 100, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Corpo
    ctx.beginPath();
    ctx.moveTo(x, 130);
    ctx.lineTo(x, 250);
    ctx.stroke();

    // Gambe
    ctx.beginPath();
    ctx.moveTo(x, 250);
    ctx.lineTo(x - 20, 330);
    ctx.moveTo(x, 250);
    ctx.lineTo(x + 20, 330);
    ctx.stroke();

    // Braccia (che si incrociano)
    ctx.beginPath();
    ctx.moveTo(x, 160);
    if (isRight) {
      ctx.lineTo(x - 60, 180); // Braccio teso verso l'altro
    } else {
      ctx.lineTo(x + 60, 180); // Braccio teso verso l'altro
    }
    ctx.stroke();
  };

  // Disegno i due stickman vicini
  drawStickman(200, '#3498db', false); // Blu (Sinistra)
  drawStickman(300, '#e74c3c', true);  // Rosso (Destra)

  // Cuoricino sopra le teste
  ctx.fillStyle = '#ff2e63';
  ctx.font = '50px serif';
  ctx.fillText('❤️', 230, 60);

  const buffer = canvas.toBuffer();

  // --- LOGICA RANKING E FRASI ---
  const frasi = [
    `@${sender.split("@")[0]} stringe forte @${target.split("@")[0]}! 🤗`,
    `Un abbraccio scalda-cuore da @${sender.split("@")[0]} per @${target.split("@")[0]}! ✨`,
    `@${sender.split("@")[0]} corre ad abbracciare @${target.split("@")[0]}! 🫂`,
    `Niente è meglio di un abbraccio tra @${sender.split("@")[0]} e @${target.split("@")[0]}! 💖`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];
  if (!globalThis.abbracciRank[target]) globalThis.abbracciRank[target] = 0;
  globalThis.abbracciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n\n🫂 Abbracci ricevuti da @${target.split("@")[0]}: ${globalThis.abbracciRank[target]}`;

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: testoFinale,
    mentions: [sender, target]
  }, { quoted: m });
};

handler.help = ['abbraccia'];
handler.tags = ['giochi'];
handler.command = /^(abbraccia|hug)$/i;
handler.group = true;

export default handler;
