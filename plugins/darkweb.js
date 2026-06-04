// Plug-in creato da elixir
import { createCanvas } from 'canvas'

const footer = '𝕰𝕷𝕴𝖃𝕴𝕽𝕭𝕺𝕿'

// Funzione delay per le animazioni
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, command, args, usedPrefix, mentionedJid }) => {
    let who = m.sender
    global.db.data.users[who] = global.db.data.users[who] || {}
    let user = global.db.data.users[who]
    if (!user.inventory) user.inventory = {}
    if (user.euro === undefined) user.euro = 50

    // --- DATABASE OGGETTI ---
    const shop = {
        "1": { nome: "SPOOF_GPS", prezzo: 400, rischio: 10, uso: "🛡️ Riduce del 50% il rischio di sanzioni della Polizia." },
        "2": { nome: "BITCOIN_MIXER", prezzo: 800, rischio: 25, uso: "🧼 Pulisce euro sporchi generando tra 1000€ e 2500€." },
        "3": { nome: "EXPLOIT_KIT", prezzo: 1500, rischio: 40, uso: "🏴‍☠️ Sblocca il comando .hackk @tag per rubare il 20% del saldo altrui." },
        "4": { nome: "GHOST_DRIVE", prezzo: 300, rischio: 5, uso: "💾 Protegge i tuoi EXP durante le retate della Polizia." },
        "5": { nome: "ROOT_ACCESS", prezzo: 3500, rischio: 65, uso: "🔑 Reset istantaneo dei cooldown dei giochi (In arrivo)." }
    }

    // --- 0. MENU DARKWEB PRINCIPALE (nuovo, integrato da fun-darkweb2) ---
    if (command === 'darkweb' || command === 'dw' || command === 'darkwebb' || command === 'negozio') {
        let help = `🌌 *NEURAL DARKWEB v6.2* — LIVELLO VII\n`
        help += `┌─────────────────────────────┐\n`
        help += `│ 👮 *Rischio:* Ogni acquisto può essere tracciato.\n`
        help += `│ Se la Polizia ti becca, paghi multa del 150%!\n`
        help += `└─────────────────────────────┘\n\n`

        help += `*🛒 CATALOGO:* \n`
        Object.keys(shop).forEach(id => {
            help += `│ *ID ${id}* - ${shop[id].nome} 💰${shop[id].prezzo}€\n`
        })

        help += `\n*📑 COMANDI ACQUISTO:* \n`
        help += `│ \`${usedPrefix}buy [ID]\` → Compra oggetto\n`
        help += `│ \`${usedPrefix}zaino\` → Guarda strumenti\n`
        help += `│ \`${usedPrefix}hackk @tag\` → Ruba 20% (serve ID 3)\n`
        help += `│ \`${usedPrefix}regala [€] @tag\` → Invia soldi\n`
        help += `│ \`${usedPrefix}cedi [NOME] @tag\` → Passa oggetto\n`

        help += `\n*🕵️ COMANDI HACKING SIMULATO:* \n`
        help += `│ \`${usedPrefix}hacksim @tag\` → Simula hacking\n`
        help += `│ \`${usedPrefix}breach @tag\` → Data Breach\n`
        help += `│ \`${usedPrefix}blackmail @tag\` → Ricatto\n`
        help += `│ \`${usedPrefix}phish @tag\` → Phishing\n`
        help += `│ \`${usedPrefix}ransomware @tag\` → Ransomware\n`
        help += `│ \`${usedPrefix}deepfake @tag\` → DeepFake\n`
        help += `│ \`${usedPrefix}reputation @tag\` → Reputazione\n`
        help += `│ \`${usedPrefix}anon [msg]\` → Messaggio anonimo\n`

        help += `\n💰 \`Saldo:\` *${user.euro}€*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎒 ZAINO', id: `${usedPrefix}zaino` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛰️ BUY SPOOF (ID 1)', id: `${usedPrefix}buy 1` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '☠️ BREACH', id: `${usedPrefix}breach` }) }
        ]

        return conn.sendMessage(m.chat, { text: help, footer, interactiveButtons: buttons }, { quoted: m })
    }

    // --- 1. COMANDO: BUY (ACQUISTO) ---
    if (command === 'buy') {
        let id = args[0]
        if (!id || !shop[id]) return m.reply(`🛍️ Seleziona un ID corretto! Esempio: \`${usedPrefix}buy 1\``)
        let item = shop[id]
        if (user.euro < item.prezzo) return m.reply(`📉 Saldo insufficiente!`)

        let chance = Math.floor(Math.random() * 100)
        let rischioEffettivo = user.inventory["SPOOF_GPS"] > 0 ? item.rischio / 2 : item.rischio

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        if (chance < rischioEffettivo) {
            ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 600, 300)
            ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 300, 15); ctx.fillStyle = '#0000ff'; ctx.fillRect(300, 0, 300, 15)
            ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText('INTERCETTATO', 300, 140)
            let multa = Math.floor(item.prezzo * 1.5)
            user.euro = Math.max(0, user.euro - multa)
            if (user.inventory["SPOOF_GPS"] > 0) user.inventory["SPOOF_GPS"] -= 1
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `⚠️ *RETATA DELLA POLIZIA:* Il tuo ordine di \`${item.nome}\` è stato tracciato. Multa pagata: *${multa}€*.`, footer })
        } else {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 300)
            ctx.strokeStyle = '#0f0'; ctx.lineWidth = 5; ctx.strokeRect(20, 20, 560, 260)
            ctx.fillStyle = '#0f0'; ctx.font = '30px Courier New'; ctx.textAlign = 'center'
            ctx.fillText('ENCRYPTED DOWNLOAD', 300, 120); ctx.fillText(item.nome, 300, 180)
            user.euro -= item.prezzo
            user.inventory[item.nome] = (user.inventory[item.nome] || 0) + 1
            if (id === "2") {
                let bonus = Math.floor(Math.random() * 1501) + 1000
                user.euro += bonus
                return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `💰 *MIXER BITCOIN:* Hai ripulito il denaro con successo! Guadagno netto: *${bonus}€*.`, footer })
            }
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `✅ *ORDINE COMPLETATO:* L'oggetto \`${item.nome}\` è ora nel tuo zaino.`, footer })
        }
    }

    // --- 2. COMANDO: HACKK (Rapina 20%, richiede EXPLOIT_KIT) ---
    if (command === 'hackk') {
        if (!user.inventory["EXPLOIT_KIT"] || user.inventory["EXPLOIT_KIT"] <= 0) return m.reply("🚫 *ACCESSO NEGATO:* Ti serve un `EXPLOIT_KIT`. Compralo nel `.darkweb`!")
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === who) return m.reply("🎯 Tagga la vittima dell'attacco!")
        let targetUser = global.db.data.users[target]
        if (!targetUser || targetUser.euro < 100) return m.reply("📉 La vittima è troppo povera per essere hackerata.")

        let rubati = Math.floor(targetUser.euro * 0.20)
        targetUser.euro -= rubati
        user.euro += rubati
        user.inventory["EXPLOIT_KIT"] -= 1

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 600, 300)
        ctx.fillStyle = '#0f0'; ctx.font = 'bold 30px Courier New'; ctx.textAlign = 'center'
        ctx.fillText('HACK SUCCESSFUL', 300, 100); ctx.fillText(`STOLEN: ${rubati}€`, 300, 180)
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `🏴‍☠️ *SISTEMA COMPROMESSO:* Hai rubato *${rubati}€* a @${target.split('@')[0]}!`, mentions: [target] })
    }

    // --- 3. COMANDO: REGALA/CEDI (SCAMBIO) ---
    if (command === 'regala') {
        let amount = parseInt(args[0])
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!amount || amount <= 0 || !target || target === who) return m.reply(`💸 *Uso:* \`${usedPrefix}regala 100 @tag\``)
        if (user.euro < amount) return m.reply("📉 Euro insufficienti.")
        user.euro -= amount
        global.db.data.users[target].euro = (global.db.data.users[target].euro || 0) + amount
        return m.reply(`💰 Hai inviato *${amount}€* a @${target.split('@')[0]}!`, null, { mentions: [target] })
    }

    if (command === 'cedi') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        let itemName = args.filter(a => !a.includes('@')).join('_').toUpperCase()
        if (!target || !itemName || !user.inventory[itemName]) return m.reply(`🎒 *Uso:* \`${usedPrefix}cedi NOME_OGGETTO @tag\``)
        user.inventory[itemName] -= 1
        global.db.data.users[target].inventory[itemName] = (global.db.data.users[target].inventory[itemName] || 0) + 1
        return m.reply(`📦 Hai passato *1x ${itemName}* a @${target.split('@')[0]}!`, null, { mentions: [target] })
    }

    // --- 4. COMANDO: ZAINO ---
    if (command === 'zaino' || command === 'inventario') {
        let inv = Object.keys(user.inventory).filter(i => user.inventory[i] > 0)
        let text = `⋆｡˚『 ╭ \`🎒 IL TUO ZAINO \` ╯ 』˚｡⋆\n╭\n│ 『 👤 』 \`User:\` @${who.split('@')[0]}\n│ 『 💰 』 \`Euro:\` *${user.euro}€*\n│ ──────────────────\n`
        inv.forEach(i => { text += `│ • ${i}: x${user.inventory[i]}\n` })
        if (inv.length === 0) text += `│  _Il tuo zaino è vuoto._\n`
        text += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        return m.reply(text, null, { mentions: [who] })
    }

    // ====================== COMANDI HACKING SIMULATO ======================
    let target = mentionedJid?.[0] || m.quoted?.sender || m.quoted?.participant || null

    // .ANON (messaggio anonimo)
    if (command === 'anon') {
        const msg = m.text.split(' ').slice(1).join(' ')
        if (!msg) return conn.reply(m.chat, "❯ `.anon scrivi qui il messaggio`", m)
        await conn.sendMessage(m.chat, { text: `🕶️ *Instradando attraverso 9 nodi TOR...*` })
        await delay(2800)
        await conn.sendMessage(m.chat, { text: `🌑 *MESSAGGIO DAL LIVELLO VII DEL DARKWEB*\n\n"${msg}"\n\n— Ombra Sconosciuta • Livello VII` })
        return
    }

    // Verifica target per i comandi con target
    if (['hacksim', 'breach', 'blackmail', 'phish', 'ransomware', 'deepfake', 'reputation'].includes(command)) {
        const isHackSim = command === 'hacksim'
        if (!target && !isHackSim) {
            return conn.reply(m.chat, "❯ Tagga una persona oppure rispondi ad un messaggio.", m)
        }
        const name = target ? `@${target.split('@')[0]}` : ""
        const mentions = target ? [target] : []

        // .HACKSIM
        if (command === 'hacksim') {
            await conn.sendMessage(m.chat, { text: `🌐 *Stabilizzando connessione attraverso 12 proxy quantici...*` })
            await delay(1800)
            await conn.sendMessage(m.chat, { text: `🔓 *Bypassando firewall di primo livello...* [▓▓▓▓▓░░░░░] 48%` })
            await delay(2000)
            await conn.sendMessage(m.chat, { text: `🕸️ *Penetrando nel kernel del dispositivo target...*` })
            await delay(2300)
            await conn.sendMessage(m.chat, { text: `📡 *Estraendo dati dalla memoria cache e cronologia...*` })
            await delay(2800)
            await conn.sendMessage(m.chat, { text: `🌑 *HACK CONCLUSO CON SUCCESSO*\n\n${name}, abbiamo scoperto dati compromettenti nel tuo dispositivo.\n🜁 Tutte le tracce sono state cancellate dal sistema.`, mentions })
            return
        }

        // .BREACH
        if (command === 'breach') {
            await conn.sendMessage(m.chat, { text: `☢️ *Iniziando Data Breach su vasta scala...*` })
            await delay(2300)
            await conn.sendMessage(m.chat, { text: `🗄️ *Accedendo ai backup cloud e server secondari...*` })
            await delay(2500)
            await conn.sendMessage(m.chat, { text: `📂 *Estraendo messaggi, foto, note vocali e cronologia...*` })
            await delay(3000)
            await conn.sendMessage(m.chat, { text: `💥 *DATA BREACH COMPLETATO*\n\n${name}, abbiamo estratto migliaia di messaggi.\nRisulta che ha conversazioni che credeva cancellate.\n🜁 Il Darkweb ora possiede questi dati.`, mentions })
            return
        }

        // .BLACKMAIL
        if (command === 'blackmail') {
            await conn.sendMessage(m.chat, { text: `🖤 *Raccolta di leverage compromettente in corso...*` })
            await delay(2800)
            await conn.sendMessage(m.chat, { text: `💀 *BLACKMAIL PROTOCOL READY*\n\n${name}, abbiamo materiale sufficiente.\nScreenshot, messaggi privati, ricerche imbarazzanti.\nVuoi davvero che venga reso pubblico?`, mentions })
            return
        }

        // .PHISH
        if (command === 'phish') {
            await conn.sendMessage(m.chat, { text: `🎣 *Preparando attacco di Phishing personalizzato...*` })
            await delay(2500)
            await conn.sendMessage(m.chat, { text: `🪝 *PHISHING COMPLETATO*\n\n${name} ha cliccato sul link e inserito le credenziali.\nAccesso a tutti gli account acquisito.`, mentions })
            return
        }

        // .RANSOMWARE
        if (command === 'ransomware') {
            await conn.sendMessage(m.chat, { text: `🔒 *Distribuendo Ransomware crittografato...*` })
            await delay(2600)
            await conn.sendMessage(m.chat, { text: `💰 *RANSOMWARE ATTIVATO*\n\nTutti i file di ${name} sono stati crittografati.\nPagamento richiesto in Monero entro 48 ore.`, mentions })
            return
        }

        // .DEEPFAKE
        if (command === 'deepfake') {
            await conn.sendMessage(m.chat, { text: `🎥 *Generando modello facciale IA...*` })
            await delay(2200)
            await conn.sendMessage(m.chat, { text: `🧠 *Addestrando voce e movimenti...*` })
            await delay(3000)
            await conn.sendMessage(m.chat, { text: `🌀 *DEEPFAKE GENERATO*\n\nVideo compromettente di ${name} creato.\nSembra assolutamente reale.`, mentions })
            return
        }

        // .REPUTATION
        if (command === 'reputation') {
            await conn.sendMessage(m.chat, { text: `📊 *Analizzando reputazione nel Deep Web...*` })
            await delay(2400)
            await conn.sendMessage(m.chat, { text: `🜁 *REPUTATION REPORT*\n\n${name} è percepito come persona instabile.\nRischio sociale: Alto\nConsigliato: stare lontani.`, mentions })
            return
        }
    }
}

handler.help = ['darkweb', 'dw']
handler.tags = ['giochi']
handler.command = /^(darkweb|dw|darkwebb|negozio|buy|hackk|regala|cedi|zaino|inventario|hacksim|breach|blackmail|phish|ransomware|deepfake|reputation|anon)$/i
handler.group = true
handler.register = false

export default handler
