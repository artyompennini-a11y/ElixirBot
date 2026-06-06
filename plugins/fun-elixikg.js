// Plug-in creato da elixir
let handler = async (m, { conn }) => {
    try {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. CHIUSURA IMMEDIATA
        await conn.groupSettingUpdate(m.chat, 'announcement');

        // 2. MESSAGGIO DI THE PUNISHER (Cattivo)
        let message = '`[☣️] THE PUNISHER_SYSTEM_FAILURE`' + `\n` +
                      '`--------------------------`' + `\n` +
                      '`> SUBJECT:` *ESECUZIONE SENTENZA*' + `\n` +
                      '`> THREAT:` *Livello Critico - Incompetenza Totale*' + `\n` +
                      '`--------------------------`' + `\n\n` +
                      '*AVETE SUPERATO IL LIMITE.* 🛑' + `\n\n` +
                      '*Il vostro diritto di parola è stato revocato. Non siete capaci di autogestirvi, quindi vi tolgo l\'ossigeno. Restate in silenzio a riflettere sulla vostra inutilità mentre il sistema vi resetta.*' + `\n\n` +
                      '`> DISPOSIZIONE:` *ISOLAMENTO FORZATO*' + `\n` +
                      '`> BY:` *𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃*' + `\n\n` +
                      '`--------------------------`' + `\n` +
                      '`[!] LOCKDOWN IN CORSO... NON PROVATE A REAGIRE.`'

        await conn.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '☣️ 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃: ᴀʙꜱᴏʟᴜᴛᴇ_ᴄᴏɴᴛʀᴏʟ',
                    body: 'Il silenzio è l\'unica cosa che meritate.',
                    thumbnailUrl: 'https://qu.ax', 
                    sourceUrl: '𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // 3. ATTESA 20 SECONDI
        await delay(20000);

        // 4. RIAPERTURA
        await conn.groupSettingUpdate(m.chat, 'not_announcement');
        await conn.sendMessage(m.chat, {
            text: '🔓 *PUNIZIONE TERMINATA*\n\nᴏʀᴀ ᴘᴀʀʟᴀᴛᴇ ᴘʟᴇʙᴇɪ, ᴍᴀ ꜰᴀᴛᴇʟᴏ ᴄᴏɴ ᴄʀɪᴛᴇʀɪᴏ.',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '',
                    serverMessageId: '',
                    newsletterName: `𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃`
                }
            }
        });

    } catch (error) {
        console.error('Errore ElixirKG:', error);
        await conn.groupSettingUpdate(m.chat, 'not_announcement');
    }
}

handler.help = ['dio']
handler.tags = ['owner']
handler.command = /^(dio)$/i
handler.group = true
handler.owner = true // Solo il creatore/owner può usarlo
handler.botAdmin = true 

export default handler
