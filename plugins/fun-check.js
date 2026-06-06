// Plug-in by elixir
let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('`[!] ERROR: Rispondi a un pacchetto dati per analizzare l\'hardware sorgente.`');

  const msgID = m.quoted.id || m.quoted.key?.id;
  const senderJid = m.quoted.sender || 'sconosciuto';
  const tagUtente = senderJid.replace(/@.+/, '');

  let device = 'Sconosciuto 🕵️‍♂️';

  if (!msgID) {
    device = '⚠️ IMPOSSIBILE RILEVARE SOURCE';
  } else if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
    device = '🤖 BOT_EMULATOR';
  } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
    device = '💻 WHATSAPP_WEB';
  } else if (
    msgID.startsWith('3EB0') &&
    /^[A-Z0-9]+$/.test(msgID)
  ) {
    device = '💻 WEB/BOT_TERMINAL';
  } else if (msgID.includes(':')) {
    device = '🖥️ DESKTOP_CLIENT';
  } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
    device = '📱 ANDROID_OS';
  } else if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)
  ) {
    device = '🍏 IOS_KERNEL (iPhone)';
  } else if (
    /^[A-Z0-9]{20,25}$/i.test(msgID) &&
    !msgID.startsWith('3EB0')
  ) {
    device = '🍏 IOS_KERNEL (iPhone - High Tier)';
  } else if (msgID.startsWith('3EB0')) {
    device = '🤖 ANDROID_OS (Low Tier)';
  } else {
    device = 'Sconosciuto 🕵️‍♂️';
    console.log('[ANALISI] Nuovo ID non riconosciuto:', msgID);
  }

  const messaggio = `\`[⚡] THE PUNISHER_SCANNER: Risultati Perquisizione\`
\`--------------------------\`
> \`TARGET:\` *@${tagUtente}*
> \`HARDWARE:\` *${device}*
\`--------------------------\`
\`[!] Tracciamento completato. Payload pronto.\``;

  await conn.sendMessage(m.chat, {
    text: messaggio,
    mentions: [senderJid]
  }, { quoted: m });
};

handler.help = ['check', 'device', 'perqisizione'];  
handler.tags = ['giochi'];  
handler.command = /^(check|device|perqisizione)$/i; 
handler.group = true;
handler.admin = true;
handler.botAdmin = false;

handler.fail = null;

export default handler;