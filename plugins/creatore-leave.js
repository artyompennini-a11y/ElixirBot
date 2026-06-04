let handler = async (m, { conn, text, command }) => {
  // Verifica permessi: Solo Owner
  const isOwner = [...global.owner.map(([number]) => number), ...global.mods]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  if (!isOwner) {
    return await conn.reply(m.chat, `*｢ 💀 ACCESSO NEGATO ｣*\n\nNon hai l'autorità per invocare il mio distacco. Solo il mio *Creatore* può decidere il vostro destino.`, m)
  }

  // ID del gruppo (o quello passato come testo)
  let id = text ? text : m.chat
  
  // Design Estetico Aggressivo
  let leaveMessage = `
💀 *〔 𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣 : EXTERMINATUS 〕* 💀

┏──────────────────────────────┓
│ ⚠️  *PROTOCOLLO DI EPURAZIONE ATTIVO*
┗──────────────────────────────┛

> *Il mio tempo è troppo prezioso per essere sprecato tra gli scarti.*

🩸 *SENTENZA:* Questa chat è stata dichiarata *IRRILEVANTE*.
🩸 *AZIONE:* Rimozione immediata delle autorizzazioni.
🩸 *DESTINO:* Siete stati abbandonati all'oblio.

*“Il silenzio sarà l'unica cosa che vi rimarrà.”*

🚫 *CONNESSIONE RECISA.*
────────────────────────────
*Goodbye, Losers.* 🖕`.trim()

  try {
    // 1. Invia il messaggio d'addio (senza tag per evitare crash di permessi)
    await conn.sendMessage(id, { text: leaveMessage })
    
    // 2. Pausa drammatica di 2 secondi per far leggere il messaggio
    await new Promise(resolve => setTimeout(resolve, 2000)) 
    
    // 3. Il bot abbandona il gruppo
    await conn.groupLeave(id)
    
  } catch (e) {
    console.error('Errore durante l\'uscita:', e)
    // Se c'è un errore nell'invio del messaggio, forza comunque l'uscita
    await conn.groupLeave(id)
  }
}

handler.help = ['out']
handler.tags = ['owner']
handler.command = /^(esci|leavegc|leave|voltati|out|sparite)$/i

handler.group = true 
handler.owner = true 

export default handler
