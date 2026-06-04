import gplay from "google-play-scraper";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`PLAY STORE\` ╯ 』˚｡⋆\n╭\n│
│  \`inserisci il nome dell'app.\`
│
│ 『 📚 』 \`Esempio d'uso:\`
│ *${usedPrefix}${command} whatsapp*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m);
  }
 
  try {
    let res = await gplay.search({ term: text, num: 10 });
    if (!res.length) {
      return conn.reply(m.chat, `\`Non ho trovato nessuna app per "${text}", Prova con una ricerca diversa\``, m);
    }
    const appsWithDetails = await Promise.all(
      res.map(async (app) => {
        try {
          const fullDetails = await gplay.app({ appId: app.appId });
          return {
            ...app,
            installs: fullDetails.installs || fullDetails.minInstalls || 'N/A',
            size: fullDetails.size || 'N/A',
            genre: fullDetails.genre || fullDetails.genreId || 'N/A',
            scoreText: fullDetails.scoreText || fullDetails.score || 'N/A'
          };
        } catch (error) {
          console.log(`Errore nel recuperare i dettagli per ${app.title}:`, error);
          return app;
        }
      })
    );
    
    const cards = appsWithDetails.map((app, index) => {
      const prezzo = (!app.priceText || app.priceText.toLowerCase().includes("free") || app.priceText === "0") ? "Gratis" : app.priceText;
      const rating = app.scoreText || 'N/A';
      const downloads = app.installs || 'N/A';
      const size = app.size || 'N/A';
      const genre = app.genre || 'N/A';
     
      return {
        image: { url: app.icon },
        title: `- \`${app.title.substring(0, 60) + (app.title.length > 60 ? '...' : '')}\``,
        body: `『 👤 』 ${app.developer}\n『 💸 』 ${prezzo}\n『 ⭐ 』 ${rating}\n『 📥 』 ${downloads}\n『 🏷️ 』 ${genre}\n\n\`${app.summary ? app.summary.substring(0, 100) + '...' : 'Nessuna descrizione disponibile'}\``,
        footer: '˗ˏˋ ☾ ᴇʟɪxɪʀʙᴏᴛ ☽ ˎˊ˗',
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "📱 Apri nel Play Store",
              url: app.url
            })
          }
        ]
      };
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `📱 \`Risultati Play Store per:\``,
        footer: `- *${text}*`,
        cards: cards
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Errore nella ricerca Play Store:", error);
    try {
      let res = await gplay.search({ term: text });
      if (!res.length) {
        return conn.reply(m.chat, "*❌ Nessun risultato trovato. Prova con un altro nome.*", m);
      }
     
      let app = res[0];
      try {
        const fullDetails = await gplay.app({ appId: app.appId });
        app.installs = fullDetails.installs || fullDetails.minInstalls || app.installs;
        app.size = fullDetails.size || app.size;
        app.genre = fullDetails.genre || fullDetails.genreId || app.genre;
        app.scoreText = fullDetails.scoreText || fullDetails.score || app.scoreText;
      } catch (detailsError) {
        console.log("Errore nel recuperare i dettagli nel fallback:", detailsError);
      }

      let prezzo = (!app.priceText || app.priceText.toLowerCase().includes("free") || app.priceText === "0") ? "Gratis" : app.priceText;
      let downloads = app.installs || 'N/A';
      let size = app.size || 'N/A';
      let genre = app.genre || 'N/A';
      
      let opt = {
        contextInfo: {
          externalAdReply: {
            title: app.title,
            body: app.summary,
            thumbnail: (await conn.getFile(app.icon)).data,
            sourceUrl: app.url,
          },
        },
      };
      
      let msg =
`ㅤㅤ⋆｡˚『 ╭ \`PLAY STORE\` ╯ 』˚｡⋆\n╭\n│
│ 『📱』 \`Nome:\` *${app.title}*
│ 『👤』 \`Sviluppatore:\` *${app.developer}*
│ 『💸』 \`Prezzo:\` *${prezzo}*
│ 『🪙』 \`Punteggio:\` *${app.scoreText || 'N/A'}*
│ 『📥』 \`Download:\` *${downloads}*
│ 『📊』 \`Dimensione:\` *${size}*
│ 『🔗』 \`Link:\` *${app.url}*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
      
      conn.reply(m.chat, msg, m, opt);
     
    } catch (fallbackError) {
      console.error("Errore anche nel fallback:", fallbackError);
      return conn.reply(m.chat, `${global.errore}`, m);
    }
  }
};

handler.help = ['pscerca <nome app>'];
handler.tags = ['ricerca'];
handler.command = /^(playstoresearch|pscerca)$/i;
export default handler;
