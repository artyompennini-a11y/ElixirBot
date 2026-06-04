import { performance } from "perf_hooks";

let handler = async (m, { conn, text }) => {
    let destinatario;

    if (m.quoted && m.quoted.sender) {
        destinatario = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        destinatario = m.mentionedJid[0];
    } else {
        return m.reply("`[!]` Tagga qualcuno o rispondi a un messaggio per avviare il protocollo.");
    }

    let nomeDestinatario = `@${destinatario.split('@')[0]}`;
    
    // --- SEQUENZA ELIXIR ---
    let sequenza = [
        `*───「 🧪 ELIXIR INJECTION 」───*\n\n*Target:* ${nomeDestinatario} 🥵\n*Protocollo:* \`Sincronizzazione ormonale...\`\n\n*────────────────*`,
        `*───「 ⚡ OVERLOAD 」───*\n\n*Pressione in aumento...* 🍌\n*Caricamento:* \`[████████▒▒] 80%\`\n\n*────────────────*`,
        `*───「 💦 RELEASE 」───*\n\n*FASE FINALE: ESPULSIONE!* 💦💦\n*Stato:* \`Critico / Irreversibile\`\n\n*────────────────*`
    ];

    // Invio con ritardo di 1.5 secondi per effetto suspense
    for (let msg of sequenza) {
        await conn.sendMessage(m.chat, { text: msg, mentions: [destinatario] }, { quoted: m });
        await new Promise(resolve => setTimeout(resolve, 1500)); 
    }

    let elapsedTime = (Math.random() * 300 + 200).toFixed(2);

    // --- RISULTATO FINALE ELIXIR ---
    let resultMessage = `┏─━─━─━  〔 🛡️ 〕  ━─━─━─┓
        *ELIXIR EXECUTION*
   ┗─━─━─━─━─━─━─━─━─┛

◈ *Vittima:* ${nomeDestinatario}
◈ *Risultato:* \`Imbiancamento Totale\` 🤤
◈ *Tempo:* \`${elapsedTime}ms\`

> ✨ *Il sistema Elixir ha completato l'operazione. Sei stato/a inondato/a!* 😏`.trim();

    await conn.sendMessage(m.chat, { 
        text: resultMessage, 
        mentions: [destinatario],
        contextInfo: {
            externalAdReply: {
                title: 'ᴇʟɪxɪʀ sᴇᴄᴜʀɪᴛʏ: sᴘᴇʀᴍ sʏɴᴄ',
                body: 'Iniezione completata con successo',
                thumbnailUrl: 'https://qu.ax', 
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
};

handler.command = /^(sborralo|sborrala)$/i;
handler.help = ['sborralo', 'sborrala'];  
handler.tags = ['giochi']; 
export default handler;
