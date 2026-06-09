const EURO_REWARD = 100;
const GAME_DURATION = 60000;

const PAROLE_WORDLE = ['ABITO', 'ACQUA', 'AIUTO', 'ALBUM', 'AMICO', 'ANIMA', 'AMORE', 'ARENA', 'ASPRO', 'AVERE', 'BANCO', 'BARCA', 'BARBA', 'BASSO', 'BELLO', 'BIRRA', 'BOSCO', 'BRAVO', 'BUONO', 'CALDO', 'CAFFE', 'CAMPO', 'CARNE', 'CARTA', 'CAUSA', 'CERCA', 'CERTO', 'CHINA', 'CIFRA', 'DANTE', 'DANZA', 'DENTE', 'DIECI', 'DISCO', 'DOLCE', 'DONNA', 'DRAGO', 'DUOMO', 'DITTA', 'EBANO', 'EPOCA', 'EREDE', 'EXTRA', 'ESAME', 'ENTRO', 'ELICA', 'FERRO', 'FESTA', 'FETTA', 'FIUME', 'FIORE', 'FOLLA', 'FORMA', 'FORTE', 'GATTO', 'GAMBA', 'GENTE', 'GIOCO', 'GOMMA', 'GRADO', 'GRECO', 'GUSTO', 'HOTEL', 'ISOLA', 'LATTE', 'LARGO', 'LEGGE', 'LEONE', 'LIBRO', 'LINEA', 'LISTA', 'LUNGO', 'MONDO', 'MADRE', 'MARCO', 'MASSA', 'MEZZO', 'METRO', 'MILLE', 'MONTE', 'MORTE', 'NOTTE', 'NELLO', 'NOZZE', 'NULLO', 'NUOVO', 'OLTRE', 'OPERA', 'OCCHI', 'OVEST', 'PADRE', 'PANDA', 'PARTE', 'PASTA', 'PAURA', 'PESCE', 'PIANO', 'PIZZA', 'QUOTA', 'QUASI', 'RESTO', 'RICCO', 'ROSSO', 'RUSSO', 'ROTTO', 'REGNO', 'RAZZA', 'SANTO', 'SALTO', 'SCALE', 'SENSO', 'SOLDI', 'SOTTO', 'SPESA', 'SPORT', 'TEMPO', 'TERRA', 'TORTA', 'TUTTO', 'TURNO', 'TESTA', 'UNICO', 'UMORE', 'UNITO', 'USATO', 'USCIO', 'UTILE', 'VERDE', 'VENTO', 'VINO', 'VISTA', 'VOCE', 'VOLO', 'VUOTO', 'VALLE', 'ZEBRA', 'ZITTO', 'ZUCCA', 'ZAINO', 'ZOPPO', 'ZAPPA'];

class WordleGame {
    constructor(targetWord, playerId) {
        this.targetWord = targetWord.toUpperCase();
        this.attempts = [];
        this.maxAttempts = 6;
        this.gameOver = false;
        this.won = false;
        this.startTime = Date.now();
        this.id = null;
        this.playerId = playerId;
        this.timeoutId = null;
    }

    guess(word) {
        if (this.gameOver) return { error: "La partita è già terminata! Usa `.wordle` per iniziarne una nuova." };
        
        const normalizedWord = word.toUpperCase().trim();
        if (normalizedWord.length !== 5) return { error: "La parola deve essere di 5 lettere!" };
        if (!/^[A-Z]+$/.test(normalizedWord)) return { error: "La parola deve contenere solo lettere dell'alfabeto (A-Z)!" };

        const result = this.calculateResult(normalizedWord);
        this.attempts.push({ word: normalizedWord, result });

        if (normalizedWord === this.targetWord) {
            this.gameOver = true;
            this.won = true;
        } else if (this.attempts.length >= this.maxAttempts) {
            this.gameOver = true;
        }

        return { success: true };
    }

    calculateResult(word) {
        const targetLetters = this.targetWord.split('');
        const guessLetters = word.split('');
        const result = new Array(5).fill(null);
        const targetLetterCount = {};

        for (const letter of targetLetters) {
            targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
        }

        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetterCount[guessLetters[i]]--;
            }
        }

        for (let i = 0; i < 5; i++) {
            if (result[i] === null) {
                if (targetLetterCount[guessLetters[i]] > 0) {
                    result
