let handler = async (m, { conn }) => {

  const testo = `*momo sto coglione ha una palla storta e un dente nel naso ma gli voglio tanto bene al mio ragusano stronzo preferito melo chiavo tutti giorni*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['momoo'];
handler.tags = ['giochi'];
handler.command = ['momoo'];

export default handler;
