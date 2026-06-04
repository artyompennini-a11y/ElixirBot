let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🍭 *Inserisci il @tag di un utente.*');
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) return m.reply('紗 *Inserisci il @tag di un utente.*');
  let users = global.db.data.users;
  users[who] = users[who] || {};

  if (command === 'banuser') {
    users[who].banned = true;
    users[who].bannedReason = 'Bannato da owner';
    conn.reply(m.chat, `✨ *L'utente @${who.split('@')[0]} è stato bannato con successo.*`, m, { mentions: [who] });
  } else if (command === 'unbanuser') {
    users[who].banned = false;
    users[who].bannedReason = '';
    conn.reply(m.chat, `✨ *L'utente @${who.split('@')[0]} è stato sbannato con successo.*`, m, { mentions: [who] });
  }
  await global.db.write();
};

handler.help = ['banuser <@tag>', 'unbanuser <@tag>'];
handler.command = ['banuser', 'unbanuser'];
handler.tags = ['creatore'];
handler.mods = true;
handler.owner = true;
export default handler;
