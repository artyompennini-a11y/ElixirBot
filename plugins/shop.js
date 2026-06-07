// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.properties) user.properties = []
    if (!user.vehicles) user.vehicles = []

    const items = {
        case: {
            monolocale: { name: 'Monolocale City', price: 30000, rent: 300, tax: 50 },
            bilocale: { name: 'Bilocale Moderno', price: 65000, rent: 700, tax: 120 },
            attico: { name: 'Attico Panoramico', price: 150000, rent: 1800, tax: 350 },
            chalet: { name: 'Chalet in Montagna', price: 250000, rent: 2500, tax: 500 },
            rustico: { name: 'Rustico in Campagna', price: 110000, rent: 1200, tax: 200 }
        },
        ville: {
            schiera: { name: 'Villa a Schiera', price: 450000, rent: 5000, tax: 1000 },
            piscina: { name: 'Villa con Piscina', price: 850000, rent: 9500, tax: 2000 },
            mediterranea: { name: 'Villa Mediterranea', price: 1500000, rent: 18000, tax: 4000 },
            mansion: { name: 'Mansion Hollywood', price: 5000000, rent: 60000, tax: 12000 },
            moderna: { name: 'Villa Ultra-Moderna', price: 12000000, rent: 150000, tax: 35000 },
            castello: { name: 'Castello Reale', price: 50000000, rent: 600000, tax: 100000 }
        },
        veicoli: {
            utilitaria: { name: 'Fiat 500', price: 15000, maintenance: 150 },
            berlina: { name: 'Tesla Model 3', price: 55000, maintenance: 300 },
            suv: { name: 'Lamborghini Urus', price: 220000, maintenance: 1500 },
            sportiva: { name: 'Ferrari SF90', price: 450000, maintenance: 3000 },
            hypercar: { name: 'Bugatti Chiron', price: 3000000, maintenance: 25000 },
            elicottero: { name: 'Elicottero Robinson', price: 1200000, maintenance: 10000 },
            jet: { name: 'Private Jet Luxury', price: 25000000, maintenance: 150000 },
            yacht: { name: 'Yacht 40 Metri', price: 15000000, maintenance: 80000 }
        },
        business: {
            chiosco: { name: 'Chiosco Spiaggia', price: 25000, income: 800, tax: 100 },
            bar: { name: 'Caffetteria Centro', price: 80000, income: 2500, tax: 500 },
            palestra: { name: 'Gold Gym', price: 200000, income: 7000, tax: 1500 },
            concessionaria: { name: 'Auto Luxury Dealer', price: 1500000, income: 45000, tax: 8000 },
            centro: { name: 'Centro Commerciale', price: 10000000, income: 350000, tax: 60000 },
            banca: { name: 'Banca Privata', price: 100000000, income: 4000000, tax: 500000 }
        }
    }

    let category = args[0]?.toLowerCase()
    let itemKey = args[1]?.toLowerCase()

    if (!items[category]) {
        let msg = `💎 *THE PUNISHER LUXURY SHOP*\n`
        msg += `━━━━━━━━━━━━━━━━━━━━\n\n`
        msg += `🏙️ \`${usedPrefix + command} case\`\n`
        msg += `🏰 \`${usedPrefix + command} ville\`\n`
        msg += `🏎️ \`${usedPrefix + command} veicoli\`\n`
        msg += `🏢 \`${usedPrefix + command} business\`\n\n`
        msg += `✨ *Scegli la tua prossima conquista.*`
        return m.reply(msg)
    }

    if (!itemKey) {
        let list = `📂 *LISTINO ${category.toUpperCase()}*\n`
        list += `━━━━━━━━━━━━━━━━━━━━\n\n`
        for (let key in items[category]) {
            let itm = items[category][key]
            list += `【 *${itm.name.toUpperCase()}* 】\n`
            list += `ID: \`${key}\`\n`
            list += `💰 Prezzo: *${itm.price.toLocaleString()}* 🪙\n`
            if (itm.rent) list += `🏠 Affitto: +${itm.rent.toLocaleString()} 🪙\n`
            if (itm.income) list += `📈 Rendita: +${itm.income.toLocaleString()} 🪙\n`
            list += `────────────────────\n`
        }
        list += `\n🛒 *Acquista:* \`${usedPrefix + command} ${category} <id>\``
        return m.reply(list)
    }

    let item = items[category][itemKey]
    if (!item) return m.reply('❌ Articolo non disponibile.')
    
    let count = [...user.properties, ...user.vehicles].filter(i => i.key === itemKey).length
    if (count >= 100) return m.reply(`🚫 Hai raggiunto il limite massimo (100) per *${item.name}*.`)

    if (user.money < item.price) return m.reply(`⚠️ *Fondi insufficienti!*\nTi mancano: ${(item.price - user.money).toLocaleString()} 🪙`)

    user.money -= item.price
    let dataToSave = { ...item, key: itemKey, category, boughtAt: Date.now(), level: 1 }

    if (['case', 'ville', 'business'].includes(category)) {
        user.properties.push(dataToSave)
    } else {
        user.vehicles.push(dataToSave)
    }

    m.reply(`✨ *ACQUISTO COMPLETATO*\n━━━━━━━━━━━━━━━\n\nHai ottenuto: *${item.name}*\nPosseduti: ${count + 1}/100\n\n_Visualizza il tuo impero con .assets_`)
}

handler.help = ['shop <categoria> <id>']
handler.tags = ['economy']
handler.command = /^(shop|buy)$/i

export default handler
