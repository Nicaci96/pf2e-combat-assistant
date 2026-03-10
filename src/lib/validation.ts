import type { Creature } from '../types/creature';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCreature(value: unknown): value is Creature {
  if (!isObject(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.level === 'number' &&
    typeof value.notes === 'string' &&
    typeof value.perception === 'number' &&
    typeof value.speed === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.traits) &&
    Array.isArray(value.tags) &&
    Array.isArray(value.languages) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.attacks) &&
    Array.isArray(value.actions) &&
    Array.isArray(value.reactions) &&
    Array.isArray(value.macros) &&
    isObject(value.defenses) &&
    typeof value.defenses.ac === 'number' &&
    typeof value.defenses.hp === 'number' &&
    Array.isArray(value.defenses.resistances) &&
    isObject(value.defenses.saves) &&
    typeof value.defenses.saves.fortitude === 'number' &&
    typeof value.defenses.saves.reflex === 'number' &&
    typeof value.defenses.saves.will === 'number'
  );
}

export function isCreatureArray(value: unknown): value is Creature[] {
  return Array.isArray(value) && value.every(isCreature);
}
