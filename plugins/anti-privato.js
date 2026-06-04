export async function before(m, { isOwner, isRowner, isMods }) {
    // 1. Esclusioni immediate
    if (m.fromMe) return !0; // Non bloccare se stesso
    if (m.isGroup) return !1; // Ignora i messaggi nei gruppi
    if (!m.message) return !0;
    
    // 2. Escludi solo i proprietari assoluti (owner/rowner)
    if (isOwner || isRowner) return !1;

    // 3. BLOCCA SEMPRE chiunque altro in privato (senza inviare messaggi)
    try {
        await this.updateBlockStatus(m.chat, 'block');
    } catch (e) {
        console.error('[ANTI-PRIVATO] Errore nel bloccare:', e);
    }
    // Ritorna !0 per fermare qualsiasi altra esecuzione del bot per questo messaggio (silenzioso)
    return !0;
}
