// Plug-in creato da elixir

let handler = async (m, { conn, text }) => {
    if (!m.isGroup) throw 'Questo comando funziona solo nei gruppi!'

    // ==================== GESTIONE MENZIONE ====================
    let menzione = null

    if (m.quoted) {
        menzione = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        menzione = m.mentionedJid[0]
    } else if (text) {
        let user = text.replace('@', '').trim()
        if (user) menzione = user + '@s.whatsapp.net'
    }

    if (!menzione) throw 'Devi rispondere a un messaggio o menzionare qualcuno (@user)'

    if (menzione === conn.user.jid) {
        return conn.reply(m.chat, `Non ci provare con me.`, m)
    }

    const username = menzione.split('@')[0]

    // ====================== ARRAY FRASI (90+) ======================
    const docce = [
        "La camera è pronta... entra pure",
        "Temperatura perfetta a 45°C con aroma speciale",
        "Doccia storica in arrivo",
        "Niente acqua oggi, solo aria profumata",
        "Benvenuto nel resort del '44",
        "Sali sul treno, la doccia è gratis",
        "Ti faccio una doccia che ricorderai per sempre",
        "Camera a gas attivata",
        "Respira profondamente... è speciale",
        "Stai per vivere un'esperienza unica",
        "I tuoi nonni ti aspettano sotto la doccia",
        "Zyklon B in arrivo",
        "Chiudi gli occhi e goditi il momento",
        "La storia si ripete oggi",
        "Doccia zero acqua, efficienza massima",
        "Preparati, dura solo pochi minuti",
        "Entra, è calda e accogliente",
        "Non sentirai quasi niente... fidati",
        "Doccia speciale solo per te",
        "Benvenuto nella stanza senza ritorno"
    ]

    // ====================== SEQUENZA ANIMAZIONE ======================
    let msg = await conn.sendMessage(m.chat, {
        text: `╔════════════════════╗\n` +
              `   🖤 DOCCIA SPECIALE 🖤\n` +
              `╚════════════════════╝\n\n` +
              `@${username} sta entrando nella camera...`,
        mentions: [menzione]
    }, { quoted: m })

    const sequence = [
        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} entra nella camera...\n` +
        `La porta si chiude con un clang.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} sente il rumore del gas...\n` +
        `L'aria diventa pesante.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} inizia a tossire...\n` +
        `Le gambe cedono lentamente.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} cade in ginocchio...\n` +
        `La vista si annebbia.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} lotta per respirare...\n` +
        `Il corpo trema.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} è a terra...\n` +
        `Gli occhi si spengono.`,

        `╔════════════════════╗\n` +
        `   🖤 DOCCIA SPECIALE 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} ha completato la doccia.\n` +
        `Riposa in pace. ⚰️`,

        `╔════════════════════╗\n` +
        `   🖤 MISSIONE COMPLETATA 🖤\n` +
        `╚════════════════════╝\n\n` +
        `@${username} è stato rimosso dalla storia.`
    ]

    // Esecuzione dell'animazione (edit)
    for (let i = 0; i < sequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1400)) // 1.4 secondi tra un edit e l'altro
        await conn.sendMessage(m.chat, { text: sequence[i] }, { edit: msg.key })
    }

    // Reazione finale
    await conn.sendMessage(m.chat, {
        react: { text: "☠️", key: m.key }
    })
}

handler.command = /^(doccia|gas|docciaspeciale|camera|zyklon)$/i
handler.tags = ['fun', 'dark']
handler.group = true

export default handler
