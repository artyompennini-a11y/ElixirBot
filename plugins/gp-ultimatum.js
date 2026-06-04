// Plug-in creato da elixir
const PROTECTED_USERS = [
  '393784409415@s.whatsapp.net',
  '393514722317@s.whatsapp.net'
];

const handler = async (msg, { conn, command, text, isAdmin }) => {
  let mentionedJid = msg.mentionedJid?.[0] || msg.quoted?.sender;

  if (!mentionedJid && text) {
    let splitText = text.split(' ')[0]; 
    if (splitText.endsWith('@s.whatsapp.net') || splitText.endsWith('@c.us')) {
      mentionedJid = splitText.trim();
    } else {
      let number = splitText.replace(/[^0-9]/g, '');
      if (number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net';
      }
    }
  }

  const chatId = msg.chat;
  const botNumber = conn.user.jid;
  const groupMetadata = await conn.groupMetadata(chatId);
  const groupOwner = groupMetadata.owner || chatId.split('-')[0] + '@s.whatsapp.net';
  
  // Estrae la motivazione escludendo il tag
  let reason = text ? text.replace(/@[0-9]+/g, '').trim() : '';

  if (!isAdmin)
    throw '╭━━━❌━━━╮\n     𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n╰━━━❌━━━╯\n\n𝐒𝐨𝐥𝐨 i 𝐂𝐚𝐩𝐨-𝐒𝐭𝐚𝐟𝐟 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.';

  if (!mentionedJid)
    return conn.reply(chatId, `╭━━━📢━━━╮\n 𝐔𝐓𝐄𝐍𝐓𝐄 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐄\n╰━━━📢━━━╯\n\n𝐔𝐬𝐨: .${command} @tag [motivazione]`, msg);

  if (mentionedJid === groupOwner || PROTECTED_USERS.includes(mentionedJid) || mentionedJid === botNumber)
    throw '╭━━━━━👑━━━━━╮\n    𝐀𝐙𝐈𝐎𝐍𝐄 𝐍𝐄𝐆𝐀𝐓𝐀\n╰━━━━━👑━━━━━╯\n\n🚫 𝐈 𝐦𝐞𝐦𝐛𝐫𝐢 𝐝𝐞𝐥𝐥\'𝐀𝐥𝐭ο 𝐂𝐨𝐦𝐚𝐧𝐝ο 𝐬𝐨𝐧𝐨 𝐢𝐧𝐭𝐨𝐜𝐜𝐚𝐛𝐢𝐥𝐢.';

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { ultimatum: 0 };
  const user = global.db.data.users[mentionedJid];
  const tag = '@' + mentionedJid.split('@')[0];

  if (command === 'ultimatum') {
    if (!reason) throw '⚠️ 𝐃𝐞𝐯𝐢 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐮𝐧𝐚 𝐦𝐨𝐭𝐢𝐯𝐚𝐳𝐢𝐨𝐧𝐞 𝐩𝐞𝐫 𝐥’𝐮𝐥𝐭𝐢𝐦𝐚𝐭𝐮𝐦.';
    
    user.ultimatum = (user.ultimatum || 0) + 1;

    if (user.ultimatum >= 3) {
      user.ultimatum = 0; // Reset dopo il raggiungimento del limite
      
      return conn.sendMessage(chatId, {
        text: `╭━━━━━━━🚫━━━━━━━╮\n  ✦ 𝐅𝐈𝐍𝐄 𝐈𝐍𝐂𝐀𝐑𝐈𝐂𝐎 ✦\n╰━━━━━━━🚫━━━━━━━╯\n\n👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}\n📊 𝐒𝐭𝐚𝐭𝐨: 𝟑/𝟑 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐮𝐦\n📝 𝐌𝐨𝐭𝐢𝐯𝐨: ${reason}\n\n❗ *𝐀𝐕𝐕𝐈𝐒𝐎:* L'utente ha esaurito i richiami. Procedere alla **rimozione manuale** dai ruoli amministrativi.`,
        mentions: [mentionedJid],
      });
    }

    return conn.sendMessage(chatId, {
      text: `╭━━━━━━━🚨━━━━━━━╮\n        ✦ 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐔𝐌 ✦\n╰━━━━━━━🚨━━━━━━━╯\n\n👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}\n📊 𝐒𝐭𝐚𝐭ο: ${user.ultimatum}/𝟑\n📝 𝐌𝐨𝐭𝐢𝐯𝐨: ${reason}\n\n⚠️ *𝐀𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞: 𝐚𝐥 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐨 𝐫𝐢𝐜𝐡𝐢𝐚𝐦𝐨  perderai il grado.*`,
      mentions: [mentionedJid],
    });
  }

  if (command === 'reultimatum') {
    if (!user.ultimatum || user.ultimatum <= 0) throw '⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐮𝐥𝐭𝐢𝐦𝐚𝐭𝐮𝐦 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.';
    
    user.ultimatum -= 1;

    return conn.sendMessage(chatId, {
      text: `╭━━━━━━━🛡️━━━━━━━╮\n         ✦ 𝐑𝐄𝐕𝐈𝐒𝐈𝐎𝐍𝐄 ✦\n╰━━━━━━━🛡️━━━━━━━╯\n\n👤 𝐔𝐭𝐞𝐧𝐭𝐞: ${tag}\n✅ 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐮𝐦 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.\n📊 𝐒𝐭𝐚𝐭𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞: ${user.ultimatum}/𝟑`,
      mentions: [mentionedJid],
    });
  }
};

handler.command = /^(ultimatum|reultimatum)$/i;
handler.group = true;
handler.admin = true;

export default handler;
