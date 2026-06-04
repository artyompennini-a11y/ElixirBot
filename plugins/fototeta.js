let handler = async (m, { conn, usedPrefix, command}) => {
await conn.reply(m.chat,`Padre nostro, che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra. e rimetti a noi i nostri debiti come noi li rimettiamo ai nostri debitori, e non ci indurre in tentazione, ma liberaci dal male..`, m)
}
handler.customPrefix = /^(Fototeta|fototeta|fototette|fototetta)$/i
handler.command = new RegExp
export default handler