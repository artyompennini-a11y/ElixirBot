let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text:
`*🌐 𝐄𝐜𝐜𝐨 𝐢𝐥 𝐫𝐞𝐩𝐨 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭:*
*https://github.com/Elixir-png/ElixirBot*

*📢 𝐒𝐞𝐠𝐮𝐢 𝐢𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐩𝐞𝐫 𝐫𝐢𝐦𝐚𝐧𝐞𝐫𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨 𝐬𝐮 𝐧𝐨𝐯𝐢𝐭à 𝐞 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐡𝐞!*

*https://whatsapp.com/channel/0029Vb7NyC67tkj0robcbw24* 

*🌟 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐥𝐨 𝐬𝐯𝐢𝐥𝐮𝐩𝐩𝐨 𝐝𝐢 𝐸𝑙ɪxⁱʳ-𝔅o͜͡ꪻ 𝐜𝐨𝐧 𝐮𝐧𝐚 𝐬𝐭𝐞𝐥𝐥𝐚 𝐬𝐮 𝐆𝐢𝐭𝐇𝐮𝐛!*

*👑 𝐎𝐰𝐧𝐞𝐫:* 𝐸𝑙ɪxⁱʳ

> *ʙʏ 𝐸𝑙ɪxⁱʳ*`,
    contextInfo: global.rcanal?.contextInfo || {}
  }, { quoted: m })
}

handler.help = ['repo', 'infobot']
handler.tags = ['info']
handler.command = ['repo', 'repository', 'github', 'infobot']

export default handler
