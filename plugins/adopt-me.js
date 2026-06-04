// ╔════════════════════════════════════════════════════╗
// ║         Pet World — Plug-in by elixir (FIX)        ║
// ║                                                    ║
// ╚════════════════════════════════════════════════════╝

// ─── ANIMALI COMUNI ─────────────────────────────────
const ANIMALI_COMUNI = {
  gatto: {
    nome: 'Gatto', fasi: ['🐱', '🐈', '🐈‍⬛'],
    personalita: 'Indipendente e misterioso',
    cibi: ['🐟 pesce', '🥛 latte', '🍗 pollo'],
    giochi: ['🧶 gomitolo', '🔦 laser', '🪶 piuma']
  },
  cane: {
    nome: 'Cane', fasi: ['🐶', '🐕', '🦮'],
    personalita: 'Fedele e giocoso',
    cibi: ['🦴 osso', '🥩 carne', '🐾 croccantini'],
    giochi: ['🎾 pallina', '🥏 frisbee', '🦮 passeggiata']
  },
  coniglio: {
    nome: 'Coniglio', fasi: ['🐰', '🐇', '🐇'],
    personalita: 'Dolce e curioso',
    cibi: ['🥕 carota', '🥬 lattuga', '🌿 erba'],
    giochi: ['🏃 corridoio', '🧩 labirinto', '🌸 giardino']
  },
  criceto: {
    nome: 'Criceto', fasi: ['🐹', '🐹', '🐹'],
    personalita: 'Attivo e vivace',
    cibi: ['🌾 semi', '🥜 noccioline', '🍎 mela'],
    giochi: ['⚙️ ruota', '🏔️ tunnels', '🧸 nido']
  },
  pappagallo: {
    nome: 'Pappagallo', fasi: ['🐣', '🦜', '🦜'],
    personalita: 'Chiacchierone e colorato',
    cibi: ['🌽 mais', '🍇 uva', '🥜 semi'],
    giochi: ['🎵 canto', '🪞 specchio', '🎪 trapezio']
  },
  tartaruga: {
    nome: 'Tartaruga', fasi: ['🥚', '🐢', '🐢'],
    personalita: 'Paziente e longeva',
    cibi: ['🥬 verdure', '🍓 fragole', '🐛 insetti'],
    giochi: ['☀️ bagno di sole', '🌊 nuoto', '🌿 esplorazione']
  },
  pesce: {
    nome: 'Pesce Rosso', fasi: ['🐟', '🐠', '🐡'],
    personalita: 'Tranquillo e zen',
    cibi: ['🦐 gamberetti', '🌱 alghe', '🟡 mangime'],
    giochi: ['🫧 bolle', '🪨 rocce', '🌿 piante acquatiche']
  },
  furetto: {
    nome: 'Furetto', fasi: ['🦦', '🦦', '🦦'],
    personalita: 'Birichino e curioso',
    cibi: ['🍗 pollo', '🥚 uova', '🐟 pesce'],
    giochi: ['🧦 calzino', '🚇 tunnel', '🎪 acrobazie']
  },
  cavia: {
    nome: 'Cavia', fasi: ['🐾', '🐾', '🐾'],
    personalita: 'Socievole e mite',
    cibi: ['🥦 broccoli', '🫑 peperone', '🌿 prezzemolo'],
    giochi: ['🏡 rifugio', '🌸 passeggiate', '🧩 percorsi']
  }
}

