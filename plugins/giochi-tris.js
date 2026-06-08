// ╔═══════════════════════════════════════════╗
// ║                                           ║
// ║   Sviluppato da: The punisher             ║
// ║                                           ║
// ╚═══════════════════════════════════════════╝

let games = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    const getPhoneNumber = (jid) => {
        if (!jid) return '';
        return jid.split('@')[0].replace(/\D/g, '');
    };

    // ----- INIZIO PARTITA (.tris) -----
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

        if (!mention) {
            return m.reply(`┌─── 「 ⚠️ *ᴇʀʀᴏʀᴇ* 」 ───┐\n│\n│ ❌ *Devi menzionare un avversario.*\n│ 📝 *Esempio:* \`${usedPrefix}tris @utente\`\n│\n└───────────────────────────┘`);
        }

        const myNumber = getPhoneNumber(m.sender);
        const theirNumber = getPhoneNumber(mention);

        if (myNumber === theirNumber) return m.reply('❌ *Non puoi sfidare te stesso!*');
        if (games[chatId]) return m.reply('❌ *C\'è già una partita attiva in questo gruppo.*');

        games[chatId] = {
            board: [['', '', ''], ['', '', ''], ['', '', '']],
            players: [myNumber, theirNumber],
            jids: [m.sender, mention],
            turn: 0,
            timer: null,
            symbols: ['❌', '⭕']
        };

        const currentGame = games[chatId];
        const boardStr = renderTextBoard(currentGame.board);
        
        let startMsg = `┌─── 「 🎮 *ᴛʀɪs ʜᴅ ᴀᴠᴠɪᴀᴛᴏ* 」 ───┐\n` +
                       `│\n` +
                       `│ ❌ *Sfidante 1:* @${currentGame.jids[0].split('@')[0]}\n` +
                       `│ ⭕ *Sfidante 2:* @${currentGame.jids[1].split('@')[0]}\n` +
                       `│\n` +
                       `${boardStr}\n` +
                       `│\n` +
                       `│ 👉 *Tocca a:* @${currentGame.jids[0].split('@')[0]}\n` +
                       `│ 📝 *Mossa:* \`${usedPrefix}putris [casella]\` (es: A1, B2, C3)\n` +
                       `│\n` +
                       `└───────────────────────────┘\n` +
                       `> *THE PUNISHER-BOT*`;

        await conn.reply(chatId, startMsg, m, { mentions: currentGame.jids });
        startTurnTimer(chatId, conn);
    }

    // ----- ESECUZIONE MOSSA (.putris) -----
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return m.reply(`❌ *Nessuna sfida attiva.* Usa \`${usedPrefix}tris\` per iniziare.`);

        const myNumber = getPhoneNumber(m.sender);
        if (myNumber !== game.players[game.turn]) {
            return conn.reply(chatId, `❌ *Non è il tuo turno!* Attendi la mossa di @${game.jids[game.turn].split('@')[0]}`, m, { mentions: [game.jids[game.turn]] });
        }

        let move = text.trim().toUpperCase();
        if (!move || move.length < 2) {
            return m.reply(`⚠️ *Mossa non valida!* Specifica riga e colonna.\n*Esempio:* \`${usedPrefix}putris B2\``);
        }

        // Normalizzazione input flessibile (accetta sia A1 che 1A)
        let letter = move.match(/[A-C]/);
        let number = move.match(/[1-3]/);

        if (!letter || !number) {
            return m.reply(`⚠️ *Coordinata errata!* Usa le lettere (A, B, C) e i numeri (1, 2, 3).\n*Esempio:* \`${usedPrefix}putris A3\``);
        }

        const map = { A: 0, B: 1, C: 2 };
        const row = map[letter[0]];
        const col = parseInt(number[0]) - 1;

        if (game.board[row][col] !== '') return m.reply('❌ *Quella casella è già occupata!* Scegline un\'altra.');

        // Assegnazione simbolo
        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            clearTimeout(game.timer);
            const finalBoard = renderTextBoard(game.board);
            let winMsg = `┌─── 「 🏆 *ᴠɪᴛᴛᴏʀɪᴀ!* 」 ───┐\n` +
                         `│\n` +
                         `│ 🎉 *Il match è terminato!*\n` +
                         `│ 🥇 *Vincitore:* @${m.sender.split('@')[0]}\n` +
                         `│\n` +
                         `${finalBoard}\n` +
                         `│\n` +
                         `└───────────────────────────┘\n` +
                         `> *THE PUNISHER-BOT*`;
            
            await conn.reply(chatId, winMsg, m, { mentions: game.jids });
            delete games[chatId];
        } 
        else if (game.board.flat().every(cell => cell !== '')) {
            clearTimeout(game.timer);
            const finalBoard = renderTextBoard(game.board);
            let drawMsg = `┌─── 「 🤝 *ᴘᴀʀᴇɢɢɪᴏ* 」 ───┐\n` +
                          `│\n` +
                          `│ 📉 *Nessun vincitore: Griglia completa.*\n` +
                          `│ 😉 Ottima strategia da parte di entrambi.\n` +
                          `│\n` +
                          `${finalBoard}\n` +
                          `│\n` +
                          `└───────────────────────────┘\n` +
                          `> *THE PUNISHER-BOT*`;

            await conn.reply(chatId, drawMsg, m, { mentions: game.jids });
            delete games[chatId];
        } 
        else {
            game.turn = 1 - game.turn; // Cambio turno
            const updatedBoard = renderTextBoard(game.board);
            let nextMsg = `┌─── 「 🎮 *ᴛʀɪs ʜᴅ* 」 ───┐\n` +
                          `│\n` +
                          `│ ✅ *Mossa registrata con successo!*\n` +
                          `│\n` +
                          `${updatedBoard}\n` +
                          `│\n` +
                          `│ 👉 *Prossimo turno:* @${game.jids[game.turn].split('@')[0]}\n` +
                          `│ 🎯 *Simbolo attivo:* ${game.symbols[game.turn]}\n` +
                          `│\n` +
                          `└───────────────────────────┘\n` +
                          `> *THE PUNISHER-BOT*`;

            await conn.reply(chatId, nextMsg, m, { mentions: game.jids });
            startTurnTimer(chatId, conn);
        }
    }

    // ----- TERMINAZIONE FORZATA (.endtris) -----
    else if (command === 'endtris') {
        if (games[chatId]) {
            clearTimeout(games[chatId].timer);
            delete games[chatId];
            m.reply('🛑 *Partita annullata e rimossa dalla memoria del gruppo.*');
        } else {
            m.reply('❌ Non ci sono sessioni di Tris attive in questa chat.');
        }
    }
};

