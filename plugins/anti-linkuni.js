// ═══════════════════════════════════════════════════════════════════
//  🛡️  THE PUNISHER - ANTI-LINK UNI  🛡️
//  Blocca: QUALSIASI link, URL, dominio, IP, short link + QR Code
//  Chiave DB: chat.antiLinkUni
// ═══════════════════════════════════════════════════════════════════

import { downloadContentFromMessage } from '@realvare/based';
import Jimp from 'jimp';
import jsQR from 'jsqr';

const handler = m => m;

// ════════════════════════
//  REGEX
// ════════════════════════

const GENERAL_URL_REGEX     = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const DOMAIN_NO_PROTO_REGEX = /(?:^|\s)(?:www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const IP_URL_REGEX          = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:\/.*)?/gi;
const TLD_REGEX             = /(?:^|\s)(?:[a-zA-Z0-9-]{2,}\.)+(?:it|com|org|net|io|eu|info|me|tv|co|app|xyz|club|online|site|tech|store|blog|dev|cloud|world|live|pro|work|one|name|mobi|us|uk|de|fr|es|nl|top|win|bid|trade|webcam|science|party|date|faith|loan|download|racing|review|bo)(?:\/\S*)?(?:\s|$)/gi;
const SOCIAL_INVITE_REGEX   = /(?:t\.me\/|telegram\.(?:me|dog)\/|discord\.(?:gg\/|com\/invite\/)|invite\.(?:discord|slack)|slack\.com\/join)/gi;

const WHATSAPP_GROUP_REGEX   = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;
const WA_ME_REGEX            = /wa\.me\/([0-9A-Za-z]+)/i;

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

function hasAnyLink(text) {
    if (!text) return false;
    // Reset lastIndex per regex stateful (flag g)
    GENERAL_URL_REGEX.lastIndex     = 0;
    DOMAIN_NO_PROTO_REGEX.lastIndex = 0;
    IP_URL_REGEX.lastIndex          = 0;
    TLD_REGEX.lastIndex             = 0;
    SOCIAL_INVITE_REGEX.lastIndex   = 0;

    if (GENERAL_URL_REGEX.test(text))     return true;
    if (DOMAIN_NO_PROTO_REGEX.test(text)) return true;
    if (IP_URL_REGEX.test(text))          return true;
    if (TLD_REGEX.test(text))             return true;
    if (SOCIAL_INVITE_REGEX.test(text))   return true;
    if (WHATSAPP_GROUP_REGEX.test(text))  return true;
    if (WHATSAPP_CHANNEL_REGEX.test(text))return true;
    if (WA_ME_REGEX.test(text))           return true;
    return false;
}

function getLinkType(text) {
    if (WHATSAPP_GROUP_REGEX.test(text))   return 'Link WhatsApp';
    if (WHATSAPP_CHANNEL_REGEX.test(text)) return 'Canale WhatsApp';
    if (WA_ME_REGEX.test(text))            return 'Link wa.me';
    if (SOCIAL_INVITE_REGEX.test(text))    return 'Invite Social';
    if (IP_URL_REGEX.test(text))           return 'IP Diretto';
    if (DOMAIN_NO_PROTO_REGEX.test(text))  return 'Dominio';
    if (TLD_REGEX.test(text))              return 'Link generico';
    if (GENERAL_URL_REGEX.test(text))      return 'URL';
    return 'Link';
}

// ════════════════════════
//  GESTIONE VIOLAZIONE
// ════════════════════════

async function handleViolation(conn, m, reason, isQR, isBotAdmin) {
    const sender = m.sender;
    const tag    = sender.split('@')[0];

    const user = global.db.data.users[sender] || {};
    if (!user.warns)                   user.warns = {};
    const warnKey = `antilinkuni_${m.chat}`;
    if (typeof user.warns[warnKey] !== 'number') user.warns[warnKey] = 0;
    user.warns[warnKey] += 1;
    const warns = user.warns[warnKey];
    global.db.data.users[sender] = user;

    if (isBotAdmin) {
        try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
    }

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTILINK\` ╯ 』˚｡⋆`;
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
    const qrNote = isQR ? '\n┃ 📷 `Rilevato:` QR Code' : '';

    if (warns >= 3) {
        user.warns[warnKey] = 0;
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *TERMINAZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` Link multipli${qrNote}\n┃ ⚠️ \`Warn:\` *3/3*\n┃ 💀 \`Sanzione:\` *ESPULSIONE*\n\n${footer}`,
            mentions: [sender]
        }).catch(() => {});
        if (isBotAdmin) await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {});
    } else {
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *ATTENZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` *${reason}*${qrNote}\n┃ ⚠️ \`Warn:\` *${warns}/3*\n┃ 🚫 \`Azione:\` Messaggio rimosso\n\n${footer}`,
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
    if (!chat?.antiLinkUni) return;

    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) return;

    const msgTimestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    if (Date.now() - msgTimestamp > 20000) return;

    const fullText = extractAllText(m).toLowerCase();

    // --- Check testo ---
    if (hasAnyLink(fullText)) {
        const ltype = getLinkType(fullText);
        await handleViolation(conn, m, `Link universale (${ltype})`, false, isBotAdmin);
        return;
    }

    // --- Check QR code ---
    try {
        const mediaBuffer = await getMediaBuffer(m);
        if (mediaBuffer) {
            const qrData = await readQR(mediaBuffer);
            if (qrData && hasAnyLink(qrData.toLowerCase())) {
                const ltype = getLinkType(qrData.toLowerCase());
                await handleViolation(conn, m, `QR Code (${ltype})`, true, isBotAdmin);
                return;
            }
        }
    } catch {}
};

export default handler;
