// Plug-in Antinuke - Elixir Bot
// Protegge il gruppo da modifiche non autorizzate
// Rispetta la whitelist: gli utenti autorizzati NON vengono bloccati

const handler = m => m;

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  // Monitora: Cambio nome (21), Rimozione (28), Promozione (29), Retrocessione (30)
  if (![21, 28, 29, 30].includes(m.messageStubType)) return;

  const sender = m.key?.participant || m.participant || m.sender;
  if (!sender) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // --- PROTEZIONE OWNER DEL BOT ---
  const BOT_OWNERS = global.owner
    .filter(o => o[0])
    .map(o => o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

  const localWhitelist = chat.whitelist || [];

  let ownerGroup = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    ownerGroup = metadata.owner || metadata.subjectOwner;
  } catch {
    ownerGroup = null;
  }

  // LISTA AUTORIZZATI (Bot, Proprietari del Bot, Whitelist, Creatore Gruppo)
  // Se il sender è nella whitelist, NON intervenire (silent)
  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...localWhitelist, 
    ownerGroup
  ].filter(Boolean);

  // Se l'utente è autorizzato, esce silenziosamente - nessun messaggio, nessuna azione
  if (allowed.includes(sender)) return;

  // Se l'azione è "rimozione utente" e il rimosso è il sender stesso, salta
  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (affected === sender) return;
  }

  // Protezione da crash: se participants è null/undefined o vuoto, esce
  if (!participants || !Array.isArray(participants) || participants.length === 0) return;

  const senderData = participants.find(p => p.jid === sender);
  // Se il sender non è admin, non serve intervenire (non può fare danni)
  if (!senderData?.admin) return;

  // Degrada immediatamente tutti gli admin NON autorizzati
  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  // Se non c'è nessuno da degradare e l'azione non è cambio nome, esce
  if (!usersToDemote.length && m.messageStubType !== 21) return;

  // Esegue le azioni di sicurezza
  try {
    if (usersToDemote.length) {
      await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
    }
    await conn.groupSettingUpdate(m.chat, 'announcement');
  } catch (e) {
    console.error('[ANTINUKE ERRORE] Impossibile eseguire azioni di sicurezza:', e);
    return;
  }

  const action =
    m.messageStubType === 21 ? 'MODIFICA NOME GRUPPO' :
    m.messageStubType === 28 ? 'RIMOZIONE UTENTE' :
    m.messageStubType === 29 ? 'PROMOZIONE ADMIN' :
    'RETROCESSIONE ADMIN';

  const text = `
┏━━━〔 🛡️ *ELIXIR ANTINUKE* 〕━━━┓
┃
┃ ⚠️ *ATTIVITÀ SOSPETTA RILEVATA*
┃
┃ 👤 **Autore:** @${sender.split('@')[0]}
┃ 🚫 **Azione:** ${action}
┃ ⚡ **Stato:** Intervento immediato
┃
┣━━━〔 ⚖️ *SANZIONI APPLICATE* 〕━━━┓
┃
┃ 📉 Admin non autorizzati: degradati
┃ 🔒 Gruppo: impostato in sola lettura
┃ ✅ Utenti in whitelist: non toccati
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
*SISTEMA SICUREZZA ELIXIR BOT*`

  try {
    await conn.sendMessage(m.chat, {
      text,
      contextInfo: {
        mentionedJid: [sender, ...usersToDemote, ...BOT_OWNERS].filter(Boolean),
        externalAdReply: {
          title: '🛡️ ELIXIR SECURITY SYSTEM',
          body: 'Protocollo di Emergenza Attivo',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          sourceUrl: 'ELIXIR_ANTINUKE',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      },
    });
  } catch (e) {
    console.error('[ANTINUKE ERRORE] Invio messaggio fallito:', e);
  }
};

export default handler;
