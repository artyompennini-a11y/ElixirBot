let handler = async (m, { conn }) => {
    let staff = `*⋆｡˚✦『 𝐒𝐓𝐀𝐅𝐅 THE PUNISHER 𝐁𝐎𝐓 』✦˚｡⋆*

╭───────────────╮
│ 🤖 𝐁𝐨𝐭: 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃
│ 🆚 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${global.versione}
╰───────────────╯

╭─── 👑 𝐂𝐑𝐄𝐀𝐓𝐎𝐑𝐄 ────╮
│ ✦ 𝐍𝐨𝐦𝐞: 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁
│ ✦ 𝐑𝐮𝐨𝐥𝐨: Creatore / Developer
│ ✦ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨: @393206032199
╰──────────────────╯

╭─── 📌 𝐈𝐍𝐅𝐎 𝐔𝐓𝐈𝐋𝐈 ───╮
│ ✦ 𝐆𝐢𝐭𝐇𝐮𝐛: https://github.com/artyompennini-a11y/ThePunisherBot
╰─────────────────╯

> 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃`

    await conn.reply(
        m.chat,
        staff.trim(),
        m,
        {
            contextInfo: {
                mentionedJid: [
                    '393206032199@s.whatsapp.net'
                ]
            }
        }
    )

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                contacts: [
                    {
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Elixⁱʳ
ORG:THE PUNISHER-BOT - Creatore / Developer
TEL;type=CELL;type=VOICE;waid=447529461874:+447529461874
END:VCARD`
                    }
                ]
            }
        },
        { quoted: m }
    )

    m.react('👑')
}

handler.help = ['staff']
handler.tags = ['main']
handler.command = ['staff', 'collaboratori']

export default handler
