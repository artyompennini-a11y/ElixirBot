// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
const MAX_WARN = 5;

let handler = async (m, { conn, isOwner }) => {
    if (!m.isGroup && !isOwner) {
        return conn.reply(m.chat, '❌ Questo comando può essere usato in privato solo dagli owner.', m);
    }

    let groupMembers = [];
    let groupName = '';

    if (m.isGroup) {
        let groupMeta = await conn.groupMetadata(m.chat);
        groupMembers = groupMeta.participants.map(p => p.id);
        groupName = groupMeta.subject;
    } else {
        groupName = 'Tutti gli utenti';
    }
    let adv = Object.entries(global.db.data.users).filter(([jid, user]) => {
        if (m.isGroup) {
            return user.warn && user.warn > 0 && groupMembers.includes(jid);
        } else {
            return user.warn && user.warn > 0;
        }
    });
    let userList = '';
    if (adv.length > 0) {
        for (let i = 0; i < adv.length; i++) {
            let [jid, user] = adv[i];
            let userGroupInfo = '';
            let warnCount = user.warn || 0;

            userList += `│ 『 ⚠️ 』 \`${i + 1}.\` *${conn.getName(jid) || 'Utente Sconosciuto'}* \`(${warnCount}/${MAX_WARN})\`
│ 『 📱 』 \`Tag:\` ${isOwner ? '@' + jid.split('@')[0] : jid.split('@')[0] + ''}${userGroupInfo}
│
`;
        }
    } else {
        userList = '│ 『 ✅ 』 *\`Nessun utente avvertito\`*\n│\n';
    }

    let caption = `\`\`\`╔══════════════════════════════════╗
║      UTENTI AVVERTITI            ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`📋\` *${m.isGroup ? 'Gruppo' : 'Modalità'}:* \`${groupName}\`
\`👥\` *Totale:* \`${adv.length}\` ${adv.length === 1 ? 'utente' : 'utenti'}
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
${userList}\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*`;

    await conn.reply(m.chat, caption, m, {
        mentions: await conn.parseMention(caption),
        contextInfo: {
            ...global.rcanal.contextInfo,
        }
    });
};

handler.command = /^(avvertimenti|listav|warns|listawarn|listavvertiti|listaavvertiti|warnlist|avvertiti)$/i;
handler.help = ['avvertimenti'];
handler.tags = ['gruppo'];
export default handler;
