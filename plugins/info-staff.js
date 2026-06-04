let handler = async (m, { conn }) => {
    let staff = `*⋆｡˚✦『 𝐒𝐓𝐀𝐅𝐅 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓 』✦˚｡⋆*

╭───────────────╮
│ 🤖 𝐁𝐨𝐭: 𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ
│ 🆚 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${global.versione}
╰───────────────╯

╭─── 👑 𝐂𝐑𝐄𝐀𝐓𝐎𝐑𝐄 ────╮
│ ✦ 𝐍𝐨𝐦𝐞: Elixⁱʳ
│ ✦ 𝐑𝐮𝐨𝐥𝐨: Creatore / Developer
│ ✦ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨: @447529461874
╰──────────────────╯

╭─── 📌 𝐈𝐍𝐅𝐎 𝐔𝐓𝐈𝐋𝐈 ───╮
│ ✦ 𝐆𝐢𝐭𝐇𝐮𝐛: https://github.com/Elixir-png/Elixir-Bot1
╰─────────────────╯

> 𝐄𝐋𝐈𝐗𝐈𝐑 𝐁𝐎𝐓`

    await conn.reply(
        m.chat,
        staff.trim(),
        m,
        {
            contextInfo: {
                mentionedJid: [
                    '447529461874@s.whatsapp.net'
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
ORG:ELIXIR BOT - Creatore / Developer
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
