import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'
import { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage } from '@realvare/based'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
    global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });
}

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await conn.groupMetadata(chatId);
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) continue;
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {
                    if (!e?.message?.includes('not authorized') && !e?.message?.includes('chat not found') && !e?.message?.includes('not in group')) {
                        console.error(`[ERRORE] Errore nell'aggiornamento cache su groups.update per ${update.id}:`, e)
                    }
                }
            }
        })
        // DYNAMIC BOT PERMISSIONS: Ascolta promozioni/demozioni del bot per aggiornare la cache senza reboot
        conn.ev.on('group-participants.update', async (update) => {
            if (!update || !update.id || !update.participants || !update.action) return;
            const botJid = conn.user?.jid?.split(':')[0] + '@s.whatsapp.net';
            const isBotAffected = update.participants.some(p => {
                const normalized = p.split(':')[0] + '@s.whatsapp.net';
                return normalized === botJid;
            });
            if (isBotAffected && (update.action === 'promote' || update.action === 'demote')) {
                console.log(`[BOT PERM] Rilevata ${update.action} del bot in ${update.id}, invalidazione cache.`);
                global.groupCache.del(update.id);
                try {
                    const freshMetadata = await fetchGroupMetadataWithRetry(conn, update.id);
                    if (freshMetadata) {
                        global.groupCache.set(update.id, freshMetadata, { ttl: 300 });
                        const nowAdmin = freshMetadata.participants.some(p => (p.id === botJid || p.id === conn.user?.jid) && (p.admin === 'admin' || p.admin === 'superadmin'));
                        console.log(`[BOT PERM] Cache aggiornata per ${update.id}, bot admin: ${nowAdmin}`);
                    }
                } catch (e) { console.error(`[BOT PERM] Errore ricaricando metadati per ${update.id}:`, e.message); }
            }
        });
        global.cacheListenersSet = true
    }
}

if (!global.pollListenerSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('messages.update', async (chatUpdate) => {
            for (const { key, update } of chatUpdate) {
                if (update.pollUpdates) {
                    try {
                        const pollCreation = await global.store.getMessage(key)
                        if (pollCreation) {
                            await getAggregateVotesInPollMessage({
                                message: pollCreation,
                                pollUpdates: update.pollUpdates,
                            })
                        }
                    } catch (e) {
                        console.error('[ERRORE] Errore nel gestire poll update:', e)
                    }
                }
            }
        })
        global.pollListenerSet = true
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const {
                timeout = 30000,
                validResponses = null,
                onTimeout = null,
                filter = null
            } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, {
                    resolve,
                    timeoutId,
                    validResponses,
                    filter
                })
            })
        }
    }
}

