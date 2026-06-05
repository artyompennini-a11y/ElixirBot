// ═══════════════════════════════════════════════════════════════════
//  🛡️  ELIXIR - ANTI-LINK  🛡️
//  Blocca: link WhatsApp (gruppi, canali, wa.me, wa.link) + Short URL
//  Chiave DB: chat.antiLink
// ═══════════════════════════════════════════════════════════════════

import { downloadContentFromMessage } from '@realvare/based';
import fetch from 'node-fetch';

const handler = m => m;

// ════════════════════════
//  REGEX
// ════════════════════════

const WHATSAPP_GROUP_REGEX   = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;
const WA_ME_REGEX            = /wa\.me\/([0-9A-Za-z]+)/i;
const WA_LINK_REGEX          = /wa\.link\/([0-9A-Za-z]+)/i;

const SHORT_URL_DOMAINS = [
    'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at',
    'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly',
    'tiny.cc', 'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly',
    'bitly.com', 'cutt.ly', 'short.io', 'links.new', 'link.ly',
    'ur.ly', 'shrinkme.io', 'clck.ru', 'short.gy', 'lnk.to',
    'sh.st', 'ouo.io', 'bc.vc', 'adfoc.us', 'linkvertise.com',
    'exe.io', 'linkbucks.com', 'adfly.com', 'shrink-service.it',
    'cur.lv', 'gestyy.com', 'shrinkarn.com', 'za.gl', 'clicksfly.com',
    '6url.com', 'shortlink.sh', 'short.tn', 'rotator.ninja',
    'shrtco.de', 'ulvis.net', 'chilp.it', 'clicky.me',
    'budurl.com', 'po.st', 'shr.lc', 'dub.co',
    's.id', 's.link', 'x.co', 'migre.me', 'zzb.bz',
    'qr.ae', 'gg.gg', 'fb.gg', 'rb.gy', 'shortcm.xyz',
    'soo.gd', 's2r.co', 'click-to-go.link', 'bom.so'
];

const SHORT_URL_REGEX = new RegExp(
    `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*`,
    'gi'
);

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

function hasWhatsAppOrShortLink(text) {
    if (!text) return false;
    if (WHATSAPP_GROUP_REGEX.test(text))   return true;
    if (WHATSAPP_CHANNEL_REGEX.test(text)) return true;
    if (WA_ME_REGEX.test(text))            return true;
    if (WA_LINK_REGEX.test(text))          return true;
    if (SHORT_URL_REGEX.test(text))        return true;
    return false;
}

function getLinkType(text) {
    if (WHATSAPP_GROUP_REGEX.test(text))   return 'Link WhatsApp';
    if (WHATSAPP_CHANNEL_REGEX.test(text)) return 'Canale WhatsApp';
    if (WA_ME_REGEX.test(text))            return 'Link wa.me';
    if (WA_LINK_REGEX.test(text))          return 'Link wa.link';
    if (SHORT_URL_REGEX.test(text))        return 'Short URL';
    return 'Link';
}

// ════════════════════════
//  GESTIONE VIOLAZIONE
// ════════════════════════

async function handleViolation(conn, m, reason, isBotAdmin) {
    const sender = m.sender;
    const tag    = sender.split('@')[0];

    const user = global.db.data.users[sender] || {};
    if (!user.warns)              user.warns = {};
    const warnKey = `antilink_${m.chat}`;
    if (typeof user.warns[warnKey] !== 'number') user.warns[warnKey] = 0;
    user.warns[warnKey] += 1;
    const warns = user.warns[warnKey];
    global.db.data.users[sender] = user;

    if (isBotAdmin) {
        try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
    }

    if (warns >= 3) {
        user.warns[warnKey] = 0;
        await conn.sendMessage(m.chat, {
            text: `╭─━━━━━━━━━━━━━━━━━━━─╮
          🛡️ THE PUNISHER ANTILINK 🛡️
╰─━━━━━━━━━━━━━━━━━━━─╯

┃ 👤 @${tag}
┃ ⛔ ${reason}
┃ ⚠️ Warn: *3/3*
┃ 💀 Sanzione: ESPULSIONE

╰─━━━━━━━━━━━━━─╯
> _Protocollo sicurezza The punisher_`,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: '⚔️ THE PUNISHER ANTILINK',
                    body: `Espulso: ${tag}`,
                    thumbnailUrl: 'https://qu.ax',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }).catch(() => {});
        if (isBotAdmin) await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {});
    } else {
        await conn.sendMessage(m.chat, {
            text: `╭─━━━━━━━━━━━━━━━━━━━─╮
          🛡️ THE PUNISHER ANTILINK 🛡️
╰─━━━━━━━━━━━━━━━━━━━─╯

┃ 👤 @${tag}
┃ ⛔ ${reason}
┃ 🚫 Messaggio rimosso
┃ ⚠️ Warn: ${warns}/3

╰─━━━━━━━━━━━━━─╯
> _Protocollo sicurezza The punisher_`,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: '⚔️ THE PUNISHER ANTILINK',
                    body: `Warn ${warns}/3: ${tag}`,
                    thumbnailUrl: 'https://qu.ax',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
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
    if (!chat?.antiLink) return;

    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) return;

    const msgTimestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    if (Date.now() - msgTimestamp > 20000) return;

    const fullText = extractAllText(m).toLowerCase();

    if (hasWhatsAppOrShortLink(fullText)) {
        const reason = getLinkType(fullText) + ' non autorizzato';
        await handleViolation(conn, m, reason, isBotAdmin);
    }
};

export default handler;
