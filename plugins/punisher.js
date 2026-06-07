let handler = async (m, { conn }) => {
  const message = `NON CAGARE IL CAZZO NON STO PASSANDO UN BEL MOMENTO.`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['The punisher'];
handler.tags = ['giochi'];
handler.command = /^(The punisher)$/i; // Corretto il regex per attivarsi con "The punisher"

export default handler;