// ─── ANIMALI ESOTICI ────────────────────────────────
const ANIMALI_ESOTICI = {
  drago: {
    nome: 'Drago', fasi: ['🥚', '🐲', '🐉'],
    personalita: 'Leggendario e potente',
    cibi: ['🔥 fuoco', '💎 gemme', '⚔️ acciaio'],
    giochi: ['🌋 vulcano', '⚡ fulmini', '🏔️ montagne'],
    raro: true, probabilita: 0.03
  },
  fenice: {
    nome: 'Fenice', fasi: ['🥚', '🔥', '🦅'],
    personalita: 'Immortale e maestosa',
    cibi: ['🌞 luce solare', '🔥 braci', '✨ stelle'],
    giochi: ['🌅 alba', '🌌 volo notturno', '🌈 arcobaleno'],
    raro: true, probabilita: 0.02
  },
  unicorno: {
    nome: 'Unicorno', fasi: ['🥚', '🦄', '🦄'],
    personalita: 'Magico e puro',
    cibi: ['🌸 fiori magici', '🌈 arcobaleno', '⭐ stelle'],
    giochi: ['🌺 prato incantato', '💫 magia', '🌙 luna'],
    raro: true, probabilita: 0.02
  },
  capibara: {
    nome: 'Capibara', fasi: ['🦫', '🦫', '🦫'],
    personalita: 'Pacifico e sociale',
    cibi: ['🌿 erba', '🍉 cocomero', '🥕 carote'],
    giochi: ['🏊 nuoto', '☀️ relax', '👨‍👩‍👧 socializzare'],
    probabilita: 0.08
  },
  axolotl: {
    nome: 'Axolotl', fasi: ['🥚', '🦎', '🦎'],
    personalita: 'Mistico e rigenerante',
    cibi: ['🦐 gamberetti', '🐛 larve', '🌊 plancton'],
    giochi: ['🫧 bolle', '🌿 nascondiglio', '🌊 correnti'],
    probabilita: 0.06
  },
  fennec: {
    nome: 'Fennec Fox', fasi: ['🐾', '🦊', '🦊'],
    personalita: 'Furbo e adattabile',
    cibi: ['🦗 insetti', '🐭 topolini', '🍇 frutta'],
    giochi: ['🌙 caccia notturna', '🏜️ sabbia', '🐾 tracce'],
    probabilita: 0.07
  },
  kinkajou: {
    nome: 'Kinkajou', fasi: ['🐒', '🐒', '🐒'],
    personalita: 'Notturno e affettuoso',
    cibi: ['🍯 miele', '🍌 banane', '🍓 frutti di bosco'],
    giochi: ['🌳 alberi', '🌙 notte', '🍃 rami'],
    probabilita: 0.06
  },
  pangolino: {
    nome: 'Pangolino', fasi: ['🥚', '🦔', '🦔'],
    personalita: 'Raro e protetto',
    cibi: ['🐜 formiche', '🪲 termiti', '🌿 insetti'],
    giochi: ['🌳 scavare', '⚽ arrotolarsi', '🌿 esplorare'],
    raro: true, probabilita: 0.02
  }
}

// ─── INDICI ─────────────────────────────────────────
const TUTTI = { ...ANIMALI_COMUNI, ...ANIMALI_ESOTICI }
const LISTA_COMUNI  = Object.keys(ANIMALI_COMUNI)
const LISTA_ESOTICI = Object.keys(ANIMALI_ESOTICI)
const LISTA_RARI    = LISTA_ESOTICI.filter(x => ANIMALI_ESOTICI[x].raro)

// ─── DATABASE ────────────────────────────────────────
function getPet(user) {
  if (!global.db.data.users[user]) global.db.data.users[user] = {}
  return global.db.data.users[user].pet || null
}

function setPet(user, data) {
  if (!global.db.data.users[user]) global.db.data.users[user] = {}
  global.db.data.users[user].pet = data
}

// ─── CREA PET ────────────────────────────────────────
function crea(tipo, nome) {
  return {
    tipo,
    nome,
    livello: 1,
    exp: 0,
    fame: 100,
    felicita: 100,
    salute: 100,
    ultimo: Date.now(),
    esotico: !!ANIMALI_ESOTICI[tipo]
  }
}

// ─── EXP PER LIVELLO ────────────────────────────────
function expRichiesta(livello) {
  return livello * 50
}

// ─── FASE VISIVA ────────────────────────────────────
function getFase(pet) {
  const dati = TUTTI[pet.tipo]
  if (!dati) return '❓'
  if (pet.livello >= 10) return dati.fasi[2]
  if (pet.livello >= 5)  return dati.fasi[1]
  return dati.fasi[0]
}

