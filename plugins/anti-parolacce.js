// Plug-in creato da elixir
// Lista espansa di parole proibite in italiano (regex migliorato)
const uhuh = /\b(b[4a@]st[4a@]rd[0o]|[Ff][1iI][cC][4aA]|succh[i1][a4][l1][a4o0]|[Cc][i1][uU][cC][cC][i1][oO]|succh[i1][a4]m[e3][l1][oO]|v[e3]rm[e3]|f[i1][gG][l1][i1][oO]d[i1]p[uU]tt[4aA]n[4aA]|[sS]tr[o0]n[zZ][oa]|[l1][i1]n[gG][uU][a4][cC][cC][i1][uU]t[4aA]|l[4aA]d[o0]nn[4aA]d[i1]dd[i1][oO]|p[uU]tt[4aA]n[e3][l1][l1][4aA]|p[uU]tt[4aA]n[0o]|[pP]r[o0O][sS5][tT][i1][tT][uU][tT][e3]|[a4A]n[sS5][i1][oO][l1][i1]t[i1][cC][oO]|dr[o0O][gG][hH][e3]|dr[o0O][gG][4aA]|p[e3]n[e3]|[nN][e3][gG]r[o0]|f[rR][o0][cC][i1][oO]|f[i1][nN][o0][cC][cC][hH][i1][oO]|v[4aA][fF][fF][4aA][nN][cC][uU][l1][oO]|[e3][fF][fF][e3]mm[i1]n[4aA]t[o0]|[cC][o0][cC][4aA][i1]n[4aA]|[mM][4aA]r[i1][jJ][uU][4aA]n[4aA]|[vV][e3][cC][cC][hH][i1][o0aA]|[cC][4aA][gG][o0]n[e3aA]|[sS][cC][o0]r[e3][gG][gG][i1][o0]n[e3aA]|pr[e3][sS5][uU]m[tT][uU][o0][sS5][o0aA]|[cC][4aA][zZ][zZ][o0]|[sS][uU][cC][cC][hH][i1][4aA]|[mM][e3]rd[4aA]|[sS][cC][e3]m[o0aA]|[pP][4aA][zZ][zZ][o0aA]|[pP][o0]mp[i1]n[4aA]r[o0]|[sS]t[uU]p[i1]d[o0aA]|[i1]d[i1][o0]t[4aA]|tr[o0][i1][4aA]|[sS]tr[o0]n[zZ][4aA]t[4aA]|[sS]p[e3]rm[4aA]|[sS][cC][o0]p[4aA]t[o0]r[e3]|[fF][o0][tT][tT][uU]t[o0])\b/i

// Lista espansa di insulti e bestemmie aggiuntive
const uhuhEspansa = /\b(d[4a@]nn[4a@]t[o0]|[o0]m[nN][i1]c[4aA]|[sS][tT][uU]p[4aA]g[gG][i1]t[o0]|[mM][e3]rd[4aA]c[4aA]|[cC][uU]l[o0]|[cC][uU]l[4aA]|[fF][4aA]n[nN]c[o0]|[fF]r[o0]c[i1][o0]|[sS]c[4aA]m[4aA]p[4aA]|[rR][o0]tt[4aA]|[i1]m[pP]e[gG][nN]e|[dD][e3]b[i1]l[e3]|[cC]r[e3]t[i1]n[o0]|[rR][e3]t[4aA]rd[4aA]t[o0]|[mM][o0]n[nN][e3]z[zZ][4aA]|[fF][o0]r[o0]n[zZ]|[tT]r[o0]g[l1][i1]o0|[sS]tr[4aA]p[4aA]|[cC]h[i1]n[o0]di[mM]er[d4aA]|[fF]i[l1]i[o0]d[i1]p[uU]tt[4aA]n[4aA]|[bB][o0]s[tT]a[rR]d[o0]|[mM][i1]n[cC][hH][i1]a|[sS]c[4aA]g[gG]|[pP][o0]r[cC]o0|z[o0]cc[o0]l[i1]|[o0]m[nN][e3]t[o0]|b[o0]h[jJ]|[a4A]b[o0]rt[o0]|n[4aA]z[i1]|[fF]4a[sS]c[i1]|[tT]r[o0][i1][4aA]|[fF][o0]r[gG][4aA]s|[cC][4aA]nn[4aA]|[sS]cr[o0]t[o0]|[vV][i1]g[l1]|[4aA]z[zZ][o0]n[4aA]|[pP]utt[4aA]n[e3]ll[4aA]|[bB]est[e3]mm[i1][a4]|[dD][i1][o0]c[4aA]n[e3]|[pP]0rc[o0]|[dD][e3]m[o0]n[i1]|[cC][a4]zz[o0]|[mM]3rd[4aA]|[sS]tr0nz[o0]|putt4n4|figli0|m3rd4|stronz4|c4zz0|b3st3mm14|d10c4n3|p0rc0|d3m0n[i1]|[cC]h[e3]m[i1]c4a|[fF]r0c[i1]0|[i1]mp3gn3nt3)\b/i

// Unione delle due regex
const regexFinale = new RegExp(uhuh.source + '|' + uhuhEspansa.source, 'i')

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) { 
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!m.text) return true
    
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    const t = regexFinale.exec(m.text)
    
    if (chat.antiparolacce && !isOwner && !isAdmin) {
        const decodedSender = conn.decodeJid(m.sender)
        
        // Controlla se è una bestemmia specifica (più grave)
        const isGrave = /\b(d[i1][o0]c[4a]n[e3]|b[e3]st[e3]mm[i1][a4]|p[o0]rc[o0]d[i1][o0]|m[a4]d[o0]nn[a4]|cr[i1]st[o0]|g[e3]s[o0]|m[a4]r[i1]a|s[a4]nt[o0]|ch[i1]e[s5][a4])\b/i.test(m.text)
        
        if (isGrave) {
            // Bestemmia: warn + elimina immediatamente
            user.warn += 2
            if (isBotAdmin) {
                await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
            }
            await conn.sendMessage(m.chat, {
                text: `🚨 *BESTEMMIA RILEVATA* — @${decodedSender.split('@')[0]}\n\nLa bestemmia non è tollerata. Hai *${user.warn}* warn.`,
                mentions: [decodedSender]
            }, { quoted: m })
        } else {
            // Insulto normale
            user.warn += 1
            if (isBotAdmin) {
                await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
            }
        }

        if (user.warn >= 4) {
            user.warn = 0
            await conn.sendMessage(m.chat, {
                text: `🚫 *BANNATO* — @${decodedSender.split('@')[0]}\n\nHai accumulato troppi warn. Sei stato rimosso dal gruppo.`,
                mentions: [decodedSender]
            }).catch(() => {})
            
            user.banned = true
            if (isBotAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
            }
        }
    }
    return true
}

export default handler
