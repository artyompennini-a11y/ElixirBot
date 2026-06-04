// Plug-in creato da elixir
let handler = async (m, { conn, groupMetadata }) => {
    if (!m.isGroup) throw false
    
    let gruppi = global.db.data?.chats?.[m.chat]
    if (gruppi && gruppi.spacobot === false) throw false

    // Funzione corretta per visualizzare il tag nel testo
    let toM = a => '@' + a.split('@')[0]
    
    let ps = groupMetadata.participants.map(v => v.id)
    if (ps.length < 2) throw 'Servono almeno due persone nel gruppo per creare zizzania!'
    
    let a = ps.getRandom()
    let b
    do b = ps.getRandom()
    while (b === a)

    const frasi = [
        // — Originali —
        'ha rubato segretamente la collezione di tappi di', 'vuole sfidare a duello con i cuscini', 'pensa che il sosia perduto di Babbo Natale sia',
        'ha sognato di cavalcare un unicorno rosa insieme a', 'vuole fondare un fan club dedicato ai piedi di', 'crede che sia un alieno infiltrato',
        'passa ore a guardare le foto del profilo di', 'vorrebbe scambiare il proprio guardaroba con quello di', 'ha chiesto a un cartomante il futuro di',
        'vorrebbe andare a vivere su Marte insieme a', 'ha confessato di voler clonare', 'crede che scriva messaggi sotto dettatura di un gatto',
        'ha salvato per sbaglio lo stato WhatsApp di', 'ha cercato su Google "come diventare migliore amico di"', 'vuole chiedere un autografo sulla fronte a',
        'sogna di fare un karaoke imbarazzante con', 'ha mandato un bacio virtuale per errore a', 'ha provato a copiare il taglio di capelli di',
        'ha una gigantografia in camera di', 'vorrebbe farsi prestare i calzini usati da', 'ha provato a spiare cosa mangia a pranzo',
        'pensa che la risata più buffa del mondo sia quella di', 'ha scritto una canzone d\'amore dedicata a', 'vorrebbe farsi fare i grattini da',
        'pensa di essere molto più intelligente di', 'ha mangiato l\'ultimo biscotto destinato a', 'vorrebbe rubare il posto di lavoro di',
        'ha mutato perennemente le notifiche di', 'crede che il gusto in fatto di musica di sia pessimo', 'ha rivelato un segreto buffo su',
        'pensa che si vesta peggio di un pagliaccio rispetto a', 'ha nascosto il caricabatterie di', 'ride ogni volta che legge un messaggio di',
        'vorrebbe partecipare a un reality show con', 'ha chiesto in prestito dei soldi mai restituiti a', 'pensa che sia il/la più pigro/a del gruppo',
        'vuole organizzare uno scherzo telefonico a', 'sogna di vincere la lotteria e non dare nulla a', 'ha provato a imparare il ballo del ceppo con',
        'vorrebbe tingere i capelli di verde a', 'ha confessato di avere una cotta segreta per la zia di', 'pensa che sia un robot telecomandato',
        'vorrebbe fare una gara di abbuffata con', 'ha rubato l\'idea geniale di', 'crede che parli nel sonno di',
        'vuole sfidare a una maratona di serie TV', 'ha scambiato il sale con lo zucchero nel caffè di', 'pensa che abbia i gusti cinematografici di un sasso',
        'vorrebbe fare un tatuaggio temporaneo con la faccia di', 'ha provato a ipnotizzare via chat', 'crede che sia il/la preferito/a degli admin',
        'vorrebbe fare una battaglia di polpette con', 'ha confessato di preferire il cane di a', 'vuole insegnare a cantare lirica a',
        'ha cercato di vendere su eBay un oggetto di', 'pensa che sia la causa del riscaldamento globale', 'vorrebbe vivere in una bolla di sapone con',
        'ha provato a indovinare la password del telefono di', 'crede che si lavi i denti con la nutella', 'vuole fare un viaggio in autostop con',
        'ha paura che gli rubi la scena', 'pensa che sia l\'anima della festa (in senso ironico)', 'vorrebbe regalare un set di nani da giardino a',
        'ha sognato di essere in trappola in un ascensore con', 'vuole sfidare a braccio di ferro', 'pensa che abbia un talento nascosto per il curling',
        'ha provato a imitare l\'accento di', 'vorrebbe fare un picnic sotto la pioggia con', 'crede che sia la persona più ritardataria del secolo',
        'vuole regalare un abbonamento a "Simpatici ma non troppo" a', 'ha dimenticato il compleanno di', 'pensa che sia un influencer fallito',
        'vorrebbe vedere cosa c\'è nel carrello della spesa di', 'ha chiesto un consiglio di stile a', 'crede che sia un agente segreto',
        'vuole sfidare a chi sta più tempo senza parlare', 'ha confessato che non capisce mai le battute di', 'pensa che sia un mito assoluto',
        'vorrebbe fare una scalata in montagna con', 'ha provato a scrivere un libro sulla vita di', 'crede che sia un vampiro',
        'vuole fare una gara di sguardi con', 'ha nascosto le chiavi di casa di', 'pensa che sia la persona più fortunata del mondo',
        'vorrebbe costruire un castello di sabbia con', 'ha chiesto a Siri come sopportare', 'crede che abbia un gemello cattivo',
        'vuole fare un duetto su TikTok con', 'ha provato a rubare la merenda di', 'pensa che sia il re/regina dei meme',
        'vorrebbe fare una partita a scacchi bendato contro', 'ha confessato di ammirare segretamente lo stile di', 'vuole fare un corso di yoga con',

        // — Nuove 150 frasi —
        'ha tentato di insegnare a nuotare a un gatto per far colpo su', 'pensa che il profilo Instagram di faccia schifo rispetto al suo, al contrario di', 'ha ordinato una pizza con gli ananas solo per fare dispetto a',
        'vorrebbe scambiare il numero di scarpe con', 'ha confessato di aver pianto guardando un cartone animato a causa di', 'crede che sia troppo bello/a per stare in questo gruppo al contrario di',
        'ha provato a scrivere un poema epico sulle avventure di', 'vuole fare una gara di chi rutta più forte con', 'ha spiato il frigorifero di',
        'pensa che il quoziente intellettivo di sia inferiore a una pianta grassa rispetto a', 'vorrebbe fare un reality di sopravvivenza in un IKEA con', 'ha provato a vendere NFT con la faccia di',
        'crede che stia tramando qualcosa di losco insieme a', 'ha tentato di imparare il klingon per parlare con', 'vuole candidarsi come sindaco del divano insieme a',
        'pensa che il guardaroba di sia sponsorizzato dal mercatino dell\'usato rispetto a quello di', 'ha confessato di aver leccato il piatto dopo aver mangiato da', 'vorrebbe fare un corso di ballo del serpente con',
        'ha registrato una cover di Bocelli dedicata a', 'crede che abbia una passione segreta per i documentari sui delfini come', 'vuole fare la guerra dei coriandoli con',
        'ha tentato di decifrare i messaggi criptici di', 'pensa che sia il/la campione/essa mondiale di procrastinazione dopo', 'vorrebbe aprire un negozio di souvenir con la faccia di',
        'ha confessato di parlare ai muri quando pensa a', 'crede che stia cercando su Google "come diventare ricco senza fare niente" più di', 'vuole fare un corso intensivo di origami con',
        'ha provato a convincere l\'algoritmo di TikTok che è più famoso/a di', 'pensa che il telefono di sia bloccato sul 2007 come quello di', 'vorrebbe fare un challenge su chi mangia più lentamente con',
        'ha sognato di essere rapito/a dagli alieni insieme a', 'crede che abbia più follower fasulli di', 'vuole costruire un bunker antiapocalittico con',
        'ha confessato di aver messo la sveglia alle 3 di notte per spiare i messaggi di', 'pensa che sia più permaloso/a di un porcospino rispetto a', 'vorrebbe fare una gara di chi si addormenta prima nel film con',
        'ha tentato di clonare il segreto del ragù della nonna di', 'crede che il senso dell\'orientamento di sia peggiore di quello di', 'vuole fare un corso di cucina messicana con',
        'ha provato a fare la boxe con i calzini contro', 'pensa che sia ancora convinto/a che i cartoni siano reali come', 'vorrebbe passare 24 ore chiuso/a in un centro commerciale con',
        'ha confessato di sentire la mancanza perfino del respiro di', 'crede che stia leggendo i messaggi fingendo di non averli visti proprio come', 'vuole fare una gara di chi resiste più tempo senza toccare il telefono con',
        'ha tentato di ingaggiare un detective privato per scoprire i segreti di', 'pensa che il codice fiscale di contenga il numero del diavolo come quello di', 'vorrebbe fare un patto segreto contro',
        'ha confessato di aver salvato tutte le foto profilo di', 'crede che stia seguendo un corso segreto di magia nera insieme a', 'vuole fare una battaglia di acqua con le pistole ad acqua contro',
        'ha provato a scrivere una lettera anonima di insulti a', 'pensa che puzzi di vecchio tanto quanto', 'vorrebbe svegliarsi un giorno nei panni di',
        'ha cercato su YouTube "come sopravvivere a" riferendosi a', 'crede che stia sabotando la connessione internet di tutto il gruppo tranne quella di', 'vuole fare una maratona di film horror abbracciato/a a',
        'ha confessato di aver usato il profilo di per fare acquisti online', 'pensa che la sveglia di suoni come quella di', 'vorrebbe fare uno scambio di personalità con',
        'ha tentato di far credere al gruppo di essere migliore amico/a di', 'crede che mangi in segreto il cibo di', 'vuole fare una gara di chi resiste più tempo a fissarsi negli occhi con',
        'ha provato a impersonare via messaggio vocale', 'pensa che abbia un segreto oscuro più grande di quello di', 'vorrebbe fare una seduta spiritica con',
        'ha confessato di trollare in modo anonimo i post di', 'crede che stia cercando casa su Subito.it per trasferirsi lontano da', 'vuole fare un campo estivo di sopravvivenza con',
        'ha tentato di convincere tutti che è più simpatico/a di', 'pensa che la firma di sembri quella di un bambino di quinta elementare come quella di', 'vorrebbe adottare un criceto e chiamarlo con il nome di',
        'ha confessato di aver mangiato il gelato nascosto in freezer di', 'crede che stia chattando con un bot invece che con', 'vuole fare una gara di chi cucina la cosa più immangiabile con',
        'ha provato a rubare il posto fisso sul divano di', 'pensa che stia fingendo di lavorare da casa esattamente come', 'vorrebbe scrivere le memorie segrete di',
        'ha confessato di aver sbroccato da solo/a guardando le storie di', 'crede che la password WiFi di sia "password123" proprio come quella di', 'vuole fare un corso di sopravvivenza emotiva da',
        'ha tentato di mandare messaggi imbarazzanti dal telefono sbloccato di', 'pensa che abbia lo stesso umorismo di una zuppa fredda rispetto a', 'vorrebbe fare uno scambio di telefoni per un giorno con',
        'ha confessato di aver cercato "quanto costa un clone umano" pensando a', 'crede che sia innamorato/a di', 'vuole fare una gara di chi manda più messaggi vocali inutili a',
        'ha provato a imparare la firma di per falsificarla come', 'pensa che preferisca il gatto al resto del gruppo incluso/a', 'vorrebbe fare un viaggio low cost in camper con',
        'ha confessato di aver usato le foto di per un profilo falso su Tinder al posto di', 'crede che stia cercando come diventare youtuber copiando lo stile di', 'vuole fare una sessione di meditazione guidata con',
        'ha tentato di rivendere su Vinted i vestiti di', 'pensa che il cibo preferito di siano i cracker scaduti come quelli di', 'vorrebbe fare una gara di chi dorme di più il weekend con',
        'ha confessato di aver impostato il suono delle notifiche di come sveglia mattutina', 'crede che sia il/la responsabile di tutti i meme cringe del gruppo insieme a', 'vuole fare una recita improvvisata insieme a',
        'ha tentato di convincere il gatto di a morderlo/la', 'pensa che stia frequentando un corso segreto di cucina solo per impressionare', 'vorrebbe fare una gara di chi cade prima dalla sedia ridendo con',
        'ha confessato di aver mandato un vocale di 10 minuti per sbaglio a', 'crede che il/la migliore amico/a segreto/a di sia in realtà', 'vuole fare il test del DNA per scoprire se è parente di',
        'ha tentato di vendere l\'anima di in cambio di uno sconto su Amazon a', 'pensa che abbia un alter ego notturno più strano di quello di', 'vorrebbe fare una gara a chi imita peggio i VIP con',
        'ha confessato di aver riso da solo/a per 10 minuti a un messaggio di', 'crede che stia organizzando una festa senza invitare', 'vuole fare un corso di autodifesa contro',
        'ha tentato di scrivere un copione cinematografico basato sulla vita di', 'pensa che la fotocamera frontale di faccia paura tanto quanto quella di', 'vorrebbe fare un pomeriggio intero di karaoke anni 90 con',
        'ha confessato di aver sognato di sposarsi con il/la peggior nemico/a di', 'crede che stia portando sfiga al gruppo insieme a', 'vuole fare una gara di chi lancia la tazzina del caffè più lontano con'
    ]

    const fraseScelta = pickRandom(frasi)
    const messaggio = `${toM(a)} ${fraseScelta} ${toM(b)}`
    
    // Il parametro mentions deve contenere gli ID completi (es. 39xx@s.whatsapp.net)
    await conn.sendMessage(m.chat, { 
        text: messaggio, 
        mentions: [a, b] 
    }, { quoted: m })
}

handler.customPrefix = /zizzania/i
handler.command = new RegExp
export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}
