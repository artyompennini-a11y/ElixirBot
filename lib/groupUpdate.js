// by elixir
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLACKLIST_PATH = join(__dirname, '..', 'blacklist.json');
export async function loadBlacklist() {
  try {
    const data = await readFile(BLACKLIST_PATH, { encoding: 'utf-8' });
    return data.trim() ? JSON.parse(data) : {};
  } catch (e) {

    return {};
  }
}

export async function handleGroupAdd({ id, participants, chat, conn, fetchMetadata }) {
  if (!chat?.welcome || !participants?.length) return;

  let bl;
  try {
    bl = await loadBlacklist();
  } catch {
    bl = {};
  }

  let groupMetadata;
  try {
    groupMetadata = await fetchMetadata(id);
  } catch (e) {
    console.error(`[groupUpdate] Errore nel recuperare i metadati per ${id}:`, e.message);
    return;
  }
  if (!groupMetadata) return;

  const admins = groupMetadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);
  const botIsAdmin = admins.includes(conn.user?.jid);

  for (const user of participants) {
    if (bl[user]) {
      if (botIsAdmin) {
        try {
          await conn.sendMessage(id, {
            text: `🚫 *ACCESSO NEGATO* 🚫\n\n@${user.split('@')[0]} è in Blacklist e verrà espulso immediatamente.\n\n📌 *Motivo:* ${bl[user].reason}\n📅 *Data ban:* ${bl[user].date}`,
            mentions: [user, ...admins]
          });
          await conn.groupParticipantsUpdate(id, [user], 'remove');
        } catch (e) {
          console.error(`[groupUpdate] Errore espellendo utente blacklistato ${user}:`, e.message);
        }
      } else {
        try {
          await conn.sendMessage(id, {
            text: `⚠️ *ATTENZIONE ADMIN* ⚠️\n\nL'utente @${user.split('@')[0]} è in Blacklist ma non posso rimuoverlo perché non sono admin!`,
            mentions: [user, ...admins]
          });
        } catch (e) {
          console.error(`[groupUpdate] Errore avvisando admin per blacklist ${user}:`, e.message);
        }
      }
      continue; 
    }

    const welcomeText = (chat.sWelcome || 'Benvenuto @user in @subject')
      .replace('@user', '@' + user.split('@')[0])
      .replace('@subject', groupMetadata.subject);
    try {
      await conn.sendMessage(id, { text: welcomeText, mentions: [user] });
    } catch (e) {
      console.error(`[groupUpdate] Errore inviando benvenuto a ${user}:`, e.message);
    }
  }
}
