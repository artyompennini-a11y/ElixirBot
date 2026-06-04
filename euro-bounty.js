// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user) return m.reply('❌ *Errore:* Utente non trovato.')

    if (typeof user.bounty === 'undefined') user.bounty = 0
    if (typeof user.lastHunt === 'undefined') user.lastHunt = 0

    switch (command) {
        case 'taglia':
        case 'bounty': {
            let tagTarget = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
            if (!tagTarget) return m.reply('👤 *Usa:* `' + usedPrefix + 'taglia @utente <importo>`')

            if (tagTarget === m.sender) return m.reply('❌ Non puoi mettere una taglia su te stesso!')

            let tagAmount = parseInt(args.find(a => !a.includes('@')))
            if (!tagAmount || tagAmount <= 0) return m.reply('💰 *Usa:* `' + usedPrefix + 'taglia @utente <importo>`')

            if (user.euro < tagAmount) return m.reply('🚫 Non hai abbastanza Euro! Ti servono *' + tagAmount.toLocaleString() + ' 🪙*, ma hai solo *' + (user.euro || 0).toLocaleString() + ' 🪙*.')

            let tagTargetUser = global.db.data.users[tagTarget]
            if (!tagTargetUser) return m.reply('❌ Utente non trovato nel database.')
            if (typeof tagTargetUser.bounty === 'undefined') tagTargetUser.bounty = 0

            user.euro -= tagAmount
            tagTargetUser.bounty += tagAmount

            conn.sendMessage(m.chat, {
                text: '🕵️ *@' + m.sender.split('@')[0] + '* ha messo una taglia di *' + tagAmount.toLocaleString() + ' Euro* sulla testa di *@' + tagTarget.split('@')[0] + '*!\n\nLa sua taglia totale ora è di *' + tagTargetUser.bounty.toLocaleString() + ' Euro*! 💀',
                mentions: [m.sender, tagTarget]
            }, { quoted: m })
            break
        }

        case 'caccia':
        case 'hunt': {
            let huntTarget = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
            if (!huntTarget) return m.reply('👤 *Usa:* `' + usedPrefix + 'caccia @utente`')

            if (huntTarget === m.sender) return m.reply('❌ Non puoi dare la caccia a te stesso!')

            let huntTargetUser = global.db.data.users[huntTarget]
            if (!huntTargetUser) return m.reply('❌ Utente non trovato nel database.')
            if (typeof huntTargetUser.bounty === 'undefined') huntTargetUser.bounty = 0

            if (huntTargetUser.bounty <= 0) return m.reply('🚫 *@' + huntTarget.split('@')[0] + '* non ha alcuna taglia attiva. Questa persona non è ricercata! 🕊️', null, { mentions: [huntTarget] })

            let now = Date.now()
            if (user.lastHunt && (now - user.lastHunt) < 900000) {
                let remaining = Math.ceil((900000 - (now - user.lastHunt)) / 60000)
                return m.reply('⏳ Devi aspettare *' + remaining + ' minuto/i* prima di poter cacciare di nuovo!')
            }

            user.lastHunt = now

            let huntSuccess = Math.random() < 0.4
            let bountyAmount = huntTargetUser.bounty

            if (huntSuccess) {
                if (typeof user.euro === 'undefined') user.euro = 0
                user.euro += bountyAmount
                huntTargetUser.bounty = 0

                conn.sendMessage(m.chat, {
                    text: '💥 *Catturato!*\n\n🏃 @' + m.sender.split('@')[0] + '* ha preso *@' + huntTarget.split('@')[0] + '* e ha riscosso la taglia di *' + bountyAmount.toLocaleString() + ' Euro*! 🎯',
                    mentions: [m.sender, huntTarget]
                }, { quoted: m })
            } else {
                if (typeof user.euro === 'undefined') user.euro = 0
                user.euro = Math.max(0, user.euro - 50)

                conn.sendMessage(m.chat, {
                    text: '💨 *@' + huntTarget.split('@')[0] + '* è riuscito a sfuggire all\'inseguimento di *@' + m.sender.split('@')[0] + '*! Hai perso *50 Euro* in equipaggiamento. 😤',
                    mentions: [m.sender, huntTarget]
                }, { quoted: m })
            }
            break
        }

        case 'topricercati':
        case 'topbounty':
        case 'ricercati':
        case 'bountylist': {
            let allUsers = global.db.data.users
            let bountyList = []

            for (let userId in allUsers) {
                let u = allUsers[userId]
                if (u && u.bounty && u.bounty > 0) {
                    bountyList.push({ id: userId, bounty: u.bounty })
                }
            }

            if (bountyList.length === 0) {
                return m.reply('🕊️ *Nessun ricercato al momento. La città è tranquilla!*')
            }

            bountyList.sort((a, b) => b.bounty - a.bounty)

            let top = bountyList.slice(0, 10)
            let leaderboard = '╭━━━〔 🏆 *TOP RICERCATI* 〕━━━🌀\n┃\n'
            top.forEach((u, i) => {
                let rank = i + 1
                let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '👤'
                let name = u.id.split('@')[0]
                leaderboard += '┃  ' + medal + ' @' + name + ' - *' + u.bounty.toLocaleString() + ' Euro*\n'
            })
            leaderboard += '┃\n╰━━━━━━━━━━━━━━━━━━━━━━━🌀'

            let mentions = top.map(u => u.id)
            conn.sendMessage(m.chat, {
                text: leaderboard,
                mentions: mentions
            }, { quoted: m })
            break
        }

        case 'removetaglia':
        case 'cleartaglia':
        case 'removebounty': {
            let isOwner = m.fromMe || global.owner.some(([num]) => num + '@s.whatsapp.net' === m.sender)
            if (!isOwner) {
                return m.reply('🛡️ *ACCESSO NEGATO*\nSolo i proprietari del bot possono rimuovere taglie.')
            }

            let removeTarget = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
            if (!removeTarget) return m.reply('👤 *Usa:* `' + usedPrefix + 'removetaglia @utente`')

            let removeUser = global.db.data.users[removeTarget]
            if (!removeUser) return m.reply('❌ Utente non trovato nel database.')
            if (typeof removeUser.bounty === 'undefined' || removeUser.bounty === 0) {
                return m.reply('🚫 *@' + removeTarget.split('@')[0] + '* non ha alcuna taglia attiva.', null, { mentions: [removeTarget] })
            }

            let removedBounty = removeUser.bounty
            removeUser.bounty = 0

            conn.sendMessage(m.chat, {
                text: '✅ *Taglia rimossa con successo!*\n\n👤 @' + removeTarget.split('@')[0] + ' non è più ricercato.\n💰 Taglia rimossa: *' + removedBounty.toLocaleString() + ' Euro*',
                mentions: [removeTarget]
            }, { quoted: m })
            break
        }
    }
}

handler.help = ['taglia', 'caccia', 'topricercati', 'removetaglia']
handler.tags = ['economy']
handler.command = /^(taglia|bounty|caccia|hunt|topricercati|topbounty|ricercati|bountylist|removetaglia|cleartaglia|removebounty)$/i

export default handler
