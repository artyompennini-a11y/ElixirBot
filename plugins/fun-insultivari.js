// Plug-in creato da elixir 

let handler = async (m, { conn, text, command }) => {
    if (!m.isGroup) throw 'Solo nei gruppi!'

    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/@/, '') + '@s.whatsapp.net'
    
    if (!menzione || menzione.length < 15) throw `Chi vuoi colpire con il comando *${command}*?`
    if (menzione === conn.user.jid) return conn.reply(m.chat, `Non ci provare con me, pivello.`, m)

    let list = []

    switch (command) {
        case 'insultaforte':
            list = [
                "sei una testa di minchia patentata", "figghiu ri buttana", "pezzo ri mmerda", "vastasu schifiusu",
                "scimunito senza neuroni", "curnutu e contentu", "si nu nuddu mmiscatu cu nenti", "va a suca minchia",
                "facci ri càrcara", "sei più inutile di un preservativo bucato", "to matri è na buttana sacra",
                "sei un coglione di prima categoria", "sei come la merda: ovunque vai lasci puzza",
                "sei talmente brutto che fai schifo pure ai cani", "sei un fallito a vita", "testa di cazzo ambulante",
                "sei il motivo per cui si usa il preservativo", "sei nato per sbaglio", "sei un errore della natura",
                "sei così lercio che puzzi anche da lontano", "sei un parassita della società", "figlio di una troia patentata",
                "sei inutile come il terzo testicolo", "hai il QI di una pianta grassa", "sei un ritardato evolutivo",
                "sei la vergogna della famiglia", "sei così scemo che ti compatisco", "va a farti fottere dal treno",
                "sei un bidone dell'immondizia con le gambe", "sei più falso di una moneta da 3 euro",
                "hai la faccia come il culo di un babuino", "sei un essere umano di serie B", "sei un aborto fallito",
                "sei più sporco di una fogna a cielo aperto", "sei un cesso con le gambe", "sei un rifiuto umano",
                "sei così brutto che tua madre ti allattava con la mascherina", "sei un clown senza trucco",
                "sei la dimostrazione che l'incesto fa male", "sei un virus con le gambe", "sei un tumore della società",
                "sei più inutile di un fornelletto da campo", "sei un handicappato mentale", "sei un sacco di letame",
                "sei così stupido che fai pena", "sei un fenomeno da baraccone", "sei la feccia della società",
                "sei un nano mentale", "sei un mongoloide patentato", "sei un deficiente cronico", "sei un ritardato di merda",
                "sei un povero sfigato", "sei un perdente nato", "sei un fallito su tutta la linea", "scarto biologico",
                "sei l'unica prova che l'evoluzione può fare retromarcia", "hai il carisma di un calzino bucato",
                "sei una delusione genetica", "il tuo albero genealogico è un cerchio perfetto", "sei un ammasso di cellule sprecate"
            ]
            break

        case 'roast':
            list = [
                "Sei così brutto che quando sei nato il dottore ha dato le condoglianze a tua madre",
                "Hai meno personalità di un muro bianco", "Sei il motivo per cui alcuni animali mangiano i propri cuccioli",
                "Sei talmente inutile che se fossi un Pokémon saresti MissingNo", "La tua faccia sembra un incidente stradale",
                "Sei così scemo che ti sei guardato allo specchio e hai detto 'chi è sto coglione?'",
                "Tua madre è pentita ogni volta che ti guarda", "Sei la prova vivente che Dio a volte sbaglia",
                "Sei così noioso che fai addormentare pure i morti", "La tua vita è un meme che non fa ridere",
                "Sei il tipo di persona che viene taggato solo nelle catene", "Sei come WiFi pubblico: tutti ti usano ma nessuno ti vuole",
                "Hai il carisma di un pezzo di pane raffermo", "Sei così brutto che fai sembrare bello Quasimodo",
                "La tua esistenza è un filler", "Sei il motivo per cui l'evoluzione a volte torna indietro",
                "Sei talmente sfigato che perdi anche a testa o croce", "La tua vita è un bug del sistema",
                "Non sei brutto, sei solo un esperimento estetico fallito", "Sei l'equivalente umano di una notifica di errore",
                "Hai lo spessore culturale di un post di Facebook", "Sei così insignificante che anche Google non ti trova",
                "La tua opinione è utile quanto una forchetta nel brodo", "Sei il trailer di un film che nessuno vuole vedere",
                "Sei così pigro che l'ultima cosa che hai fatto correre è il naso"
            ]
            break

        case 'sberla':
            list = [
                "🔥 *SBERLA VOLANTE* 🔥 Ti ho lasciato cinque dita sulla faccia",
                "Ti ho dato una sberla che hai visto fino a dopodomani",
                "Sberla così forte che ti ho resettato il cervello",
                "Ti ho schiaffeggiato così forte che hai cambiato continente",
                "Sberla che ti ha girato la testa di 360°",
                "Ti ho dato una sberla che ti è partito il dente del giudizio",
                "Ti ho dato un ceffone che ora il tuo orecchio sinistro parla con quello destro",
                "Ti ho schiaffeggiato così forte che pure tuo nonno ha sentito dolore",
                "Sberla atomica: ora hai la faccia simmetrica per la prima volta",
                "Ti ho dato un manrovescio che ti ha fatto ricaricare il cellulare",
                "Schiaffo così potente che ora parli in aramaico antico"
            ]
            break

        case 'stupido':
            list = [
                "Sei così stupido che pensi che 1+1 faccia Finestra", "Hai il QI di un posacenere",
                "Sei talmente scemo che ti sei affogato in una pozzanghera", "Il tuo cervello ha più RAM di un Nokia 3310",
                "Sei scemo di natura", "Sei un ritardato evolutivo", "Hai il cervello in modalità aereo",
                "Sei così stupido che cerchi di leggere un libro sottosopra", "Hai i neuroni in sciopero permanente",
                "Sei così scemo che se ti dicono 'fai il serio' vai in crash", "Il tuo cervello è un optional che non hai riscattato",
                "Sei così stupido che hai cercato di scalare un muro di nebbia", "Hai la profondità mentale di un piattino da caffè",
                "Sei così ottuso che non entri nemmeno in un cerchio", "Il tuo unico neurone sta giocando a nascondino e sta perdendo"
            ]
            break

        case 'culo':
            list = [
                "Ha un culo così grande che ci parcheggia la macchina", "Il tuo culo ha più buchi di un colabrodo",
                "Hai il culo così floscio che sembra due buste della spesa", "Hai il culo che sembra due palloni sgonfi",
                "Ti cade il culo ogni volta che cammini", "Hai il culo così piatto che sembra una tavola da surf",
                "Il tuo culo è così largo che serve il permesso di sosta", "Hai più cellulite tu che un barattolo di ricotta",
                "Culo così cadente che devi stare attento a non inciamparci", "Hai un sedere che sembra un sacco di patate dimenticato sotto la pioggia"
            ]
            break

        case 'morto':
            list = [
                "Sei più morto di mio nonno", "Sei morto dentro da anni", "Sei così morto che puzzi già", 
                "Sei morto e non lo sai ancora", "Sei un cadavere che cammina", "La tua vitalità è pari a quella di un sasso",
                "Sei così spento che i necrofori ti seguono per strada", "Hai lo sguardo di uno che è morto tre giorni fa e non l'hanno ancora avvisato",
                "Sei un'anima in pena senza nemmeno il corpo", "Sei così moscio che sembri un zombie vegetariano"
            ]
            break

        case 'ammazza':
            list = [
                "Ti ammazzo di botte", "Ti ammazzo e ti seppellisco nel giardino", "Ti ammazzo lentamente con le mie mani", 
                "Ti faccio fuori come un cane", "Ti scavo la fossa con un cucchiaino", "Ti faccio sparire meglio dei calzini in lavatrice",
                "Ti ammazzo così forte che i tuoi antenati si chiederanno cosa è successo", "Ti cancello dall'esistenza con un colpo solo",
                "Ti faccio diventare un ricordo sbiadito", "Ti ammazzo di insulti finché non chiedi pietà"
            ]
            break
    }

    let txt = list[Math.floor(Math.random() * list.length)]
    await conn.reply(m.chat, `@${menzione.split('@')[0]} ${txt}`, m, { mentions: [menzione] })
}

handler.help = ['insultaforte', 'roast', 'sberla', 'stupido', 'culo', 'morto', 'ammazza']
handler.tags = ['fun']
handler.command = /^(insultaforte|roast|sberla|stupido|culo|morto|ammazza)$/i
handler.group = true

export default handler
