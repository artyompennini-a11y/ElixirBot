import { createCanvas } from 'canvas';

let handler = async (m, { conn }) => {
  try {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    // Gestione Nome per il Canvas
    let rawName = conn.getName(target);
    let cleanName = rawName.replace(/[^\x00-\x7F]/g, "").trim(); 
    if (!cleanName || cleanName.length < 1) {
      cleanName = target.split('@')[0]; 
    }
    
    await m.reply('`[⚠️] Scansione vulnerabilità in corso...`');

    // Valore percentuale 0-100
    const downValue = Math.floor(Math.random() * 101); 

    let status, color;
    if (downValue >= 90) { status = "CRITICAL FAILURE"; color = "#ff0033"; } // Rosso puro
    else if (downValue >= 70) { status = "SYSTEM OVERHEAT"; color = "#ff6600"; } // Arancio
    else if (downValue >= 40) { status = "STABLE DECLINE"; color = "#ffcc00"; } // Giallo
    else if (downValue >= 10) { status = "LOW IMPACT"; color = "#00ffcc"; } // Ciano
    else { status = "OPTIMAL"; color = "#ffffff"; } // Bianco

    const width = 1000;
    const height = 560;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // SFONDO DARK
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // GRIGLIA RADAR (stile hacker)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for(let i=0; i<height; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // CORNICE DI ALLERTA
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.shadowBlur = 0;

    // INTESTAZIONE
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('▼ SYSTEM DOWN ANALYSIS', 60, 80);
    ctx.fillStyle = color;
    ctx.fillRect(60, 100, 350, 3);

    // SOGGETTO
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px monospace';
    ctx.fillText('TARGET_ID:', 60, 150);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px monospace';
    ctx.fillText(cleanName.toUpperCase(), 60, 205);

    // PERCENTUALE GRANDE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('DOWN RATE PERCENTAGE', 65, 270);

    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 160px monospace';
    ctx.fillText(`${downValue}%`, 60, 400);
    ctx.shadowBlur = 0;

    // BARRA DI CARICAMENTO/ERRORE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(60, 430, 880, 35, 5);
    ctx.fill();

    const barWidth = (downValue / 100) * 880;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(60, 430, Math.max(barWidth, 10), 35, 5);
    ctx.fill();

    // STATUS FOOTER
    ctx.textAlign = 'right';
    ctx.font = 'bold 60px monospace';
    ctx.fillStyle = color;
    ctx.fillText(status, 940, 515);

    const buffer = canvas.toBuffer();
    
    // MESSAGGIO FINALE
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `\`[⚡] ANALISI DOWN COMPLETATA\`\n\n` +
               `> *User:* @${target.split('@')[0]}\n` +
               `> *Percentuale:* ${downValue}%\n` +
               `> *Status:* ${status}`,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('`[!] ERROR: Glitch nel modulo di scansione .down`');
  }
};

handler.help = ['down'];
handler.tags = ['giochi'];
handler.command = /^(down)$/i;
handler.group = true;

export default handler;
