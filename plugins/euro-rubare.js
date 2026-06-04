const cooldown = 30 * 60 * 1000; // 30 minuti

const frasiSuccesso = [
  "Come un napoletano in centro: preciso, rapido, invisibile.",
  "Schietto come un napoletano col motorino.",
  "È più veloce un rumeno, un marocchino o un napoletano? La risposta sei tu.",
  "Freddo come un milanese col Rolex: hai preso gli euro senza farti scoprire.",
  "È piovuto in città, ma non acqua, sono euro, e tutti per te.",
  "Con la calma di chi sa cosa fare: rubata da degno marocchino.",
  "I soldi non fanno la felicità, ma questi rubati sì.",
  "Sei entrato come un fantasma, nessuno ti ha visto.",
  "Hai lasciato la vittima senza parole... e senza euro."
];

const frasiFallimento = [
  "Occhi sospetti ti hanno sgamato.",
  "Ti sei distratto guardando tiktok.",
  "Troppa ansia da prestazione: ti sei tirato indietro.",
  "Sei stato colto dal panico e hai mollato tutto.",
  "La tua faccia da cazzo è stata black listata.",
  "Hai beccato la trappola per topi. Addio euro (e dignità).",
  "Eri troppo confident, i soldi stessi ti hanno derubato (?)",
  "Hai fatto un rumore assurdo e tutti si sono girati.",
  "La vittima aveva una telecamera nascosta, sei finito su TikTok."
];

const handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const now = Date.now();
  const time = (user.lastrob2 || 0) + cooldown;

  if (now < time) {
    const remaining = msToTime(time - now);
    return conn.reply(m.chat, `『 🚓 』- *La polizia ti sta ancora cercando, ritenta il colpo tra ${remaining}.*`, m);
  }

  let who;
  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.quoted?.sender;
  } else {
    who = m.chat;
  }

  if (!who || !(who in global.db.data.users)) {
    return conn.reply(m.chat, `『 🫷 』 - \`Devi menzionare o rispondere al messaggio della vittima con il comando\``, m);
  }

  if (who === m.sender) {
    return conn.reply(m.chat, `🙃 *Non puoi rubare a te stesso... down.*`, m);
  }

  const vittima = global.db.data.users[who];
  
  // Calcolo dinamico basato sul livello
  const livello = user.level || 1;
  // Probabilità base 40% + 3% per ogni livello (max 95%)
  const probSuccesso = Math.min(0.40 + (livello * 0.03), 0.95);
  
  // Euro rubabili: base 15-150 + bonus livello
  const bonusLivello = livello * 2;
  const minRubate = 15 + bonusLivello;
  const maxRubate = 150 + bonusLivello * 3;
  const rubate = Math.floor(Math.random() * (maxRubate - minRubate + 1)) + minRubate;

  if (vittima.euro < rubate) {
    return conn.reply(m.chat, `『 📉 』- @${who.split('@')[0]} *è gia un poraccio di suo, lascialo stare nella sua miseria*`, m, { mentions: [who] });
  }

  // Penalità in caso di fallimento: 20-50% del tentativo
  const multa = Math.floor(rubate * (0.20 + Math.random() * 0.30));

  const isSuccess = Math.random() < probSuccesso;
  user.lastrob2 = now;

  // ANIMAZIONE
  let key = await m.reply('🕵️ *Infiltrandosi nell\'ombra...*');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!isSuccess) {
    const failMsg = pickRandom(frasiFallimento);
    await conn.sendMessage(m.chat, {
      text: `\`${failMsg}\`\n\n『 👮‍♂️ 』- \`Hai tentato di derubare\` *@${who.split('@')[0]}*, e sei *stato sgamato!*\n『 💸 』- \`Multa:\` *-${multa}€*\n『 ⏳ 』- \`Ritenta tra:\` *${msToTime(cooldown)}*\n*👛 Saldo:* ${user.euro}€`,
      mentions: [who, m.sender],
      edit: key
    }, {
      quoted: m
    });
    // Applica multa
    user.euro = (user.euro || 0) - multa;
    if (user.euro < 0) user.euro = 0;
    return;
  }

  // Successo
  user.euro = (user.euro || 0) + rubate;
  vittima.euro = (vittima.euro || 0) - rubate;

  const successoMsg = pickRandom(frasiSuccesso);
  const livelloEmoji = livello >= 20 ? '💎' : livello >= 10 ? '🌟' : livello >= 5 ? '⭐' : '🌱';

  await conn.sendMessage(m.chat, {
    text: `\`${successoMsg}\`\n\n💫 @${m.sender.split('@')[0]} *ha sgraffiniato ${rubate}€* a @${who.split('@')[0]}!\n━━━━━━━━━━━━━\n${livelloEmoji} *Livello:* ${livello} | *Probabilità:* ${(probSuccesso * 100).toFixed(0)}%\n*👛 Tuo saldo:* ${user.euro}€\n*👛 Suo saldo:* ${vittima.euro}€`,
    mentions: [who, m.sender],
    edit: key
  }, {
    quoted: m
  });
};

handler.help = ['rubare @utente'];
handler.tags = ['euro'];
handler.command = ['rubare', 'ruba'];
handler.register = false;
handler.group = true;
export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);
  return parts.join(' ') || '0s';
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
