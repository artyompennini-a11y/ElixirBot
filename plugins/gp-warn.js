// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
const PROTECTED_USERS = [
  '393784409415@s.whatsapp.net',
  '2348174457298@s.whatsapp.net'
];

const MAX_WARN = 5;

const handler = async (msg, { conn, command, text, isAdmin }) => {
  let mentionedJid = msg.mentionedJid?.[0] || msg.quoted?.sender;

  if (!mentionedJid && text) {
    let number = text.split(' ')[0].replace(/[^0-9]/g, '');
    if (number.length >= 8 && number.length <= 15) {
      mentionedJid = number + '@s.whatsapp.net';
    }
  }

  const chatId = msg.chat;
  const botNumber = conn.user.jid;
  const groupMetadata = await conn.groupMetadata(chatId);
  const groupOwner = groupMetadata.owner || chatId.split('-')[0] + '@s.whatsapp.net';

  if (!isAdmin) throw '`[!] ACCESSO NEGATO: Privilegi Admin richiesti.`';

  if (!mentionedJid) {
    return conn.reply(chatId, `*───「 ⚠️ UTENTE NON TROVATO 」───*\n\nTagga un utente o rispondi a un suo messaggio.\n\n*Esempio:* \`.warn @user Motivo\`\n*────────────────*`, msg);
  }

  let reason = text ? text.replace(/@\d+|^\d+/, '').trim() : '';

  if (command === 'warn' && (!reason || reason.length < 3)) {
    return conn.reply(chatId, `*───「 ❌ ERRORE PROTOCOLLO 」───*\n\nDevi inserire una *motivazione* per ammonire l'utente.\n\n*Esempio:* \`.warn ${mentionedJid.split('@')[0]} Comportamento inappropriato\`\n*────────────────*`, msg);
  }

  if (mentionedJid === groupOwner || PROTECTED_USERS.includes(mentionedJid) || mentionedJid === botNumber) {
    return conn.reply(chatId, `*───「 👑 TARGET PROTETTO 」───*\n\nL'utente selezionato è presente nel database delle protezioni di *𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁*.\n*────────────────*`, msg);
  }

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { warn: 0 };
  const user = global.db.data.users[mentionedJid];
  const tag = '@' + mentionedJid.split('@')[0];

  if (command === 'warn') {
    user.warn = (user.warn || 0) + 1;

    if (user.warn >= MAX_WARN) {
      user.warn = 0;
      await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove');

      return conn.sendMessage(chatId, {
        text: `\`\`\`╔══════════════════════════════════╗
║      ESPULSIONE AUTOMATICA       ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`🔨\` *Azione:* \`ESPULSIONE\`
\`⚠️\` *Causa:* \`Accumulo ${MAX_WARN}/${MAX_WARN} Warn\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA THE PUNISHER*`,
        mentions: [mentionedJid]
      });
    }

    return conn.sendMessage(chatId, {
      text: `\`\`\`╔══════════════════════════════════╗
║      AMMONIZIONE REGISTRATA      ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`📝\` *Motivo:* \`${reason}\`
\`⚠️\` *Stato:* \`${user.warn}/${MAX_WARN} Warn\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA THE PUNISHER*`,
      mentions: [mentionedJid]
    });
  }

  if (command === 'unwarn') {
    if (!user.warn || user.warn <= 0) throw '`[!] L\'utente non ha sanzioni attive.`';
    user.warn -= 1;

    return conn.sendMessage(chatId, {
      text: `\`\`\`╔══════════════════════════════════╗
║      SANZIONE REVOCATA           ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *Target:* ${tag}
\`✅\` *Azione:* \`Rimozione 1 Warn\`
\`📊\` *Nuovo Stato:* \`${user.warn}/${MAX_WARN} Warn\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA THE PUNISHER*`,
      mentions: [mentionedJid]
    });
  }
};

handler.help = ['warn', 'unwarn'];
handler.tags = ['admin'];
handler.command = /^(warn|unwarn)$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