// ─── ESTRAZIONE CASUALE ESOTICO ─────────────────────
function estraiEsotico() {
  const pool = []
  for (const [id, dati] of Object.entries(ANIMALI_ESOTICI)) {
    const peso = Math.round((dati.probabilita || 0.05) * 100)
    for (let i = 0; i < peso; i++) pool.push(id)
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── MENU ESOTICO ───────────────────────────────────
function menuEsotico(usedPrefix) {
  let txt = `🌟 *MENU ESOTICO* 🌟\n\n`
  txt += `Animali speciali con probabilità di adozione:\n\n`
  for (const [id, dati] of Object.entries(ANIMALI_ESOTICI)) {
    const pct  = Math.round((dati.probabilita || 0.05) * 100)
    const star = dati.raro ? ' ⭐ Rarissimo' : ''
    txt += `${dati.fasi[1]} *${dati.nome}*${star}\n`
    txt += `   ${dati.personalita}\n`
    txt += `   Probabilità: ${pct}%\n\n`
  }
  txt += `Usa ${usedPrefix}adopt esotico per tentare la fortuna!`
  return txt
}

// ─── HANDLER ─────────────────────────────────────────
let handler = async (m, { conn, args, usedPrefix, command }) => {

  const user = m.sender
  let pet    = getPet(user)

  // ─── ADOTTA ────────────────────────────────────────
  if (/^adopt$/.test(command)) {

    if (pet) return m.reply(`Hai già ${pet.nome}! Usa ${usedPrefix}abbandona prima di adottare un altro.`)

    if (!args[0]) {
      return m.reply(
        `🐾 *ADOZIONE*\n\n` +
        `*Comuni:*\n` +
        LISTA_COMUNI.map(id => `  ${ANIMALI_COMUNI[id].fasi[0]} ${usedPrefix}adopt ${id}`).join('\n') +
        `\n\n*Esotici (casuale):*\n  ${usedPrefix}adopt esotico\n\n` +
        `*Vedi tutti gli esotici:*\n  ${usedPrefix}esotico`
      )
    }

    let tipo

    if (args[0] === 'casuale') {
      tipo = Math.random() < 0.08
        ? LISTA_ESOTICI[Math.floor(Math.random() * LISTA_ESOTICI.length)]
        : LISTA_COMUNI[Math.floor(Math.random() * LISTA_COMUNI.length)]
    } else if (args[0] === 'esotico') {
      tipo = estraiEsotico()
    } else {
      tipo = args[0].toLowerCase()
      if (!TUTTI[tipo]) return m.reply('Animale non valido. Usa !adopt per vedere la lista.')
      if (ANIMALI_ESOTICI[tipo]) return m.reply(`${TUTTI[tipo].nome} è un animale esotico! Usa ${usedPrefix}adopt esotico per tentare la fortuna.`)
    }

    const nome = args[1] || TUTTI[tipo].nome
    pet = crea(tipo, nome)
    setPet(user, pet)
    await global.db.write()

    const tag = ANIMALI_ESOTICI[tipo] ? '✨ *Adozione Esotica!*' : '🐾 *Nuovo Amico!*'
    return m.reply(`${tag}\n\nHai adottato *${nome}*! ${TUTTI[tipo].fasi[0]}\n_${TUTTI[tipo].personalita}_`)
  }

  // ─── MENU ESOTICO ──────────────────────────────────
  if (/^esotico$/.test(command)) {
    return m.reply(menuEsotico(usedPrefix))
  }

  // ─── INFO ──────────────────────────────────────────
  if (/^(animale|pet|miopet)$/.test(command)) {
    if (!pet) return m.reply(`Nessun animale. Usa ${usedPrefix}adopt per adottarne uno!`)

    const dati    = TUTTI[pet.tipo]
    const fase    = getFase(pet)
    const expNext = expRichiesta(pet.livello)
    const categoria = pet.esotico ? '⭐ Esotico' : '🏠 Domestico'

    return m.reply(
      `${fase} *${pet.nome}*\n` +
      `_${dati.personalita}_\n` +
      `${categoria}\n\n` +
      `🏅 Livello: ${pet.livello}\n` +
      `✨ EXP: ${pet.exp}/${expNext}\n` +
      `🍖 Fame: ${pet.fame}/100\n` +
      `😊 Felicità: ${pet.felicita}/100\n` +
      `❤️ Salute: ${pet.salute}/100`
    )
  }

  // ─── NUTRI ─────────────────────────────────────────
  if (/^(nutri|mangia)$/.test(command)) {
    if (!pet) return m.reply('Nessun animale.')

    const dati = TUTTI[pet.tipo]
    const cibo = dati.cibi[Math.floor(Math.random() * dati.cibi.length)]

    pet.fame = Math.min(100, pet.fame + 20)
    pet.exp  += 10
    pet      = controllaLivello(pet)

    setPet(user, pet)
    await global.db.write()

    return m.reply(`${pet.nome} ha mangiato ${cibo}! 🍽️\n+10 EXP — Fame: ${pet.fame}/100`)
  }

  // ─── GIOCA ─────────────────────────────────────────
  if (/^(gioca)$/.test(command)) {
    if (!pet) return m.reply('Nessun animale.')

    const dati  = TUTTI[pet.tipo]
    const gioco = dati.giochi[Math.floor(Math.random() * dati.giochi.length)]

    pet.felicita = Math.min(100, pet.felicita + 20)
    pet.exp      += 15
    pet          = controllaLivello(pet)

    setPet(user, pet)
    await global.db.write()

    return m.reply(`${pet.nome} ha giocato con ${gioco}! 🎮\n+15 EXP — Felicità: ${pet.felicita}/100`)
  }

  // ─── CURA ──────────────────────────────────────────
  if (/^(cura|heal)$/.test(command)) {
    if (!pet) return m.reply('Nessun animale.')

    pet.salute = Math.min(100, pet.salute + 30)

    setPet(user, pet)
    await global.db.write()

    return m.reply(`${pet.nome} è stato curato! 💊\nSalute: ${pet.salute}/100`)
  }

  // ─── EVOLVI ────────────────────────────────────────
  if (/^evolvi$/.test(command)) {
    if (!pet) return m.reply('Nessun animale.')

    const expNext = expRichiesta(pet.livello)
    if (pet.exp < expNext) {
      return m.reply(`${pet.nome} ha bisogno di ${expNext - pet.exp} EXP per evolversi.\nEXP attuale: ${pet.exp}/${expNext}`)
    }

    pet.exp -= expNext
    pet.livello++
    const fase = getFase(pet)

    setPet(user, pet)
    await global.db.write()

    return m.reply(`✨ *EVOLUZIONE!* ✨\n\n${pet.nome} è ora al livello ${pet.livello}!\n${fase}`)
  }

  // ─── ABBANDONA ─────────────────────────────────────
  if (/^(abbandona|rilascia)$/.test(command)) {
    if (!pet) return m.reply('Nessun animale.')

    const nome = pet.nome
    setPet(user, null)
    await global.db.write()

    return m.reply(`😢 Hai salutato ${nome} per sempre.`)
  }

  // ─── CLASSIFICA ────────────────────────────────────
  if (/^(classificaanimali|topanimali)$/.test(command)) {

    const users = Object.entries(global.db.data.users)
      .filter(([_, v]) => v.pet)
      .sort((a, b) => {
        const lvDiff = b[1].pet.livello - a[1].pet.livello
        return lvDiff !== 0 ? lvDiff : b[1].pet.exp - a[1].pet.exp
      })
      .slice(0, 10)

    if (!users.length) return m.reply('Nessun animale in classifica.')

    const medaglie = ['🥇', '🥈', '🥉']
    let txt = '🏆 *TOP PET*\n\n'

    for (let i = 0; i < users.length; i++) {
      const p    = users[i][1].pet
      const dati = TUTTI[p.tipo]
      const fase = getFase(p)
      const med  = medaglie[i] || `${i + 1}.`
      txt += `${med} ${fase} *${p.nome}* — Lv.${p.livello}\n`
      if (dati) txt += `   _${p.tipo}_ ${p.esotico ? '⭐' : ''}\n`
    }

    return m.reply(txt)
  }
}

// ─── CONTROLLO LIVELLO AUTOMATICO ───────────────────
function controllaLivello(pet) {
  while (pet.exp >= expRichiesta(pet.livello)) {
    pet.exp -= expRichiesta(pet.livello)
    pet.livello++
  }
  return pet
}

// ─── REGEX COMANDI ──────────────────────────────────
handler.command = /^(adopt|esotico|animale|pet|miopet|nutri|mangia|gioca|cura|heal|evolvi|abbandona|rilascia|classificaanimali|topanimali)$/i

handler.group = true

export default handler
