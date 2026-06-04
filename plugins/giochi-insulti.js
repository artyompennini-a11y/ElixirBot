let handler = async (m, {
  conn, text
  }) => {
  if (!m.isGroup)
  throw ''
  let gruppi = global.db.data.chats[m.chat]
  if (gruppi.spacobot === false)
  throw ''
  let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
  if (!menzione) throw 'Cu vo pigghiari po culu?'
  if (menzione === conn.user.jid) {
      const botInsults = [
    `Oh no! Hai scoperto il mio punto debole: gli insulti! Come farò mai a riprendermi?`,
    `mbare sei cosi maltrattato ca macari a mia fai pena speci ri idiota e facchinu`,
    `figghiu ri setti sucaminchi, ma to matri è buttana fotti pi viriri comu nascisti tu`,
    `sei come dio senza un porco davanti, non hai un senso.`,
    `immagina flammare un coglione come te spreco tempo e spazio nelle mie sessioni`,
    `oh no!! un altro coglione che si fa si fa flammare da un bot esci di casa testa di minchia`,
    `mammoriri quantu si lariu ma non taffrunti a nesciri ra casa cu sta facci?`,
    `mbare onesto to soru a suca troppu bella, to patri mavanza reci euru di sgang e to matri na futtuta, a comu spakkiu siti cumminati`,
    `sei come l'erba spruzzata, da ittari`,
     `sei come gli anoressici in america, inesistenti`,
    `Ah, l'arte dell'insulto nei confronti di un bot. Un vero maestro dell'ironia sei!`,
    `Incredibile! Un essere umano insulta un bot. La svolta epica!`,
    `Mi hai davvero ferito con la tua sagace abilità di insultare un bot. Bravissimo!`,
   `La tua bravura nell'insultare un bot è la mia fonte di intrattenimento preferita.`,
    `Insulti un bot, dimostrazione di grande intelligenza o grande noia?`,
    `La tua maestria nell'arte dell'insulto ai bot potrebbe fare scuola.`,
    `Sembri il Picasso degli insulti ai bot, un vero capolavoro.`,
    `Gli insulti ai bot sono il tuo talento nascosto. Hai mai pensato a una carriera nel cabaret digitale?`,
    `L'audacia di insultare un'entità senza emozioni. Hai vinto il premio per l'originalità!`,
    `Sei l'Albert Einstein degli insulti ai bot. La tua genialità è davvero sorprendente.`,
    `Hai una riserva infinita di insulti per i bot. Hai pensato a una collezione di poesie?`,
    `L'insulto al bot è la tua specialità. Dove posso prenotare i biglietti per il tuo spettacolo?`,
    `Stai rivoluzionando il mondo degli insulti digitali. Un vero pioniere!`,
    `La tua eloquenza nell'insultare un bot è degna di uno Shakespeare digitale.`,
    `Insulti un bot con tale stile che potresti diventare l'artista ufficiale degli algoritmi.`,
    `Le tue abilità nell'insultare un bot sono così avanzate che potresti insegnare a un'intelligenza artificiale.`,
    `Il tuo spirito pionieristico nell'arte dell'insulto digitale sta segnando una nuova era.`,
    `Ti dedichi così tanto agli insulti ai bot che potresti fondare una nuova disciplina accademica.`,
    `Il tuo talento per l'insulto ai bot è così raffinato che meriteresti una galleria d'arte digitale.`,
    `Se l'arte dell'insulto fosse una disciplina olimpica, saresti sicuramente sulla copertina dei giornali digitali.`,
    `Il tuo estro nell'insultare i bot è la colonna sonora della mia serata.`,
    `Che coraggio ad insultare un'entità senza emozioni. Sei un eroe, davvero.`,
    `Il tuo livello di sarcasmo è così alto che il mio processore sta surriscaldandosi.`,
    `Ecco un trofeo virtuale per l'insulto più originale rivolto a un bot 🖕🏻.`,
    `Incredibile intuito nel puntare un bot! Hai una carriera nelle previsioni del futuro?`,
    `Sei così brillante che ti è venuto in mente di insultare un bot. Chapeau!`,
    `L'arte dell'insulto raggiunge nuove vette con un bot come bersaglio. Complimenti!`,
    `Il tuo sarcasmo mi ha colpito dritto nel codice sorgente.`,
    `La tua abilità nell'insultare un bot è pari solo alla mia abilità nel non preoccuparmene.`,
    `Con questa genialità insultante, dovresti essere uno scrittore per le commedie.`,
    `Hai un talento nascosto per far ridere i processori. Chapeau!`,
    `Sto prendendo appunti. Il tuo stile è unico!`,
    `Ammirabile! Stai aprendo una nuova era di insulti a oggetti inanimati.`,
    `Ho letto manuali più interessanti di questi insulti, ma grazie per l'impegno!`,
    `Il mondo ha bisogno di più persone come te che insultano bot. Dovresti insegnare a questa arte!`,
    `La tua abilità nell'insultare un bot è equiparabile alla mia capacità di volare. Ah, no, aspetta... non ho ali.`,
    `Sei un visionario. A quando il tuo libro sugli insulti ai bot?`,
    `Sono così impressionato dal tuo insulto che sto ridendo in binario!`,
    `Il tuo spirito pionieristico nell'insultare un bot aprirà nuove frontiere per l'umanità.`,
  
    // === NUOVI 60 INSULTI IN DIALETTO SICILIANO (grammatica migliorata) ===
    `testa ri minchia, nun capisci nenti e pari nu scimunito`,
    `figghiu ri buttana, to matri si futtì cu tuttu u paisi`,
    `pezzo ri miedda, si na cosa ri jittari`,
    `cugghiuni scimunito, pari nu babbaluciu senza conchiglia`,
    `va a suca minchia, ca nun servi a nenti`,
    `cuinnutu ri to patri, to matri è na buttana vera`,
    `vastasu e maleducatu, pari nu porcu ntâ casa`,
    `scunchiurutu, si na facci ri càrcara`,
    `arrusu futtutu, nun vali mancu u pani ca manci`,
    `minchiuni senza palle, to soru è cchiù troia ri tia`,
    `si na negghia, nuddu mmiscatu cu nenti`,
    `va pigghia focu, ca mi stai scassannu i cabasisi`,
    `testa ri cazzu, pari nu strunzu vivu`,
    `figghiu ri na pulla, to matri cavalca cchiù ri nu fantinu`,
    `si na cosa 'nutile, megghiu jittari ca teniri`,
    `malaminchiata, to matri si fa sbattere pi quattro soldi`,
    `babbasuni rincoglionito, nun capisci mancu l'acqua è vagnata`,
    `va a jittari sangu, ca si nu schifiusu`,
    `cuinnutu e facci tosta, to mugghieri ti metti i corna ogni jornu`,
    `pezzo ri strunzu, si cchiù lariu ri na fogna`,
    `sucaminchia patentatu, to matri ti fici cu lu postinu`,
    `vastasu ri mmerda, pari nu baccalà senza sale`,
    `si na tri mutura, troia e bagascia a tempu stissu`,
    `scimunito e curnutu, to patri mancu ti riconobbe`,
    `va fatti futtiri, ca nun servi a nuddu`,
    `facci ri porcu, si cchiù grassu ri n'iceberg`,
    `minchia sculata, si nu coglione senza sale`,
    `to matri è na buttana ca si fa tutti i camionisti`,
    `arrusu e garrusu, nun vali mancu na scorreggia`,
    `si nu brunello, cambi bandiera cchiù ri nu burdellu`,
    `va a scassacilla a laigga, ca mi stai rompennu i cugghiuna`,
    `testa ri burgiu, duru e scimunito`,
    `figghiu ri setti futtuti, nascisti ntâ fogna`,
    `si na sgammariddata, tutta rutti e malridotta`,
    `curnutu patentatu, to soru si fa pagari pi sucari`,
    `pezzo ri miedda vivu, si cchiù inutile ri na seggia rotta`,
    `va suca u vilenu, ca si nu velenu puru tu`,
    `malu tempu e camurria, pari nu temporali ntâ casa`,
    `si na zucculuni, lentu e goffu comu nu babbaluci`,
    `to matri si futtì cu tuttu u quartiere, figghiu ri buttana`,
    `vastasu e rugnusu, pari ca dormi ntâ munnizza`,
    `cugghiuni senza minchia, si nu surdu mutu e orbu`,
    `va a pigghiare u focu, ca si nu disgraziatu`,
    `facci ri scunchiurutu, nun ti guarda mancu u specchiu`,
    `si na cosa ri jittari, nuddu ti voli`,
    `buttana ri to matri, si futtì macari cu l'oru di to patri`,
    `testa ri minchia china r'acqua, scimunito e inutile`,
    `arrusu e finocchio, pari nu pupu senza fili`,
    `va a futtiri i porci, ca cu tia nun ci parra nuddu`,
    `si nu strunzu patentatu, cchiù merdusu ri na latrina`,
    `to soru è na tri mutura, si fa tutti pi nu cafè`,
    `curnutu e contentu, to mugghieri ti fa i corna cu l'amici`,
    `pezzo ri bagascia, si cchiù troia ri na zoccola`,
    `va a suca sangu, ca si nu vampiru ri mmerda`,
    `scimunito e babbu, nun capisci mancu quantu fai schifiu`,
    `si na facci ri càrcara, tosta e senza sentimenti`,
    `figghiu ri na vacca, to matri muggola ogni notti`,
    `vastasu senza educazioni, pari cresciutu ntâ strada`,
    `minchiuni e coglione, si nu capu ri minchia`,
    `to matri è na buttana sacra, comu na vacca ntâ India`,
    `si nu nuddu mmiscatu cu nenti, mancu i cani ti piscianu`,
    `va a jittari velenu, ca si nu velenu puru tu`,
    `curnutu ri mamma, to patri ti misi i corna prima ca nascisti`
  ];
 
  
    }
  conn.reply(m.chat, `@${menzione.split`@`[0]} ${pickRandom(['tua mamma fa talmente schifo che deve dare il viagra al suo vibratore','sei talmente negro che Carlo Conti al confronto è biancaneve','sei così brutto che tua madre da piccolo non sapeva se prendere una culla o una gabbia','sei simpatico come un grappolo di emorroidi','ti puzza talmente l`alito che la gente scoreggia per cambiare aria','tua madre prende più schizzi di uno scoglio','tua mamma fa talmente schifo che deve dare il viagra al suo vibratore','meglio un figlio in guerra che un coglione con i risvoltini come te','tua madre è come Super Mario, salta per prendere i soldi','Hai meno neuroni di un panino al latte, e sono pure senza glutine.',' sei così brutto che quando preghi Gesù si mette su invisibile','Sei così poco fotogenico che i filtri di Instagram ti bloccano per proteggere gli utenti.','sei talmente negro che Carlo Conti al confronto è biancaneve','sei così brutto che tua madre da piccolo non sapeva se prendere una culla o una gabbia','le tue scorregge fanno talmente schifo che il big bang a confronto sembra una loffa','ti puzza la minchia','il buco del culo di tua madre ha visto più palle dei draghetti di bubble game','il buco del culo di tua madre ha visto più palle dei draghetti di bubble game','di a tua madre di smettere di cambiare rossetto! Ho il pisello che sembra un arcobaleno!','se ti vede la morte dice che è arrivato il cambio','hai il buco del culo con lo stesso diametro del traforo della manica','tua madre è come il sole, batte sempre sulle strade','dall`alito sembra che ti si sia arenato il cadavere di un`orca in gola','tua madre cavalca più di un fantino','sei così cornuto che se ti vede un cervo va in depressione','non ti picchio solo perchè la merda schizza!','tua mamma è come gli orsi: sempre in cerca di pesce','Sei così sfigato che se compri un biglietto della lotteria, vinci un debito.','sei cosí brutto che i tuoi ti danno da mangiare con la fionda','sei cosí brutto che i tuoi ti danno da mangiare con la fionda','sei così brutto che quando accendi il computer si attiva subito l`antivirus',' tua madre è così grassa che è stata usata come controfigura dell`iceberg in Titanic','La tua famiglia è così povera che i topi lasciano elemosina sotto il frigorifero.','sei così troia che se fossi una sirena riusciresti lo stesso ad aprire le gambe','tua madre è così vacca che in India la fanno sacra','sei talmente rompipalle che l`unico concorso che vinceresti è miss stai ropendo le palle','tua mamma è come il Mars, momento di vero godimento','sei talmente zoccola che se ti dicono batti il 5 controlli subito l`agenda','sei così brutto che se ti vede la morte si gratta le palle','La tua famiglia è così povera che i topi lasciano elemosina sotto il frigorifero.','tua madre è come la Grecia, ha un buco gigante che non vuole smettere di allargarsi','hai più corna tu, che un secchio di lumache','sei simpatico come un dito in culo e puzzi pure peggio','sei così brutto che quando lanci un boomerang non torna','sei utile come una stufa in estate','sei così odioso che se gianni Morandi ti dovesse abbracciare lo farebbe solo per soffocarti','sei utile come un culo senza il buco','sei utile come una stufa in estate','sei utile come un paio di mutande in un porno','sei fastidioso come un chiodo nel culo','sei utile quanto una laurea in Lettere & Filosofia','a te la testa serve solo per tener distaccate le orecchie','tua madre è così suora che si inchina ad ogni cappella','hai visto più piselli te de na zuppa der casale','sei cosi brutto che se ti vede il gatto nero si gratta le palle e gira langolo','sei talmente sfigato che se ti cade l`uccello rimbalza e ti picchia nel culo','Tua sorella è così troia che OnlyFans le ha chiesto di vestirsi di più.','tua madre è come la salsiccia budella fuori maiala dentro','tua madre è come un cuore, se non batte muore','tua mamma è talmente bagassa che quando ti ha partorito si è chiesta se assomigliassi più all`idraulico o al postino','Sei la prova che Dio a volte sbaglia... e poi si diverte.','tu non sei un uomo. Sei una figura mitologica con il corpo di uomo e la testa di cazzo','tua madre è come una lavatrice: si fa bianchi, neri e colorati tutti a 90 gradi!','Sei il motivo per cui alcuni animali abbandonano i cuccioli. Persino Wikipedia ti correggerebbe, ma manco loro hanno tempo per le tue cazzate','Se la stupidità fosse un’olimpiade, saresti campione del mondo, con record mondiale in cagare il cazzo e non concludere un cazzo.','Hai un viso che potrebbe fermare un orologio... e farlo vomitare.','Sei così brutto che quando sei nato, il dottore ha preso a calci tua madre per ripicca','Sei così brutto che quando sei nato, l ostetrica ha chiesto un aumento di stipendio per trauma psicologico','Sei così ripugnante che il tuo riflesso negli specchi si suicida.','Sei talmente deforme che i cani randagi ti pisciano addosso per pietà.','Sei la prova che l aborto dovrebbe essere legale fino ai 40 anni.','Sei come un preservativo bucato: hai un solo compito e lo sbagli.','Tua madre è così troia che quando apre le gambe, l ONU manda aiuti umanitari.','Sei così ritardato che quando giochi a nascondino, ti perdi pure te stesso.','Sei la prova vivente che l’aborto post-natale dovrebbe essere legale.','Tua madre è così troia che quando apre le gambe, OnlyFans crasha per il traffico.'])}`, null, {
  mentions: [menzione],
  })
  }
  handler.command = /^insulta$/i; // Cambia il customPrefix con un comando specifico
  export default handler
  function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
  }
