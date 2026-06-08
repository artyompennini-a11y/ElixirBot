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
//  CONFIGURAZIONE
// ════════════════════════

// Lista TLD comuni (puoi espanderla)
const COMMON_TLDS = ['it', 'com', 'org', 'net', 'io', 'eu', 'info', 'me', 'tv', 'co', 'app', 'xyz', 'club', 'online', 'site', 'tech', 'store', 'blog', 'dev', 'cloud', 'world', 'live', 'pro', 'work', 'one', 'name', 'mobi', 'us', 'uk', 'de', 'fr', 'es', 'nl', 'top', 'win', 'bid', 'trade', 'webcam', 'science', 'party', 'date', 'faith', 'loan', 'download', 'racing', 'review', 'bo', 'fm', 'tk', 'ml', 'ga', 'cf'];

// Servizi Social & Short Link (puoi espanderli)
const SOCIAL_INVITE_SERVICES = ['t.me/', 'telegram.me/', 'discord.gg/', 'invite.discord', 'slack.com/join'];
const SHORT_LINK_SERVICES = ['bit.ly/', 'tinyurl.com/', 'is.gd/', 'buff.ly/', 'goo.gl/', 'owl.ly/', 'mcaf.ee/', 'su.pr/', 'fur.ly/', 't.co/', 'tr.im/', 'vk.cc/', 'clck.ru/', 'bl.ink/', 'shorte.st/'];

// Cache per evitare scansioni QR duplicate dello stesso media
// Struttura: { [senderID]: { timestamp: number, qrData: string | null } }
const qrCache = new Map();

// ════════════════════════
//  REGEX (Aggiornate e Potenziate)
// ════════════════════════

// Cattura URL con o senza protocollo, gestisce parametri complessi
const ANY_URL_REGEX = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

// Cattura domini comuni e IP (più robusto contro file locali e percorsi interni)
const DOMAIN_IP_REGEX = /\b(?:(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:[/?#]\S*)?|[-a-zA-Z0-9-]{2,}\.(it|com|org|net|io|eu|fm|co|me|tv|xyz|info|us|ca|fr|de)\b)(?![a-zA-Z0-9.\-_])(?:[/?#]\S*)?/gi;

// Cattura inviti specifici per WhatsApp (gruppi e canali)
const WHATSAPP_INVITE_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})\b|\bwhatsapp\.com\/channel\/([0-9A-Za-z]{20,24})\b/i;

// Cattura link wa.me con o senza numero (potenziata)
const WA_ME_REGEX = /\bwa\.me\/(\+?([0-9A-Za-z]+)?)\b/i;

// Cattura file comuni (puoi espandere la lista)
const FILE_LINK_REGEX = /\.(zip|rar|7z|pdf|doc|docx|xls|xlsx|ppt|pptx|exe|msi|dmg|iso|apk)$((?<![a-zA-Z0-9.\-_]))/gi;

// Cattura servizi specifici per Social & Short Link
const SOCIAL_INVITE_REGEX = new RegExp(`\\b(?:${SOCIAL_INVITE_SERVICES.map(s => s.replace('.', '\\.')).join('|')})`, 'gi');
const SHORT_LINK_REGEX = new RegExp(`\\b(?:${SHORT_LINK_SERVICES.map(s => s.replace('.', '\\.')).join('|')})`, 'gi');

// Cattura TLD generici basandosi sulla lista COMMON_TLDS
const TLD_REGEX = new RegExp(`\\b(?:[a-zA-Z0-9-]{2,}\\.)+(?:${COMMON_TLDS.join('|')})(?![a-zA-Z0-9.\\-_])(?:/[/?#]\\S*)?(?:\\s|$)`, 'gi');

// ════════════════════════
//  UTILITIES
// ════════════════════════

// Estrae il contenuto grezzo del messaggio, gestendoEphemeral, ViewOnce, Edited ecc.
function unwrapMessageContent(message) {
    let content = message?.message || message;
    for (let i = 0; i < 10; i++) {
        if (content?.ephemeralMessage?.message) { content = content.ephemeralMessage.message; continue; }
        if (content?.viewOnceMessage?.message) { content = content.viewOnceMessage.message; continue; }
        if (content?.viewOnceMessageV2?.message) { content = content.viewOnceMessageV2.message; continue; }
        if (content?.documentWithCaptionMessage?.message) { content = content.documentWithCaptionMessage.message; continue; }
        if (content?.editedMessage?.message) { content = content.editedMessage.message; continue; }
        break;
    }
    return content;
}

// Estrae tutto il testo presente nel messaggio, inclusi caption e messaggi quotati (senza ricorsione infinita)
function extractAllText(m) {
    const texts = [];
    const seen = new Set();
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

// Scarica il media del messaggio e restituisce il buffer
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

// Legge i dati di un QR code da un buffer immagine
async function readQR(buffer) {
    try {
        const img = await Jimp.read(buffer);
        const { data, width, height } = img.bitmap;
        const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
        const code = jsQR(clamped, width, height);
        return code?.data || null;
    } catch { return null; }
}

// Analizza il testo fornito alla ricerca di link e restituisce il tipo, se trovato
function analyzeTextForLinks(text) {
    if (!text) return null;

    // Reset lastIndex per regex stateful (flag g)
    ANY_URL_REGEX.lastIndex = 0;
    DOMAIN_IP_REGEX.lastIndex = 0;
    SOCIAL_INVITE_REGEX.lastIndex = 0;
    SHORT_LINK_REGEX.lastIndex = 0;
    FILE_LINK_REGEX.lastIndex = 0;
    TLD_REGEX.lastIndex = 0;

    if (WHATSAPP_INVITE_REGEX.test(text)) return 'Link WhatsApp';
    if (WA_ME_REGEX.test(text)) return 'Link wa.me';
    if (SOCIAL_INVITE_REGEX.test(text)) return 'Invite Social';
    if (SHORT_LINK_REGEX.test(text)) return 'Short Link';
    if (FILE_LINK_REGEX.test(text)) return 'Link File';
    if (DOMAIN_IP_REGEX.test(text)) return 'Dominio/IP';
    if (ANY_URL_REGEX.test(text)) return 'URL generico';
    if (TLD_REGEX.test(text)) return 'Link generico';
    
    return null;
}

// ════════════════════════
//  GESTIONE VIOLAZIONE
// ════════════════════════

// Gestisce la violazione cancellando il messaggio, dando un warn e gestendo l'espulsione
async function handleViolation(conn, m, reason, isQR, isBotAdmin) {
    const sender = m.sender;
    const tag = sender.split('@')[0];

    // Gestione Warn (usando global.db)
    const user = global.db.data.users[sender] || {};
    if (!user.warns) user.warns = {};
    const warnKey = `antilinkuni_${m.chat}`;
    if (typeof user.warns[warnKey] !== 'number') user.warns[warnKey] = 0;
    user.warns[warnKey] += 1;
    const warns = user.warns[warnKey];
    global.db.data.users[sender] = user;

    // Tentativo di cancellazione del messaggio
    if (isBotAdmin) {
        try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
    }

    // Preparazione dei messaggi di feedback
    const header = `⋆｡˚『 ╭ \`SISTEMA ANTILINK\` ╯ 』˚｡⋆`;
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
    const qrNote = isQR ? '\n┃ 📷 `Rilevato:` QR Code' : '';

    // Gestione feedback e azioni basate sul numero di warn
    if (warns >= 3) {
        user.warns[warnKey] = 0; // Reset dei warn dopo l'espulsione (o prima se preferisci)
        const kickMsg = `${header}\n\n🚨 *TERMINAZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` Link multipli${qrNote}\n┃ ⚠️ \`Warn:\` *3/3*\n┃ 💀 \`Sanzione:\` *ESPULSIONE*\n\n${footer}`;
        
        await conn.sendMessage(m.chat, { text: kickMsg, mentions: [sender] }).catch(() => {});
        
        // Espulsione se il bot è admin
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {});
        }
    } else {
        const warnMsg = `${header}\n\n🚨 *ATTENZIONE* @${tag}\n\n┃ ⛔ \`Violazione:\` *${reason}*${qrNote}\n┃ ⚠️ \`Warn:\` *${warns}/3*\n┃ 🚫 \`Azione:\` Messaggio rimosso\n\n${footer}`;
        
        await conn.sendMessage(m.chat, { text: warnMsg, mentions: [sender] }).catch(() => {});
    }
}

