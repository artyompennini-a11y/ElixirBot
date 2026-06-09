// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║        Sviluppato da: Elixir              ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝
import { canLevelUp, xpRange } from '../lib/levelling.js'

export async function before(m, { conn }) {
    if (!global.db.data.chats[m.chat].autolevelup) return !0
    
    let user = global.db.data.users[m.sender]
    let before = user.level * 1
    
    while (canLevelUp(user.level, user.exp, global.multiplier)) {
        user.level++
    }

    if (before !== user.level) {
        try {
            const range = xpRange(user.level, global.multiplier)
            const name = await conn.getName(m.sender)
            
            const caption = `
ㅤㅤ⋆｡˚『 ╭ \`LIVELLO\` ╯ 』˚｡⋆\n╭
│ 🎋 *Nome:* ${name}
│ ✧ *Livello:* ${before} ➯ ${user.level}
│ ❈ *Ruolo:* ${user.role}
│ ✦ *EXP:* ${user.exp}/${range.max}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

            await conn.sendMessage(m.chat, {
                text: caption
            }, { quoted: m })

        } catch (e) {
            console.error('Errore principale:', e)
            await conn.reply(m.chat, '⚠️ Errore durante l\'avanzamento di livello', m)
        }
    }
    return !0
}

export const disabled = false
