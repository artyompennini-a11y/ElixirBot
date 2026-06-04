// by elixir
export function ensureStorageDirSync(dir = 'storage') {
  try {
    const fs = require('fs')
    fs.mkdirSync(dir, { recursive: true })
  } catch (e) {}
}

export async function loadCacheFile(path) {
  try {
    const fs = await import('fs')
    const fsp = fs.promises
    const data = await fsp.readFile(path, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

export async function saveCacheFileAtomic(path, obj) {
  try {
    const fs = await import('fs')
    const fsp = fs.promises
    const tmp = path + '.tmp'
    await fsp.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf-8')
    await fsp.rename(tmp, path)
    return true
  } catch (e) {
    return false
  }
}

export function registerExitHandler(saveFn) {
  if (typeof saveFn !== 'function') return
  const wrapper = async (code = 0) => {
    try { await saveFn() } catch (e) {}
    try { process.exit(code) } catch (e) {}
  }
  process.on('SIGINT', () => wrapper(0))
  process.on('SIGTERM', () => wrapper(0))
  process.on('beforeExit', async () => { try { await saveFn() } catch (e) {} })
}
