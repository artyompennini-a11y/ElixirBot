let handler = async (m, { conn }) => {
  const message = `è un cucciolo e fa un po' il down ma è bravo`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['lilblud'];
handler.tags = ['giochi'];

// Questa regex rileva "lilblud" ovunque nel messaggio, ignorando maiuscole/minuscole
handler.customPrefix = /lilblud/i; 
handler.command = new RegExp; // Sovrascrive il comando standard per usare il prefisso personalizzato

export default handler;
