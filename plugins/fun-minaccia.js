// Plug-in creato da elixir
let handler = async (m, { conn, text }) => {
    if (!m.isGroup) throw 'Questo comando funziona solo nei gruppi!'

    let menzione = m.mentionedJid[0] 
                 ? m.mentionedJid[0] 
                 : m.quoted 
                 ? m.quoted.sender 
                 : text.replace(/@/, '') + '@s.whatsapp.net'

    if (!menzione) throw 'Chi vuoi minacciare? Rispondi a un messaggio o scrivi @user'

    // Protezione Bot
    if (menzione === conn.user.jid) {
        return conn.reply(m.chat, `Non ci provare nemmeno, testa di minchia.`, m)
    }

    const minacce = [
        "Ti vengo a casa e ti spacco tutte le ossa una ad una",
        "Ti apro la testa come una scatoletta e ci piscio dentro",
        "Ti faccio ingoiare i denti uno per uno",
        "Ti rovino la vita così tanto che tua madre ti rinnega",
        "Ti spacco la faccia fino a fartela diventare irriconoscibile",
        "Ti levo la pelle a strisce lentamente",
        "Ti faccio cacare sangue per mesi",
        "Ti brucio la casa con te dentro",
        "Ti rompo il culo così forte che dovrai cacare dal naso",
        "Ti taglio le palle e te le faccio friggere",
        "Ti mando all'ospedale con la faccia spappolata",
        "Ti sfondo il cranio a calci",
        "Ti uso la schiena come zerbino",
        "Ti faccio rimpiangere di essere nato",
        "Ti butto dal balcone come un sacco di immondizia",
        "Ti rompo tutte le dita delle mani",
        "Ti squarto come un maiale",
        "Ti distruggo l'esistenza",
        "Ti riduco così male che nemmeno tua madre ti riconosce",
        "Ti investo e faccio retromarcia",
        "Ti taglio la lingua e te la faccio mangiare",
        "Ti faccio vomitare le budella",
        "Ti brucio vivo e piscio sulle ceneri",
        "Ti spezzo la spina dorsale e ti lascio per terra",
        "Ti massacro finché non diventi un mucchio di carne",
        "Ti apro la pancia e ci gioco con le budella",
        "Ti faccio diventare cibo per cani",
        "Ti distruggo l'anima e poi il corpo",
        "Ti vengo di notte e ti taglio le palpebre",
        "Ti spacco la mascella e te la giro al contrario",
        "Ti faccio soffrire così tanto che implorerai la morte",
        "Ti rovino talmente che vorrai non essere mai esistito",
        "Ti spacco le ginocchia così non cammini più",
        "Ti ficco un ferro rovente nel culo",
        "Ti strappo gli occhi e te li faccio ingoiare",
        "Ti rompo la colonna vertebrale vertebra per vertebra",
        "Ti faccio mangiare i tuoi stessi testicoli",
        "Ti vengo a casa e ti ammazzo di botte davanti ai tuoi",
        "Ti taglio le orecchie e te le faccio portare come trofeo",
        "Ti sfondò lo stomaco a pugni",
        "Ti riduco la faccia a poltiglia",
        "Ti faccio un buco in testa e ci infilo una sigaretta accesa",
        "Ti spezzo tutte le costole una ad una",
        "Ti faccio diventare handicappato a vita",
        "Ti vengo addosso con la macchina a tutta velocità",
        "Ti lego e ti lascio morire di fame lentamente",
        "Ti brucio i genitali con l'accendino",
        "Ti strappo le unghie una per una",
        "Ti faccio passare un inferno che non dimenticherai mai",
        "Sei talmente merda che nemmeno i vermi ti mangerebbero",
        "Ti distruggo tutto quello che hai di caro",
        "Ti faccio piangere sangue",
    ]

    let minaccia = minacce[Math.floor(Math.random() * minacce.length)]

    // Protezione Admin
    let isAdmin = false
    if (m.isGroup) {
        let group = await conn.groupMetadata(m.chat)
        isAdmin = group.participants.some(p => 
            p.id === menzione && (p.admin === "admin" || p.admin === "superadmin")
        )
    }

    if (isAdmin) {
        minaccia = "Calmo admin, ti minaccio solo un pochino..."
    }

    await conn.reply(m.chat, `@${menzione.split('@')[0]} ${minaccia}`, m, {
        mentions: [menzione]
    })
}

handler.command = /^minaccia$/i
handler.tags = ['fun']
handler.group = true

export default handler
