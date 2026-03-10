import type { Creature } from '../../types/creature';
import { generateMacros } from '../macros/generator';

function baseCreature(partial: Partial<Creature>): Creature {
  const now = new Date().toISOString();
  const creature: Creature = {
    id: partial.id ?? crypto.randomUUID(),
    name: partial.name ?? 'Creature',
    level: partial.level ?? 1,
    alignment: partial.alignment ?? 'N',
    size: partial.size ?? 'Medio',
    traits: partial.traits ?? [],
    tags: partial.tags ?? [],
    notes: partial.notes ?? '',
    imageDataUrl: partial.imageDataUrl,
    perception: partial.perception ?? 0,
    languages: partial.languages ?? [],
    skills: partial.skills ?? [],
    abilities: partial.abilities ?? {},
    defenses: partial.defenses ?? { ac: 10, saves: { fortitude: 0, reflex: 0, will: 0 }, hp: 10, resistances: [] },
    speed: partial.speed ?? '6 m',
    attacks: partial.attacks ?? [],
    reactions: partial.reactions ?? [],
    actions: partial.actions ?? [],
    macros: [],
    unparsedText: partial.unparsedText ?? '',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now
  };
  creature.macros = generateMacros(creature);
  return creature;
}

export const SAMPLE_CREATURES: Creature[] = [
  baseCreature({
    id: 'sample-hellknight',
    name: 'Hellknight della Ruota (Paralictor “di strada”)',
    level: 5,
    alignment: 'LN',
    size: 'Medio',
    traits: ['Umanoide', 'Hellknight'],
    tags: ['hellknight', 'humanoid'],
    perception: 13,
    languages: ['Comune', 'Chelaxiano', 'Infernale'],
    skills: [
      { name: 'Athletics', bonus: 15 },
      { name: 'Intimidation', bonus: 14 },
      { name: 'Society', bonus: 11 }
    ],
    defenses: { ac: 23, raisedShieldAc: 25, saves: { fortitude: 14, reflex: 12, will: 13 }, hp: 95, resistances: ['mental 5'] },
    speed: '6 m',
    attacks: [
      { id: 'a1', rangeType: 'Melee', name: 'Spada lunga', bonus: 16, traits: 'versatile P', damage: '2d8+7' },
      { id: 'a2', rangeType: 'Melee', name: 'Frusta', bonus: 15, traits: 'finesse, reach 3 m, disarm, trip, nonlethal', damage: '1d4+7' },
      { id: 'a3', rangeType: 'Ranged', name: 'Balestra leggera', bonus: 13, traits: 'gittata 36 m, ricarica 1', damage: '1d8+4' }
    ],
    reactions: [{ id: 'r1', name: 'Attacco di Opportunità', description: '' }],
    actions: [
      { id: 'ac1', name: 'Sentenza: Inginocchiati', description: 'Tenta Demoralize (Intimidation +14).' },
      { id: 'ac2', name: 'Colpo Disciplinare', description: 'Tentare Trip contro lo stesso bersaglio (Athletics +15).' }
    ]
  }),
  baseCreature({
    id: 'sample-wolf',
    name: 'Lupo Crudele',
    level: 2,
    alignment: 'N',
    size: 'Medio',
    traits: ['Animale'],
    tags: ['beast'],
    perception: 9,
    languages: [],
    skills: [{ name: 'Stealth', bonus: 8 }],
    defenses: { ac: 18, saves: { fortitude: 9, reflex: 8, will: 6 }, hp: 35, resistances: [] },
    speed: '10 m',
    attacks: [{ id: 'w1', rangeType: 'Melee', name: 'Fauci', bonus: 11, traits: 'trip', damage: '1d8+4' }],
    actions: [],
    reactions: []
  }),
  baseCreature({
    id: 'sample-skeleton',
    name: 'Scheletro Guardia',
    level: 1,
    alignment: 'NE',
    size: 'Medio',
    traits: ['Non Morto'],
    tags: ['undead'],
    perception: 5,
    skills: [{ name: 'Athletics', bonus: 7 }],
    defenses: { ac: 16, saves: { fortitude: 8, reflex: 4, will: 5 }, hp: 20, resistances: ['piercing 5'] },
    speed: '6 m',
    attacks: [{ id: 's1', rangeType: 'Melee', name: 'Spada corta', bonus: 9, traits: '', damage: '1d6+3' }],
    actions: [],
    reactions: []
  })
];
