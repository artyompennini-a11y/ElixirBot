// Plug-in creato da elixir
let handler = async (m, { conn, text, command, isOwner }) => {
  if (!isOwner) return m.reply("❌ Accesso negato.");
  if (!text) return m.reply(`💡 *Uso:* .${command} [Link]`);

  const groups = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats)
    .map(([jid]) => jid);

  if (!groups.length) return m.reply('⚠️ Nessun gruppo trovato.');

  let total = groups.length;
  let success = 0;
  let listReport = "";

  await m.reply(`🚀 *INVIO TURBO AVVIATO*\n📦 Destinazioni: ${total}\n⏱️ Delay: 0.5s\n\n_Il report arriverà a breve..._`);

  for (let jid of groups) {
    try {
      // Usa i partecipanti in cache invece di scaricare i metadata (risparmia tempo)
      const participants = conn.chats[jid]?.metadata?.participants.map(p => p.id) || [];
      const groupName = conn.chats[jid]?.metadata?.subject || "Gruppo";

      await conn.relayMessage(jid, {
        extendedTextMessage: {
          text: text,
          contextInfo: {
            mentionedJid: participants,
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: '🎥 NUOVO VIDEO DISPONIBILE',
              body: 'Guarda ora su TikTok! ❤️',
              thumbnailUrl: 'https://qu.ax', 
              sourceUrl: text,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }
      }, {});

      success++;
      listReport += `✅ *${groupName}*\n`;

      // Delay ridotto al minimo per velocità estrema
      await new Promise(res => setTimeout(res, 500));

    } catch (e) {
      listReport += `❌ *Errore:* ${jid.split('@')[0]}\n`;
    }
  }

  let reportFinal = `✨ *INVIO TURBO COMPLETATO*\n\n` +
                    `📊 *Statistiche:* ${success}/${total}\n\n` +
                    `📋 *LISTA GRUPPI:*\n${listReport}`;

  await conn.sendMessage(m.chat, { text: reportFinal }, { quoted: m });
};

handler.help = ['newvid'];
handler.tags = ['owner'];
handler.command = /^(newvid|tiktok)$/i;
handler.owner = true;

export default handler;
