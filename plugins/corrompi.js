// Plug-in creato da elixir
let handler = async (m, { conn, usedPrefix, command, args }) => {
    let user = global.db.data.users[m.sender]
    let now = Date.now()
    
    if (command === 'corrompi') {
        if (user.money < 5000) return m.reply("❌ Non hai abbastanza contanti per corrompere nessuno. Servono almeno *5.000 🪙*.")
        if (user.corrotto && now < user.corrottoExp) {
            let remain = Math.ceil((user.corrottoExp - now) / 3600000)
            return m.reply(`🕵️ Sei già protetto per altre *${remain} ore*. Non dare troppo nell'occhio.`)
        }

        let costo = 5000
        user.money -= costo
        
        let success = Math.random() > 0.4
        if (success) {
            user.corrotto = true
            user.corrottoExp = now + 86400000
            
            let ok = `💼 *ACCORDO SOTTOBANCO*\n`
            ok += `━━━━━━━━━━━━━━━━━━━━\n\n`
            ok += `La mazzetta è stata accettata. Per le prossime *24 ore*:\n`
            ok += `✅ Nessun pignoramento sui tuoi beni.\n`
            ok += `✅ Immunità dalle multe negli imprevisti.\n\n`
            ok += `_Usa questo tempo con saggezza._`
            return m.reply(ok)
        } else {
            let multa = 10000
            user.money -= multa
            let fail = `⚖️ *TENTATIVO DI CORRUZIONE FALLITO*\n`
            fail += `━━━━━━━━━━━━━━━━━━━━\n\n`
            fail += `L'ufficiale è onesto e ha fatto rapporto.\n`
            fail += `📉 Penale pagata: -${multa.toLocaleString()} 🪙\n`
            fail += `⚠️ La tua reputazione è crollata.`
            return m.reply(fail)
        }
    }
}

handler.help = ['corrompi']
handler.tags = ['economy']
handler.command = /^(corrompi)$/i

export default handler
