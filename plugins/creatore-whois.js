// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
    try {
        await m.react('🔍')

        if (!m.isGroup) return m.reply('`[!] Comando utilizzabile solo nei gruppi.`')

        let targetJid = null

        if (m.quoted) {
            targetJid = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
        } else if (text) {
            let cleaned = text.replace(/[^0-9]/g, '')
            if (cleaned.length >= 8 && cleaned.length <= 15) {
                targetJid = cleaned + '@s.whatsapp.net'
            }
        }

        if (!targetJid) {
            return m.reply('`[!] Rispondi a un messaggio, tagga un utente o inserisci un numero.\n\nEsempio: .whois @tag`')
        }

        let phoneNumber = targetJid.split('@')[0]
        let userName = await conn.getName(targetJid)
        let localWarn = global.db.data.users[targetJid]?.warn || 0
        let whitelistStatus = global.db.data.chats[m.chat]?.whitelist?.includes(targetJid) || false
        let hasColon = targetJid.includes(':')
        let clientType = hasColon ? 'WhatsApp Web / Desktop' : 'Dispositivo Mobile (Android/iOS)'

        let device = 'Sconosciuto'
        let msgID = m.quoted?.id || m.quoted?.vM?.key?.id || m.quoted?.key?.id || ''

        if (msgID) {
            if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
                device = 'BOT_EMULATOR'
            } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
                device = 'WHATSAPP_WEB'
            } else if (msgID.startsWith('3EB0') && msgID.length > 12) {
                device = 'WEB/BOT_TERMINAL'
            } else if (msgID.startsWith('3EB0')) {
                device = 'ANDROID_OS (Low Tier)'
            } else if (msgID.includes(':')) {
                device = 'DESKTOP_CLIENT'
            } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
                device = 'ANDROID_OS'
            } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) {
                device = 'IOS_KERNEL (iPhone)'
            } else if (/^[A-Z0-9]{20,25}$/i.test(msgID)) {
                device = 'IOS_KERNEL (iPhone - High Tier)'
            }
        } else {
            device = hasColon ? '🖥️ DESKTOP / WEB_CLIENT' : '📱 MOBILE_OS (Android/iOS)'
        }

        let countryName = 'N/D'
        let carrier = 'N/D'
        let lineType = 'N/D'
        let apiOnline = false

        const apiKey = process.env.NUMLOOKUP_API_KEY

        if (apiKey) {
            try {
                let apiUrl = `https://numlookupapi.com{phoneNumber}?apikey=${apiKey}`
                let res = await fetch(apiUrl)
                if (res.ok) {
                    let json = await res.json()
                    if (json && json.data) {
                        countryName = json.data.country_name || 'N/D'
                        carrier = json.data.carrier || 'N/D'
                        lineType = json.data.line_type || 'N/D'
                        apiOnline = true
                    } else if (json) {
                        countryName = json.country_name || 'N/D'
                        carrier = json.carrier || 'N/D'
                        lineType = json.line_type || 'N/D'
                        apiOnline = true
                    }
                }
            } catch (e) {
                apiOnline = false
            }
        }

        let warnTag = localWarn >= 5 ? 'ESPULSO' : `${localWarn}/5`
        let whitelistLabel = whitelistStatus ? 'IN WHITELIST' : 'NON IN WHITELIST'
        let apiStatusLabel = apiOnline ? 'ONLINE' : 'OFFLINE (solo dati locali)'

        let output = `\`\`\`╔══════════════════════════════════╗
║       OS INTELLIGENCE            ║
╚══════════════════════════════════╝\`\`\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`👤\` *UTENTE:* \`${userName}\`
\`📱\` *NUMERO:* \`${phoneNumber}\`
\`💻\` *CLIENT:* \`${clientType}\`
\`💻\` *OS:* \`${device}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`📊\` *DATABASE LOCALE*
\`⚠️\` *Warn:* \`${warnTag}\`
\`📋\` *Whitelist:* \`${whitelistLabel}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🌐\` *RETE (Numlookupapi)*
\`📡\` *API:* \`${apiStatusLabel}\`
\`🌍\` *Nazione:* \`${countryName}\`
\`📶\` *Operatore:* \`${carrier}\`
\`📞\` *Tipo Linea:* \`${lineType}\`
\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`🔐\` *SISTEMA ELIXIR*\`

        await conn.sendMessage(m.chat, {
            text: output,
            mentions: [targetJid]
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA ELIXIR*`)
    }
}

handler.help = ['whois <@tag/numero/reply>', 'lookup']
handler.tags = ['admin']
handler.command = /^(whois|lookup)$/i
handler.admin = true
handler.group = true

export default handler
