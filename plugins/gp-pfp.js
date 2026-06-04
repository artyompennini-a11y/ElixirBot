// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
  try {
    let who;
    let targetMsg = m; 

    // 1. Identificazione Target
    if (text) {
      let number = text.replace(/[@\s+-]/g, '');
      if (!isNaN(number) && number.length >= 7 && number.length <= 15) {
        who = number + '@s.whatsapp.net';
        // Se è un numero manuale, non abbiamo un messaggio precitato da analizzare
        targetMsg = null; 
      } else if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
      }
    } else if (m.quoted) {
      who = m.quoted.sender;
      targetMsg = m.quoted; // Analizziamo il messaggio a cui rispondi
    } else {
      who = m.sender;
    }

    // 2. Analisi Dispositivo (Logica basata su ID Messaggio)
    let device = 'Sconosciuto 🕵️‍♂️';
    if (targetMsg && (targetMsg.id || targetMsg.key?.id)) {
      const msgID = targetMsg.id || targetMsg.key?.id;
      
      if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
        device = '🤖 BOT_EMULATOR';
      } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
        device = '💻 WHATSAPP_WEB';
      } else if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) {
        device = '💻 WEB/BOT_TERMINAL';
      } else if (msgID.includes(':')) {
        device = '🖥️ DESKTOP_CLIENT';
      } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
        device = '📱 ANDROID_OS';
      } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) {
        device = '🍏 IOS_KERNEL (iPhone)';
      } else if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) {
        device = '🍏 IOS_KERNEL (iPhone High-Tier)';
      } else if (msgID.startsWith('3EB0')) {
        device = '🤖 ANDROID_OS (Low Tier)';
      }
    }

    // 3. Recupero Foto Profilo
    let name = await conn.getName(who);
    let userNumber = who.split('@')[0];
    let pp;
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch {
      pp = null;
    }

    if (!pp) {
      return conn.reply(m.chat, `*⚠️ ${name}* non ha una foto profilo o le impostazioni di privacy la nascondono.\n\n*Dispositivo rilevato:* ${device}`, m);
    }

    // 4. Output Grafico
    let caption = `
╔════════════════════╗
      🖼️ *PROFILO UTENTE*
╚════════════════════╝

  👤  *Nome:* ${name}
  📱  *ID:* @${userNumber}
  ⚙️  *Hardware:* ${device}
  🔗  *Link:* wa.me/${userNumber}

      _Scansione completata_
`.trim();

    await conn.sendFile(m.chat, pp, 'profile.jpg', caption, m, null, { mentions: [who] });

  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, `❌ Errore nel recupero dati.`, m);
  }
};

handler.help = ['pic <@tag/numero/reply>'];
handler.tags = ['gruppo'];
handler.command = /^(pfp|pic|fotoprofilo)$/i;
handler.admin = true;

export default handler;
