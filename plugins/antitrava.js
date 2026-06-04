let handler = m => m

// Regex potenziata: rileva Zalgo, caratteri invisibili, combinazioni di simboli crash e Unicode pericolosi
const CRASH_REGEX = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]{3,}|[\u200b-\u200f\u202a-\u202e\ufeff]|[\u17b4\u17b5\u115f\u1160\u3164]/g;

function extractText(m) {
    if (!m) return '';
    let text = (m.text || m.caption || m.msg?.text || m.msg?.caption || '').trim();
    // Controllo anche nei sondaggi (vettore comune per i trava)
    const poll = m.message?.pollCreationMessageV3 || m.message?.pollCreationMessage;
    if (poll?.name) {
        text += ' ' + poll.name;
        poll.options?.forEach(opt => text += ' ' + (opt.optionName || ''));
    }
    return text;
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || !m.sender) return false;
    if (m.isBaileys && m.fromMe) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antitrava) return true;

    // Immunità élite
    if (isAdmin || isOwner || isSam || m.fromMe) return true;

    const text = extractText(m);
    
    // Parametri di sicurezza
    const isTooLong = text.length > 3500; // Ridotto leggermente per sicurezza
    const crashMatches = text.match(CRASH_REGEX) || [];
    const isCrashAttempt = crashMatches.length > 4;

    if (isTooLong || isCrashAttempt) {
        // 1. Azione Immediata: Eliminazione per prevenire il lag degli altri utenti
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

        // 2. Espulsione istantanea se il bot ha i permessi
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
        }

        const userTag = m.sender.split('@')[0];
        const reason = isTooLong ? 'Saturazione Buffer (Text Bomb)' : 'Codice Malevolo / Unicode Crash';
        
        // Estetica Elegant & Dark
        const textMsg = `╔════════════════════╗
  ⚔️ *ELIXIR DEFENSE SYSTEM* ⚔️
╚════════════════════╝

◈ *TARGET:* @${userTag}
◈ *MINACCIA:* ${reason}
◈ *STATUS:* 🛡️ Neutralizzato

⚠️ *NOTIFICA DI SICUREZZA:*
_Rilevato tentativo di destabilizzazione tramite caratteri illegali o lunghezza eccessiva. L'utente è stato rimosso per garantire l'integrità del gruppo._

*『 SECURITY PROTOCOL ACTIVE 』*`.trim();

        await conn.sendMessage(m.chat, {
            text: textMsg,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '🛡️ ELIXIR CRASH PROTECTION 🛡️',
                    body: 'Threat Level: Critical',
                    thumbnailUrl: 'https://qu.ax/TfUj.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: null
                }
            }
        });

        return false; // Blocca l'esecuzione di altri handler
    }

    return true;
}

export default handler;
