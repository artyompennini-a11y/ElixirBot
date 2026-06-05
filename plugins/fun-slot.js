// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import { createCanvas, loadImage } from 'canvas'

const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f352.png',
    '🍋': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f34b.png',
    '🍉': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f349.png',
    '🍇': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f347.png',
    '🍎': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f34e.png',
    '🍓': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

const carteValori = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':10,'Q':10,'K':10,'A':11 }
const semi = ['♠', '♥', '♦', '♣']
const ranghi = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const mazzoBuild = () => {
    let m = []
    for (let s of semi) for (let r of ranghi) m.push({ r, s, v: carteValori[r] })
    return m
}
const calcolaPunteggio = (mano) => {
    let tot = mano.reduce((a,c) => a + c.v, 0)
    let assi = mano.filter(c => c.r === 'A').length
    while (tot > 21 && assi > 0) { tot -= 10; assi-- }
    return tot
}
const manoToString = (mano, nascondiPrima = false) => {
    if (nascondiPrima) return `[?] ${mano.slice(1).map(c => `${c.r}${c.s}`).join(' ')}`
    return mano.map(c => `${c.r}${c.s}`).join(' ')
}

const cittaItaliane = ['Roma','Milano','Napoli','Torino','Palermo','Genova','Firenze','Bologna','Venezia','Catania','Bari','Verona','Trieste','Pescara','Cagliari']
const providerISP = ['TIM SpA','Vodafone Italia','Wind Tre S.p.A','Fastweb S.p.A','Iliad Italia','Tiscali Italia','Eolo S.p.A','BT Italia']
const sistemiOp = ['Windows 11 Pro','macOS Sonoma 14.5','Ubuntu 24.04 LTS','Android 14','iOS 17.5']
const browserUA = ['Chrome 125.0.6422.60','Safari 17.5','Firefox 127.0','Edge 125.0.2535.51']

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 1000
    if (user.level === undefined) user.level = 1

    const checkMoney = (costo) => {
        if (user.euro < costo) {
            m.reply(`⚠️ Non hai abbastanza Euro! Ti servono ${costo}€ (Saldo: ${user.euro}€)`)
            return false
        }
        return true
    }

    if (!global.cooldownGames) global.cooldownGames = {}
    const checkCooldown = (tipo, durata) => {
        const key = `${m.sender}:${tipo}`
        const now = Date.now()
        if (global.cooldownGames[key] && now < global.cooldownGames[key]) {
            const rimanente = Math.ceil((global.cooldownGames[key] - now) / 1000)
            m.reply(`⏳ *Cooldown:* aspetta ${rimanente} secondi per usare \`${tipo}\` di nuovo.`)
            return false
        }
        global.cooldownGames[key] = now + durata
        return true
    }

    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ DI ELIXIR 🎰*\n\n*💰 SALDO:* *${user.euro}€*  |  *⭐ LIVELLO:* ${user.level}`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA&VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nPunta un importo (min 50€).\n• 3 uguali = X3\n• 2 uguali = X1.5\n• Nessuno = perdi tutto\n\nEs: *${usedPrefix}slot 100*`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 GIRA' }, type: 1 }] })
    if (command === 'infobj') return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nPunta un importo (min 50€).\nAvvicinati a 21 senza superarlo!\n• \`carta\` = pesca\n• \`stai\` = fermati\n\nEs: *${usedPrefix}bj 100*`, buttons: [{ buttonId: `${usedPrefix}bj`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    if (command === 'infogratta') return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA & VINCI*\nCosto: 200€! Puoi vincere fino a 5000€!`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA' }, type: 1 }] })
    if (command === 'inforoulette') return conn.sendMessage(m.chat, { text: `*🎡 ROULETTE*\nScegli su cosa puntare (100€):`, buttons: [{ buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: 'PARI' }, type: 1 }, { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: 'DISPARI' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ SFIDA AI RIGORI*\nScegli l'angolo del tiro (100€):`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA CAVALLI*\nPunta 100€ sul vincitore (Paga X3):`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.nome}` }, type: 1 })) })

    if (command === 'slot') {
        const puntata = parseInt(args[0]) || 100
        if (puntata < 50) return m.reply(`⚠️ Puntata minima: 50€. Es: *${usedPrefix}slot 100*`)
        if (!checkMoney(puntata)) return
        if (!checkCooldown('slot', 20000)) return

        let key = await m.reply('🎰 *Girando i rulli...*')
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        
        for (let g = 0; g < 4; g++) {
            r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
            await conn.sendMessage(m.chat, { text: `🎰 ┃ *SLOT ELIXIR*\n   ───────────\n     ${r[0]} │ ${r[1]} │ ${r[2]}\n   ───────────`, edit: key })
            await new Promise(resolve => setTimeout(resolve, 800))
        }

        let premio = 0
        let risultato = ''
        if (r[0] === r[1] && r[1] === r[2]) {
            premio = puntata * 3
            risultato = '*💰 JACKPOT!* 3 uguali!'
        } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
            premio = Math.floor(puntata * 1.5)
            risultato = '*🔮 COPPIA!* Quasi jackpot!'
        } else {
            premio = -puntata
            risultato = '*💸 NIENTE!* Ritenta!'
        }
        user.euro += premio

        const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'
        ctx.fillText('🎰 ELIXIR SLOT 🎰', 300, 40)
        try {
            const i1 = await loadImage(fruitURLs[r[0]]), i2 = await loadImage(fruitURLs[r[1]]), i3 = await loadImage(fruitURLs[r[2]])
            ctx.drawImage(i1, 100, 70, 100, 100); ctx.drawImage(i2, 250, 70, 100, 100); ctx.drawImage(i3, 400, 70, 100, 100)
        } catch (e) {}
        ctx.fillStyle = premio > 0 ? '#4dff88' : '#ff4d4d'
        ctx.font = 'bold 24px Arial'; ctx.fillText(`${premio > 0 ? '+'+premio : premio}€`, 300, 210)
        ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.fillText(`Saldo: ${user.euro}€`, 300, 240)

        const buttons = [{ buttonId: `${usedPrefix}slot 100`, buttonText: { displayText: '🎰 100€' }, type: 1 }, { buttonId: `${usedPrefix}slot 200`, buttonText: { displayText: '🎰 200€' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${risultato}\n*👛 SALDO:* ${user.euro}€`, buttons })
    }

    if (command === 'bj' || command === 'blackjack') {
        const puntata = parseInt(args[0]) || 100
        if (puntata < 50) return m.reply(`⚠️ Puntata minima: 50€. Es: *${usedPrefix}bj 100*`)
        if (!checkMoney(puntata)) return
        if (!checkCooldown('blackjack', 20000)) return

        user.euro -= puntata

        let mazzo = mazzoBuild()
        function pesca() {
            const idx = Math.floor(Math.random() * mazzo.length)
            return mazzo.splice(idx, 1)[0]
        }
        let manoGiocatore = [pesca(), pesca()]
        let manoBanco = [pesca(), pesca()]
        let pGiocatore = calcolaPunteggio(manoGiocatore)
        let pBanco = calcolaPunteggio(manoBanco)

        if (pGiocatore === 21) {
            const premio = Math.floor(puntata * 2.5)
            user.euro += puntata + premio
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
            ctx.fillStyle = '#d4af37'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
            ctx.fillText('🃏 BLACKJACK!', 300, 80)
            ctx.fillStyle = '#fff'; ctx.font = '24px Arial'
            ctx.fillText(`TU: ${manoToString(manoGiocatore)} = ${pGiocatore}`, 300, 150)
            ctx.fillText(`BANCO: ${manoToString(manoBanco)} = ${pBanco}`, 300, 200)
            ctx.fillStyle = '#4dff88'; ctx.font = 'bold 28px Arial'; ctx.fillText(`VINTO: +${premio}€`, 300, 260)
            const buttons = [{ buttonId: `${usedPrefix}bj 100`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🃏 BLACKJACK!* +${premio}€\n*👛 SALDO:* ${user.euro}€`, buttons })
        }

        if (pBanco === 21) {
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
            ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
            ctx.fillText('IL BANCO HA BLACKJACK!', 300, 80)
            ctx.fillStyle = '#fff'; ctx.font = '24px Arial'
            ctx.fillText(`TU: ${manoToString(manoGiocatore)} = ${pGiocatore}`, 300, 150)
            ctx.fillText(`BANCO: ${manoToString(manoBanco)} = ${pBanco}`, 300, 200)
            ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 28px Arial'; ctx.fillText(`PERSO: -${puntata}€`, 300, 260)
            const buttons = [{ buttonId: `${usedPrefix}bj 100`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🃏 BLACKJACK* Perso -${puntata}€\n*👛 SALDO:* ${user.euro}€`, buttons })
        }

        let gameState = {
            chat: m.chat,
            sender: m.sender,
            mazzo, manoGiocatore, manoBanco,
            puntata, inCorso: true
        }
        if (!global.blackjackGames) global.blackjackGames = {}
        global.blackjackGames[m.chat + ':' + m.sender] = gameState

        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0d2818'; ctx.fillRect(0,0,600,400)
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
        ctx.fillText('🃏 BLACKJACK ELIXIR 🃏', 300, 40)

        ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 20px Arial'; ctx.fillText('BANCO', 300, 80)
        ctx.fillStyle = '#fff'; ctx.font = '18px Arial'
        ctx.fillText(`${manoToString(manoBanco, true)}`, 300, 110)
        ctx.fillText(`=?`, 300, 140)

        ctx.fillStyle = '#4dff88'; ctx.font = 'bold 20px Arial'; ctx.fillText(`TU (${m.pushName || '?'})`, 300, 190)
        ctx.fillStyle = '#fff'; ctx.font = '18px Arial'
        ctx.fillText(`${manoToString(manoGiocatore)}`, 300, 220)
        ctx.fillText(`=${pGiocatore}`, 300, 250)

        ctx.fillStyle = '#FFD700'; ctx.font = '18px Arial'; ctx.fillText(`Puntata: ${puntata}€`, 300, 290)
        ctx.fillStyle = '#aaa'; ctx.font = '16px Arial'; ctx.fillText(`\`carta\` o \`stai\``, 300, 330)

        const buttons = [
            { buttonId: `${usedPrefix}carta`, buttonText: { displayText: '📥 CARTA' }, type: 1 },
            { buttonId: `${usedPrefix}stai`, buttonText: { displayText: '✋ STAI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🃏 BLACKJACK*\nTu: ${pGiocatore} | Banco: ?\nScegli: \`carta\` o \`stai\``, buttons })
    }

    if (command === 'carta' || command === 'stai') {
        const gameKey = m.chat + ':' + m.sender
        const game = global.blackjackGames?.[gameKey]
        if (!game || !game.inCorso) return m.reply('❌ Nessuna partita di Blackjack in corso. Usa *.bj [puntata]*')

        if (command === 'carta') {
            const carta = game.mazzo.splice(Math.floor(Math.random() * game.mazzo.length), 1)[0]
            game.manoGiocatore.push(carta)
            const pGiocatore = calcolaPunteggio(game.manoGiocatore)

            if (pGiocatore > 21) {

                game.inCorso = false
                delete global.blackjackGames[gameKey]
                const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
                ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
                ctx.fillText('💥 SBALLATO!', 300, 80)
                ctx.fillStyle = '#fff'; ctx.font = '22px Arial'
                ctx.fillText(`TU: ${manoToString(game.manoGiocatore)} = ${pGiocatore}`, 300, 150)
                ctx.fillText(`BANCO: ${manoToString(game.manoBanco)} = ${calcolaPunteggio(game.manoBanco)}`, 300, 200)
                ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 28px Arial'; ctx.fillText(`PERSO: -${game.puntata}€`, 300, 260)
                const buttons = [{ buttonId: `${usedPrefix}bj 100`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
                return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*💥 SBALLATO!* Perso -${game.puntata}€\n*👛 SALDO:* ${user.euro}€`, buttons })
            }

            if (pGiocatore === 21) {

                game.inCorso = false
                delete global.blackjackGames[gameKey]
                const premio = Math.floor(game.puntata * 2)
                user.euro += game.puntata + premio
                const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
                ctx.fillStyle = '#d4af37'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
                ctx.fillText('🎉 21! VITTORIA!', 300, 80)
                ctx.fillStyle = '#fff'; ctx.font = '22px Arial'
                ctx.fillText(`TU: ${manoToString(game.manoGiocatore)} = ${pGiocatore}`, 300, 150)
                ctx.fillText(`BANCO: ${manoToString(game.manoBanco)} = ${calcolaPunteggio(game.manoBanco)}`, 300, 200)
                ctx.fillStyle = '#4dff88'; ctx.font = 'bold 28px Arial'; ctx.fillText(`VINTO: +${premio}€`, 300, 260)
                return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🎉 21!* +${premio}€\n*👛 SALDO:* ${user.euro}€` })
            }

            let pBanco = calcolaPunteggio(game.manoBanco)
            while (pBanco < 17) {
                const c = game.mazzo.splice(Math.floor(Math.random() * game.mazzo.length), 1)[0]
                game.manoBanco.push(c)
                pBanco = calcolaPunteggio(game.manoBanco)
            }

            if (pBanco > 21) {
                game.inCorso = false
                delete global.blackjackGames[gameKey]
                const premio = Math.floor(game.puntata * 2)
                user.euro += game.puntata + premio
                const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
                ctx.fillStyle = '#4dff88'; ctx.font = 'bold 35px Arial'; ctx.textAlign = 'center'
                ctx.fillText('🔥 IL BANCO SBALLA!', 300, 80)
                ctx.fillStyle = '#fff'; ctx.font = '22px Arial'
                ctx.fillText(`TU: ${manoToString(game.manoGiocatore)} = ${pGiocatore}`, 300, 150)
                ctx.fillText(`BANCO: ${manoToString(game.manoBanco)} = ${pBanco}`, 300, 200)
                ctx.fillStyle = '#4dff88'; ctx.font = 'bold 28px Arial'; ctx.fillText(`VINTO: +${premio}€`, 300, 260)
                return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🔥 IL BANCO SBALLA!* +${premio}€\n*👛 SALDO:* ${user.euro}€` })
            }

            const win = pGiocatore > pBanco
            game.inCorso = false
            delete global.blackjackGames[gameKey]
            if (win) {
                const premio = Math.floor(game.puntata * 2)
                user.euro += game.puntata + premio
            }
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
            ctx.fillStyle = win ? '#4dff88' : '#ff4d4d'
            ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
            ctx.fillText(win ? '🏆 VITTORIA!' : '😔 SCONFITTA', 300, 80)
            ctx.fillStyle = '#fff'; ctx.font = '22px Arial'
            ctx.fillText(`TU: ${manoToString(game.manoGiocatore)} = ${pGiocatore}`, 300, 150)
            ctx.fillText(`BANCO: ${manoToString(game.manoBanco)} = ${pBanco}`, 300, 200)
            ctx.fillStyle = win ? '#4dff88' : '#ff6b6b'
            ctx.font = 'bold 28px Arial'
            ctx.fillText(win ? `VINTO: +${Math.floor(game.puntata * 2)}€` : `PERSO: -${game.puntata}€`, 300, 260)
            const buttons = [{ buttonId: `${usedPrefix}bj 100`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${win ? '🏆 VITTORIA!' : '😔 SCONFITTA'}\n*👛 SALDO:* ${user.euro}€`, buttons })
        }

        if (command === 'stai') {
            let pGiocatore = calcolaPunteggio(game.manoGiocatore)
            let pBanco = calcolaPunteggio(game.manoBanco)

            while (pBanco < 17) {
                const c = game.mazzo.splice(Math.floor(Math.random() * game.mazzo.length), 1)[0]
                game.manoBanco.push(c)
                pBanco = calcolaPunteggio(game.manoBanco)
            }

            let premio = 0
            let win = false
            if (pBanco > 21 || pGiocatore > pBanco) { win = true; premio = Math.floor(game.puntata * 2); user.euro += game.puntata + premio }

            game.inCorso = false
            delete global.blackjackGames[gameKey]

            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
            ctx.fillStyle = win ? '#4dff88' : '#ff4d4d'
            ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
            ctx.fillText(win ? '🏆 VITTORIA!' : '😔 SCONFITTA', 300, 80)
            ctx.fillStyle = '#fff'; ctx.font = '22px Arial'
            ctx.fillText(`TU: ${manoToString(game.manoGiocatore)} = ${pGiocatore}`, 300, 150)
            ctx.fillText(`BANCO: ${manoToString(game.manoBanco)} = ${pBanco}`, 300, 200)
            ctx.fillStyle = win ? '#4dff88' : '#ff6b6b'
            ctx.font = 'bold 28px Arial'
            ctx.fillText(win ? `VINTO: +${premio}€` : `PERSO: -${game.puntata}€`, 300, 260)
            const buttons = [{ buttonId: `${usedPrefix}bj 100`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${win ? '🏆 VITTORIA!' : '😔 SCONFITTA'}\n*👛 SALDO:* ${user.euro}€`, buttons })
        }
    }

    if (command === 'rigore') {
        if (!checkMoney(100)) return
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        let cambio = win ? 150 : -100
        user.euro += cambio
        
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 600, 350)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(100, 50, 400, 250)
        let pos = { sx: 160, cx: 300, dx: 440 }
        ctx.fillStyle = '#111'; ctx.fillRect(pos[parata]-40, 160, 80, 20)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pos[tiro] || 300, win ? 140 : 170, 15, 0, Math.PI*2); ctx.fill()
        
        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        let status = win ? `*⚽ GOOOL!*\n*💰 VINTO:* +150€` : `*🧤 PARATA!*\n*💸 PERSO:* -100€`
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${status}\n*👛 SALDO:* ${user.euro}€`, buttons })
    }

    if (command === 'puntacorsa') {
        if (!checkMoney(100)) return
        let vIdx = Math.floor(Math.random() * 4), win = args[0]?.toUpperCase() === cavalliConfig[vIdx].nome
        let cambio = win ? 200 : -100
        user.euro += cambio
        
        const canvas = createCanvas(700, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 0, 700, 400)
        for(let i=0; i<=4; i++) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, 50+(i*80)); ctx.lineTo(650, 50+(i*80)); ctx.stroke() }
        cavalliConfig.forEach((c, i) => {
            let xPos = (i === vIdx) ? 610 : Math.floor(Math.random() * 200) + 150
            ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(xPos, 90+(i*80), 25, 0, Math.PI*2); ctx.fill()
            ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.fillText(c.nome, 60, 95+(i*80))
        })
        
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        let status = win ? `*✅ HAI VINTO!*\n*💰 VINTO:* +200€` : `*❌ PERSO!*\nIl vincitore era il ${cavalliConfig[vIdx].nome}.\n*💸 PERSO:* -100€`
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${status}\n*👛 SALDO:* ${user.euro}€`, buttons })
    }

    if (command === 'playroulette') {
        if (!checkMoney(100)) return
        let n = Math.floor(Math.random() * 37), win = (args[0] === 'pari' && n % 2 === 0 && n !== 0) || (args[0] === 'dispari' && n % 2 !== 0)
        let cambio = win ? 100 : -100
        user.euro += cambio
        
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, 600, 400)
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(300, 180, 140, 0, Math.PI*2); ctx.stroke()
        ctx.fillStyle = n === 0 ? '#10b981' : (n % 2 === 0 ? '#e74c3c' : '#2c3e50')
        ctx.beginPath(); ctx.arc(300, 180, 60, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center'; ctx.fillText(n, 300, 200)
        
        const buttons = [{ buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        let status = win ? `*✅ VINTO!*\n*💰 VINTO:* +100€` : `*❌ PERSO!*\nUscito: ${n}.\n*💸 PERSO:* -100€`
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${status}\n*👛 SALDO:* ${user.euro}€`, buttons })
    }

    if (command === 'gratta') {
        if (!checkMoney(200)) return
        let premi = [0, 0, 500, 0, 1000, 0, 5000]
        let v = premi[Math.floor(Math.random() * premi.length)]
        let cambio = v - 200
        user.euro += cambio
        
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#d4af37'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#000'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText(v > 0 ? `VINTO ${v}€!` : 'NON HAI VINTO', 300, 160)
        
        const buttons = [{ buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        let status = v > 0 ? `*🎟️ GRATTA & VINCI*\n*💰 VINCITA NETTA:* +${cambio}€` : `*🎟️ GRATTA & VINCI*\n*💸 PERSO:* -200€`
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${status}\n*👛 SALDO ATTUALE:* ${user.euro}€`, buttons })
    }
}

handler.help = ['casino']
handler.tags = ['giochi']
handler.command = /^(casino|infoslot|infobj|infogratta|inforoulette|inforigore|infocorsa|slot|blackjack|blakjak|bj|gratta|playroulette|rigore|puntacorsa|carta|stai)$/i
handler.group = true

export default handler
