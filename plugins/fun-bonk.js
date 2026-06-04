// Plug-in creato da elixir

import jimp from 'jimp'
import path from 'path'

let handler = async (m, { conn, text }) => {
    // Percorso dinamico verso la cartella media del bot
    let imagePath = path.join(process.cwd(), 'media/bonk.jpeg')
    
    let img = await jimp.read(imagePath),
        who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender,
        avatar = await jimp.read(await conn.profilePictureUrl(who, 'image')),
        bonk = await img.composite(avatar.resize(128, 128), 120, 90, {
            mode: 'dstOver',
            opacitySource: 1,
            opacityDest: 1
        }).getBufferAsync('image/png')
        
    conn.sendMessage(m.chat, { image: bonk }, { quoted: m })
}
handler.command = /^(bonk)$/i

export default handler
