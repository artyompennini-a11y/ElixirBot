// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Lista delle mosse Bankai aggiornata e corretta
const bankaiMoves = {
  "Bankai di Ichigo Kurosaki (Tensa Zangetsu)": "https://media1.tenor.com/m/fTKfFMOURxQAAAAd/bleach-bleach-anime.gif",
  "Bankai di Byakuya Kuchiki (Senbonzakura Kageyoshi)": "https://th.bing.com/th/id/OIP.y5eU6SpycZn2WWjrJEN0pgHaEK?rs=1&pid=ImgDetMain",
  "Bankai di Renji Abarai (Sōō Zabimaru)": "https://th.bing.com/th/id/OIP.-82sc-Jy7Ws5iz9SgT9oAQHaEK?rs=1&pid=ImgDetMain",
  "Bankai di Tōshirō Hitsugaya (Daiguren Hyōrinmaru)": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3o4Z3I0cHg1a2ZwNm52bHd1aGpqMDI4cnRrcHFyYjJnM3Jrb21rdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/14pPFIQ1ToXriM/giphy.gif",
  "Bankai di Kenpachi Zaraki": "https://media1.tenor.com/m/4c9Ggdc4ztoAAAAd/kenpachi-zaraki-bankai.gif",
  "Bankai di Rukia Kuchiki (Hakka no Togame)": "https://media1.tenor.com/m/jvwc7_wOHwEAAAAC/sode-shirayuki.gif",
  "Bankai di Genryūsai Shigekuni Yamamoto (Zanka no Tachi)": "https://media1.tenor.com/m/XUBpaZaAJ08AAAAC/yamamoto-yamamoto-shigekuni.gif",
  "Kyōka Suigetsu di Sosuke Aizen": "https://media1.tenor.com/m/KyflVZBY0C8AAAAd/aizen-shikai.gif",
  "Urahara Kisuke in chill": "https://media1.tenor.com/m/D7XdxpdtNSsAAAAd/kisuke.gif",
  "Bankai di Shunsui Kyōraku (Katen Kyōkotsu: Karamatsu Shinjū)": "https://media1.tenor.com/m/5D27zcyB-hIAAAAC/kyoraku-shunsui-bleach.gif",
  "Bankai di Soi Fon (Jakuho Raikoben)": "https://media1.tenor.com/m/kd-bBtrXEjoAAAAC/bankai-bleach.gif",
  "Bankai di Mayuri Kurotsuchi (Konjiki Ashisogi Jizō)": "https://media1.tenor.com/m/aKhshX6fGdAAAAAd/bleach-tybw.gif",
  "Bankai di Gin Ichimaru (Kamishini no Yari)": "https://media1.tenor.com/m/z3DjDTFP0xEAAAAC/sawunn.gif",
  "Lampo di Yoruichi Shihōin": "https://media1.tenor.com/m/KQbZJUO8m9sAAAAd/yoruichi-thunder.gif",
  "Bankai di Retsu Unohana (Minazuki)": "https://media1.tenor.com/m/p7gMJraHb6YAAAAC/unohana-unohana-retsu.gif",
  "Bankai di Sajin Komamura (Kokujō Tengen Myō'ō)": "https://media1.tenor.com/m/0rqWg5QVCMIAAAAC/bankai-bleach.gif",
  "Bankai di Shinji Hirako (Sakashima Yokoshima Happōfusagari)": "https://media1.tenor.com/m/y0qlSP2vJrYAAAAd/hirako-shinji-shinji.gif",
  "Bankai di Kensei Muguruma (Tekken Tachikaze)": "https://media1.tenor.com/m/ajtlQvPeDUgAAAAd/bleach-kensei-bankai.gif",
  "Shockwave Flick di Isshin Kurosaki": "https://media1.tenor.com/m/f_5wYbZ7ETMAAAAd/isshin-shockwave-flick.gif",
  "The Balance di Jugram Haschwalth": "https://media1.tenor.com/m/rJSrzFc-iFoAAAAd/bleach-thousand-year-blood-war.gif",
  "Bankai di Rose (Kinshara Butōdan)": "https://tenor.com",
  "Bankai di Chōjirō Sasakibe (Kōkō Gonryō Rikū)": "https://tenor.com",
  "Bankai di Senjumaru Shutara (Shatatsu Karagara Shigarami no Tsuji)": "https://tenor.com"
};

const handler = async (m, { conn }) => {
  if (!m.isGroup) return;
 
  let user;
  if (m.quoted) {
    user = `@${m.quoted.sender.split('@')[0]}`;
  } else if (m.mentionedJid.length) {
    user = `@${m.mentionedJid[0].split('@')[0]}`;
  } else {
    return m.reply("⚠️ Devi rispondere a un messaggio o menzionare qualcuno!");
  }

  const moves = Object.keys(bankaiMoves);
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  const gifUrl = bankaiMoves[randomMove];

  const message = `💥 ${user} ha subito il *${randomMove}*! 💀`;

  try {
    const response = await fetch(gifUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync('temp.gif', buffer);

    await execAsync('ffmpeg -i temp.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" temp.mp4');

    await conn.sendMessage(m.chat, {
      video: { url: 'temp.mp4' },
      caption: message,
      mentions: [m.quoted ? m.quoted.sender : m.mentionedJid[0]],
      gifPlayback: true
    });

    fs.unlinkSync('temp.gif');
    fs.unlinkSync('temp.mp4');
  } catch (error) {
    console.error("Errore:", error);
    m.reply("⚠️ Si è verificato un errore durante l'invio del Bankai.");
  }
};

handler.help = ['bankai @utente'];
handler.tags = ['fun'];
handler.command = ['bankai'];

export default handler;
