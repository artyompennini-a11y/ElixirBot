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

// Funzione unica per finalizzare e inviare il Kebab inserito nel flusso della chat (Solo Testo)
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
  
  await conn.sendMessage(chatId, {
    text: `┌🌯 *𝑲𝑬𝑩𝑨𝑩 𝑪𝑹𝑬𝑨𝑻𝑶* 🌯┐\n` +
          `│ 👤 *Chef:* ${userTag}\n` +
          `│\n` +
          `│ 🥙 *Ingredienti scelti:*\n` +
          `│ ${kebab.replace(/\*/g, '')}\n` +
          `└───────────────────┘\n\n` +
          `_${randomReply}_\n\n` +
          `*PREPARATO DA THE PUNISHER-BOT*`,
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
    }, 60000) // 1 minuto di tempo limite
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
