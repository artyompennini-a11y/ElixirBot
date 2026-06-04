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

    // ====================== SEQUENZE CREATIVE ======================

    const sequences = [

        // 1. Brutale e Diretto
        [`@${username} viene sbattuto contro il muro con violenza...`,
         `Gli strappo i pantaloni e lo penetro di colpo...`,
         `Lo sto sfondando senza pietà, sempre più forte...`,
         `Culo distrutto e riempito fino in fondo 💦`],

        // 2. Lento e Umiliante
        [`@${username} è in ginocchio come una brava troia...`,
         `Ti sto allargando il culo con calma...`,
         `Senti come ti apro tutto? Sei solo un buco...`,
         `Bravo, prendi tutto fino alla fine 🍑`],

        // 3. Passionale / Intenso
        [`@${username} viene spinto sul letto...`,
         `Le mani stringono i fianchi mentre entro lentamente...`,
         `Lo sto inculando con colpi profondi e ritmati...`,
         `Viene riempito completamente mentre geme...`],

        // 4. Creative - "Medico"
        [`@${username} viene messo sul lettino...`,
         `Il dottore sta allargando il buco con attenzione...`,
         `Ora entra lo strumento grosso...`,
         `Diagnosi: culo completamente sfondato 💉`],

        // 5. Creative - "Demoniaco"
        [`@${username} viene posseduto...`,
         `Sento il demone che ti allarga il culo...`,
         `Viene sbattuto da forze sovrannaturali...`,
         `Riempito dal seme infernale 🔥`],

        // 6. Creative - "Macchina"
        [`@${username} viene legato alla macchina...`,
         `La macchina inizia a inculare a velocità crescente...`,
         `Non si ferma... sempre più forte e profondo...`,
         `Culo distrutto dalla macchina automatica 🤖`],

        // 7. Creative - "Gangbang Mentale"
        [`@${username} è circondato...`,
         `Uno dopo l'altro ti stanno allargando il culo...`,
         `Stai prendendo da tutti i lati...`,
         `Completamente usato e ricoperto 💦`],

        // 8. Creative - "Alien"
        [`@${username} viene catturato dagli alieni...`,
         `Il tentacolo grosso sta entrando...`,
         `Ti stanno sondando e dilatando profondamente...`,
         `Riempito dal fluido alieno 👽`]
    ]

    // Scelta casuale della sequenza
    const chosen = sequences[Math.floor(Math.random() * sequences.length)]

    // Messaggio iniziale
    let currentMsg = await conn.sendMessage(m.chat, {
        text: `╔════════════════════╗\n` +
              `     🔥 INCULA MODE 🔥\n` +
              `╚════════════════════╝\n\n` +
              `@${username} è stato selezionato...`,
        mentions: [menzione]
    }, { quoted: m })

    // Animazione sicura (modifica stesso messaggio)
    for (let line of chosen) {
        await new Promise(r => setTimeout(r, 1700))
        await conn.sendMessage(m.chat, {
            text: `╔════════════════════╗\n` +
                  `     🔥 INCULA MODE 🔥\n` +
                  `╚════════════════════╝\n\n${line}`
        }, { edit: currentMsg.key })
    }

    // Reazione finale
    await conn.sendMessage(m.chat, {
        react: { text: "🍑", key: m.key }
    })
}

handler.command = /^(incula|incul|sfonda|sfon|inculami|sfondaculo|inculo)$/i
handler.tags = ['fun', 'nsfw']
handler.group = true

export default handler