global.processedCalls = global.processedCalls || new Map()
if (global.conn && global.conn.ws) {
    global.conn.ws.on('CB:call', async (json) => {
        try {
            if (!json?.tag || json.tag !== 'call' || !json.attrs?.from) {
                return
            }
            const callerId = global.conn.decodeJid(json.attrs.from)
            const isOwner = global.owner.some(([num]) => num === callerId.split('@')[0])
            if (isOwner) return

            const eventId = json.attrs.id
            let actualCallId = null
            if (json.content?.length > 0) {
                for (const item of json.content) {
                    if (item.attrs && item.attrs['call-id']) {
                        actualCallId = item.attrs['call-id']
                        break
                    }
                }
            }
            const uniqueCallId = actualCallId || eventId
            if (json.content?.length > 0) {
                const contentTags = json.content.map(item => item.tag)
                if (contentTags.includes('terminate')) {
                    global.processedCalls.delete(uniqueCallId)
                    return
                }
                if (contentTags.includes('relaylatency')) {
                    if (global.processedCalls.has(uniqueCallId)) {
                        return
                    }
                    global.processedCalls.set(uniqueCallId, true)

                    const numero = callerId.split('@')[0]
                    let nome = global.nameCache.get(callerId);
                    if (!nome) {
                      nome = global.conn.getName(callerId) || 'Sconosciuto'
                      global.nameCache.set(callerId, nome);
                    }
                    console.log(`[📞] chiamata in arrivo da ${numero} - ${nome}`)

                    if (!global.db.data) await global.loadDatabase()
                    let settings = global.db.data?.settings?.[global.conn.user.jid]
                    if (!settings) {
                        settings = global.db.data.settings[global.conn.user.jid] = {
                            jadibotmd: false,
                            antiPrivate: true,
                            soloCreatore: false,
                            anticall: true,
                            status: 0
                        }
                    }
                    if (!settings.anticall) return

                    let user = global.db.data.users[callerId] || (global.db.data.users[callerId] = { callCount: 0, banned: false })
                    if (user.banned) {
                        await global.conn.rejectCall(uniqueCallId, callerId)
                        return
                    }
                    user.callCount = (user.callCount || 0) + 1
                    try {
                        await global.conn.rejectCall(uniqueCallId, callerId)
                        console.log(`[📞] chiamata di ${numero} - ${nome} rifiutata`)
                        if (user.callCount >= 3) {
                            user.banned = true
                            user.bannedReason = 'Troppi tentativi di chiamata'
                            const msg = `🚫 Quanto puoi essere sfigato per spammare di call smh.`
                            await global.conn.sendMessage(toJid(callerId), { text: msg })
                        } else {
                            const msg = `🚫 Chiamata rifiutata automaticamente, non chiamare il bot.`
                            await global.conn.sendMessage(toJid(callerId), { text: msg })
                        }
                    } catch (err) {
                        console.error('[ERRORE] Errore nel gestire la chiamata:', err)
                        global.processedCalls.delete(uniqueCallId)
                    }
                }
            }
        } catch (e) {
            console.error('[ERRORE] Errore generale gestione chiamata:', e)
        }
    })
}

setInterval(() => {
    if (global.processedCalls.size > 10) {
        global.processedCalls.clear()
    }

}, 180000)

