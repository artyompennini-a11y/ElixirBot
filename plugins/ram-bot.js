// Plugin creato da elixir
import { performance } from 'perf_hooks'
import os              from 'os'

// ── Formatta uptime ──
const formatUptime = ms => {
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
}

// ── Formatta byte → unità leggibile ──
const formatBytes = b => {
  if (b >= 1_073_741_824) return (b / 1_073_741_824).toFixed(2) + ' GB'
  if (b >= 1_048_576)     return (b / 1_048_576).toFixed(2)     + ' MB'
  return (b / 1_024).toFixed(1) + ' KB'
}

// ── Barra di progresso testuale ──
const progressBar = (pct, len = 10) => {
  const filled = Math.round(pct / 100 * len)
  return '█'.repeat(filled) + '░'.repeat(len - filled) + ' ' + pct.toFixed(1) + '%'
}

// ════════════════════════════════════════
//  HANDLER
// ════════════════════════════════════════

const handler = async (m, { conn }) => {

  // ── Velocità Reale (Speed) ──
  // Calcola il tempo passato tra l'invio del messaggio dell'utente e la risposta del bot
  const oldTimestamp = m.messageTimestamp * 1000
  const speed = ((Date.now() - oldTimestamp) / 1000).toFixed(3)

  // ── RAM ──
  const totalRam = os.totalmem()
  const freeRam  = os.freemem()
  const usedRam  = totalRam - freeRam
  const ramPct   = (usedRam / totalRam) * 100

  // ── CPU ──
  const cpus  = os.cpus()
  const cores = cpus.length

  // ── CPU load ──
  let loadLabel = '—'
  try { loadLabel = os.loadavg()[0].toFixed(2) } catch { /* ignora */ }

  // ── Node.js heap ──
  const heap    = process.memoryUsage()
  const heapPct = (heap.heapUsed / heap.heapTotal) * 100

  // ── Uptime ──
  const uptime = formatUptime(process.uptime() * 1000)

  // ── Ora italiana ──
  const ora = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const testo = `⋆｡˚『 ╭ 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁 · SYSTEM STATS ╯ 』˚｡⋆
╭─────────────────────────
┃  ⚡ *Velocità* ›  ${speed} ms
┃  ⏱️ *Uptime*   ›  ${uptime}
┃  🕐 *Ora*      ›  ${ora}
┃
┃  💾 *RAM*
┃  ${progressBar(ramPct)}
┃  ${formatBytes(usedRam)} / ${formatBytes(totalRam)}
┃
┃  🧠 *Heap Node.js*
┃  ${progressBar(heapPct)}
┃  ${formatBytes(heap.heapUsed)} / ${formatBytes(heap.heapTotal)}
┃
┃  ⚙️ *CPU*   ›  ${cores} core
┃  📊 *Load*  ›  ${loadLabel}
┃  🖥️ *OS*    ›  ${os.type()} ${os.arch()}
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒
_𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 · SYSTEM MONITOR_`

  await conn.sendMessage(m.chat, { text: testo }, { quoted: m })
}

handler.help    = ['stbot']
handler.tags    = ['info']
handler.command = /^(ping|stbot|stats|speed|st)$/i

export default handler;
