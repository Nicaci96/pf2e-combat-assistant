import { openDB } from 'idb';
import type { Creature } from '../types/creature';
import type { RollResult } from '../features/dice/types';

type Store = 'creatures' | 'rolls' | 'meta';

export interface AppMeta {
  recentCreatureIds: string[];
  theme: 'dark' | 'light';
}

const DB_NAME = 'pf2e-combat-assistant';
const LS_PREFIX = 'pf2e-combat-assistant';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('creatures')) db.createObjectStore('creatures');
    if (!db.objectStoreNames.contains('rolls')) db.createObjectStore('rolls');
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
  }
}).catch(() => null);

async function setFallback(store: Store, value: unknown) {
  localStorage.setItem(`${LS_PREFIX}:${store}`, JSON.stringify(value));
}

function getFallback<T>(store: Store, fallback: T): T {
  const raw = localStorage.getItem(`${LS_PREFIX}:${store}`);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveCreatures(creatures: Creature[]): Promise<void> {
  const db = await dbPromise;
  if (!db) return setFallback('creatures', creatures);
  await db.put('creatures', creatures, 'all');
}

export async function loadCreatures(): Promise<Creature[]> {
  const db = await dbPromise;
  if (!db) return getFallback('creatures', []);
  return ((await db.get('creatures', 'all')) as Creature[] | undefined) ?? [];
}

export async function saveRolls(rolls: RollResult[]): Promise<void> {
  const db = await dbPromise;
  if (!db) return setFallback('rolls', rolls);
  await db.put('rolls', rolls, 'all');
}

export async function loadRolls(): Promise<RollResult[]> {
  const db = await dbPromise;
  if (!db) return getFallback('rolls', []);
  return ((await db.get('rolls', 'all')) as RollResult[] | undefined) ?? [];
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  const db = await dbPromise;
  if (!db) return setFallback('meta', meta);
  await db.put('meta', meta, 'app');
}

export async function loadMeta(): Promise<AppMeta> {
  const fallback: AppMeta = { recentCreatureIds: [], theme: 'dark' };
  const db = await dbPromise;
  if (!db) return getFallback('meta', fallback);
  return ((await db.get('meta', 'app')) as AppMeta | undefined) ?? fallback;
}

export async function resetDatabase(): Promise<void> {
  const db = await dbPromise;
  if (db) {
    await db.clear('creatures');
    await db.clear('rolls');
    await db.clear('meta');
  }
  localStorage.removeItem(`${LS_PREFIX}:creatures`);
  localStorage.removeItem(`${LS_PREFIX}:rolls`);
  localStorage.removeItem(`${LS_PREFIX}:meta`);
}
