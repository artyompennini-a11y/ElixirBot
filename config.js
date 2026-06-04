import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝕰𝕷𝕴𝖃𝕴𝕽𝕭𝕺𝕿✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

global.sam = ['393784409415', '447529461874', '2348174457298', '6282364029306']
global.owner = [
  ['393784409415', 'Elixir', true],
  ['393514722317', 'Momo', true],
  ['6282364029306', 'Elixir VoIP', true],
  ['992929328521', 'ElixirVoIP', true], 
  ['447529461874', 'Elixir', true],
  ['2348174457298', 'Elixir VoIP', true],
  ['393784409415', 'Elixir Secondary', true],
  ['6282364029306', 'Elixir voip', true]
]

global.mods = ['393784409415', '393514722317', '6282364029306', '2348174457298', '447529461874', '6282364029306']
global.prems = ['393784409415', '393514722317', '639750840641', '447529461874', '2348174457298', '6282364029306']

/*⭑⭒━━━✦❘༻🩸 INFO BOT 🕊️༺❘✦━━━⭒⭑*/

global.nomepack = '𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣'
global.nomebot = '𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣'
global.wm = '𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣'
global.autore = 'ELIXIR'
global.dev = 'ELIXIR'
global.testobot = `𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣`
global.versione = pkg.version
global.errore = '*ERRORE INATTESO*, UTILIZZA IL COMANDO .segnala (errore) per contattare lo sviluppatore. contatto diretto: +393784409415'

/*⭑⭒━━━✦❘༻🌐 LINK 🌐༺❘✦━━━⭒⭑*/

global.repobot ='https//wa.me/393784409415'
global.gruppo = 'https://chat.whatsapp.com/JOaqS04seMvFepBFp4Q4rL'
global.insta = 'instagram.com/eli.xir_gg'

/*⭑⭒━━━✦❘༻ MODULI ༺❘✦━━━⭒⭑*/

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

/*⭑⭒━━━✦❘🗝️ API KEYS 🌍༺❘✦━━━⭒⭑*/

global.APIKeys = { // le keys con scritto "varebot" vanno cambiate con keys valide
    spotifyclientid: 'varebot',
    spotifysecret: 'varebot',
    browserless: 'varebot',
    screenshotone: 'varebot',
    screenshotone_default: 'varebot',
    tmdb: 'varebot',
    gemini: 'varebot',
    ocrspace: 'varebot',
    assemblyai: 'varebot',
    google: 'varebot',
    googlex: 'varebot',
    googleCX: 'varebot',
    genius: 'varebot',
    unsplash: 'varebot',
    removebg: 'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter: 'varebot',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
    sightengine_user: 'varebot',
    sightengine_secret: 'varebot'
};


/*⭑⭒━━━✦❘༻🪷 SISTEMA XP/EURO 💸༺❘✦━━━⭒⭑*/

global.multiplier = 1 // piu è alto piu è facile guardagnare euro e xp

/*⭑⭒━━━✦❘༻📦 RELOAD 📦༺❘✦━━━⭒⭑*/

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href
const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  unwatchFile(filePath)
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}
watchFile(filePath, reloadConfig)
