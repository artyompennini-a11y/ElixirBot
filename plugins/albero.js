// Plug-in creato da elixir (Fix testuale per Termux)
import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/database/sposi.json');
if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });

// --- UTILS DATABASE ---
const loadMarriages = () => {
    try { return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {}; } 
    catch (e) { return {}; }
}
const saveMarriages = (data) => fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));

const checkUser = (id) => {
    if (!id) return
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let u = global.db.data.users[id]
    if (!Array.isArray(u.p)) u.p = [] 
    if (u.s === undefined) u.s = null 
}

// --- HANDLER ---
let handler = async (m, { conn, command, usedPrefix }) => {
    let user = m.sender;
    checkUser(user);
    let marriages = loadMarriages();

    // --- ALBERO GENEALOGICO (TESTUALE) ---
    if (command === 'albero' || command === 'famigliamia') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : user);
        checkUser(target);
        
        let u = global.db.data.users[target];
        let partner = marriages[target];
        let padre = u.s;
        let figli = u.p || [];
        
        let targetName = await conn.getName(target);
        let mentions = [target];

        let txt = `✨ 📜 *SACRO ALBERO DELLA DINASTIA* 📜 ✨\n\n`;
        
        // 1. Linea Genitore
        if (padre) {
            let padreName = await conn.getName(padre);
            txt += `👑 *Genitore:* ${padreName} (@${padre.split('@')[0]})\n`;
            txt += `   │\n`;
            txt += `   ▼\n`;
            mentions.push(padre);
        } else {
            txt += `🌌 *Origine:* Stirpe nata dalle stelle (Nessun genitore)\n   │\n   ▼\n`;
        }

        // 2. Linea Centrale (Soggetto + Partner)
        if (partner) {
            let partnerName = await conn.getName(partner);
            txt += `👤 *IO:* ${targetName} 💍 *PARTNER:* ${partnerName} (@${partner.split('@')[0]})\n`;
            mentions.push(partner);
        } else {
            txt += `👤 *IO:* ${targetName} (In cerca dell'anima gemella 🌌)\n`;
        }

        // 3. Linea Figli
        if (figli.length > 0) {
            txt += `   │\n`;
            txt += `   ├───────────────┐\n`;
            txt += `   ▼               ▼\n`;
            txt += `👶 *Discendenza (${figli.length}):*\n`;
            
            for (let i = 0; i < figli.length; i++) {
                let figlioId = figli[i];
                let figlioName = await conn.getName(figlioId);
                txt += `${i === figli.length - 1 ? '   └──' : '   ├──'} 🍼 ${figlioName} (@${figlioId.split('@')[0]})\n`;
                mentions.push(figlioId);
            }
        } else {
            txt += `\n🍁 *Ramo Terminale:* Questa dinastia non ha ancora eredi.`;
        }

        txt += `\n\n_I legami di @${target.split('@')[0]} sono scritti nel destino del regno._`;

        return conn.sendMessage(m.chat, { text: txt, mentions: mentions }, { quoted: m });
    }

    // --- MATRIMONIO ---
    if (command === 'sposa') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
        if (!target || target === user) return m.reply('`⚠️ Devi indicare a chi vuoi donare il tuo cuore.`');
        if (marriages[user] || marriages[target]) return m.reply('`⚠️ I vostri cuori appartengono già ad altri rami...`');
        
        global.marriage_proposals = global.marriage_proposals || {};
        global.marriage_proposals[target] = { proposer: user, target: target, timeout: setTimeout(() => delete global.marriage_proposals[target], 60000) };

        const buttons = [
            { buttonId: `${usedPrefix}accettasposa`, buttonText: { displayText: 'Sì, ti scelgo 💍' }, type: 1 },
            { buttonId: `${usedPrefix}rifiuta`, buttonText: { displayText: 'Non ora... ❌' }, type: 1 }
        ];
        return conn.sendMessage(m.chat, { 
            text: `💍 *UNA PROMESSA DI ETERNITÀ*\n\n@${user.split('@')[0]} ha chiesto la tua mano @${target.split('@')[0]}.\n\n*Solo @${target.split('@')[0]} può rispondere.*`, 
            buttons: buttons, mentions: [user, target] 
        }, { quoted: m });
    }

    if (command === 'accettasposa') {
        let prop = global.marriage_proposals[user];
        if (!prop || user !== prop.target) return;
        marriages[user] = prop.proposer; marriages[prop.proposer] = user;
        saveMarriages(marriages); clearTimeout(prop.timeout); delete global.marriage_proposals[user];
        return m.reply('✨ *Le campane suonano all\'unisono! Da oggi le vostre anime sono intrecciate in un legame sacro.* 💖');
    }

    if (command === 'divorzia') {
        let p = marriages[user];
        if (!p) return m.reply('`⚠️ Non sei vincolato a nessuno sposo.`');
        delete marriages[user]; delete marriages[p];
        saveMarriages(marriages);
        return m.reply('💔 *L\'INCANTO SI È SPEZZATO...* \n\nLe vostre strade si dividono qui. Quello che un tempo era un "noi", ora torna ad essere solo polvere e ricordi.');
    }

    // --- ADOZIONE ---
    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
        if (!target || target === user) return m.reply('`⚠️ Chi cerchi di accogliere sotto la tua protezione?`');
        checkUser(target);
        if (global.db.data.users[target].s) return m.reply('`❌ Questa persona ha già un genitore.`');
        
        global.adoption_proposals = global.adoption_proposals || {};
        global.adoption_proposals[target] = { proposer: user, target: target, timeout: setTimeout(() => delete global.adoption_proposals[target], 60000) };

        const buttons = [
            { buttonId: `${usedPrefix}accettaadozione`, buttonText: { displayText: 'Accetta la famiglia 🍼' }, type: 1 },
            { buttonId: `${usedPrefix}rifiuta`, buttonText: { displayText: 'Resto solo ❌' }, type: 1 }
        ];
        return conn.sendMessage(m.chat, { 
            text: `🍼 *UN ATTO DI AMORE E PROTEZIONE*\n\n@${user.split('@')[0]} desidera adottarti come figlio/a @${target.split('@')[0]}.\n\n*Solo @${target.split('@')[0]} può accettare.*`, 
            buttons: buttons, mentions: [user, target] 
        }, { quoted: m });
    }

    if (command === 'accettaadozione') {
        let prop = global.adoption_proposals[user];
        if (!prop || user !== prop.target) return;
        checkUser(prop.proposer);
        checkUser(user);
        
        global.db.data.users[user].s = prop.proposer;
        if (!global.db.data.users[prop.proposer].p.includes(user)) {
            global.db.data.users[prop.proposer].p.push(user);
        }
        
        clearTimeout(prop.timeout);
        delete global.adoption_proposals[user];
        return m.reply('🍼 ✨ *La famiglia si allarga! L\'adozione è stata accettata con gioia e il legame è ora registrato.* ❤️');
    }

    if (command === 'rifiuta') {
        if (global.marriage_proposals && global.marriage_proposals[user]) {
            clearTimeout(global.marriage_proposals[user].timeout);
            delete global.marriage_proposals[user];
        }
        if (global.adoption_proposals && global.adoption_proposals[user]) {
            clearTimeout(global.adoption_proposals[user].timeout);
            delete global.adoption_proposals[user];
        }
        return m.reply('❌ *La proposta è stata gentilmente declinata.*');
    }
}

handler.help = ['albero', 'sposa', 'divorzia', 'adotta']
handler.tags = ['rpg']
handler.command = /^(albero|famigliamia|sposa|accettasposa|divorzia|adotta|accettaadozione|rifiuta)$/i

export default handler