// ════════════════════════
//  HANDLER PRINCIPALE
// ════════════════════════

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return;
    if (isAdmin || isOwner || isSam || m.fromMe) return;

    // Controllo attivazione chat (antiLinkUni nel database global.db.data.chats)
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLinkUni) return;

    // Salta tipi di messaggi non rilevanti per il controllo link
    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) return;

    // Salta messaggi troppo vecchi (evita reazioni ritardate a messaggi cancellati o vecchi)
    const msgTimestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    if (Date.now() - msgTimestamp > 20000) return;

    const fullText = extractAllText(m).toLowerCase();

    // --- Check testo ---
    const linkType = analyzeTextForLinks(fullText);
    if (linkType) {
        await handleViolation(conn, m, `${linkType}`, false, isBotAdmin);
        return; // Violazione trovata, inutile procedere con QR
    }

    // --- Check QR code (Caching e scansione media) ---
    const sender = m.sender;
    const cacheEntry = qrCache.get(sender);

    // Se l'utente ha inviato un media di recente, controlla se è già stato scansionato
    if (cacheEntry && cacheEntry.timestamp === msgTimestamp) {
        if (cacheEntry.qrData) {
            const qrLinkType = analyzeTextForLinks(cacheEntry.qrData);
            if (qrLinkType) {
                await handleViolation(conn, m, `QR Code (${qrLinkType})`, true, isBotAdmin);
            }
        }
        return; // Usa cache, non scaricare o scansionare di nuovo
    }

    // Scarica media e scansiona per QR
    try {
        const mediaBuffer = await getMediaBuffer(m);
        if (mediaBuffer) {
            const qrDataRaw = await readQR(mediaBuffer);
            const qrData = qrDataRaw?.toLowerCase();
            
            // Salva nella cache
            qrCache.set(sender, { timestamp: msgTimestamp, qrData: qrData });

            if (qrData) {
                const qrLinkType = analyzeTextForLinks(qrData);
                if (qrLinkType) {
                    await handleViolation(conn, m, `QR Code (${qrLinkType})`, true, isBotAdmin);
                }
            }
        } else {
            // Nessun media, salva 'null' nella cache per questo timestamp
            qrCache.set(sender, { timestamp: msgTimestamp, qrData: null });
        }
    } catch {}
};

// Pulisce la cache periodicamente (per evitare perdite di memoria)
setInterval(() => {
    const now = Date.now();
    qrCache.forEach((entry, sender) => {
        if (now - entry.timestamp > 600000) { // Rimuove entry più vecchie di 10 minuti
            qrCache.delete(sender);
        }
    });
}, 60000); // Esegui pulizia ogni minuto

export default handler;
