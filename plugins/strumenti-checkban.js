// Plug-in creato da elixir
import fetch from 'node-fetch';

let handler = async (m, { args, conn }) => {

  if (!args[0]) {
    return m.reply(`
╭━〔 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐁𝐀𝐍 𝐂𝐇𝐄𝐂𝐊 〕━╮
┣━━━━━━━━━━━━━━━━━━━━━
┃ 📌 *𝐔𝐬𝐨:* .checkban <numero>
┃ 🌍 *𝐅𝐨𝐫𝐦𝐚𝐭𝐨:* internazionale (es. 39...)
┣━━━━━━━━━━━━━━━━━━━━━
┃ ✅ 𝐄𝐬𝐞𝐦𝐩𝐢:
┃ • .checkban 391112224444
┃ • .checkban +39 111 222 4444
┃ • .checkban 00391112224444
┃ • .checkban 347 968 4300 (Prefisso IT auto)
┣━━━━━━━━━━━━━━━━━━━━━
┃ 🤖 𝐈𝐥 𝐛𝐨𝐭 𝐫𝐢𝐦𝐮𝐨𝐯𝐞
┃ 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞 𝐬𝐩𝐚𝐳𝐢, +, -
╰━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
  }

  let phoneNumber = args.join(' ').trim();

  // 1. Pulizia Avanzata e Formattazione
  phoneNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, ''); // Rimuove spazi, trattini, parentesi e +
  if (phoneNumber.startsWith('00')) {
    phoneNumber = phoneNumber.substring(2); // Gestisce il prefisso internazionale 00
  }

  // Aggiunta automatica prefisso italiano se necessario
  if (phoneNumber.startsWith('3') && phoneNumber.length === 10) {
    phoneNumber = '39' + phoneNumber;
  }

  // 2. Verifiche di Validità più Stringenti
  if (!/^\d+$/.test(phoneNumber)) {
    return m.reply(`
╭━〔 ❌ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐈𝐍𝐕𝐀𝐋𝐈𝐃𝐎 〕━╮
┣━━━━━━━━━━━━━━━━━━━━━
┃ 📌 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐬𝐨𝐥𝐨 𝐜𝐢𝐟𝐫𝐞 𝐧𝐮𝐦𝐞𝐫𝐢𝐜𝐡𝐞
┃
┃ ✅ 𝐅𝐨𝐫𝐦𝐚𝐭𝐢 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐢:
┃ • 391112224444
┃ • +391112224444
┃ • 347 968 4300
┃ • +39 347 968 4300
╰━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
  }

  // Controllo lunghezza standard internazionale (tra 10 e 15 cifre)
  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return m.reply(`
╭━〔 ❌ 𝐋𝐔𝐍𝐆𝐇𝐄𝐐𝐐𝐀 𝐈𝐑𝐑𝐄𝐆𝐎𝐋𝐀𝐑𝐄 〕━╮
┣━━━━━━━━━━━━━━━━━━━━━
┃ 📌 𝐈𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐯𝐞 𝐚𝐯𝐞𝐫𝐞 𝐭𝐫𝐚
┃ 𝟏𝟎 𝐞 𝟏𝟓 𝐜𝐢𝐟𝐫𝐞 𝐯𝐚𝐥𝐢𝐝𝐞
╰━━━━━━━━━━━━━━━━━━━━━╯
`.trim());
  }

  try {

    // Messaggio di attesa iniziale con menzione
    const waitingMsg = await conn.reply(m.chat, `
╭━━〔 🔍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 〕━━╮
┣━━━━━━━━━━━━━━━━━━━
┃ 📱 𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚 𝐧𝐮𝐦𝐞𝐫𝐨 @${m.sender.split('@')[0]}
┃ +${phoneNumber} su WhatsApp...
╰━━━━━━━━━━━━━━━━━━━╯
`.trim(), m, { mentions: [m.sender] });

    // Ottenimento del Token
    const tokenRes = await fetch('https://baron0.com/api/get-token');

    if (!tokenRes.ok) {
      return conn.reply(m.chat, `
╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑𝐄 𝐀𝐏𝐈 𝐓𝐎𝐊𝐄𝐍 〕━━╮
┣━━━━━━━━━━━━━━━━━━━━
┃ HTTP ${tokenRes.status}
┃ Impossibile ottenere il token di sicurezza.
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim(), m);
    }

    const { token } = await tokenRes.json();

    // Chiamata all'API di controllo
    const response = await fetch('https://baron0.com/check-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-page-token': token,
      },
      body: JSON.stringify({
        number: `+${phoneNumber}`
      }),
    });

    if (!response.ok) {
      return conn.reply(m.chat, `
╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑𝐄 𝐀𝐏𝐈 𝐂𝐇𝐄𝐂𝐊 〕━━╮
┣━━━━━━━━━━━━━━━━━━━━
┃ HTTP ${response.status}
┃ L'endpoint di controllo non ha risposto correttamente.
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim(), m);
    }

    const data = await response.json();

    // 3. Analisi Approfondita dei Dati dell'API
    const err = data.error || {};
    const status = err.status || 'unknown';
    const reason = err.reason || 'unknown';
    const loginNum = err.login || phoneNumber;

    // Logica di Ban più precisa basata sulla risposta API
    let isBanned = data.banned || false;
    let notRegistered = false;

    if (err && err.status === 404 && err.reason === 'not-registered') {
        notRegistered = true; // Il numero non è bannato, ma non ha un account WhatsApp
        isBanned = false;
    } else if (err && err.status === 451 && err.reason === 'banned') {
        isBanned = true; // Errore specifico che indica il ban
    }
    // Altri codici di errore dell'API potrebbero essere gestiti qui per maggiore precisione

    const methods =
      Array.isArray(err.fallback_methods) &&
      err.fallback_methods.length
        ? err.fallback_methods.join(', ')
        : 'nessuno';

    const autoconf =
      err.autoconf_type != null
        ? err.autoconf_type
        : 'n/a';

    // Costruzione del messaggio di risposta finale
    let replyMsg = `╭━〔 📱 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐒𝐓𝐀𝐓𝐔𝐒 〕━╮
┣━━━━━━━━━━━━━━━━━━━━━
┃ 📞 𝐍𝐮𝐦𝐞𝐫𝐨:
┃ +${loginNum}
┃ 👤 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐚: @${m.sender.split('@')[0]}
┣━━━━━━━━━━━━━━━━━━━━━
`;

    if (notRegistered) {
        replyMsg += `┃ ⚪ 𝐒𝐓𝐀𝐓𝐎: 𝐍𝐎𝐍 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐓𝐎
┃ ✅ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞
┃ 𝐬𝐮 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 (𝐧𝐨𝐧 𝐛𝐚𝐧𝐧𝐚𝐭𝐨)
`;
    } else if (isBanned) {
        replyMsg += `┃ 🔴 𝐒𝐓𝐀𝐓𝐎: 𝐁𝐀𝐍𝐍𝐀𝐓𝐎
┃ ❌ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐛𝐚𝐧𝐧𝐚𝐭𝐨
┃ 𝐝𝐚 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
`;
    } else {
        replyMsg += `┃ 🟢 𝐒𝐓𝐀𝐓𝐎: 𝐀𝐓𝐓𝐈𝐕𝐎
┃ ✅ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐚𝐭𝐭𝐢𝐯𝐨
┃ 𝐬𝐮 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
`;
    }

    replyMsg += `┣━━━━━━━━━━━━━━━━━━━━━
┃ 📊 𝐃𝐄𝐓𝐓𝐀𝐆𝐋𝐈 𝐀𝐍𝐀𝐋𝐈𝐒𝐈
┣━━━━━━━━━━━━━━━━━━━━━
┃ • 𝐒𝐭𝐚𝐭𝐮𝐬 𝐀𝐏𝐈: ${status}
┃ • 𝐌𝐨𝐭𝐢𝐯𝐨: ${reason}
┃ • 𝐀𝐮𝐭𝐡: ${methods}
┃ • 𝐀𝐮𝐭𝐨𝐜𝐨𝐧𝐟: ${autoconf}
┃ • 𝐎𝐫𝐚 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨: ${new Date().toLocaleString('it-IT')}
┃
┃ ⚠️ *𝐍𝐨𝐭𝐚:* L'accuratezza dipende
┃ dall'API esterna utilizzata.
╰━━━━━━━━━━━━━━━━━━━━━╯`;

    // Invio del messaggio finale con menzione
    conn.reply(m.chat, replyMsg.trim(), m, { mentions: [m.sender] });

  } catch (error) {

    console.error('WhatsApp Ban Check Error:', error);

    conn.reply(m.chat, `
╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑𝐄 𝐈𝐍𝐓𝐄𝐑𝐍𝐎 〕━━╮
┣━━━━━━━━━━━━━━━━━━━━━
┃ 🌐 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐢 𝐜𝐨𝐧𝐧𝐞𝐬𝐬𝐢𝐨𝐧𝐞
┃
┃ ${error.message}
┃
┃ 🔄 𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐩𝐢𝐮̀ 𝐭𝐚𝐫𝐝𝐢 o segnala
┃ l'errore all'amministratore.
╰━━━━━━━━━━━━━━━━━━━━━╯
`.trim(), m);
  }
};

handler.help = ['checkban'];
handler.tags = ['tools'];

handler.command =
 /^(checkban|check-ban|controllabn|controllawhatsapp|wa-check|whatsapp-check)$/i;

export default handler;
