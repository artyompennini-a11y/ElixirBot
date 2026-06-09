// Plug-in creato da elixir

const footer = '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃'

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

    // --- 0. MENU DARKWEB PRINCIPALE ---
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
        help += `│ \`${usedPrefix}breach @tag
