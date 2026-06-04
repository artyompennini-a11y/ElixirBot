import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import NodeCache from 'node-cache';
const { initAuthCreds, BufferJSON, proto } = (await import('@realvare/based')).default;

const CONFIG = {
  CACHE_TTL: {
    CONTACTS: 600,
    GROUPS: 300,
    PRESENCE: 60
  },
  CACHE_CHECK_PERIOD: 120,
  MAX_CACHE_SIZE: 1000,
  DEBOUNCE_DELAY: 1000,
  SAVE_DELAY: 5000,
  MAX_SAVE_COUNT: 10
};

const contactCache = new NodeCache({ stdTTL: CONFIG.CACHE_TTL.CONTACTS, checkperiod: CONFIG.CACHE_CHECK_PERIOD, maxKeys: CONFIG.MAX_CACHE_SIZE });
const groupCache = new NodeCache({ stdTTL: CONFIG.CACHE_TTL.GROUPS, checkperiod: CONFIG.CACHE_CHECK_PERIOD, maxKeys: CONFIG.MAX_CACHE_SIZE });
const presenceCache = new NodeCache({ stdTTL: CONFIG.CACHE_TTL.PRESENCE, checkperiod: CONFIG.CACHE_CHECK_PERIOD, maxKeys: CONFIG.MAX_CACHE_SIZE });

function debounce(func, delay) {
  let timeoutId;
  return function (...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); };
}

function isValidJid(jid) { return jid && typeof jid === 'string' && jid !== 'status@broadcast' && jid.includes('@'); }

async function safeAsync(fn, fallback = null) {
  try { return await fn(); } catch { return fallback; }
}

function useSingleFileAuthState(filename, logger) {
  let creds;
  let keys = {};
  let saveCount = 0;

  const ensureDir = async () => {
    try {
      const dir = dirname(filename);
      if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    } catch (error) { console.error('[AuthState] Error creating directory:', error.message); }
  };

  const debouncedSave = debounce(async (forceSave = false) => {
    logger?.trace('[AuthState] Saving auth state');
    saveCount++;
    if (forceSave || saveCount >= CONFIG.MAX_SAVE_COUNT) {
      try {
        await ensureDir();
        const data = JSON.stringify({ creds, keys }, BufferJSON.replacer, 2);
        await writeFile(filename, data, 'utf-8');
        saveCount = 0;
        logger?.debug('[AuthState] Auth state saved successfully');
      } catch (error) { console.error('[AuthState] Error saving auth state:', error.message); }
    }
  }, CONFIG.SAVE_DELAY);

  const loadState = async () => {
    try {
      if (existsSync(filename)) {
        const data = await readFile(filename, { encoding: 'utf-8' });
        if (data.trim()) {
          const result = JSON.parse(data, BufferJSON.reviver);
          creds = result.creds;
          keys = result.keys || {};
          logger?.debug('[AuthState] Auth state loaded successfully');
        } else {
          logger?.warn('[AuthState] Empty auth file, initializing new state');
          creds = initAuthCreds();
          keys = {};
        }
      } else {
        creds = initAuthCreds();
        keys = {};
      }
    } catch (error) {
      console.error('[AuthState] Error loading auth state:', error.message);
      creds = initAuthCreds();
      keys = {};
    }
  };

  return {
    state: { creds, keys },
    saveState: debouncedSave,
    loadState
  };
}

export default { useSingleFileAuthState, contactCache, groupCache, presenceCache, CONFIG };
