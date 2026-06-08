import { createCanvas } from 'canvas';

const kebabIngredients = [
  '*Pane pita 🫓*', '*Pane lavash 🫓*', '*Carne di pollo 🍗*', '*Carne di manzo 🥩*', '*Carne di agnello 🐑*',
  '*Insalata 🥗*', '*Pomodori 🍅*', '*Cipolla 🧅*', '*Cetriolini sottaceto 🥒*', '*Peperoni 🌶️*',
  '*Salsa allo yogurt 🥛*', '*Salsa piccante 🔥*', '*Salsa all’aglio 🧄*', '*Patatine fritte 🍟*',
  '*Formaggio feta 🧀*', '*Rucola 🥗*', '*Mais 🌽*', '*Peperoncino fresco 🌶️*'
];

const kebabBotReplies = [
  "🌯 Kebab perfetto! Uno spettacolo per il palato.",
  "😋 Che bontà! Il maestro del kebab approva.",
  "🔥 Attenzione, questo è decisamente piccante!",
  "🎉 Kebab da campioni! Pronto per essere divorato.",
  "🤤 Mmm, la combinazione definitiva. Che delizia!"
];

// Funzione Canvas per disegnare un kebab stilizzato e dinamico
async function generateKebabImage(ingredients) {
  const width = 600;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Sfondo della card
  ctx.fillStyle = "#1e1e24";
  ctx.fillRect(0, 0, width, height);

  // Cerchio di sfondo decorativo
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
  ctx.fill();

  // DISEGNO DEL KEBAB STRATIFICATO
  // 1. Il Pane (Pita) di sfondo
  ctx.fillStyle = "#e29c52";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 + 50, 160, 0, Math.PI, true);
  ctx.fill();

  // 2. Strato Insalata (Verde)
  if (ingredients.some(i => i.includes('Insalata') || i.includes('Rucola'))) {
    ctx.fillStyle = "#2ed573";
    ctx.fillRect(width / 2 - 100, height / 2 - 20, 200, 40);
  }

  // 3. Strato Carne (Marrone)
  ctx.fillStyle = "#744410";
  ctx.fillRect(width / 2 - 110, height / 2 + 10, 220, 50);

  // 4. Strato Pomodori / Piccante (Rosso)
  if (ingredients.some(i => i.includes('Pomodori') || i.includes('piccante') || i.includes('Peperoncino'))) {
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.arc(width / 2 - 50, height / 2 + 20, 20, 0, Math.PI * 2);
    ctx.arc(width / 2 + 50, height / 2 + 20, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Strato Salse (Salsa Yogurt / Aglio)
  if (ingredients.some(i => i.includes('Salsa'))) {
    ctx.strokeStyle = "#f1f2f6";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, height / 2 - 10);
    ctx.bezierCurveTo(width / 2 - 40, height / 2 + 30, width / 2 + 40, height / 2 - 30, width / 2 + 80, height / 2 + 10);
    ctx.stroke();
  }

  // 6. Chiusura del Pane davanti (Involtino)
  ctx.fillStyle = "#f5b066";
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, height / 2 + 150);
  ctx.lineTo(width / 2, height / 2 - 40);
  ctx.lineTo(width / 2 + 140, height / 2 + 150);
  ctx.closePath();
  ctx.fill();

  // Testo e Titolo sulla Canvas
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🌟 KEBAB SPECIAL 🌟", width / 2, 70);

  ctx.fillStyle = "#a4b0be";
  ctx.font = "16px monospace";
  ctx.fillText("PREPARATO DA THE PUNISHER-BOT", width / 2, 550);

  return canvas.toBuffer('image/jpeg');
}

