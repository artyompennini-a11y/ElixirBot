let handler = async (m, { conn }) => {
  const message = `Per svuotare gruppi ci pensa The punisher manda il link a me o a +33 6 25 41 55 28`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['nuke,nukkare'];
handler.tags = ['giochi'];

// Questa regex rileva "nuke,nukkare" ovunque nel messaggio, ignorando maiuscole/minuscole
handler.customPrefix = /nuke,nukkare/i; 
handler.command = new RegExp; // Sovrascrive il comando standard per usare il prefisso personalizzato

export default handler;