export async function participantsUpdate({ id, participants, action }) {
    if (global.db.data.chats[id]?.rileva === false) return

    try {
        let metadata = global.groupCache.get(id) || await fetchMetadata(this, id)
        if (!metadata) return

        global.groupCache.set(id, metadata, { ttl: 300 })
        for (const user of participants) {
            const normalizedUser = this.decodeJid(user)
            let userName = global.nameCache.get(normalizedUser);
            if (!userName) {
              userName = (await this.getName(normalizedUser)) || normalizedUser.split('@')[0] || 'Sconosciuto'
              global.nameCache.set(normalizedUser, userName);
            }
            switch (action) {
                case 'add':
                    break
                case 'remove':
                    break
                case 'promote':
                    break
                case 'demote':
                    break
            }
        }
    } catch (e) {
        console.error(`[ERRORE] Errore in participantsUpdate per ${id}:`, e)
    }
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
    const key = m.message.protocolMessage.key;
    const editedMessage = m.message.protocolMessage.editedMessage;
    m.key = key;
    m.message = editedMessage;
    m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || '';
    m.mtype = Object.keys(editedMessage)[0];
    console.log(`[EDIT] Messaggio ${key.id} modificato in ${key.remoteJid}`);
}
    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.fromMe) return
    if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return

    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }
    if (!m.key.remoteJid) return
    if (!this.originalGroupParticipantsUpdate) {
        this.originalGroupParticipantsUpdate = this.groupParticipantsUpdate
        this.groupParticipantsUpdate = async function(chatId, users, action) {
            try {
                let metadata = global.groupCache.get(chatId)
                if (!metadata) {
                    metadata = await fetchMetadata(this, chatId)
                    if (metadata) global.groupCache.set(chatId, metadata, { ttl: 300 })
                }
                if (!metadata) {
                    console.error('[ERRORE] Nessun metadato del gruppo disponibile per un aggiornamento sicuro')
                    return this.originalGroupParticipantsUpdate.call(this, chatId, users, action)
                }

                const correctedUsers = users.map(userJid => {
                    const decoded = this.decodeJid(userJid)
                    const phone = decoded.split('@')[0].replace(/:\d+$/, '')
                    const participant = metadata.participants.find(p => {
                        const pId = this.decodeJid(p.id)
                        const pPhone = pId.split('@')[0].replace(/:\d+$/, '')
                        return pPhone === phone
                    })
                    return participant ? participant.id : userJid
                })

                return this.originalGroupParticipantsUpdate.call(this, chatId, correctedUsers, action)
            } catch (e) {
                console.error('[ERRORE] Errore in safeGroupParticipantsUpdate:', e)
                throw e
            }
        }
    }

    initResponseHandler(this)

    let user = null
    let chat = null
    let usedPrefix = null
    let normalizedSender = null
    let normalizedBot = null
    try {
        if (m.message?.eventResponseMessage) {
            const { eventId, response } = m.message.eventResponseMessage
            const jid = this.decodeJid(m.key.remoteJid)
            const userId = this.decodeJid(m.key.participant || m.key.remoteJid)
            const action = response === 'going' ? 'join' : 'leave'

            try {
                if (!global.activeEvents) global.activeEvents = new Map()
                if (!global.activeGiveaways) global.activeGiveaways = new Map()

                let eventData = global.activeEvents.get(eventId) || global.activeGiveaways.get(jid)
                if (eventData) {
                    if (!eventData.participants) eventData.participants = new Set()
                    if (action === 'join') {
                        eventData.participants.add(userId)
                    } else {
                        eventData.participants.delete(userId)
                    }
                }
            } catch (e) {
                console.error('[ERRORE] Errore nel gestire eventResponseMessage:', e)
            }
        }

        if (m.message?.interactiveResponseMessage) {
            const interactiveResponse = m.message.interactiveResponseMessage
            if (interactiveResponse.nativeFlowResponseMessage?.paramsJson) {
                try {
                    const params = JSON.parse(interactiveResponse.nativeFlowResponseMessage.paramsJson)
                    if (params.id) {
                        const fakeMessage = {
                            key: m.key,
                            message: { conversation: params.id },
                            messageTimestamp: m.messageTimestamp,
                            pushName: m.pushName,
                            broadcast: m.broadcast
                        }
                        const processedMsg = smsg(this, fakeMessage)
                        if (processedMsg) {
                            processedMsg.text = params.id
                            return handler.call(this, { messages: [processedMsg] })
                        }
                    }
                } catch (e) {
                    console.error('❌ Errore parsing nativeFlowResponse:', e)
                }
            }
        }

        if (!global.db.data) await global.loadDatabase()
        m.exp = 0
        m.euro = false
        m.isCommand = false

        normalizedSender = this.decodeJid(m.sender)
        normalizedBot = this.decodeJid(this.user.jid)
if (!normalizedSender) return;

        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = {
    // --- Variabili Base ---
    exp: 0,
    money: 0,
    euro: 0,
    muto: false,
    registered: false,
    name: m.pushName || '?',
    age: -1,
    regTime: -1,
    banned: false,
    bannedReason: '',
    bank: 0,
    level: 0,
    firstTime: Date.now(),
    spam: 0,
    antispam: 0,
    messages: 0,

    // --- Variabili Famiglia (Elixir Tree) ---
    p: [],               // Prole: Lista dei JID dei figli adottati
    s: null,             // Senior: JID del genitore che ti ha adottato

    // --- Economia & Lavoro ---
    properties: [],      // Lista case, ville, business
    vehicles: [],        // Lista auto, yacht, jet
    job: null,           // Nome del lavoro attuale
    salary: 0,           // Paga base
    workExp: 0,          // Esperienza lavorativa per i bonus
    corrotto: false,     // Stato protezione corruzione
    corrottoExp: 0,      // Scadenza protezione corruzione
    lastClaim: 0,        // Ultimo ritiro stipendio/rendite
    inventory: {},       // Inventario oggetti (darkweb, etc.)
    coin: 0,             // Coin reward (mensile/settimanale)
    diamonds: 0,         // Diamanti reward (mensile)

    // --- Sistemi Giornalieri/Settimanali/Mensili ---
    lastclaim: 0,        // Ultimo claim giornaliero
    streak: 0,           // Striek giornaliero
    weekly: 0,           // Ultimo claim settimanale
    monthly: 0,          // Ultimo claim mensile
    dailyActivity: [],   // Attività giornaliera (settimanale)
    lastActivity: 0,     // Ultima attività

    // --- Warn e Penalità ---
    warn: 0,             // Warn generali
    warns: {},           // Warn per chat (anti-link, anti-tagall)
    antiLink2Warns: 0,   // Warn specifici anti-link2
    ultimatum: 0,        // Contatore ultimatum (gp-ultimatum)

    // --- Statistiche ---
    bestemmie: 0,        // Contatore bestemmie
    messaggi: 0,         // Contatore messaggi (messagiometri)
    lastrob2: 0,         // Timestamp ultimo furto (euro-rubare)
    lastpizzu: 0,        // Timestamp ultimo pizzo (mafia-sicilia)

    // --- Premium ---
    premium: false,       // Stato premium
    premiumTime: 0,       // Scadenza premium

    // --- Sistemi di Gioco ---
    role: 'Principiante', // Ruolo utente (bot-ruoli)
    profile: {            // Profilo utente
        description: '',
        gender: '',
        instagram: '',
        city: '',
        birthday: '',
        occupation: ''
    },
    infinito: false,     // Stato infinito (creatore-infinito)

    // --- BOUNTY / TAGLIE (Aggiunti in questa sessione) ---
    bounty: 0,           // Taglia attiva sull'utente
    lastBountyAlert: 0,  // Timestamp ultimo avviso latitante
    lastHunt: 0          // Timestamp ultima caccia (cooldown 15min)
})

        chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {
            isBanned: false,
            welcome: false,
            goodbye: false,
            ai: false,
            vocali: false,
            antiporno: true,
            antioneview: false,
            autolevelup: false,
            antivoip: false,
            rileva: false,
            modoadmin: true, // ✅ DEFAULT: ATTIVO - Solo admin possono comandare
            antiLink: true,  // ✅ DEFAULT: ATTIVO - Blocca link WhatsApp
            antiLink2: false,
            antiLinkUni: false, // ✅ DEFAULT: DISATTIVO - Blocca ogni tipo di link/URL
            reaction: false,
            antispam: false,
            safetyMode: false,
            antiBot: true,   // ✅ DEFAULT: ATTIVO - Rileva e rimuove bot esterni
            antiBot2: true,  // ✅ DEFAULT: ATTIVO - Blocca sub-bot
            antinuke: true,  // ✅ DEFAULT: ATTIVO - Protezione anti-raid
            expired: 0,
            users: {}
        })

        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = {
            autoread: false,
            jadibotmd: false,
            antiPrivate: true,
            soloCreatore: false,
            registrazioni: true, 
            status: 0
        })

        if (settings.registrazioni === false) {
            user.registered = true;
        }

        if (m.mtype === 'pollUpdateMessage') return
        if (m.mtype === 'reactionMessage') return
        let groupMetadata = m.isGroup ? global.groupCache.get(m.chat) : null
        let participants = null
        let normalizedParticipants = null
        let isBotAdmin = false
        let isAdmin = false
        let isRAdmin = false
        let isSam = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isROwner = isSam || global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isOwner = isROwner || m.fromMe
        let isMods = isOwner || global.mods?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false
        let isPrems = isROwner || global.prems?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false

        let modsList = global.db.data.chats[m.chat]?.moderatori || []
        let isMod = modsList.includes(normalizedSender)

        // === BLOCCAGGIO GLOBALE: Utente o Chat/Gruppo bannato ===
        // Blocca immediatamente qualsiasi comando se l'utente o la chat sono bannati
        // (eccetto per owner/rowner che possono usare i comandi di sban)
        if (user.banned && !isROwner && !isOwner) {
            console.log(`[BLOCCATO] Utente bannato ${normalizedSender} bloccato globalmente.`)
            return
        }
        if (chat.isBanned && !isROwner && !isOwner) {
            console.log(`[BLOCCATO] Chat bannata ${m.chat} - comando ignorato per ${normalizedSender}`)
            return
        }

        // === PROTEZIONE DM: Blocca utenti comuni in privato ===
        if (!m.isGroup && !isOwner && !isROwner) {
            console.log(`[DM BLOCK] Utente comune ${normalizedSender} bloccato in privato.`)
            try {
                await this.updateBlockStatus(m.chat, 'block')
            } catch (e) {
                console.error('[DM BLOCK] Errore nel bloccare utente:', e)
            }
            return // Silenzioso: nessun messaggio di risposta
        }

        if (m.isGroup) {
            if (!groupMetadata) {
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat)
                if (groupMetadata) {
                    groupMetadata.fetchTime = Date.now()
                    global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
                }
            }
            if (groupMetadata) {
                participants = groupMetadata.participants
                normalizedParticipants = participants.map(u => {
                    const normalizedId = this.decodeJid(u.id)
                    return { ...u, id: normalizedId, jid: u.jid || normalizedId }
                })
                const normalizedOwner = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null
                const normalizedOwnerLid = groupMetadata.ownerLid ? this.decodeJid(groupMetadata.ownerLid) : null

                isAdmin = (participants.some(u => {
                    const participantIds = [
                        this.decodeJid(u.id),
                        u.jid ? this.decodeJid(u.jid) : null,
                        u.lid ? this.decodeJid(u.lid) : null
                    ].filter(Boolean)
                    const isMatch = participantIds.includes(normalizedSender)
                    return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                }) || isMod)

                isBotAdmin = participants.some(u => {
                    const participantIds = [
                        this.decodeJid(u.id),
                        u.jid ? this.decodeJid(u.jid) : null,
                        u.lid ? this.decodeJid(u.lid) : null
                    ].filter(Boolean)
                    const isMatch = participantIds.includes(normalizedBot)
                    return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                }) || (normalizedBot === normalizedOwner || normalizedBot === normalizedOwnerLid)

                isRAdmin = isAdmin && (normalizedSender === normalizedOwner || normalizedSender === normalizedOwnerLid)

                if (m.isGroup && !isAdmin) {
                    const secondMetadata = await fetchGroupMetadataWithRetry(this, m.chat)
                    if (secondMetadata) {
                        secondMetadata.fetchTime = Date.now()
                        global.groupCache.set(m.chat, secondMetadata, { ttl: 300 })
                        participants = secondMetadata.participants
                        normalizedParticipants = participants.map(u => {
                            const normalizedId = this.decodeJid(u.id)
                            return { ...u, id: normalizedId, jid: u.jid || normalizedId }
                        })

                        isAdmin = (participants.some(u => {
                            const participantIds = [
                                this.decodeJid(u.id),
                                u.jid ? this.decodeJid(u.jid) : null,
                                u.lid ? this.decodeJid(u.lid) : null
                            ].filter(Boolean)
                            const isMatch = participantIds.includes(normalizedSender)
                            return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                        }) || isMod)

                        isBotAdmin = participants.some(u => {
                            const participantIds = [
                                this.decodeJid(u.id),
                                u.jid ? this.decodeJid(u.jid) : null,
                                u.lid ? this.decodeJid(u.lid) : null
                            ].filter(Boolean)
                            const isMatch = participantIds.includes(normalizedBot)
                            return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                        }) || (normalizedBot === normalizedOwner || normalizedBot === normalizedOwnerLid)
                    }
                }
            }
        }

        const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        // EARLY EXIT: Se il testo non inizia con un prefix valido, salta il loop dei comandi
        const skipPluginCommandLoop = !m.text || !(
          (typeof global.prefix === 'string' && m.text.startsWith(global.prefix)) ||
          (global.prefix instanceof RegExp && global.prefix.test(m.text?.charAt(0))) ||
          m.text.startsWith('.') || m.text.startsWith('#') || m.text.startsWith('!') || m.text.startsWith('/')
        )
        // Eseguiamo comunque gli hook plugin.all (es. bot-ia.js che processa ogni messaggio)
        const hasPluginAllHooks = Object.values(global.plugins).some(p => typeof p.all === 'function')

        if (!skipPluginCommandLoop || hasPluginAllHooks) {
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue

            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error('[ERRORE] Errore in plugin.all:', e)
                }
            }

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix || global.prefix || '.'
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] :
                [[[], new RegExp]]).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants: normalizedParticipants,
                    groupMetadata,
                    user: { admin: isAdmin ? 'admin' : null },
                    bot: { admin: isBotAdmin ? 'admin' : null },
                    isSam,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue

            if (!match || !match[0]) continue

            usedPrefix = (match[0] || '')[0]
            if (usedPrefix) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = command?.toLowerCase() || ''
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                // ===== CENTRALIZED PRE-FILTER: Controllo permessi anticipato =====
                // Questi controlli avvengono PRIMA del re-fetch metadata per risparmiare CPU
                if (plugin.disabled && !isOwner) { fail('disabled', m, this); continue }
                if (user.muto && !isROwner && !isOwner) {
                    await this.sendMessage(m.chat, { text: `🚫 Hai il cazzo di elixir in bocca,non puoi usare i comandi.` }, { quoted: m }).catch(e => console.error('[ERRORE] Errore nell\'invio del messaggio:', e))
                    return
                }
                const ignoredGlobally = global.ignoredUsersGlobal.has(normalizedSender)
                const ignoredInGroup = m.isGroup && global.ignoredUsersGroup[m.chat]?.has(normalizedSender)
                if ((ignoredGlobally || ignoredInGroup) && !isROwner) {
                    await this.sendMessage(m.chat, { text: `🚫 Ma chi ti ha dato il permesso di provare sto comando, mongoplettico.` }, { quoted: m }).catch(e => console.error('[ERRORE] Errore nell\'invio del messaggio:', e))
                    return
                }

                // Pre-filtro gerarchia permessi: ordine logico dal più alto al più basso
                // Questi controlli sono completamente centralizzati e non richiedono logica nei plugin
                if (plugin.sam && !isSam) { fail('sam', m, this); continue }
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && !user.registered) { fail('unreg', m, this); continue }
                // I controlli admin/botAdmin richiedono eventualmente un refresh dei metadati
                if (plugin.admin && m.isGroup && !isOwner && !isROwner) {
                    // Refresh solo se necessario: potrebbe essere cambiato dopo l'avvio (bot promosso)
                    if (!isAdmin && (global.groupCache.get(m.chat)?.fetchTime || 0) < Date.now() - 60000) {
                        const fresh = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat);
                        if (fresh) {
                            global.groupCache.set(m.chat, fresh, { ttl: 300 });
                            const botParticipant = fresh.participants.find(u => {
                                const ids = [this.decodeJid(u.id), u.jid ? this.decodeJid(u.jid) : null].filter(Boolean);
                                return ids.includes(normalizedBot);
                            });
                            if (botParticipant) isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin' || botParticipant.isAdmin === true;
                        }
                    }
                    if (!isAdmin) { fail('admin', m, this); continue }
                }
                if (plugin.botAdmin && m.isGroup && !isOwner) {
                    if (!isBotAdmin) { fail('botAdmin', m, this); continue }
                }
                if (chat.modoadmin && !isOwner && !isROwner && m.isGroup && !isAdmin) return
                if (settings.soloCreatore && !isROwner) return
                // ===== FINE PRE-FILTER =====

                m.plugin = name
                if (chat.isBanned && !isROwner && !['gp-sbanchat.js', 'creatore-exec.js', 'gp-delete.js'].includes(name)) return
                if (user.banned && !isROwner && name !== 'creatore-banuser.js') {
                    if (user.antispam > 2) return
                    await this.sendMessage(m.chat, {
                        text: `🚫 *Elixir ti ha tolto il privileggio di usare il bot*.\n\n${user.bannedReason ? `🥀 Motivo: ${user.bannedReason}` : `🥀 Elixir non ha bisogno di motivazioni`}\n\n⚠️ Contatta il creatore con *${usedPrefix}segnala* per problemi.`
                    }, { quoted: m }).catch(e => console.error('[ERRORE] Errore nell\'invio del messaggio:', e))
                    user.antispam++
                    return
                }

                if (m.isGroup && !isOwner && !isROwner && !isAdmin && chat.antispam) {
                    const groupData = global.groupSpam[m.chat] || (global.groupSpam[m.chat] = { count: 0, firstCommandTimestamp: 0, isSuspended: false })
                    const now = Date.now()
                    if (groupData.isSuspended) return
                    if (now - groupData.firstCommandTimestamp > 60000) { groupData.count = 1; groupData.firstCommandTimestamp = now }
                    else { groupData.count++ }
                    if (groupData.count > 8) {
                        groupData.isSuspended = true
                        await this.reply(m.chat, `『 ⚠️ 』 \`Anti-spam comandi\`\n\n> Rilevati troppi comandi in un minuto, aspettate \`15 secondi\` prima di riutilizzare i comandi.\n\n*ℹ️ Gli admin del gruppo sono esenti da questo limite.*`, m).catch(e => console.error('[ERRORE] Errore nell\'invio della risposta:', e))
                        setTimeout(() => { delete global.groupSpam[m.chat]; console.log(`[Anti-Spam] Comandi riattivati per il gruppo: ${m.chat}`) }, 15000)
                        return
                    }
                }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) {
                    await this.reply(m.chat, 'bzzzzz', m).catch(e => console.error('[ERRORE] Errore nella risposta:', e))
                } else {
                    m.exp += xp
                }

                if (!isPrems && plugin.euro && user.euro < plugin.euro) {
                    await this.reply(m.chat, `Niente più soldini, stupido poraccio`, m, null, global.fake).catch(e => console.error('[ERRORE] Errore nella risposta:', e))
                    continue
                }

                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants: normalizedParticipants,
                    groupMetadata,
                    user: { admin: isAdmin ? 'admin' : null },
                    bot: { admin: isBotAdmin ? 'admin' : null },
                    isSam,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }

                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.euro = plugin.euro || false
                } catch (e) {
                    m.error = e
                    console.error(`[ERRORE] Errore nell'esecuzione del plugin per la chat ${m.chat}, mittente ${m.sender}:`, e)
                    if (e && e.message && e.message.includes('rate-overlimit')) {
                        console.warn('[AVVISO] Rate limit raggiunto, ritento dopo 2 secondi...')
                        await delay(2000)
                    }
                    let textErr = format(e)
                    await this.reply(m.chat, textErr, m).catch(err => console.error('[ERRORE] Errore nella risposta:', err))
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error('[ERRORE] Errore in plugin.after:', e)
                        }
                    }
                    if (m.euro) {
                        await this.reply(m.chat, `\`Hai utilizzato *${+m.euro}*\``, m, null, global.rcanal).catch(e => console.error('[ERRORE] Errore nell\'invio della risposta:', e))
                    }
                }
                break
            }
        }
        } // fine if (!skipPluginCommandLoop || hasPluginAllHooks)
    } catch (e) {
        console.error(`[ERRORE] Errore nel handler per la chat ${m.chat}, mittente ${m.sender}:`, e)
    } finally {
        if (m && user && user.muto && !m.fromMe) {
            await this.sendMessage(m.chat, { delete: m.key }).catch(e => console.error('[ERRORE] Errore nell\'eliminazione del messaggio:', e))
        }

        if (m && user) {
            user.exp += m.exp || 0
            user.euro -= m.euro * 1 || 0
            if (!user.messages) user.messages = 0;
            user.messages++;
            if (m.isGroup) {
                if (!chat.users) chat.users = {};
                const senderId = normalizedSender;
                if (!chat.users[senderId]) {
                    chat.users[senderId] = { messages: 0 };
                }
                chat.users[senderId].messages++;
            }

            if (m.plugin) {
                let stats = global.db.data.stats || (global.db.data.stats = {})
                let stat = stats[m.plugin] || (stats[m.plugin] = {
                    total: 0,
                    success: 0,
                    last: 0,
                    lastSuccess: 0
                })
                const now = +new Date
                stat.total += 1
                stat.last = now
                if (!m.error) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!global.opts['noprint'] && m) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.error('[ERRORE] Errore in print:', e)
        }

        let settingsREAD = global.db.data.settings[this.user.jid] || {}
        if ((global.opts['autoread'] || settingsREAD.autoread2) && m) {
            await this.readMessages([m.key]).catch(e => console.error('[ERRORE] Errore nella lettura del messaggio:', e))
        }

        if (chat && chat.reaction && m?.text?.match(/(mente|zione|tà|ivo|osa|issimo|ma|però|eppure|anche|ma|no|se|ai|ciao|si)/gi) && !m.fromMe) {
            const emot = pickRandom([
                "🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰"
            ])
            await this.sendMessage(m.chat, { react: { text: emot, key: m.key } }).catch(e => console.error('[ERRORE] Errore nell\'invio della reazione:', e))
        }
    }
}

