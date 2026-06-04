const PROTECTED_USERS = [
  '393784409415@s.whatsapp.net',
  '393514722317@s.whatsapp.net'
];

const handler = async (msg, { conn, command, text, isAdmin }) => {
  let mentionedJid = msg.mentionedJid?.[0] || msg.quoted?.sender;
  
  // Identificazione utente dal testo se non c'è tag/quote
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

  // --- CONTROLLO ACCESSO ---
  if (!isAdmin) throw '`[!] ACCESSO NEGATO: Privilegi Admin richiesti.`';

  if (!mentionedJid) {
    return conn.reply(chatId, `*───「 ⚠️ UTENTE NON TROVATO 」───*\n\nTagga un utente o rispondi a un suo messaggio.\n\n*Esempio:* \`.warn @user Motivo\`\n*────────────────*`, msg);
  }

  // --- ESTRAZIONE MOTIVAZIONE OBBLIGATORIA (Solo per Warn) ---
  // Rimuove il tag o il numero dal testo per isolare il motivo
  let reason = text ? text.replace(/@\d+|^\d+/, '').trim() : '';

  if (command === 'warn' && (!reason || reason.length < 3)) {
    return conn.reply(chatId, `*───「 ❌ ERRORE PROTOCOLLO 」───*\n\nDevi inserire una *motivazione* per ammonire l'utente.\n\n*Esempio:* \`.warn ${mentionedJid.split('@')[0]} Comportamento inappropriato\`\n*────────────────*`, msg);
  }

  // --- PROTEZIONI REALI ---
  if (mentionedJid === groupOwner || PROTECTED_USERS.includes(mentionedJid) || mentionedJid === botNumber) {
    return conn.reply(chatId, `*───「 👑 TARGET PROTETTO 」───*\n\nL'utente selezionato è presente nel database delle protezioni di *Elixir*.\n*────────────────*`, msg);
  }

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { warn: 0 };
  const user = global.db.data.users[mentionedJid];
  const tag = '@' + mentionedJid.split('@')[0];

  // --- COMANDO WARN ---
  if (command === 'warn') {
    user.warn = (user.warn || 0) + 1;

    if (user.warn >= 3) {
      user.warn = 0;
      await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove');
      
      return conn.sendMessage(chatId, {
        text: `┏─━─━─━  〔 🚨 〕  ━─━─━─┓\n     *SECURITY ENFORCEMENT*\n┗─━─━─━─━─━─━─━─━─┛\n\n◈ *Target:* ${tag}\n◈ *Azione:* \`Espulsione Definitiva\`\n◈ *Causa:* \`Accumulo 3/3 Warn\`\n\n> _Protocollo di sicurezza completato._`,
        mentions: [mentionedJid]
      });
    }

    return conn.sendMessage(chatId, {
      text: `┏─━─━─━  〔 ⚠️ 〕  ━─━─━─┓\n     *ELIXIR WARN SYSTEM*\n┗─━─━─━─━─━─━─━─━─┛\n\n◈ *Target:* ${tag}\n◈ *Motivo:* \`${reason}\`\n◈ *Stato:* \`${user.warn}/3 Warn\`\n\n> *Attenzione:* Al prossimo richiamo verrai rimosso dal gruppo.`,
      mentions: [mentionedJid]
    });
  }

  // --- COMANDO UNWWARN ---
  if (command === 'unwarn') {
    if (!user.warn || user.warn <= 0) throw '`[!] L\'utente non ha sanzioni attive.`';
    user.warn -= 1;

    return conn.sendMessage(chatId, {
      text: `┏─━─━─━  〔 ✅ 〕  ━─━─━─┓\n     *SANZIONE REVOCATA*\n┗─━─━─━─━─━─━─━─━─┛\n\n◈ *Target:* ${tag}\n◈ *Azione:* \`Rimozione 1 Warn\`\n◈ *Nuovo Stato:* \`${user.warn}/3 Warn\`\n\n> _Il sistema ha aggiornato il profilo dell'utente._`,
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
