// Plug-in creato da elixir
let handler = async (m, { conn, command, text, participants }) => {
  if (!m.isGroup) throw '🚨 Questo comando funziona solo nei gruppi!';
  
  if (!text) throw `💕 *Menzione romantica richiesta*\nTagga la persona con cui vuoi condividere questa passione!`;
  
  let mentionedUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!mentionedUser) throw `❌ Devi menzionare il tuo amore!`;
  
  let user = (Array.isArray(participants) ? participants : []).find(u => u.id === mentionedUser);
  let displayName = user?.name || text.split('@')[0] || mentionedUser.split('@')[0];
  
  if (mentionedUser === m.sender) throw '❌ Non puoi amare te stesso in questo modo!';

  // Solo il tuo numero come owner
  const owners = [
    '393792829288@s.whatsapp.net'
  ];
  
  const isOwner = owners.includes(m.sender);
  
  await conn.sendPresenceUpdate('composing', m.chat);
  
  // Animazione romantica realistica
  const romanticFrames = [
    `🌹 *INIZIO DELL'INCONTRO* 🌹\n▁▂▃▄▅▆▇ 15%\n✨ Un sorriso timido rompe il silenzio\n💘 Gli occhi si cercano con curiosità...`,
    
    `🔥 *CRESCITA DELL'INTESA* 🔥\n▁▂▃▄▅▆▇ 35%\n💓 Una risata condivisa rompe ogni barriera\n🌙 La vicinanza diventa naturale\n✨ @${displayName} sente il calore di questo momento`,
    
    `💋 *AVVICINAMENTO* 💋\n▁▂▃▄▅▆▇ 60%\n👄 Le parole si fermano, parlano solo i gesti\n⭐ Lo spazio tra voi si riduce\n🌈 Una connessione autentica prende forma`,
    
    `❤️ *MOMENTO UNICO* ❤️\n▁▂▃▄▅▆▇ 80%\n💞 Un abbraccio sincero, rassicurante\n🔥 La tensione diventa dolcezza\n🎶 I battiti si fondono in armonia`,
    
    `💫 *APICE DELL'EMOZIONE* 💫\n▁▂▃▄▅▆▇ 95%\n🌌 Un bacio che ferma il tempo\n✨ Ogni dettaglio diventa eterno\n🏰 Si crea un ricordo destinato a restare`,
    
    `✅ *CONNESSIONE COMPLETA* ✅\n▁▂▃▄▅▆▇ 100%\n\n💖 *@${displayName} È STATO/A AMATO/A CON TUTTO IL CUORE!* 💖\n\n📊 Report dell'Amore:\n💝 Intensità: ${isOwner ? '10/10 ★' : Math.floor(Math.random() * 10) + 1 + '/10'}\n🌠 Magia: ${isOwner ? '100% ✨' : Math.floor(Math.random() * 900) + 100 + '%'}\n🎯 Compatibilità: ${isOwner ? '100% 💞' : Math.floor(Math.random() * 30) + 70 + '%'}`  
  ];
  
  // Invio animazione romantica
  let msg = await conn.sendMessage(m.chat, { 
    text: romanticFrames[0],
    mentions: [mentionedUser]
  }, { quoted: m });
  
  for (let i = 1; i < romanticFrames.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: msg.key,
        type: 14,
        editedMessage: {
          conversation: romanticFrames[i]
        }
      }
    }, {});
  }
  
  // Messaggi finali romantici
  const finalMessages = isOwner ? [
    `*💞 NOTTE LEGGENDARIA* 💞\nCon @${displayName} è stata un'esperienza divina!\n\n*"L'amore perfetto esiste solo con te"* - L'Owner del Cuore`,
    
    `*🌅 ALBA DELLA PERFEZIONE* 🌅\n@${displayName} ha toccato il paradiso del piacere!\n\n*Valutazione: 💖💖💖 PERFEZIONE ASSOLUTA*`,
    
    `*🏰 STORIA D'AMORE DIVINA* 🏰\nQuesto momento con @${displayName} è scolpito nell'eternità!\n\n*"Solo un owner può amare così intensamente"* - Leggenda d'Amore`
  ] : [
    `*💞 NOTTE INDIMENTICABILE* 💞\nCon @${displayName} è stato come danzare sotto le stelle!\n\n*"L'amore è la poesia dei sensi"* - Cit. Romantica`,
    
    `*🌅 ALBA DI UNA PASSIONE* 🌅\n@${displayName} ha scoperto nuovi orizzonti di piacere!\n\n*Valutazione: ${['❤️', '💕', "💖", "💘"][Math.floor(Math.random() * 4)]}*`,
    
    `*🏰 STORIA D'AMORE ETERNA* 🏰\nQuesto momento con @${displayName} rimarrà per sempre nei ricordi!\n\n*"Due anime che diventano una"* - Poesia d'Amore`
  ];
  
  const randomFinal = finalMessages[Math.floor(Math.random() * finalMessages.length)];
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  await conn.sendMessage(m.chat, {
    text: randomFinal,
    mentions: [mentionedUser]
  }, { quoted: m });
}

handler.help = ['scopa @utente'];
handler.tags = ['fun', 'group'];
handler.command = ['scopa', 'scopami', 'scopalo'];
handler.group = true;
handler.admin = false;
handler.premium = false;

export default handler;
