// Notifica Automatica "Latitante più Ricercato" - Ogni 24 ore
// Separato da euro-bounty.js per evitare conflitti di struttura

let handler = m => m

handler.all = async function (m, { conn }) {
    try {
        if (m.fromMe) return
        if (!m.sender) return

        let user = global.db.data.users[m.sender]
        if (!user) return

        if (typeof user.bounty === 'undefined') user.bounty = 0
        if (typeof user.lastBountyAlert === 'undefined') user.lastBountyAlert = 0

        // Se l'utente non ha taglia, salta
        if (user.bounty <= 0) return

        // Controlla se la taglia è >= 150.000
        if (user.bounty < 150000) return

        // Verifica se questo utente è quello con la taglia più alta
        let allUsers = global.db.data.users
        let topBounty = 0
        let topUserId = null

        for (let userId in allUsers) {
            let u = allUsers[userId]
            if (u && u.bounty && u.bounty > topBounty) {
                topBounty = u.bounty
                topUserId = userId
            }
        }

        // Se l'utente che ha scritto NON è il numero 1, salta
        if (topUserId !== m.sender) return

        // Controllo anti-spam: 24 ore dall'ultima notifica
        let now = Date.now()
        if (user.lastBountyAlert && (now - user.lastBountyAlert) < 86400000) return

        // Invia la notifica
        await conn.sendMessage(m.chat, {
            text: '🚨 *ATTENZIONE!*\n\nIl ricercato numero uno del server, *@' + m.sender.split('@')[0] + '*, è appena entrato in chat!\nLa sua taglia attuale è di *' + user.bounty.toLocaleString() + ' Euro*!\n\nCacciatori, all\'attacco! 🎯',
            mentions: [m.sender]
        })

        // Aggiorna il timestamp dell'ultimo avviso
        user.lastBountyAlert = now
    } catch (e) {
        console.error('[BOUNTY ALERT] Errore:', e)
    }
}

export default handler
