// Plug-in creato da elixir
import os from 'os'
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Sistema di ottimizzazione automatica VPS
let handler = async (m, { conn }) => {
  const result = await eseguiPulizia()
  
  const toMB = b => (b / 1024 / 1024).toFixed(1)
  const ramLiberata = result.ramBefore - result.ramAfter
  const sep = '▸'
  
  const msg = `╔══════════════════════════╗
║   ⚡ *ELIXIR VPS OPTIMIZER* ⚡
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━
*📊 REPORT OTTIMIZZAZIONE*
━━━━━━━━━━━━━━━━━━━
${sep} 🗑️ File tmp: ${result.filesCleaned} eliminati
${sep} 🧹 Garbage Collector: ${result.gcRun ? '✅ Eseguito' : '❌ Non disponibile'}
${sep} 💾 RAM prima/dopo: ${toMB(result.ramBefore)} MB → ${toMB(result.ramAfter)} MB
${sep} 📉 Risparmio: ~${ramLiberata > 0 ? '+' + ramLiberata.toFixed(1) : '0'} MB

━━━━━━━━━━━━━━━━━━━
*💾 STATO SISTEMA*
━━━━━━━━━━━━━━━━━━━
${sep} Heap usato: ${toMB(result.ramAfter)} MB
${sep} RAM libera VPS: ${toMB(os.freemem())} MB / ${toMB(os.totalmem())} MB

━━━━━━━━━━━━━━━━━━━
*⚡ VPS OTTIMIZZATA CON SUCCESSO*`.trim()

  await conn.reply(m.chat, msg, m)
}

handler.help = ['clean', 'pulisci']
handler.tags = ['owner']
handler.command = /^(clean|pulisci|ottimizza)$/i
handler.owner = true
handler.group = true

export default handler

// === AUTOMAZIONE: pulizia ogni 6 ore ===
setInterval(async () => {
  try {
    await eseguiPulizia()
    console.log('[VPS OPTIMIZER] Pulizia automatica ogni 6 ore eseguita.')
  } catch (e) {
    console.error('[VPS OPTIMIZER] Errore pulizia automatica:', e)
  }
}, 6 * 60 * 60 * 1000)

// === FUNZIONE DI PULIZIA ===
async function eseguiPulizia() {
  // Misura RAM prima
  const ramBefore = process.memoryUsage().heapUsed
  
  // 1. Forza Garbage Collector
  let gcRun = false
  try {
    if (global.gc) {
      global.gc()
      gcRun = true
    } else {
      // Avvia node con --expose-gc per abilitare GC manuale
      console.log('[VPS OPTIMIZER] GC non esposto. Avvia node con --expose-gc per attivarlo.')
    }
  } catch (e) {}
  
  // 2. Pulisci file temporanei più vecchi di 1 ora
  const dirsTmp = [path.join(__dirname, '../tmp'), path.join(__dirname, '../temp')]
  let filesCleaned = 0
  
  for (const dir of dirsTmp) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          const fp = path.join(dir, file)
          try {
            const stat = fs.statSync(fp)
            if (stat.isFile() && Date.now() - stat.mtimeMs > 3600000) {
              fs.unlinkSync(fp)
              filesCleaned++
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  
  const ramAfter = process.memoryUsage().heapUsed
  
  return { ramBefore, ramAfter, filesCleaned, gcRun }
}
