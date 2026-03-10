import type { ActionEntry, Attack, Creature, Macro } from '../../types/creature';
import { makeStableId } from '../../lib/stableId';

function rollMacro(creatureId: string, category: Macro['category'], label: string, expression: string, linkedActionId?: string): Macro {
  return {
    id: makeStableId('macro', `${creatureId}|${category}|${label}|${expression}|${linkedActionId ?? ''}`),
    creatureId,
    category,
    label,
    expression,
    linkedActionId
  };
}

function extractActionRollHints(action: ActionEntry): string[] {
  const hints: string[] = [];
  const bonusMatch = action.description.match(/\(([A-Za-zÀ-ÿ' ]+)\s*([+-]\d+)\)/g);
  for (const chunk of bonusMatch ?? []) {
    const extracted = chunk.match(/\(([A-Za-zÀ-ÿ' ]+)\s*([+-]\d+)\)/);
    if (extracted) {
      hints.push(`1d20${extracted[2]}`);
    }
  }
  return hints;
}

export function generateMacros(creature: Pick<Creature, 'id' | 'perception' | 'defenses' | 'skills' | 'attacks' | 'actions'>): Macro[] {
  const macros: Macro[] = [
    rollMacro(creature.id, 'checks', 'Percezione', `1d20${creature.perception >= 0 ? '+' : ''}${creature.perception}`),
    rollMacro(creature.id, 'saves', 'Tempra', `1d20${creature.defenses.saves.fortitude >= 0 ? '+' : ''}${creature.defenses.saves.fortitude}`),
    rollMacro(creature.id, 'saves', 'Riflessi', `1d20${creature.defenses.saves.reflex >= 0 ? '+' : ''}${creature.defenses.saves.reflex}`),
    rollMacro(creature.id, 'saves', 'Volonta', `1d20${creature.defenses.saves.will >= 0 ? '+' : ''}${creature.defenses.saves.will}`)
  ];

  creature.skills.forEach((skill) => {
    macros.push(rollMacro(creature.id, 'checks', skill.name, `1d20${skill.bonus >= 0 ? '+' : ''}${skill.bonus}`));
  });

  creature.attacks.forEach((attack: Attack) => {
    macros.push(rollMacro(creature.id, 'strikes', `${attack.rangeType} ${attack.name} - Tiro per colpire`, `1d20${attack.bonus >= 0 ? '+' : ''}${attack.bonus}`));
    macros.push(rollMacro(creature.id, 'damage', `${attack.rangeType} ${attack.name} - Danni`, attack.damage));
  });

  creature.actions.forEach((action) => {
    const hints = extractActionRollHints(action);
    hints.forEach((expression, index) => {
      macros.push(rollMacro(creature.id, 'skill actions', `${action.name} #${index + 1}`, expression, action.id));
    });
  });

  return macros;
}
