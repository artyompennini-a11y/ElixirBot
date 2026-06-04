import { createCanvas } from 'canvas';

globalThis.baciRank = globalThis.baciRank || {};

let handler = async (m, { conn }) => {
  let sender = m.sender;
  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno o rispondere al suo messaggio per dargli un bacio! 💋");
  }

  // --- CREAZIONE CANVAS REALISTICO ---
  const canvas = createCanvas(500, 300);
  const ctx = canvas.getContext('2d');

  // Gradiente per le labbra (rosso/borgogna)
  const grad = ctx.createRadialGradient(250, 150, 20, 250, 150, 150);
  grad.addColorStop(0, '#ff4d6d'); // Centro più chiaro
  grad.addColorStop(1, '#800e13'); // Bordi scuri

  ctx.fillStyle = grad;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';

  // Labbro superiore (Arco di Cupido)
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.bezierCurveTo(180, 100, 230, 100, 250, 130); // Sinistra
  ctx.bezierCurveTo(270, 100, 320, 100, 350, 150); // Destra
  ctx.bezierCurveTo(300, 160, 200, 160, 150, 150); // Base superiore
  ctx.fill();

  // Labbro inferiore (Più pieno)
  ctx.beginPath();
  ctx.moveTo(150, 160);
  ctx.bezierCurveTo(180, 240, 320, 240, 350, 160);
  ctx.bezierCurveTo(300, 175, 200, 175, 150, 160);
  ctx.fill();

  // Effetto lucido (Highlight)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.arc(250, 195, 40, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  const buffer = canvas.toBuffer();

  // --- LOGICA RANKING E FRASI ---
  const frasi = [
    `@${sender.split("@")[0]} ha dato un bacio travolgente a @${target.split("@")[0]}! 💋`,
    `Un bacio dolcissimo da @${sender.split("@")[0]} per @${target.split("@")[0]}! ✨`,
    `@${sender.split("@")[0]} ha appena baciato @${target.split("@")[0]} davanti a tutti! 😳`,
    `Muah! @${sender.split("@")[0]} lancia un bacio speciale a @${target.split("@")[0]}! 💖`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];
  
  if (!globalThis.baciRank[target]) globalThis.baciRank[target] = 0;
  globalThis.baciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n\n💋 Baci totali ricevuti da @${target.split("@")[0]}: ${globalThis.baciRank[target]}`;

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: testoFinale,
    mentions: [sender, target]
  }, { quoted: m });
};

handler.help = ['bacia'];
handler.tags = ['giochi'];
handler.command = /^(bacia|kiss)$/i;
handler.group = true;

export default handler;