global.dfail = async (type, m, conn) => {
    const settings = global.db.data.settings[conn.user.jid] || {}
    if (type === 'unreg' && settings.registrazioni === false) return

    const nome = m.pushName || 'sam'
    const etarandom = Math.floor(Math.random() * 21) + 13
        const msg = {
        sam: '🔒 𝗔𝗖𝗖𝗘𝗦𝗦𝗢 𝗥𝗜𝗦𝗘𝗥𝗩𝗔𝗧𝗢\n Solo elixir puo usare sto comando.',
        rowner: '👑 𝗕𝗢𝗦𝗦\nFratello solo i miei friend possono usare sto comando.',
        owner: '🛡️ 𝗖𝗔𝗣𝗢\nSolo i Capo possono eseguire questo comando, mbàre.',
        mods: '⚙️ 𝗦𝗢𝗦𝗧𝗢𝗖𝗔𝗣𝗢\nSolo i sottocapi possono ordinarlo.',
        premium: '💎 𝗙𝗜𝗗𝗘𝗟𝗜𝗧À\nMbare, serve lo status Premium per usare questo potere.',
        group: '👥 𝗙AMIGLIA\nQuesto comando funziona solo nel gruppo.',
        private: '📩 𝗙ACCENDA PRIVATA\nParla direttamente con il Boss, mbare.',
        admin: '🛠️ 𝗔𝗜𝗨𝗧𝗔𝗡𝗧𝗘\nSolo gli aiutanti del clan possono dare quest’ordine.',
        botAdmin: '🤖 𝗩𝗜𝗚𝗜𝗟𝗘\nIl bot deve avere poteri da Admin per agire.',
        unreg: `📛 𝗡𝗨𝗢𝗩𝗢 𝗣𝗜𝗖𝗖𝗜𝗢𝗧𝗧𝗢
Mbare, prima ti devi registrrare.

Esempio:
.reg ${nome} ${etarandom}`,
        restrict: '🚫 𝗭𝗢𝗡𝗔 𝗖𝗛𝗜𝗨𝗦𝗔\nFunzione momentaneamente bloccata.',
        disabled: '🚫 𝗢𝗥𝗗𝗜𝗡𝗘 𝗦𝗢𝗦𝗣𝗘𝗦𝗢\nQuesto comando è stato disattivato.'
    }[type]
    if (msg) {
        conn.reply(m.chat, msg, m, global.rcanal).catch(e => console.error('[ERRORE] Errore in dfail:', e))
    }
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => { 
    unwatchFile(file)     
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})
