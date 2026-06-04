const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  const textpremERROR = `⚠️ *Istruzioni:* Tagga l'utente o rispondi a un suo messaggio per aggiungerlo ai Premium.`;
  if (!who) return m.reply(textpremERROR, null, {mentions: conn.parseMention(textpremERROR)});

  const user = global.db.data.users[who];
  // Puliamo il testo per ottenere solo il numero, evitando che rimanga la chiocciola
  const duration = text.replace(/[@]?[0-9]+/, '').trim() || "1"; 
  const name = `@${who.split`@`[0]}`;

  const ERROR = `❌ L'utente non è presente nel database di *Elixir Bot*.`;
  if (!user) return m.reply(ERROR, null, {mentions: conn.parseMention(ERROR)});

  const n = parseInt(duration) || 1;
  const ora1 = 60 * 60 * 1000;
  const giorno1 = 24 * ora1;
  const settimana1 = 7 * giorno1;
  const mese1 = 30 * giorno1;
  const now = Date.now();

  let addedTime = 0;
  let type = "";

  if (command == 'addprem' || command == 'userpremium') {
    addedTime = n * ora1;
    type = n > 1 ? `${n} ore` : `1 ora`;
  } else if (command == 'addprem2' || command == 'userpremium2') {
    addedTime = n * giorno1;
    type = n > 1 ? `${n} giorni` : `1 giorno`;
  } else if (command == 'addprem3' || command == 'userpremium3') {
    addedTime = n * settimana1;
    type = n > 1 ? `${n} settimane` : `1 settimana`;
  } else if (command == 'addprem4' || command == 'userpremium4') {
    addedTime = n * mese1;
    type = n > 1 ? `${n} mesi` : `1 mese`;
  }

  if (now < user.premiumTime) user.premiumTime += addedTime;
  else user.premiumTime = now + addedTime;
  user.premium = true;

  const timeLeft = await formatTime(user.premiumTime - now);

  const report = `
┏━━━〔 🎟️ *ELIXIR PREMIUM* 〕━━━┓
┃
┃ ✨ *Utente:* ${name}
┃ 🕐 *Durata aggiunta:* ${type}
┃ 📉 *Scadenza totale:* ┃ ╰╼> ${timeLeft}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
*STATUS: ACCOUNT AGGIORNATO*`;

  m.reply(report, null, {mentions: [who]});
};

handler.help = ['addprem [@user] <quantità>'];
handler.tags = ['creatore'];
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'];
handler.group = true;
handler.owner = true; // Solo l'owner dovrebbe poter aggiungere premium

export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) timeString += `${days}g `;
  if (hours) timeString += `${hours}h `;
  if (minutes) timeString += `${minutes}m `;
  if (seconds) timeString += `${seconds}s`;
  return timeString.trim();
}