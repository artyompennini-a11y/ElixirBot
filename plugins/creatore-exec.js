// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
import { format } from 'util';

let handler = async (m, { conn, args, isSam }) => {
    const sender = m.sender.split('@')[0];
    const masterOwner = '447529461874';
    
    if (sender !== masterOwner && !isSam) {
        await conn.sendMessage(m.chat, {
            text: '❌ *Accesso negato.* Questo comando è riservato ESCLUSIVAMENTE al creatore del bot.'
        });
        return;
    }
    
    if (!args.length) {
        const usageText = `⋆｡˚『 ╭ \`EXEC — CONSOLE\` ╯ 』˚｡⋆
╭
┃ 💻 \`Comando:\` *Esecuzione Codice JS*
┃
┃ ╭───  \`USO\`  ───╮
┃ ┃  .exec <codice>
┃ ╰────────────────╯
┃
┃ ✍️ \`Esempi:\`
┃ ┃  .exec 2 + 2 * 5
┃ ┃  .exec console.log("test")
┃ ┃  .exec await conn.sendMessage(m.chat, {text:"ciao"})
┃
┃ ⚠️ *Attenzione:* Il codice viene eseguito
┃ direttamente sul server. Usa con cautela.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
        
        await conn.sendMessage(m.chat, { text: usageText });
        return;
    }
    
    const code = args.join(' ');
    
    let result;
    let error = null;
    
    try {
        if (code.includes('await')) {
            result = await eval(`(async () => { ${code} })()`);
        } else {
            result = eval(code);
        }
    } catch (e) {
        error = e;
        result = e.toString();
    }
    
    let output;
    if (error) {
        output = `⋆｡˚『 ╭ \`❌ EXEC — ERRORE\` ╯ 』˚｡⋆
╭
┃ ⚠️ *Attenzione:* Il codice viene eseguito
┃ 📄 ${format(error).slice(0, 1500)}
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
    } else {
        const resultStr = typeof result === 'undefined' 
            ? '✓ Eseguito con successo (nessun valore di ritorno)' 
            : format(result);
        
        output = `⋆｡˚『 ╭ \`💻 EXEC — OUTPUT\` ╯ 』˚｡⋆
╭
┃ 📄 \`Risultato:\`
┃
┃ ${resultStr.slice(0, 2000)}
┃
┃ ──ׄ─ׅ─ׄ──ׄ─ׅ─ׄ──ׄ─ׅ─ׄ─ׅ─ׄ─
┃
┃ 📊 \`Tipo:\` ${typeof result}
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;
    }
    
    await conn.sendMessage(m.chat, { text: output }).catch(() => {});
};

handler.help = ['exec <codice>'];
handler.tags = ['owner'];
handler.command = /^(exec|eval|>)$/i;
handler.owner = true;
handler.rowner = true;

export default handler;