// Funzione unica per finalizzare e inviare il Kebab inserito nel flusso della chat
async function finalizeKebab(chatId, conn) {
  const game = global.kebabGame[chatId];
  if (!game) return;

  // Se l'utente non ha scelto ingredienti, ne mettiamo alcuni a caso per evitare errori
  if (game.ingredients.length === 0) {
    game.ingredients.push(kebabIngredients[0], kebabIngredients[2], kebabIngredients[5]);
  }

  const kebab = game.ingredients.join(', ');
  const userTag = `@${game.user.split('@')[0]}`;
  const randomReply = kebabBotReplies[Math.floor(Math.random() * kebabBotReplies.length)];
  
  const imageBuffer = await generateKebabImage(game.ingredients);

  await conn.sendMessage(chatId, {
    image: imageBuffer,
    caption: `┌🌯 *𝑲𝑬𝑩𝑨𝑩 𝑪𝑹𝑬𝑨𝑻𝑶* 🌯┐\n` +
            `│ 👤 *Chef:* ${userTag}\n` +
            `│\n` +
            `│ 🥙 *Ingredienti scelti:*\n` +
            `│ ${kebab.replace(/\*/g, '')}\n` +
            `└───────────────────┘\n\n` +
            `_${randomReply}_`,
    mentions: [game.user]
  });

  delete global.kebabGame[chatId];
}

let handler = async (m, { conn }) => {
  if (global.kebabGame?.[m.chat])
    return m.reply("⚠️ C'è già un kebab in fase di preparazione in questo gruppo!");

  const cooldownKey = `kebab_${m.chat}`;
  const now = Date.now();
  const cooldownTime = 5000;

  global.cooldowns = global.cooldowns || {};
  const lastGame = global.cooldowns[cooldownKey] || 0;

  if (now - lastGame < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ La cucina è calda! Aspetta ${remaining} secondi prima di ordinare.`);
  }

  global.cooldowns[cooldownKey] = now;

  const intro = `┌━━━〔 🌯 *𝑲𝑬𝑩𝑨𝑩 𝑺𝑻𝑼𝑫𝑰𝑶* 🌯 〕━━━┐\n` +
                `│ Componenti disponibili in dispensa:\n` +
                `└━━━━━━━━━━━━━━━━━━━━━━━━━┘\n`;

  let text = intro + "\n";
  kebabIngredients.forEach((c, i) => {
    text += `  [ ${String(i + 1).padStart(2, '0')} ]  ${c}\n`;
  });

  text += `\n───────────────────────────\n` +
          `📝 *Istruzioni:* Rispondi a questo messaggio scrivendo i numeri separati da virgola (es: *1, 3, 11*).\n` +
          `🏁 Scrivi *fine* per completare la cottura!`;

  const msg = await conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m });

  global.kebabGame = global.kebabGame || {};
  global.kebabGame[m.chat] = {
    id: msg.key.id,
    ingredients: [],
    user: m.sender,
    timeout: setTimeout(() => {
      if (global.kebabGame?.[m.chat]) {
        finalizeKebab(m.chat, conn);
      }
    }, 60000) // Ridotto a 1 minuto per dinamicità del gruppo
  };
};

handler.before = async (m, { conn }) => {
  const game = global.kebabGame?.[m.chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.sender !== game.user) return;

  const choices = m.text.trim().split(',').map(s => s.trim());

  for (const choice of choices) {
    if (choice.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);
      await finalizeKebab(m.chat, conn);
      return;
    }

    const index = parseInt(choice) - 1;
    if (!isNaN(index) && kebabIngredients[index] && !game.ingredients.includes(kebabIngredients[index])) {
      game.ingredients.push(kebabIngredients[index]);
    }
  }

  await conn.sendMessage(m.chat, {
    text: `🥙 *In cucina:* Hai aggiunto:\n${game.ingredients.join(', ').replace(/\*/g, '')}\n\nContinua l'ordine inserendo altri numeri oppure scrivi *fine*.`
  }, { quoted: m });
};

handler.help = ['kebab'];
handler.tags = ['giochi'];
handler.command = /^kebab$/i;
handler.group = true;

export default handler;
