let handler = async (m, { conn }) => {
  const message = `NON CAGARE IL CAZZO NON STO PASSANDO UN BEL MOMENTO.`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['punisher'];
handler.tags = ['giochi'];
handler.command = /^(punisher)$/i; // Corretto il regex per attivarsi con "punisher"

export default handler;
