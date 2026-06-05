// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import { createCanvas, loadImage } from 'canvas'

const handler = async (m, { conn, args, usedPrefix }) => {

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  let name = args.length > 0 && !m.mentionedJid[0] && !m.quoted ? args.join(" ") : conn.getName(who)

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const id = random(100000, 999999)
  const prezzo = random(5, 50)
  const followers = random(1000, 900000)
  const post = random(5, 350)
  const likes = random(10000, 900000)
  const verified = Math.random() < 0.4 

  const bioList = [
    "🔥 Contenuti esclusivi ogni giorno",
    "💋 Solo per veri fan",
    "😈 Non adatto ai deboli di cuore",
    "💎 Premium content 18+",
    "🌙 Notte calda garantita",
    "🖤 DM aperti per richieste speciali"
  ]

  const bio = bioList[Math.floor(Math.random() * bioList.length)]

  let avatarUrl
  try {
    avatarUrl = await conn.profilePictureUrl(who, 'image')
  } catch {
    avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/240px-Portrait_Placeholder.png'
  }

  const avatar = await loadImage(avatarUrl)

  const canvas = createCanvas(900, 1100)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0f0f14'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00aff0'
  ctx.fillRect(0, 0, canvas.width, 140)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 50px Sans'
  ctx.textAlign = 'center'
  ctx.fillText('ONLYFANS', 450, 90)

  ctx.save()
  ctx.beginPath()
  ctx.arc(450, 300, 140, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatar, 310, 160, 280, 280)
  ctx.restore()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px Sans'
  ctx.fillText(name, 450, 480)

  if (verified) {
    ctx.fillStyle = '#00aff0'
    ctx.beginPath()
    ctx.arc(450 + (ctx.measureText(name).width / 2) + 25, 465, 15, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = '24px Sans'
  ctx.fillStyle = '#cccccc'
  ctx.fillText(`ID: OF${id}`, 450, 520)

  ctx.fillStyle = '#ffffff'
  ctx.fillText(`💰 ${prezzo}€ / mese`, 450, 570)
  ctx.fillText(`👥 ${followers.toLocaleString()} followers`, 450, 610)
  ctx.fillText(`📸 ${post} post`, 450, 650)
  ctx.fillText(`🔥 ${likes.toLocaleString()} like`, 450, 690)

  ctx.font = '22px Sans'
  ctx.fillStyle = '#aaaaaa'
  ctx.fillText(bio, 450, 760)

  ctx.fillStyle = '#00aff0'
  ctx.fillRect(300, 900, 300, 80)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px Sans'
  ctx.fillText('ABBONATI ORA', 450, 950)

  const buffer = canvas.toBuffer()

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: `🔞 Profilo OnlyFans di ${name}`,
    mentions: [who]
  }, { quoted: m })
}

handler.help = ['onlyfans <@tag/nome>']
handler.tags = ['fun']
handler.command = /^onlyfans$/i

export default handler

