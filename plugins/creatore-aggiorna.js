import { execSync } from 'child_process'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function truncate(text = '', max = 3500) {
  const str = String(text || '')
  return str.length > max ? str.slice(0, max) + '\n...' : str
}

let handler = async (m, { conn }) => {
  try {
    await m.react('🔄')

    // Recupera lo stato della repository remota
    execSync('git fetch origin', { encoding: 'utf-8' })

    const diffStat = execSync('git diff --stat HEAD origin/main', {
      encoding: 'utf-8'
    })

    const diffStatus = execSync('git diff --name-status HEAD origin/main', {
      encoding: 'utf-8'
    })

    const statMap = {}

    // Mappa le righe aggiunte e rimosse per ogni file
    diffStat
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('|'))
      .forEach(line => {
        const [file, changesRaw] = line.split('|').map(s => s.trim())
        const plus = (changesRaw.match(/\+/g) || []).length
        const minus = (changesRaw.match(/-/g) || []).length
        statMap[file] = { plus, minus }
      })

    // Genera la lista dei file modificati con i relativi log
    const updatedFiles = diffStatus
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('\t')
        const status = parts[0]
        const oldPath = parts[1]
        const newPath = parts[2]

        if (status.startsWith('R')) {
          const stats = statMap[newPath] || statMap[oldPath] || { plus: 0, minus: 0 }
          return `\`🔁\` ${oldPath} \`→\` ${newPath} \`(+${stats.plus}/-${stats.minus})\``
        }

        if (status === 'A') {
          const stats = statMap[oldPath] || { plus: 0, minus: 0 }
          return `\`🆕\` ${oldPath} \`(+${stats.plus}/-${stats.minus})\``
        }

        if (status === 'D') {
          const stats = statMap[oldPath] || { plus: 0, minus: 0 }
          return `\`🗑\` ${oldPath} \`(+${stats.plus}/-${stats.minus})\``
        }

        const stats = statMap[oldPath] || { plus: 0, minus: 0 }
        return `\`📄\` ${oldPath} \`(+${stats.plus}/-${stats.minus})\``
      })

    // Esegue il reset e il pull forzato
    execSync('git reset --hard origin/main && git pull', {
      encoding: 'utf-8'
    })

    await sleep(1500)

    let resultMsg = `\`── ✅ UPDATE COMPLETE ──\``

    if (updatedFiles.length > 0) {
      resultMsg += `\n\n\`📦 File aggiornati:\` ${updatedFiles.length}\n\n${updatedFiles.join('\n')}`
    } else {
      resultMsg += `\n\n\`ℹ️ Nessun file da aggiornare\``
    }

    resultMsg += `\n\n\`[⚡] THE PUNISHER SYSTEM\``

    await conn.reply(m.chat, truncate(resultMsg), m)
    await m.react('✅')

  } catch (err) {
    await conn.reply(
      m.chat,
      `\`── ❌ UPDATE ERROR ──\`\n\n\`💥\` ${err.message}\n\n\`[⚡] THE PUNISHER SYSTEM\``,
      m
    )

    await m.react('❌')
  }
}

handler.help = ['aggiorna']
handler.tags = ['owner']
handler.command = /^(aggiorna|update|aggiornabot)$/i
handler.owner = true

export default handler
