// Plug-in creato da elixir
import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`💀 *ᴛʜᴇ ᴘᴜɴɪꜱʜᴇʀ-ʙᴏᴛ*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `input_${Date.now()}`);
  const outputPath = path.join(tmpDir, `output_${Date.now()}.${command === 'playaud' ? 'mp3' : 'mp4'}`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    const url = vid.url;

    // Menu principale
    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
        infoMsg += `    🎧 ᴛʜᴇ ᴘᴜɴɪꜱʜᴇʀ-ʙᴏᴛ ᴘʟᴀʏᴇʀ 🎧\n`;
        infoMsg += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n`;
        infoMsg += `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n`;
        infoMsg += `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: 'THE PUNISHER-BOT • 𝟤𝟢𝟤𝟨',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "💀", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    // Tentativo di download tramite API Dylux
    try {
        let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
        if (res && res.dl_url) downloadUrl = res.dl_url;
    } catch (e) {
        // Fallback su API esterna (Corretto URL con /)
        let api = isAudio ? 'ytmp3' : 'ytmp4';
        let res = await fetch(`https://vreden.my.id{api}?url=${url}`);
        let json = await res.json();
        downloadUrl = json.result?.download?.url || json.result?.url;
    }

    if (!downloadUrl) throw new Error('Download URL non trovato');

    const response = await fetch(downloadUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(inputPath, buffer);

    if (isAudio) {
        // Conversione Audio con FFmpeg
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 128k "${outputPath}"`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false
        }, { quoted: m });
    } else {
        // Invio Video
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(inputPath),
            mimetype: 'video/mp4',
            caption: `✅ *ꜱᴄᴀʀɪᴄᴀᴛᴏ ᴅᴀ ᴛʜᴇ ᴘᴜɴɪꜱʜᴇʀ-ʙᴏᴛ*\n📌 *Titolo:* ${vid.title}`,
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply('🚀 *ᴛʜᴇ ᴘᴜɴɪꜱʜᴇʀ-ʙᴏᴛ ᴘʟᴀʏᴇʀ ᴇʀʀᴏʀ:* Servizio momentaneamente non disponibile.');
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
  } finally {
    // Pulizia file sicura
    if (fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath) } catch {}
    if (fs.existsSync(outputPath)) try { fs.unlinkSync(outputPath) } catch {}
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;