import { describe, expect, it } from 'vitest';
import { parseCreatureTemplate } from './parser';
import { CREATURE_TEMPLATE_EXAMPLE } from './template';
import { generateMacros } from '../macros/generator';

describe('creature parser', () => {
  it('parses template fields deterministically', () => {
    const parsed = parseCreatureTemplate(CREATURE_TEMPLATE_EXAMPLE);
    const parsedAgain = parseCreatureTemplate(CREATURE_TEMPLATE_EXAMPLE);

    expect(parsed.errors).toEqual([]);
    expect(parsed.creature.name).toContain('Sentinella');
    expect(parsed.creature.perception).toBe(13);
    expect(parsed.creature.attacks?.length).toBe(3);
    expect(parsed.creature.id).toBe(parsedAgain.creature.id);
  });

  it('moves unknown lines into extra notes', () => {
    const parsed = parseCreatureTemplate('Foo - Creatura 1\nN Medio Umanoide\nPercezione +5\nRigaInutile xyz');
    expect(parsed.creature.notes).toContain('RigaInutile xyz');
    expect(parsed.unparsedText).toContain('4: RigaInutile xyz');
  });

  it('generates expected macro patterns', () => {
    const parsed = parseCreatureTemplate(CREATURE_TEMPLATE_EXAMPLE);
    const creature = parsed.creature as any;
    const macros = generateMacros(creature);
    expect(macros.some((macro) => macro.expression === '1d20+13')).toBe(true);
    expect(macros.some((macro) => macro.expression === '2d6+6')).toBe(true);
    expect(macros.some((macro) => macro.expression === '2d8+6')).toBe(true);
  });

  it('accepts english headers and stable ids', () => {
    const englishTemplate = [
      'Scout - Creature 2',
      'N Medium Humanoid, Goblin',
      'Perception +7',
      'Languages Common',
      'Skills Stealth +8',
      'AC 18; Fortitude +6 Reflex +9 Will +5',
      'HP 30',
      'Speed 25 feet',
      'Attacks',
      'Melee knife +9, Damage 1d4+3',
      'Actions',
      'Action: Sneak Attack',
      'Deals more damage.'
    ].join('\n');

    const parsed = parseCreatureTemplate(englishTemplate);
    const parsedAgain = parseCreatureTemplate(englishTemplate);

    expect(parsed.errors).toEqual([]);
    expect(parsed.creature.id).toBe(parsedAgain.creature.id);
    expect(parsed.creature.attacks?.[0]?.id).toBe(parsedAgain.creature.attacks?.[0]?.id);
  });

  it('parses the real catacomb sentinel example and preserves extra info in notes', () => {
    const parsed = parseCreatureTemplate(CREATURE_TEMPLATE_EXAMPLE);

    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toEqual([]);
    expect(parsed.creature.reactions).toHaveLength(2);
    expect(parsed.creature.actions).toHaveLength(5);
    expect(parsed.creature.defenses?.hp).toBe(82);
    expect(parsed.creature.defenses?.resistances).toContain('tutti i danni 5 (eccetto forza');
    expect(parsed.creature.notes).toContain('Aura di Gelo Sepolcrale');
    expect(parsed.creature.notes).toContain('Fonte: homebrew');
  });
});
