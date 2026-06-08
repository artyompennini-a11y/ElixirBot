// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
    try {
        if (!m.isGroup) throw new Error('Comando utilizzabile solo nei gruppi.')

        let targetJid = null
        let fakeText = ''

        // Parsing dell'input: supporta risposta a messaggio o tag esplicito
        if (m.quoted) {
            targetJid = m.quoted.sender
            fakeText = text || 'Messaggio intercettato.'
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
            let parts = text ? text.split('|').map(s => s.trim()) : ['']
            if (parts.length > 1) {
                fakeText = parts.slice(1).join(' ').trim()
            } else {
                fakeText = parts[0].replace(/@\d+/g, '').trim() || 'Messaggio intercettato.'
            }
        } else {
            throw new Error('Rispondi a un messaggio o tagga un utente usando:\n`.screenshot @tag | testo`')
        }

        let userName = await conn.getName(targetJid)

        // Recupero sicuro dell'immagine del profilo
        let ppUrl
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, 'image')
        } catch {
            ppUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/240px-Portrait_Placeholder.png'
        }

        // Generazione del timestamp orario attuale
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const timeStr = `${hours}:${minutes}`

        // Creazione del template HTML + CSS fedele a WhatsApp Dark Mode
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    background-color: #111b21;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    width: 950px;
                    display: flex;
                    align-items: center;
                    padding: 25px 40px;
                }
                .chat-container {
                    display: flex;
                    width: 100%;
                    align-items: flex-start;
                }
                .avatar-container {
                    position: relative;
                    margin-right: 25px;
                    flex-shrink: 0;
                }
                .avatar {
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .content-box {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding-top: 5px;
                }
                .header-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .username {
                    color: #e9edef;
                    font-size: 34px;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 600px;
                }
                .timestamp {
                    color: #8696a0;
                    font-size: 24px;
                }
                .message-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .message-text {
                    color: #d1d7db;
                    font-size: 28px;
                    line-height: 1.4;
                    max-width: 680px;
                    word-wrap: break-word;
                }
                .badge {
                    background-color: #00a884;
                    color: #ffffff;
                    font-size: 22px;
                    font-weight: bold;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 20px;
                    flex-shrink: 0;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="avatar-container">
                    <img class="avatar" src="${ppUrl}" alt="avatar">
                </div>
                <div class="content-box">
                    <div class="header-line">
                        <span class="username">${userName}</span>
                        <span class="timestamp">${timeStr}</span>
                    </div>
                    <div class="message-line">
                        <p class="message-text">${fakeText}</p>
                        <div class="badge">1</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `.trim()

        // Configurazione del token di Browseless (da inserire nel file .env o global config)
        const BROWSELESS_TOKEN = process.env.BROWSELESS_TOKEN || 'IL_TUO_TOKEN_BROWSELESS'
        const url = `https://chrome.browserless.io/screenshot?token=${BROWSELESS_TOKEN}`

        // Chiamata API a Browseless per effettuare il rendering dell'HTML
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: htmlContent,
                options: {
                    type: 'png',
                    fullPage: true // Adatta l'altezza dello screenshot in base al testo effettivo
                },
                viewport: {
                    width: 950,
                    height: 180 // Altezza minima di base
                }
            })
        })

        if (!response.ok) throw new Error(`Servizio di rendering non raggiungibile (${response.statusText})`)
        const buffer = await response.buffer()

        // Invio dell'immagine generata tramite Browseless
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '`[🎭] THE PUNISHER INTERCEPTOR ENGINE (HTML)`',
            mentions: [targetJid]
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`*⛔ ERRORE*\n\`━━━━━━━━━━━━━━━━\`\n\n\`⚠️\` ${e.message || 'Errore sconosciuto.'}\n\n\`🔐\` *SISTEMA THE PUNISHER*`)
    }
}

handler.help = ['screenshot']
handler.tags = ['admin']
handler.command = /^(screenshot)$/i
handler.admin = true
handler.group = true

export default handler
