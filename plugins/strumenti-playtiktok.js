// Plugin creato da elixir

import axios from 'axios';

// ── ESPRESSIONI REGOLARI PER RILEVARE LINK TIKTOK ──
const TIKTOK_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:m\.|vm\.|vt\.)?tiktok\.com\/(?:@[\w.-]+\/video\/\d+|[\w-]+)/i;
const TIKTOK_SHORT_REGEX = /(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/[\w-]+/i;

/**
 * Valida ed estrae un URL TikTok valido dal testo fornito
 */
function extractTikTokUrl(text) {
    if (!text) return null;
    const trimmed = text.trim();
    
    // Cerca pattern di URL lungo (es. https://www.tiktok.com/@user/video/123456...)
    const longMatch = trimmed.match(TIKTOK_URL_REGEX);
    if (longMatch) return longMatch[0];
    
    // Cerca pattern di URL corto (es. https://vm.tiktok.com/ZSrAbCd/)
    const shortMatch = trimmed.match(TIKTOK_SHORT_REGEX);
    if (shortMatch) return shortMatch[0];
    
    return null;
}

// ── CREAZIONE PULSANTI ──
const createActionButtons = (prefix, videoUrl) => [
    {
        buttonId: `${prefix}ttdl ${videoUrl}`,
        buttonText: { displayText: '📥 Scarica Video' },
        type: 1
    },
    {
        buttonId: `${prefix}ttaudio ${videoUrl}`,
        buttonText: { displayText: '🎵 Scarica Audio MP3' },
        type: 1
    }
];

// ════════════════════════════════════════
//  HANDLER PRINCIPALE
// ════════════════════════════════════════

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        const usageText = `⋆｡˚『 ╭ \`🎥 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃\` ╯ 』˚｡⋆
╭
┃ 📝 \`Errore:\` Manca il link del video.
┃ 
┃ ╭───  \`𝐔𝐒𝐎\`  ───╮
┃ ┃ ${usedPrefix}${command} [link TikTok]
┃ ╰────────────────╯
┃ 
┃ ✍️ \`Esempi:\`
┃ ┃ ${usedPrefix}${command} https://www.tiktok.com/@user/video/123456
┃ ┃ ${usedPrefix}${command} https://vm.tiktok.com/ZSrAbCd/
┃ ╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
        return await conn.sendMessage(m.chat, { text: usageText }, { quoted: m });
    }

    // Estrai il link TikTok dal testo
    const tiktokUrl = extractTikTokUrl(text);
    if (!tiktokUrl) {
        const invalidLinkText = `⋆｡˚『 ╭ \`❌ 𝐋𝐈𝐍𝐊 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎\` ╯ 』˚｡⋆
╭
┃ ⚠️ \`Link TikTok non riconosciuto:\`
┃ 
┃ Il link che hai inserito non sembra essere un
┃ link valido di TikTok.
┃ 
┃ 🔗 \`Formati accettati:\`
┃ ┃ • https://www.tiktok.com/@user/video/...
┃ ┃ • https://vm.tiktok.com/XXXXX/
┃ ┃ • https://vt.tiktok.com/XXXXX/
┃ ╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
        return await conn.sendMessage(m.chat, { text: invalidLinkText }, { quoted: m });
    }

    // Messaggio di attesa
    const waitText = `⋆｡˚『 ╭ \`🎥 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃\` ╯ 』˚｡⋆
╭
┃ 🔍 \`Elaborazione in corso...\`
┃ 
┃ ⏳ Recupero dati video:
┃ ┃ ${tiktokUrl}
┃ 
┃ _Download statistiche e metadati..._
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;

    await conn.sendMessage(m.chat, { text: waitText }, { quoted: m });

    try {
        // ── CHIAMATA API TIKWM (endpoint stabile per singolo video) ──
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`;
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        // ── VERIFICA RISPOSTA API ──
        const apiData = response.data;
        if (!apiData || apiData.code !== 0 || !apiData.data) {
            console.error('[TikTok] Risposta API inaspettata:', JSON.stringify(apiData));
            throw new Error('Risposta API non valida');
        }

        const video = apiData.data;

        // ── ESTRAZIONE DATI ──
        const videoUrl = video.play || video.hdplay || video.wmplay || '';
        const audioUrl = video.music || '';
        const coverUrl = video.cover || 'https://qu.ax';
        const authorName = video.author?.nickname || video.author?.unique_id || 'Sconosciuto';
        const authorUsername = video.author?.unique_id || 'sconosciuto';
        const title = video.title || 'Nessuna descrizione';
        const videoId = video.video_id || '';
        const originalLink = `https://www.tiktok.com/@${authorUsername}/video/${videoId}`;

        // Statistiche (con safe fallback)
        const views = video.play_count?.toLocaleString('it-IT') || 'N/D';
        const likes = video.digg_count?.toLocaleString('it-IT') || 'N/D';
        const comments = video.comment_count?.toLocaleString('it-IT') || 'N/D';
        const shares = video.share_count?.toLocaleString('it-IT') || 'N/D';
        
        const durationSec = video.duration || 0;
        const durationMin = Math.floor(durationSec / 60);
        const durationSecRem = durationSec % 60;
        const durationStr = durationSec > 0 
            ? `${durationMin}:${durationSecRem.toString().padStart(2, '0')} min` 
            : 'Sconosciuta';
        
        const region = video.region || 'Sconosciuta';
        const musicTitle = video.music_info?.title || '—';
        const musicAuthor = video.music_info?.author || '—';

        // ── COSTRUZIONE SCHEDA INFORMATIVA ──
        const infoText = `⋆｡˚『 ╭ \`🎥 𝐓𝐈𝐊𝐓𝐎𝐊 𝐅𝐎𝐔𝐍𝐃\` ╯ 』˚｡⋆
╭
┃ 👤 \`Creatore:\` ${authorName} (@${authorUsername})
┃ 🌍 \`Regione:\` ${region}
┃ 🎵 \`Musica:\` ${musicTitle} — ${musicAuthor}
┃ ────
┃ 📝 \`Descrizione:\`
┃ ${title.length > 100 ? title.substring(0, 100) + '...' : title}
┃ ⏱️ \`Durata:\` ${durationStr}
┃
┃ ╭─── \`📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄\` ───╮
┃ ┃ 👁️ \`Visualizzazioni:\` ${views}
┃ ┃ ❤️ \`Mi Piace:\` ${likes}
┃ ┃ 💬 \`Commenti:\` ${comments}
┃ ┃ 🔗 \`Condivisioni:\` ${shares}
┃ ╰─────────────────────╯
┃
┃ 🔗 \`Link Originale:\`
┃ ${originalLink}
┃
┃ _Clicca sui pulsanti qui sotto per scaricare_
┃
┃ > 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;

        // ── INVIO SCHEDA CON PULSANTI ──
        await conn.sendMessage(m.chat, {
            text: infoText,
            buttons: createActionButtons(usedPrefix, originalLink),
            headerType: 1,
            contextInfo: {
                externalAdReply: {
                    title: '🎥 TIKTOK DOWNLOAD SYSTEM',
                    body: `@${authorUsername} — ${title.substring(0, 40)}`,
                    thumbnailUrl: coverUrl,
                    sourceUrl: originalLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error('[TikTok Play] Errore:', e);

        // ── TENTATIVO DI FALLBACK: Secondo tentativo con wm=0 ──
        try {
            console.log('[TikTok Play] Tentativo fallback con API alternativa...');
            const fallbackUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&wm=0`;
            const fallbackRes = await axios.get(fallbackUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });

            const fallbackData = fallbackRes.data;
            if (fallbackData && fallbackData.code === 0 && fallbackData.data) {
                const video = fallbackData.data;
                const videoUrl = video.play || video.hdplay || video.wmplay || '';
                const coverUrl = video.cover || 'https://qu.ax';
                const authorName = video.author?.nickname || video.author?.unique_id || 'Sconosciuto';
                const authorUsername = video.author?.unique_id || 'sconosciuto';
                const title = video.title || 'Nessuna descrizione';
                const originalLink = `https://www.tiktok.com/@${authorUsername}/video/${video.video_id || ''}`;
                const views = video.play_count?.toLocaleString('it-IT') || 'N/D';
                const likes = video.digg_count?.toLocaleString('it-IT') || 'N/D';
                const comments = video.comment_count?.toLocaleString('it-IT') || 'N/D';
                const shares = video.share_count?.toLocaleString('it-IT') || 'N/D';

                const infoText = `⋆｡˚『 ╭ \`🎥 𝐓𝐈𝐊𝐓𝐎𝐊 𝐅𝐎𝐔𝐍𝐃\` ╯ 』˚｡⋆
╭
┃ 👤 \`Creatore:\` ${authorName} (@${authorUsername})
┃ 📝 \`Descrizione:\` ${title.substring(0, 80)}
┃
┃ ╭─── \`📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄\` ───╮
┃ ┃ 👁️ \`Visualizzazioni:\` ${views}
┃ ┃ ❤️ \`Mi Piace:\` ${likes}
┃ ┃ 💬 \`Commenti:\` ${comments}
┃ ┃ 🔗 \`Condivisioni:\` ${shares}
┃ ╰─────────────────────╯
┃
┃ 🔗 ${originalLink}
┃
┃ _Pulsanti per scaricare qui sotto_ 👇
┃ > 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;

                await conn.sendMessage(m.chat, {
                    text: infoText,
                    buttons: createActionButtons(usedPrefix, originalLink),
                    headerType: 1,
                    contextInfo: {
                        externalAdReply: {
                            title: '🎥 TIKTOK DOWNLOAD (FALLBACK)',
                            body: `@${authorUsername}`,
                            thumbnailUrl: coverUrl,
                            sourceUrl: originalLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
                return;
            }
        } catch (fallbackErr) {
            console.error('[TikTok Play] Fallback fallito:', fallbackErr.message);
        }

        // Errore finale
        const errorText = `⋆｡˚『 ╭ \`❌ 𝐓𝐈𝐊𝐓𝐎𝐊 𝐄𝐑𝐑𝐎𝐑\` ╯ 』˚｡⋆
╭
┃ ⚠️ \`Impossibile elaborare il video:\`
┃ 
┃ Il link potrebbe essere:
┃ ┃ • Scaduto o non valido  ✗
┃ ┃ • Video privato  ✗
┃ ┃ • Rimosso da TikTok  ✗
┃ ┃ • API temporaneamente offline  ✗
┃
┃ 💡 \`Soluzioni:\`
┃ ┃ • Verifica che il link sia corretto
┃ ┃ • Prova con un altro video
┃ ┃ • Riprova tra qualche minuto
┃ ╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
        await conn.sendMessage(m.chat, { text: errorText }, { quoted: m });
    }
};

handler.help = ['playtiktok <link TikTok>'];
handler.tags = ['strumenti'];
handler.command = /^(playtiktok|tiktokplay|ptiktok)$/i;

export default handler;
