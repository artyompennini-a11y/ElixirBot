import fs from 'fs'

let handler = async (m, { conn, text }) => {
    let imgBuffer = fs.readFileSync('./menu-gruppo.jpeg')
    let messaggio = text ? text : "Messaggio di testo"

    await conn.sendMessage(m.chat, { 
        text: messaggio, 
        contextInfo: { 
            mentionedJid: [m.sender], 
            externalAdReply: {
                title: "test", 
                body: global.wm || "", 
                previewType: "PHOTO", 
                thumbnailUrl: ``, 
                thumbnail: imgBuffer,
                sourceUrl: `https://whatsapp.com`, 
                mediaType: 1, 
                showAdAttribution: false
            }
        }
    }, { quoted: m })
}


handler.command = /^(txt)$/i

export default handler
