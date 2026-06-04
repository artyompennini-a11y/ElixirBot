// Plug-in creato da elixir
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    // Inizializzazione profili se non esistono
    if (!user.profile) user.profile = { description: '', city: '', birthday: '', occupation: '' }
    if (!user.properties) user.properties = []

    let name = await conn.getName(m.sender)
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://ibb.co')
    let phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international')

    // Logica Calcolo Patrimonio
    let propVal = user.properties.reduce((acc, p) => acc + (p.price || 0), 0)
    let vehVal = (user.vehicles || []).reduce((acc, v) => acc + (v.price || 0), 0)
    let totalWealth = (user.money || 0) + (user.bank || 0) + propVal + vehVal

    // Trova Famiglia e controllo Padrino
    if (!global.db.data.gangs) global.db.data.gangs = {}
    let userGang = Object.keys(global.db.data.gangs).find(name => global.db.data.gangs[name].members.includes(m.sender)) || 'Nessuna'
    let isDon = userGang !== 'Nessuna' && global.db.data.gangs[userGang].don === m.sender

    // Se l'utente è il Don, la professione diventa Padrino
    let professione = isDon ? 'Padrino' : (user.job || 'Disoccupato')

    // Trova Residenza (la casa più costosa)
    let mainHome = user.properties.length > 0 
        ? [...user.properties].sort((a, b) => b.price - a.price)[0].name 
        : 'Senza fissa dimora'

    let str = `
💳 *CARTA D'IDENTITÀ VIRTUAL*
━━━━━━━━━━━━━━━━━━━━
👤 *Nome:* ${name}
📞 *Contatto:* ${phone}
🎂 *Nato il:* ${user.profile.birthday || 'Non impostato'}
🏙️ *Città:* ${user.profile.city || 'Non impostata'}

💰 *STATO ECONOMICO*
━━━━━━━━━━━━━━━━━━━━
💼 *Professione:* ${professione}
📈 *Grado:* Livello ${Math.floor((user.workExp || 0) / 10)}
🌹 *Famiglia:* ${userGang}
🏠 *Residenza:* ${mainHome}
💸 *Patrimonio:* ${totalWealth.toLocaleString()} 🪙

📝 *Bio:* _${user.profile.description || 'Nessuna descrizione impostata.'}_
━━━━━━━━━━━━━━━━━━━━
💡 _Usa ${usedPrefix}setdesc, ${usedPrefix}setcitta o ${usedPrefix}setcompleanno per modificare i tuoi dati._`.trim()

    await conn.sendMessage(m.chat, {
        text: str,
        contextInfo: {
            externalAdReply: {
                title: `DOCUMENTO DI: ${name.toUpperCase()}`,
                body: `Patrimonio Totale: ${totalWealth.toLocaleString()} 🪙`,
                thumbnailUrl: pp,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['cartaidentita']
handler.tags = ['profilo']
handler.command = /^(cartaidentita|identita|idp)$/i

export default handler
