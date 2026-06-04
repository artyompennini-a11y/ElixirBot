// Plug-in modificato da elixir
let handler = async (m, { conn }) => {
  try {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const polls = [
      {
        name: "📍 Nord-Ovest (Piemonte, Lombardia, Liguria, VdA)",
        values: ["Torino", "Milano", "Genova", "Aosta", "Bergamo", "Brescia", "Varese", "Como", "Pavia", "Novara", "Cuneo", "Imperia"]
      },
      {
        name: "📍 Nord-Est (Veneto, FVG, Emilia-Romagna, Trentino)",
        values: ["Venezia", "Verona", "Padova", "Trieste", "Udine", "Bologna", "Modena", "Parma", "Rimini", "Trento", "Bolzano", "Piacenza"]
      },
      {
        name: "📍 Centro (Lazio, Toscana, Marche, Umbria)",
        values: ["Roma", "Firenze", "Pisa", "Livorno", "Ancona", "Pesaro", "Perugia", "Terni", "Latina", "Frosinone", "Viterbo", "Arezzo"]
      },
      {
        name: "📍 Sud (Campania, Puglia, Calabria, Basilicata)",
        values: ["Napoli", "Caserta", "Salerno", "Bari", "Lecce", "Foggia", "Taranto", "Reggio Calabria", "Catanzaro", "Cosenza", "Potenza", "Matera"]
      },
      {
        name: "📍 Isole e Altri (Sicilia, Sardegna, Abruzzo, Molise)",
        values: ["Palermo", "Catania", "Messina", "Cagliari", "Sassari", "L'Aquila", "Pescara", "Chieti", "Campobasso", "Isernia", "Olbia", "Nuoro"]
      }
    ];

    for (const poll of polls) {
      await conn.sendMessage(m.chat, {
        poll: {
          name: poll.name,
          values: poll.values,
          selectableCount: 1,
          toAnnouncementGroup: false
        }
      });
      await delay(1000); // Delay di 1 secondo per evitare lo spam-lock
    }

  } catch (error) {
    console.error('Errore in pollregioni:', error);
    await conn.reply(m.chat, `❌ Si è verificato un errore durante l'invio dei sondaggi.`, m);
  }
};

handler.help = ['pollregioni', 'province'];
handler.tags = ['gruppo'];
handler.command = ['pollregioni', 'regioni', 'province'];
handler.group = true;
handler.admin = true;

export default handler;
