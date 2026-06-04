// =============================================
//   PLUGIN ANTI-BULLISMO ULTIMATE
//   Blacklist Estremamente Estesa
// =============================================

let handler = async (m, { conn, isAdmin, isOwner, args, command }) => {
    const chatId = m.chat;
    
    if (!global.antibully) global.antibully = {};
    if (!global.antibully[chatId]) {
        global.antibully[chatId] = {
            active: true,
            strikes: {},
            lastStrike: {},
            muteTime: 60,
            blacklist: [] // blacklist personalizzata (vuota all'inizio)
        };
    }

    const settings = global.antibully[chatId];

    // ====================== COMANDI ADMIN ======================
    const text = m.text ? m.text.toLowerCase() : '';
    const cmd = text.split(' ')[0];

    if (cmd === '.antibully' || cmd === '.antibullismo') {
        if (!isAdmin && !isOwner) return conn.reply(m.chat, "❌ Solo gli admin possono usare questo comando.", m);

        const subcmd = text.split(' ')[1];
        
        if (subcmd === 'on') {
            settings.active = true;
            return conn.reply(m.chat, "✅ *Anti-Bullismo ATTIVATO*", m);
        }
        if (subcmd === 'off') {
            settings.active = false;
            return conn.reply(m.chat, "❌ *Anti-Bullismo DISATTIVATO*", m);
        }
        if (subcmd === 'mutetime' && args[1]) {
            const minutes = parseInt(args[1]);
            if (minutes > 0) settings.muteTime = minutes;
            return conn.reply(m.chat, `⏱️ Tempo di mute impostato a ${settings.muteTime} minuti.`, m);
        }
    }

    if ((cmd === '.strikes' || cmd === '.strike') && (isAdmin || isOwner)) {
        let response = `📊 *Strike Attivi*\n\n`;
        for (let [user, count] of Object.entries(settings.strikes)) {
            if (count > 0) response += `@${user.split('@')[0]} → ${count} strike\n`;
        }
        if (response === `📊 *Strike Attivi*\n\n`) response += "Nessuno strike attivo.";
        return conn.reply(m.chat, response, m);
    }

    // ====================== RILEVAMENTO AUTOMATICO ======================
    if (!settings.active || !m.text) return;

    // Reset strike dopo 6 ore
    if (settings.lastStrike[m.sender] && (Date.now() - settings.lastStrike[m.sender] > 6 * 60 * 60 * 1000)) {
        settings.strikes[m.sender] = 0;
    }

    const messaggio = m.text.toLowerCase();

    // ==================== BLACKLIST ENORME ====================
    const blacklistBase = [
        // Insulti classici italiani
        "coglione", "cogliona", "coglioni", "stronzo", "stronza", "stronzi", "puttana", "puttane",
        "troia", "troie", "zoccola", "zoccole", "bagascia", "baldracca", "mignotta", "sgualdrina",
        "bastardo", "bastarda", "figlio di puttana", "figlia di puttana", "figlio di troia",
        "merda", "pezzo di merda", "mangiamerda", "mangia merda", "sei merda",
        
        // Intelligenza
        "ritardato", "ritardata", "mongolo", "mongoloide", "handicappato", "handicappata",
        "deficiente", "imbecille", "idiota", "cretino", "cretina", "minchione", "testa di cazzo",
        "testa di minchia", "stupido", "stupida", "scemo", "scema", "coglionazzo", "decerebrato",
        
        // Aspetto e corpo
        "brutto", "brutta", "mostro", "mostra", "ciccio", "ciccia", "grasso", "grassa", "obeso",
        "obesa", "secco", "secca", "stecchino", "culona", "culone", "quattrocchi", "nano", "nana",
        "puzzone", "puzzona", "schifoso", "schifosa", "lurido", "lurida", "disgustoso",
        
        // Famiglia e sessuali
        "cornuto", "cornuta", "cornificatore", "frocio", "ricchione", "ricchiona", "finocchio",
        "succhiacazzi", "leccacazzi", "leccaculo", "inculato", "inculata", "segaiolo", "segaiola",
        
        // Volgarità forti
        "vaffanculo", "affanculo", "fanculo", "porco dio", "porca madonna", "dio cane", "dio maiale",
        "ammazzati", "suicidati", "vai a morire", "impiccati", "buttati", "kys", "kill yourself",
        
        // Altre comuni
        "fallito", "fallita", "patetico", "patetica", "sfigato", "sfigata", "loser", "worthless",
        "inutile", "sei zero", "sei un niente", "abortito", "aborto", "errore della natura",
        "delusione umana", "scarto umano", "rifiuto", "vergogna", "morto di fame", "figlio di",
        "nessuno ti vuole", "sei vuoto", "sei vuota", "sei morto dentro", "bitch", "whore", "slut",
        "cunt", "faggot", "retard", "fatass", "dumbass", "moron"
    ];

    // Unisci blacklist base + personalizzata
    let blacklist = [...blacklistBase];
    if (settings.blacklist && settings.blacklist.length > 0) {
        blacklist = [...blacklist, ...settings.blacklist];
    }

    const contieneInsulto = blacklist.some(word => messaggio.includes(word));

    if (!contieneInsulto) return;

    // ====================== SISTEMA STRIKE ======================
    if (!settings.strikes[m.sender]) settings.strikes[m.sender] = 0;
    settings.strikes[m.sender]++;
    settings.lastStrike[m.sender] = Date.now();

    const strikes = settings.strikes[m.sender];
    let responseText = "";

    if (strikes === 1) {
        responseText = `⚠️ *Primo avvertimento*\n@${m.sender.split('@')[0]}, hai usato linguaggio offensivo.`;
    } else if (strikes === 2) {
        responseText = `⚠️ *Secondo avvertimento!*\n@${m.sender.split('@')[0]}, al terzo strike verrai mutato per ${settings.muteTime} minuti.`;
    } else if (strikes >= 3) {
        responseText = `🚫 *TERZO STRIKE - MUTATO!*\n@${m.sender.split('@')[0]} è stato mutato per ${settings.muteTime} minuti.`;

        // Mute (remove + re-add after time)
        await conn.groupParticipantsUpdate(chatId, [m.sender], "remove");

        setTimeout(async () => {
            try {
                await conn.groupParticipantsUpdate(chatId, [m.sender], "add");
            } catch (e) {}
        }, settings.muteTime * 60 * 1000);
    }

    await conn.sendMessage(chatId, {
        text: responseText + `\n\n🛡️ Anti-Bullismo attivo in questo gruppo.`,
        mentions: [m.sender]
    });
};

handler.all = true;
handler.group = true;
handler.tags = ['admin', 'group'];
handler.help = ['antibully on/off', 'strikes', 'mutetime', 'addinsulto', 'removeinsulto'];

export default handler;
