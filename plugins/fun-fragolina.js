// Plug-in creato da elixir - Lockdown Temporaneo
let handler = async (m, { conn, isAdmin }) => {
    if (!isAdmin) return 

    try {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. CHIUSURA GRUPPO
        await conn.groupSettingUpdate(m.chat, 'announcement');

        // 2. MESSAGGIO FRAGOLINA (Avviso di Sistema)
        let message = '`[🍓] FRAGOLINA_REPRIMAND`' + `\n` +
                      '`--------------------------`' + `\n` +
                      '`> STATUS:` *⚠️ ULTIMATUM ATTIVO*' + `\n` +
                      '`> ALERT:` *Instabilità Sociale Rilevata*' + `\n` +
                      '`--------------------------`' + `\n\n` +
                      '*SE CONTINUATE A LITIGARE COME DELLE BESTIE NONOSTANTE I RICHIAMI, IL SISTEMA VERRÀ SIGILLATO.* 🔒' + `\n\n` +
                      '`> AZIONE:` *Chiusura Totale Gruppo* (20s)' + `\n` +
                      '`> NOTA:` *E vi beccate pure la ramanzina.* 🍓' + `\n\n` +
                      '`--------------------------`' + `\n` +
                      '`[!] Ultimo avvertimento prima del LOCKDOWN.`'

        await conn.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '🍓 FRAGOLINA: SYSTEM_WARNING',
                    body: 'Smettetela di fare casino o blocco tutto.',
                    thumbnailUrl: 'https://qu.ax', 
                    sourceUrl: '𝕸𝕺𝕸𝕺 𝕭𝕺𝕿',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // 3. ATTESA 20 SECONDI
        await delay(20000);

        // 4. RIAPERTURA E MESSAGGIO FINALE
        await conn.groupSettingUpdate(m.chat, 'not_announcement');
        await conn.sendMessage(m.chat, {
            text: '🔓 *LOCKDOWN TERMINATO*\n\n𝐨𝐫𝐚 𝐩𝐚𝐫𝐥𝐚𝐭𝐞 𝐩𝐥𝐞𝐛𝐞𝐢',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '',
                    serverMessageId: '',
                    newsletterName: global.db.data.nomedelbot || `𝕰𝕷𝕴𝖃𝕴𝕽𝕭𝕺𝕿`
                }
            }
        });

    } catch (error) {
        console.error('Errore Fragolina:', error);
        // Riapre in caso di errore critico per non lasciare il gruppo bloccato
        await conn.groupSettingUpdate(m.chat, 'not_announcement');
    }
}

handler.help = ['fragolina']
handler.tags = ['staff']
handler.command = /^(fragolina)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true 

export default handler
