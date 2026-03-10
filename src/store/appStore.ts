import { create } from 'zustand';
import type { Creature } from '../types/creature';
import type { RollResult } from '../features/dice/types';
import { loadCreatures, loadMeta, loadRolls, resetDatabase, saveCreatures, saveMeta, saveRolls } from '../lib/storage';
import { SAMPLE_CREATURES } from '../features/creatures/samples';

interface AppState {
  creatures: Creature[];
  rolls: RollResult[];
  recentCreatureIds: string[];
  theme: 'dark' | 'light';
  initialized: boolean;
  initialize: () => Promise<void>;
  upsertCreature: (creature: Creature) => Promise<void>;
  deleteCreature: (id: string) => Promise<void>;
  addRoll: (roll: RollResult) => Promise<void>;
  resetAll: () => Promise<void>;
  importCreatures: (creatures: Creature[]) => Promise<void>;
  markCreatureUsed: (id: string) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
}

function reorderRecent(ids: string[], id: string): string[] {
  return [id, ...ids.filter((entry) => entry !== id)].slice(0, 10);
}

export const useAppStore = create<AppState>((set, get) => ({
  creatures: [],
  rolls: [],
  recentCreatureIds: [],
  theme: 'dark',
  initialized: false,
  initialize: async () => {
    const [creatures, rolls, meta] = await Promise.all([loadCreatures(), loadRolls(), loadMeta()]);
    const seeded = creatures.length === 0 ? SAMPLE_CREATURES : creatures;
    if (creatures.length === 0) await saveCreatures(seeded);
    set({
      creatures: seeded,
      rolls,
      recentCreatureIds: meta.recentCreatureIds.filter((id) => seeded.some((creature) => creature.id === id)),
      theme: meta.theme,
      initialized: true
    });
  },
  upsertCreature: async (creature) => {
    const current = get().creatures;
    const idx = current.findIndex((c) => c.id === creature.id);
    const updated = idx >= 0 ? [...current.slice(0, idx), creature, ...current.slice(idx + 1)] : [creature, ...current];
    set({ creatures: updated });
    await saveCreatures(updated);
  },
  deleteCreature: async (id) => {
    const updated = get().creatures.filter((c) => c.id !== id);
    const recentCreatureIds = get().recentCreatureIds.filter((entry) => entry !== id);
    set({ creatures: updated, recentCreatureIds });
    await saveCreatures(updated);
    await saveMeta({ recentCreatureIds, theme: get().theme });
  },
  addRoll: async (roll) => {
    const updated = [roll, ...get().rolls].slice(0, 100);
    set({ rolls: updated });
    await saveRolls(updated);
  },
  resetAll: async () => {
    await resetDatabase();
    set({ creatures: SAMPLE_CREATURES, rolls: [], recentCreatureIds: [], theme: 'dark' });
    await saveCreatures(SAMPLE_CREATURES);
    await saveRolls([]);
    await saveMeta({ recentCreatureIds: [], theme: 'dark' });
  },
  importCreatures: async (creatures) => {
    const recentCreatureIds = get().recentCreatureIds.filter((id) => creatures.some((creature) => creature.id === id));
    set({ creatures, recentCreatureIds });
    await saveCreatures(creatures);
    await saveMeta({ recentCreatureIds, theme: get().theme });
  },
  markCreatureUsed: async (id) => {
    const recentCreatureIds = reorderRecent(get().recentCreatureIds, id);
    set({ recentCreatureIds });
    await saveMeta({ recentCreatureIds, theme: get().theme });
  },
  setTheme: async (theme) => {
    set({ theme });
    await saveMeta({ recentCreatureIds: get().recentCreatureIds, theme });
  }
}));
