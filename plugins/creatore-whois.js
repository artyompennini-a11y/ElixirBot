// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
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
        
        // Estrazione sicura dei dati dal database locale
        let localWarn = global.db?.data?.users?.[targetJid]?.warn || 0
        let whitelistStatus = global.db?.data?.chats?.[m.chat]?.whitelist?.includes(targetJid) || false
        let hasColon = targetJid.includes(':')
        let clientType = hasColon ? 'WhatsApp Web / Desktop' : 'Dispositivo Mobile (Android/iOS)'

        let device = 'Sconosciuto'
        let msgID = m.quoted?.id || m.quoted?.vM?.key?.id || m.quoted?.key?.id || ''

        
        if (msgID) {
            if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
                device = 'BOT_EMULATOR (Multi-Device API)'
            } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
                device = 'WHATSAPP_WEB (Browser)'
            } else if (msgID.startsWith('3EB0') && msgID.length > 12) {
                device = 'WEB/BOT_TERMINAL'
            } else if (msgID.startsWith('3EB0')) {
                device = 'ANDROID_OS (Legacy/Low Tier)'
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
                // URL corretto e standardizzato per le chiamate endpoint v1
                let apiUrl = `https://api.numlookupapi.com/v1/validate/${phoneNumber}?apikey=${apiKey}`
                let res = await fetch(apiUrl)
                if (res.ok) {
                    let json = await res.json()
                    // Parsing flessibile basato sulla struttura di ritorno dell'oggetto
                    let data = json.data || json
                    if (data) {
                        countryName = data.country_name || data.country?.name || 'N/D'
                        carrier = data.carrier || 'N/D'
                        lineType = data.line_type || 'N/D'
                        apiOnline = true
                    }
                }
            } catch (e) {
                console.error('[LOOKUP API ERROR]', e)
                apiOnline = false
            }
        }

        let warnTag = localWarn >= 5 ? 'ESPULSO' : `${localWarn}/5`
        let whitelistLabel = whitelistStatus ? 'IN WHITELIST' : 'NON IN WHITELIST'
        let apiStatusLabel = apiOnline ? 'ONLINE' : (apiKey ? 'OFFLINE (Errore API)' : 'DISATTIVATO (Manca API Key)')

        let output = `\`\`\`╔══════════════════════════════════╗\n` +
                     `║        OS INTELLIGENCE           ║\n` +
                     `╚══════════════════════════════════╝\`\`\`\n` +
                     `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n` +
                     `\`👤\` *UTENTE:* \`${userName}\`\n` +
                     `\`📱\` *NUMERO:* \`${phoneNumber}\`\n` +
                     `\`💻\` *CLIENT:* \`${clientType}\`\n` +
                     `\`🖥️\` *OS:* \`${device}\`\n` +
                     `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n` +
                     `\`📊\` *DATABASE LOCALE*\n` +
                     `\`⚠️\` *Warn:* \`${warnTag}\`\n` +
                     `\`📋\` *Whitelist:* \`${whitelistLabel}\`\n` +
                     `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n` +
                     `\`🌐\` *RETE (Numlookupapi)*\n` +
                     `\`📡\` *API:* \`${apiStatusLabel}\`\n` +
                     `\`🌍\` *Nazione:* \`${countryName}\`\n` +
                     `\`📶\` *Operatore:* \`${carrier}\`\n` +
                     `\`📞\` *Tipo Linea:* \`${lineType}\`\n` +
                     `\`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`\n` +
                     `\`🔐\` *SISTEMA THE PUNISHER*\``;

        await conn.sendMessage(m.chat, {
            text: output,
            mentions: [targetJid]
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA THE PUNISHER*`)
    }
}

handler.help = ['whois <@tag/numero/reply>', 'lookup']
handler.tags = ['admin']
handler.command = /^(whois|lookup)$/i
handler.admin = true
handler.group = true

export default handler
