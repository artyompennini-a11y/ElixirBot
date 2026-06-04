let handler = async (m, { conn }) => {
  const message = `ᴇʟɪxɪʀ ᴇ ɪʟ ꜱɪᴄɪʟɪᴀɴᴏ ᴘɪᴜ ꜱɪᴍᴘᴀᴛɪᴄᴏ ᴅᴇʟʟᴇ ᴄᴏᴍᴍ, ɪʟ ᴍɪɢʟɪᴏʀᴇ.
ɴᴏɴ ʟᴏ ꜰᴀᴛᴇ ɪɴᴄᴀᴢᴢᴀʀᴇ ᴏ ᴠɪ ꜱᴀʟᴛᴀɴᴏ ɪ ɴᴜᴍᴇʀɪ ᴇ ᴘᴀʀᴛᴏɴᴏ ɪ ᴅᴏxx ᴅᴏᴠᴇ ᴠɪ ᴘʀᴇɴᴅᴇ ᴘᴜʀᴇ ɪ ᴘᴇʟɪ ᴅᴇʟ ᴄᴜʟᴏ.`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['elixir'];
handler.tags = ['giochi'];
handler.command = /^(elixir)$/i; // Corretto il regex per attivarsi con "elixir"

export default handler;
