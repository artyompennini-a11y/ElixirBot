// ═══════════════════════════════════════════════════════════════════
//  🛡️  ELIXIR - ANTI-LINK2  🛡️
//  Blocca: link social media (IG, TT, YT, TG, Discord…) + QR Code
//  Chiave DB: chat.antiLink2
//  Chiavi per piattaforma: chat.antiLink2_tiktok, chat.antiLink2_instagram, ecc.
// ═══════════════════════════════════════════════════════════════════

import { downloadContentFromMessage } from '@realvare/based';
import Jimp from 'jimp';
import jsQR from 'jsqr';

const handler = m => m;

// ════════════════════════
//  PIATTAFORME SOCIAL
// ════════════════════════

const DOMS = {
    tiktok:    ['tiktok.com', 'vm.tiktok.com', 'tiktok.it'],
    youtube:   ['youtube.com', 'youtu.be', 'm.youtube.com'],
    telegram:  ['telegram.me', 'telegram.org', 't.me'],
    facebook:  ['facebook.com', 'fb.com', 'm.facebook.com'],
    instagram: ['instagram.com', 'instagr.am'],
    twitter:   ['twitter.com', 'x.com'],
    discord:   ['discord.gg', 'discord.com'],
    snapchat:  ['snapchat.com', 't.snapchat.com'],
    linkedin:  ['linkedin.com', 'lnkd.in'],
    twitch:    ['twitch.tv', 'm.twitch.tv'],
    reddit:    ['reddit.com', 'redd.it'],
    onlyfans:  ['onlyfans.com'],
    github:    ['github.com', 'git.io'],
    bitly:     ['bit.ly', 'bitly.com'],
    tinyurl:   ['tinyurl.com']
};

const GENERAL_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;

// ════════════════════════
//  UTILITIES
// ════════════════════════

function unwrapMessageContent(message) {
    let content = message?.message || message;
    for (let i = 0; i < 10; i++) {
        if (content?.ephemeralMessage?.message)            { content = content.ephemeralMessage.message; continue; }
        if (content?.viewOnceMessage?.message)             { content = content.viewOnceMessage.message; continue; }
        if (content?.viewOnceMessageV2?.message)           { content = content.viewOnceMessageV2.message; continue; }
        if (content?.documentWithCaptionMessage?.message)  { content = content.documentWithCaptionMessage.message; continue; }
        if (content?.editedMessage?.message)               { content = content.editedMessage.message; continue; }
        break;
    }
    return content;
}

function extractAllText(m) {
    const texts = [];
    const seen  = new Set();
    function recurse(obj) {
        if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
        seen.add(obj);
        for (const key in obj) {
            if (key === 'quotedMessage') continue;
            const val = obj[key];
            if (typeof val === 'string' && val.length > 0) texts.push(val);
            else if (typeof val === 'object') recurse(val);
        }
    }
    recurse(unwrapMessageContent(m));
    return texts.join(' ').replace(/[\s\u200b\u200c\u200d\uFEFF]+/g, ' ').trim();
}

async function getMediaBuffer(message) {
    try {
        const unwrapped = unwrapMessageContent(message);
        const MEDIA_KEYS = ['imageMessage', 'videoMessage', 'stickerMessage'];
        const seen = new Set();
        function findMedia(obj) {
            if (!obj || typeof obj !== 'object' || seen.has(obj)) return null;
            seen.add(obj);
            for (const key of Object.keys(obj)) {
                const val = obj[key];
                if (MEDIA_KEYS.includes(key) && val) return { node: val, typeKey: key };
                if (val && typeof val === 'object') { const hit = findMedia(val); if (hit) return hit; }
            }
            return null;
        }
        const found = findMedia(unwrapped);
        if (!found) return null;
        const { node, typeKey } = found;
        const type = typeKey === 'videoMessage' ? 'video' : typeKey === 'stickerMessage' ? 'sticker' : 'image';
        const stream = await downloadContentFromMessage(node, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
        return buffer;
    } catch { return null; }
}

async function readQR(buffer) {
    try {
        const img = await Jimp.read(buffer);
        const { data, width, height } = img.bitmap;
        const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
        const code = jsQR(clamped, width, height);
        return code?.data || null;
    } catch { return null; }
}

function detectSocialPlatform(url) {
    if (!url) return null;
    const lower = url.toLowerCase();
    for (const [platform, domains] of Object.entries(DOMS)) {
        if (domains.some(d => lower.includes(d))) return platform;
    }
    return null;
}

function hasSocialLink(text) {
    if (!text) return false;
    const urls = text.match(GENERAL_URL_REGEX) || [];
    for (const url of urls) {
        if (detectSocialPlatform(url)) return true;
    }
    return false;
}

// ════════════════════════
//  GESTIONE VIOLAZIONE
// ════════════════════════

async function handleViolation(conn, m, detectedPlatform, isQR, isBotAdmin) {
    const sender = m.sender;
    const tag    = sender.split('@')[0];

    const user = global.db.data.users[sender] || {};
    if (!user.antiLink2Warns) user.antiLink2Warns = 0;
    user.antiLink2Warns += 1;
    const warns = user.antiLink2Warns;
    global.db.data.users[sender] = user;

    if (isBotAdmin) {
        try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
    }

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTISOCIAL\` ╯ 』˚｡⋆`;
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
    const qrNote = isQR ? ' (QR Code)' : '';

    if (warns >= 3) {
        user.antiLink2Warns = 0;
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *TERMINAZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` Spam social ripetuto\n┃ 💀 \`Sanzione:\` *ESPULSIONE*\n\n${footer}`,
            mentions: [sender]
        }).catch(() => {});
        if (isBotAdmin) await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {});
    } else {
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *ATTENZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` Link ${detectedPlatform.toUpperCase()}${qrNote}\n┃ ⚠️ \`Warn:\` *${warns}/3*\n┃ 🚫 \`Azione:\` Messaggio rimosso\n\n${footer}`,
            mentions: [sender]
        }).catch(() => {});
    }
}

// ════════════════════════
//  HANDLER PRINCIPALE
// ════════════════════════

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return;
    if (isAdmin || isOwner || isSam || m.fromMe) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat) return;

    // Supporta sia antiLink2 globale che toggle per piattaforma (antiLink2_tiktok, ecc.)
    const hasMaster = !!chat.antiLink2;
    const hasPerPlatform = !hasMaster && Object.keys(chat).some(k => k.startsWith('antiLink2_') && chat[k] === true);
    if (!hasMaster && !hasPerPlatform) return;

    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) return;

    const msgTimestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    if (Date.now() - msgTimestamp > 20000) return;

    const fullText = extractAllText(m).toLowerCase();

    // --- Check testo ---
    if (fullText) {
        const urls = fullText.match(GENERAL_URL_REGEX) || [];
        for (const url of urls) {
            const platform = detectSocialPlatform(url);
            if (!platform) continue;
            if (!hasMaster && chat[`antiLink2_${platform}`] !== true) continue;
            await handleViolation(conn, m, platform, false, isBotAdmin);
            return;
        }
    }

    // --- Check QR code ---
    try {
        const mediaBuffer = await getMediaBuffer(m);
        if (mediaBuffer) {
            const qrData = await readQR(mediaBuffer);
            if (qrData) {
                const platform = detectSocialPlatform(qrData.toLowerCase());
                if (platform && (hasMaster || chat[`antiLink2_${platform}`] === true)) {
                    await handleViolation(conn, m, platform, true, isBotAdmin);
                    return;
                }
            }
        }
    } catch {}
};

export default handler;