// ----- RENDERING DELLA GRIGLIA TESTUALE -----
function renderTextBoard(board) {
    const rowLetters = ['A', 'B', 'C'];
    let textStr = `│      ⬜  \` 1 \`  \` 2 \`  \` 3 \` \n`;
    
    for (let r = 0; r < 3; r++) {
        let rowCells = [];
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === '') {
                rowCells.push('🟦'); // Casella Vuota standard
            } else {
                rowCells.push(board[r][c]); // Inserisce ❌ o ⭕
            }
        }
        textStr += `│      \` ${rowLetters[r]} \` ${rowCells.join(' ')}\n`;
    }
    return textStr;
}

// ----- VERIFICA VINCITORE -----
function checkWinner(board) {
    const lines = [
        [[0,0], [0,1], [0,2]], [[1,0], [1,1], [1,2]], [[2,0], [2,1], [2,2]], // Orizzontali
        [[0,0], [1,0], [2,0]], [[0,1], [1,1], [2,1]], [[0,2], [1,2], [2,2]], // Verticali
        [[0,0], [1,1], [2,2]], [[0,2], [1,1], [2,0]]  // Diagonali
    ];
    for (let line of lines) {
        const [[r1,c1], [r2,c2], [r3,c3]] = line;
        if (board[r1][c1] !== '' && board[r1][c1] === board[r2][c2] && board[r1][c1] === board[r3][c3]) return true;
    }
    return false;
}

// ----- TIMER DI INATTIVITÀ (2 MINUTI) -----
function startTurnTimer(chatId, conn) {
    const game = games[chatId];
    if (game?.timer) clearTimeout(game.timer);
    game.timer = setTimeout(() => {
        if (games[chatId]) {
            conn.sendMessage(chatId, { text: '⏱️ *TEMPO SCADUTO!*\nLa partita è stata terminata per inattività di uno dei giocatori.' });
            delete games[chatId];
        }
    }, 120000);
}

handler.command = /^(tris|putris|endtris)$/i;
handler.group = true;

export default handler;
