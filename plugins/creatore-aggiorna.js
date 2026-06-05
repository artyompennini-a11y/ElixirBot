import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

if (!global.updateDebugErrors) global.updateDebugErrors = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function truncate(text = '', max = 3500) {
  const str = String(text || '')
  return str.length > max ? str.slice(0, max) + '\n...' : str
}

async function testPluginImport(filePath) {
  const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`
  const mod = await import(fileUrl)
  return mod?.default || mod
}

function createDebugId() {
  return `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

let handler = async (m, { conn, command, usedPrefix }) => {
  if (/^debugplugin$/i.test(command)) {
    const debugId = (m.text || '').trim().split(/\s+/)[1]

    if (!debugId || !global.updateDebugErrors[debugId]) {
      return conn.reply(m.chat, '`[✖] Debug non trovato o scaduto.`', m)
    }

    const item = global.updateDebugErrors[debugId]

    const fullMsg =
`\`── 🛠 DEBUG REPORT ──\`

\`📌 File:\` ${item.file}
\`💥 Messaggio:\` ${item.message}

\`\`\`
${truncate(item.stack, 3000)}
\`\`\`

\`[⚡] THE PUNISHER SYSTEM\``

    return conn.reply(m.chat, fullMsg, m)
  }

  try {
    await m.react('🔄')

    const projectRoot = process.cwd()
    const pluginsDir = path.join(projectRoot, 'plugins')

    execSync('git fetch origin', { encoding: 'utf-8' })

    const diffStat = execSync('git diff --stat HEAD origin/main', {
      encoding: 'utf-8'
    })

    const diffStatus = execSync('git diff --name-status HEAD origin/main', {
      encoding: 'utf-8'
    })

    const statMap = {}

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

    if (!fs.existsSync(pluginsDir)) {
      await m.react('✅')
      return
    }

    const allPlugins = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    const pluginErrors = []

    for (const file of allPlugins) {
      const absPath = path.join(pluginsDir, file)

      try {
        await testPluginImport(absPath)
      } catch (err) {
        pluginErrors.push({
          file,
          message: err?.message || String(err),
          stack: err?.stack || String(err)
        })
      }
    }

    if (pluginErrors.length > 0) {
      for (const item of pluginErrors) {
        const debugId = createDebugId()

        global.updateDebugErrors[debugId] = {
          ...item,
          createdAt: Date.now()
        }

        const shortMsg =
`\`── ❌ PLUGIN ERROR ──\`

\`📌 File:\` ${item.file}
\`💥 Messaggio:\` ${item.message}

\`[⚡] THE PUNISHER SYSTEM\``

        await conn.sendMessage(m.chat, {
          text: shortMsg,
          footer: '`[⚡] THE PUNISHER SYSTEM`',
          buttons: [
            {
              buttonId: `${usedPrefix}debugplugin ${debugId}`,
              buttonText: { displayText: '🛠 Debug completo' },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: m })

        if (pluginErrors.length > 1) {
          await sleep(1200)
        }
      }

      await m.react('⚠️')
      return
    }

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

handler.help = ['aggiorna', 'debugplugin <id>']
handler.tags = ['owner']
handler.command = /^(aggiorna|update|aggiornabot|debugplugin)$/i
handler.owner = true

export default handler
