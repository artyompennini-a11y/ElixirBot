// Plug-in creato da elixir
let handler = async (m, { conn, participants }) => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
    const victim = participants[Math.floor(Math.random() * participants.length)].id;
    const victimMention = `@${victim.split('@')[0]}`;
   
    await conn.sendMessage(m.chat, {
        text: "🚨 *ALLERTA SISTEMA* 🚨\n\n" +
              "☢️ Protocollo Quantum avviato dall'operatore.\n" +
              "🔍 Ricerca di un soggetto compatibile nel gruppo..."
    }, { quoted: m });

    await delay(1800);
    await conn.sendMessage(m.chat, {
        text: `🎯 *TARGET ACQUISITO*\n\n` +
              `👤 Soggetto individuato: ${victimMention}\n` +
              `⚡ Caricamento sovraccarico neurale... [🔋 35%]`,
        mentions: [victim]
    });

    await delay(1800);
    await conn.sendMessage(m.chat, {
        text: `🧬 *INIEZIONE IN CORSO*\n\n` +
              `☣️ Alterazione del codice genetico di ${victimMention}...\n` +
              `⚙️ Modifica permessi cerebrali... [🔋 70%]`,
        mentions: [victim]
    });

    await delay(2000);
  
    const trasformazioni = [
        `${victimMention} si è trasformato in uno **Spermatozoo con depressione cronica**. Nuota da anni ma non è mai arrivato all'ovulo.`,

        `${victimMention} è mutato in un **Tampax usato con coscienza**. Galleggia nel water e riflette sulla sua vita di merda.`,

        `${victimMention} è diventato un **Cesso chimico da festival di 3 giorni**. Pieno di merda, caldo e puzzolente.`,

        `${victimMention} si è evoluto in un **Profilattico bucato bipolare**. Promette sicurezza e poi delude tutti.`,

        `${victimMention} è ora un **Moscerino con ambizioni da drago**. Volteggia intorno alla merda credendosi importante.`,

        `${victimMention} mutazione completata: **Calzino spaiato che vive dietro la lavatrice**. Solo, bagnato e dimenticato.`,

        `${victimMention} è diventato un **Pene flaccido con crisi esistenziali**. Prova a tirarsi su ma ricade sempre.`,

        `${victimMention} si è trasformato in **Diarrhea senziente**. Esce quando nessuno la vuole e fa discorsi profondi.`,

        `${victimMention} ora è un **Buco del culo parlante**. Dice solo stronzate e puzza tremendamente.`,

        `${victimMention} è mutato in un **Feto alieno abortito che suona il violino**. Tragico e patetico.`,

        `${victimMention} si è trasformato in **WiFi di McDonald’s**. Tutti ti usano 5 minuti e poi ti mollano.`,

        `${victimMention} è diventato uno **Scarafaggio con OnlyFans**. Nessuno si abbona ma continua a postare.`,

        `${victimMention} mutazione assurda: **Nuvola di peti accumulati da 10 anni**. Silenziosa ma devastante.`,

        `${victimMention} è ora un **Vibratore con batteria scarica**. Delude tutte al momento clou.`,

        `${victimMention} si è evoluto in un **Bidone della spazzatura con ansia**. Pieno di merda ma finge di essere utile.`,

        `${victimMention} è diventato **L'ombra di qualcuno di più figo**. Esiste solo quando c'è luce.`,

        `${victimMention} mutato in **Dentiera di nonno con Alzheimer**. Sbatti a vuoto e nessuno ti vuole.`,

        `${victimMention} è ora una **Busta di plastica nel Pacifico**. Galleggi da anni senza uno scopo.`,

        `${victimMention} si è trasformato in **Forfora parlante**. Cade sempre nei momenti peggiori.`,

        `${victimMention} è diventato un **Preservativo gonfiato con elio**. Sembra grosso ma è vuoto dentro.`,

        `${victimMention} mutazione completata: **Piede con fungo che canta neomelodico**. Puzza e dà fastidio a tutti.`,

        `${victimMention} è ora un **Kebab caduto per terra alle 3 di notte**. Sporco, calpestato e ancora mangiabile.`,

        `${victimMention} si è trasformato in **Ascella sudata di ciclista**. Puzza da morire e nessuno ti sopporta.`,

        `${victimMention} è diventato un **Capello incastrato nello scarico**. Ostruisci tutto e fai schifo.`,

        `${victimMention} mutato in **Pallina di polvere sotto il letto**. Esisti ma nessuno ti nota.`,

        `${victimMention} è ora un **Leccalecca raccolto da terra**. Appiccicoso, sporco e pieno di batteri.`,

        `${victimMention} si è evoluto in un **Gabinetto dell’autogrill**. Nessuno ti pulisce ma tutti ti usano.`,

        `${victimMention} è diventato **Un virus di WhatsApp del 2012**. Nessuno ti vuole più ma continui a girare.`,

        `${victimMention} mutazione: **Mutanda ingiallita di 7 giorni**. Puzzi e nessuno ti tocca.`,

        `${victimMention} è ora un **Telecomando senza batterie**. Inutile e sempre nel posto sbagliato.`,

        `${victimMention} si è trasformato in **Cacca di piccione su una macchina nuova**. Rovini tutto quello che tocchi.`,

        `${victimMention} è diventato un **Account fake di Instagram**. Esisti solo per prendere in giro.`,

        `${victimMention} mutato in **Lattina schiacciata sul ciglio della strada**. Vuoto dentro e calpestato.`,

        `${victimMention} è ora un **Succhiotto usato**. Sporco, appiccicoso e pieno di saliva altrui.`,

        `${victimMention} si è evoluto in **Piatto lavato male al ristorante**. Sembri pulito ma fai schifo.`,

        `${victimMention} è diventato un **Cuscino di saliva secca**. Nessuno vuole dormirci sopra.`,

        `${victimMention} mutazione estrema: **Protozoo con master in fallimento**. Nuoti nel cesso della vita.`,

        `${victimMention} è ora un **Biscotto caduto nella fessura del divano**. Vecchio, sbriciolato e dimenticato.`,

        `${victimMention} si è trasformato in **Odore di piedi in ascensore**. Impossibile da ignorare.`,

        `${victimMention} è diventato un **Filtro di sigaretta masticato**. Sporco e masticato da chissà chi.`,

        `${victimMention} mutato in **Pannolino pieno dopo 12 ore**. Pesante, puzzolente e da buttare.`,

        `${victimMention} è ora un **Commento hate sotto un video**. Esisti solo per dare fastidio.`,

        `${victimMention} si è evoluto in **Gomma da masticare sotto la sedia**. Appiccicoso e schifoso.`,

        `${victimMention} è diventato un **Profilo Tinder con 0 match**. Esisti ma nessuno ti vuole.`,

        `${victimMention} mutazione: **Mosca che ronza intorno alla merda**. Attratto dal peggio.`,

        `${victimMention} è ora un **Calcio di rigore sbagliato ai Mondiali**. Delusione eterna.`,

        `${victimMention} si è trasformato in **Sedia rotta dell’Ikea**. Sembri utile ma crolli sempre.`,

        `${victimMention} è diventato un **Messaggio vocale di 4 minuti**. Nessuno lo ascolta fino alla fine.`,

        `${victimMention} mutato in **Tappo di champagne esploso**. Un botto e poi più nulla di utile.`
    ];

    const chosen = trasformazioni[Math.floor(Math.random() * trasformazioni.length)];
   
    const finalOutput = `💥 *PROTOCOLLO QUANTUM COMPLETATO* 💥\n\n` +
                        `💀 *Vittima:* ${victimMention}\n` +
                        `───────────────────────\n` +
                        `${chosen}\n\n` +
                        `⏳ L'effetto dura 30 minuti. Goditi la tua nuova forma patetica, essere inutile.`;
   
    await conn.sendMessage(m.chat, {
        text: finalOutput,
        mentions: [victim]
    });
};

handler.help = ['avviaprotocollo'];
handler.tags = ['giochi'];
handler.command = /^(avviaprotocollo)$/i;
handler.group = true;
export default handler;
