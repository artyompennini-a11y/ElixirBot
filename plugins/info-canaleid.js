// Plugin per ottenere l'ID di un canale o chat
// .channelid o rispondendo a un messaggio di un canale
let handler = async (m, { conn }) => {
    let targetJid = m.chat
    
    // Se risponde a un messaggio, usa il JID della chat del messaggio originale
    if (m.quoted) {
        targetJid = m.quoted.chat || m.quoted.key?.remoteJid || targetJid
    }
    
    // Se il messaggio ha participant (es. messaggio da canale in gruppo)
    if (m.key?.participant) {
        targetJid = m.key.participant
    }
    
    const decodedJid = conn.decodeJid(targetJid)
    const isChannel = decodedJid.includes('@newsletter') || decodedJid.includes('@broadcast')
    const isGroup = decodedJid.endsWith('@g.us')
    
    let typeLabel = isChannel ? '📢 CANALE' : isGroup ? '👥 GRUPPO' : '💬 CHAT PRIVATA'
    
    const msg = `
┏━━━〔 📍 INFO CHAT 〕━━━┓
┃
┃ ${typeLabel}
┃
┃ 🆔 ID: ${decodedJid}
┃ 
┃ 📋 Copia l'ID qui sopra per usarlo nei comandi.
┃
┗━━━━━━━━━━━━━━━━━━━━┛
`
    m.reply(msg)
}

handler.help = ['channelid', 'chatid', 'idchat']
handler.tags = ['info']
handler.command = /^(channelid|chatid|idchat|cid)$/i

export default handler
