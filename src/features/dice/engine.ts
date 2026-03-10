import type { DiceTermResult, RollLabel, RollModifiers, RollResult } from './types';

const DICE_RE = /([+-]?\d*)d(\d+)/gi;
const INT_RE = /([+-]?\d+)(?!d)/gi;

export function parseDiceExpression(expression: string): { diceTerms: Array<{ count: number; sides: number; sign: 1 | -1 }>; flatModifier: number } {
  const sanitized = expression.replace(/\s+/g, '').toLowerCase();
  const diceTerms: Array<{ count: number; sides: number; sign: 1 | -1 }> = [];

  for (const match of sanitized.matchAll(DICE_RE)) {
    const rawCount = match[1] ?? '';
    const sign: 1 | -1 = rawCount.startsWith('-') ? -1 : 1;
    const digits = rawCount.replace(/[+-]/g, '');
    const count = digits ? Number(digits) : 1;
    const sides = Number(match[2]);
    if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
      throw new Error(`Invalid dice term: ${match[0]}`);
    }
    diceTerms.push({ count, sides, sign });
  }

  const stripped = sanitized.replace(DICE_RE, '');
  let flatModifier = 0;
  for (const entry of stripped.matchAll(INT_RE)) {
    flatModifier += Number(entry[1]);
  }

  if (diceTerms.length === 0 && !/^[-+]?\d+$/.test(sanitized)) {
    throw new Error('Expression must include at least one valid dice term or integer');
  }

  return { diceTerms, flatModifier };
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollExpression(
  expression: string,
  label: RollLabel,
  modifiers: RollModifiers = { circumstance: 0, status: 0, item: 0, untyped: 0, temporary: 0 }
): RollResult {
  const parsed = parseDiceExpression(expression);
  const terms: DiceTermResult[] = parsed.diceTerms.map((term) => {
    const rolls = Array.from({ length: term.count }, () => rollDie(term.sides) * term.sign);
    return {
      notation: `${term.sign < 0 ? '-' : ''}${term.count}d${term.sides}`,
      rolls,
      subtotal: rolls.reduce((acc, value) => acc + value, 0)
    };
  });

  const typedSum = modifiers.circumstance + modifiers.status + modifiers.item + modifiers.untyped + modifiers.temporary;
  const typedExpressionPart = ([
    ['circ', modifiers.circumstance],
    ['status', modifiers.status],
    ['item', modifiers.item],
    ['untyped', modifiers.untyped],
    ['temp', modifiers.temporary]
  ] as Array<[string, number]>)
    .filter(([, value]) => value !== 0)
    .map(([name, value]) => `${value >= 0 ? '+' : ''}${value}[${name}]`)
    .join('');

  return {
    expression,
    finalExpression: `${expression}${typedExpressionPart}`,
    terms,
    modifierBreakdown: modifiers,
    baseModifier: parsed.flatModifier,
    total: terms.reduce((acc, term) => acc + term.subtotal, 0) + parsed.flatModifier + typedSum,
    label,
    createdAt: new Date().toISOString()
  };
}
