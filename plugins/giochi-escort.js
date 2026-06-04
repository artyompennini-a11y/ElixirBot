// Plug-in creato da elixir
const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Inizializza il database delle escort se non esiste
  if (!global.db.data.escortList) global.db.data.escortList = [];

  // Identificazione target
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;

  // --- COMANDO AGGIUNGI ---
  if (command === 'addescort') {
    if (!who) return m.reply(`*⚠️ Tagga chi vuoi far diventare una escort!*`);
    if (global.db.data.escortList.includes(who)) return m.reply(`*✨ Questo utente è già nella lista del degrado.*`);
    
    global.db.data.escortList.push(who);
    return m.reply(`*✅ @${who.split('@')[0]} è ora ufficialmente una escort del gruppo.*`, null, { mentions: [who] });
  }

  // --- COMANDO RIMUOVI ---
  if (command === 'remescort') {
    if (!who) return m.reply(`*⚠️ Tagga chi vuoi "licenziare".*`);
    if (!global.db.data.escortList.includes(who)) return m.reply(`*L'utente non è in lista.*`);
    
    global.db.data.escortList = global.db.data.escortList.filter(u => u !== who);
    return m.reply(`*❌ @${who.split('@')[0]} è stato rimosso dalla lista escort.*`, null, { mentions: [who] });
  }

  // --- LOGICA ESCORT / POLE DANCE ---
  if (command === 'escor' || command === 'escort') {
    if (!who) return conn.reply(m.chat, `*⚠️ Tagga una escort per farla ballare!*`, m);
    
    // Controllo se l'utente è in lista
    if (!global.db.data.escortList.includes(who)) {
        return m.reply(`*🚫 @${who.split('@')[0]} non è ancora una escort. Usa ${usedPrefix}addescort per aggiungerlo!*`, null, { mentions: [who] });
    }

    let userTag = `@${who.split('@')[0]}`;
    const fasiShow = [
      `🔞 *LUCI ROSSE:* Il palco si illumina. ${userTag} entra in scena coperto solo da un velo pietoso e olio per il corpo.`,
      `💃 *L'ATTACCO AL PALO:* Con una mossa goffa, ${userTag} si arrampica sul palo. Si sente il rumore della pelle che stride.`,
      `✨ *POLE DANCE:* Inizia a ruotare vorticosamente. Il pubblico fischia, qualcuno lancia monetine.`,
      `🔥 *IL FINALE:* Si lascia scivolare lentamente fino a terra, aprendo le gambe davanti alla prima fila.`,
      `💰 *UMILIAZIONE:* ${userTag} raccoglie i pochi spiccioli da terra. Che degrado.`
    ];

    for (let riga of fasiShow) {
      await conn.sendMessage(m.chat, { text: riga, mentions: [who] });
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    return;
  }

  // --- COMANDO MANCIA ---
  if (command === 'mancia') {
    if (!who) return m.reply(`*⚠️ A chi vuoi dare la mancia?*`);
    let userTag = `@${who.split('@')[0]}`;
    const mance = [
      `💸 Lanci 5€ sudatissimi in faccia a ${userTag}. "Muoviti schiavo!"`,
      `🪙 Lanci 1€ nel perizoma di ${userTag}. Il freddo lo fa sussultare.`,
      `💵 Lanci banconote false a ${userTag} solo per vederlo correre a raccoglierle.`,
      `🤮 Lanci a ${userTag} un bottone e una cicca masticata. È il suo valore.`
    ];
    return conn.sendMessage(m.chat, { text: mance[Math.floor(Math.random() * mance.length)], mentions: [who] }, { quoted: m });
  }
};

handler.help = ['addescort', 'remescort', 'escort @user', 'mancia @user'];
handler.tags = ['fun'];
handler.command = /^(addescort|remescort|escor|escort|mancia)$/i;

export default handler;
