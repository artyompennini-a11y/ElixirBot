// Plug-in creato da elixir
import { randomInt } from 'crypto';

// Database avanzato delle armi
const firearms = [
    {
        name: "AK-47 Kalashnikov",
        emoji: "🔫",
        sound: "ratatatata",
        damage: { head: 98, chest: 85, abdomen: 70, arm: 45, leg: 40 }
    },
    {
        name: "Desert Eagle .50 AE",
        emoji: "💥", 
        sound: "BOOM!",
        damage: { head: 100, chest: 95, abdomen: 80, arm: 60, leg: 55 }
    },
    {
        name: "Remington 870 Tactical",
        emoji: "🔫",
        sound: "BLAM!",
        damage: { head: 100, chest: 97, abdomen: 82, arm: 65, leg: 60 }
    },
    {
        name: "Barrett M82 Anti-Material", 
        emoji: "🎯",
        sound: "KABOOM!!",
        damage: { head: 100, chest: 100, abdomen: 95, arm: 80, leg: 75 }
    }
];

// Effetti dettagliati per parti del corpo
const bodyEffects = {
    head: {
        name: "testa",
        fatal: [
            "💀 COLPO ALLA TESTA LETALE",
            "🧠 Cervello disintegrato dall'impatto",
            "🩸 Esplosione cranica istantanea"
        ],
        severe: [
            "☠️ Ferita cranica mortale",
            "💫 Proiettile conficcato nel cervello",
            "�� Trauma cranico irreversibile"
        ]
    },
    chest: {
        name: "petto",
        fatal: [
            "💔 CUORE CENTRATO",
            "�� Polmoni perforati in multipli punti",
            "🩸 Emorragia toracica massiva"
        ],
        severe: [
            "⚠️ FERITA TORACICA GRAVE",
            "💉 Costole fratturate - Polmone collassato",
            "🏥 Richiesto intervento chirurgico d'urgenza"
        ]
    },
    abdomen: {
        name: "addome",
        fatal: [
            "⚰️ ADDOME SQUARCIATO",
            "🩸 Emorragia interna incontrollabile",
            "💫 Danni multi-organo letali"
        ],
        severe: [
            "⚠️ FERITA ADDOMINALE CRITICA",
            "🏥 Sanguinamento interno - Trasfusione necessaria",
            "💉 Danni a fegato/milza"
        ]
    },
    arm: {
        name: "braccio",
        severe: [
            "🢾 BRAACIO FRATTURATO",
            "💉 Arteria omerale recisa",
            "🩹 Amputazione necessaria"
        ],
        moderate: [
            "⚠️ Ferita d'arto superiore",
            "🩸 Sanguinamento moderato",
            "🧪 Frattura ossea"
        ]
    },
    leg: {
        name: "gamba",
        severe: [
            "🦿 GAMBA DIVELTA",
            "💉 Arteria femorale colpita",
            "⚠️ Amputazione necessaria"
        ],
        moderate: [
            "🩹 Ferita d'arto inferiore",
            "🩸 Sanguinamento controllabile",
            "🏥 Zoppicamento permanente"
        ]
    }
};

// Funzione per ottenere il nome dell'utente
async function getUsername(conn, jid) {
    try {
        return await conn.getName(jid);
    } catch {
        return jid.split('@')[0];
    }
}

function jidToTag(jid) {
    return `@${jid.split('@')[0]}`;
}

// Animazione di sparo ultra-realistica
async function cinematicShootSequence(conn, chat, shooterJid, targetJid, weapon) {
    const steps = [
        { text: `${jidToTag(shooterJid)} estrae *${weapon.name}*... ${weapon.emoji}\n*clic-clac* Caricamento proiettile`, delay: 2000 },
        { text: `${jidToTag(shooterJid)} assume la posizione di tiro...\n*respira profondamente*`, delay: 2500 },
        { text: `${jidToTag(shooterJid)} fissa ${jidToTag(targetJid)} nel mirino...\n🎯 *Stabilità: ${randomInt(60,100)}%*`, delay: 3000 },
        { text: `*DITO SUL GRILETTO*\n*Silenzio mortale...*`, delay: 2000 },
        { text: `💥 *${weapon.sound}* ${weapon.emoji}\n*${weapon.name}* SCAGLIA PROIETTILE VERSO ${jidToTag(targetJid)}!!`, delay: 0 }
    ];

    let lastMsg;
    for (const step of steps) {
        lastMsg = await conn.sendMessage(chat, { 
            text: step.text,
            mentions: [shooterJid, targetJid]
        });
        if (step.delay > 0) await new Promise(resolve => setTimeout(resolve, step.delay));
    }
    return lastMsg;
}

// Risultato con animazione drammatica
async function goreHitEffect(conn, chat, targetJid, bodyPart, damage, weapon) {
    const part = bodyEffects[bodyPart];
    const isFatal = damage > 95;
    const isSevere = damage > 75;

    let effect, detail;
    if (bodyPart === 'head' || bodyPart === 'chest') {
        effect = isFatal ? part.fatal[randomInt(0, part.fatal.length)] 
                         : part.severe[randomInt(0, part.severe.length)];
        detail = `*${weapon.name}* ha causato *${damage}% DANNO*`;
    } else {
        effect = isSevere ? part.severe[randomInt(0, part.severe.length)]
                          : part.moderate[randomInt(0, part.moderate.length)];
        detail = `*Danno: ${damage}%* - ${weapon.emoji} ${weapon.name}`;
    }

    const steps = [
        { text: `🎯 *COLPITO IN: ${part.name.toUpperCase()}*`, delay: 1500 },
        { text: `🩸 ${jidToTag(targetJid)}: ${effect}`, delay: 2000 },
        { text: `ℹ️ ${detail}`, delay: 0 }
    ];

    let lastMsg;
    for (const step of steps) {
        lastMsg = await conn.sendMessage(chat, { 
            text: step.text,
            mentions: [targetJid]
        });
        if (step.delay > 0) await new Promise(resolve => setTimeout(resolve, step.delay));
    }
    return lastMsg;
}

const handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        const targetJid = m.mentionedJid[0] || 
                     (m.quoted ? m.quoted.sender : 
                     text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        
        if (!targetJid) return m.reply(`⚠️ *NESSUN BERSAGLIO SPECIFICATO*\nUsage: ${usedPrefix}spara @utente`);

        const weapon = firearms[randomInt(0, firearms.length)];
        const shooterJid = m.sender;

        await cinematicShootSequence(conn, m.chat, shooterJid, targetJid, weapon);

        const bodyParts = Object.keys(weapon.damage);
        const bodyPart = bodyParts[randomInt(0, bodyParts.length)];
        const damage = randomInt(weapon.damage[bodyPart]-10, weapon.damage[bodyPart]+1);

        const resultMsg = await goreHitEffect(conn, m.chat, targetJid, bodyPart, damage, weapon);

        const reactEmoji = damage > 95 ? '☠️' : (damage > 75 ? '💫' : '⚠️');
        await conn.sendMessage(m.chat, {
            react: { text: reactEmoji, key: resultMsg.key }
        });

    } catch (error) {
        console.error('*ERRORE NEL SISTEMA DI SPARO*:', error);
        m.reply('❌ *JAMMING*: Il comando non ha funzionato');
    }
};

handler.help = ['spara @utente'];
handler.tags = ['action', 'combat'];
handler.command = ['spara', 'shoot', 'kill'];
handler.group = true;
export default handler;
