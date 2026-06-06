// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (typeof user.workExp === 'undefined') user.workExp = 0

    if (!global.db.data.gangs) global.db.data.gangs = {}
    let isPadrino = Object.values(global.db.data.gangs).some(g => g.don === m.sender)

    if (command === 'licenziati') {
        if (!user.job) return m.reply("❌ Non hai un impiego attivo da cui dimetterti.")
        if (isPadrino) return m.reply("🌹 Un Padrino non serve nessuno, comanda e basta.")
        
        user.job = null
        user.salary = 0
        user.workExp = 0
        return m.reply("✅ Hai rassegnato le dimissioni. Ora sei disoccupato.")
    }

    const lavori = {
        'chef': { nome: 'Chef Stellato', paga: 3000 },
        'pilota': { nome: 'Pilota di Linea', paga: 5000 },
        'manager': { nome: 'Manager Aziendale', paga: 4500 },
        'meccanico': { nome: 'Meccanico Specializzato', paga: 2000 },
        'impiegato': { nome: 'Impiegato Statale', paga: 1500 },
        'medico': { nome: 'Chirurgo', paga: 7000 },
        'avvocato': { nome: 'Avvocato Penalista', paga: 6000 },
        'programmatore': { nome: 'Sviluppatore Senior', paga: 4000 },
        'poliziotto': { nome: 'Agente di Polizia', paga: 1800 },
        'atleta': { nome: 'Calciatore Professionista', paga: 10000 },
        'astronauta': { nome: 'Astronauta', paga: 12000 },
        'youtuber': { nome: 'Content Creator', paga: 2500 },
        'agricoltore': { nome: 'Imprenditore Agricolo', paga: 2200 },
        'architetto': { nome: 'Architetto', paga: 3500 },
        'ladro': { nome: 'Ladro Professionista', paga: 1200 }
    }

    if (!args[0]) {
        if (isPadrino) return m.reply("👑 *STATUS: PADRINO*\nIl tuo impero non prevede capi ufficio. Gestisci la Famiglia.")
        
        if (!user.job) {
            let list = `💼 *OFFERTE DI LAVORO THE PUNISHER*\n`
            list += `━━━━━━━━━━━━━━━━━━━━\n\n`
            for (let k in lavori) {
                list += `  ▫️ \`${k}\` ➭ *${lavori[k].paga.toLocaleString()}* 🪙\n`
            }
            list += `\n✍️ *Candidati:* \`${usedPrefix + command} <nome-lavoro>\``
            return m.reply(list)
        }

        let lvl = Math.floor(user.workExp / 10)
        let bonus = 1 + (lvl * 0.05)
        let pagaNetta = Math.floor(user.salary * bonus)

        let status = `📊 *PROFILO PROFESSIONALE*\n`
        status += `━━━━━━━━━━━━━━━━━━━━\n\n`
        status += `👤 *Impiego:* ${user.job}\n`
        status += `📈 *Anzianità:* Lvl ${lvl}\n`
        status += `💰 *Salario Base:* ${user.salary.toLocaleString()} 🪙\n`
        status += `✨ *Bonus Carriera:* +${(lvl * 5)}%\n`
        status += `────────────────────\n`
        status += `💵 *Paga Prossima:* ${pagaNetta.toLocaleString()} 🪙\n\n`
        status += `👉 Usa \`${usedPrefix}licenziati\` per lasciare il posto.`
        return m.reply(status)
    }

    if (isPadrino) return m.reply("🚫 Padrino, firmare un contratto di lavoro distruggerebbe la sua reputazione.")
    
    let scelta = args[0].toLowerCase()
    if (!lavori[scelta]) return m.reply(`❌ Professione non disponibile nel mercato attuale.`)

    user.job = lavori[scelta].nome
    user.salary = lavori[scelta].paga
    user.workExp = 0 

    let ok = `📝 *CONTRATTO STIPULATO*\n`
    ok += `━━━━━━━━━━━━━━━━━━━━\n\n`
    ok += `Benvenuto nel team, ora sei un *${lavori[scelta].nome}*.\n`
    ok += `Il tuo stipendio base è di *${lavori[scelta].paga.toLocaleString()}* 🪙.\n\n`
    ok += `_Usa .riscuoti ogni 24 ore per ricevere la paga._`
    return m.reply(ok)
}

handler.help = ['job', 'licenziati']
handler.tags = ['economy']
handler.command = /^(job|jobs|licenziati)$/i

export default handler
