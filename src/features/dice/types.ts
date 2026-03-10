export type RollLabel =
  | 'attack'
  | 'damage'
  | 'perception'
  | 'fortitude'
  | 'reflex'
  | 'will'
  | 'skill check'
  | 'custom';

export interface RollModifiers {
  circumstance: number;
  status: number;
  item: number;
  untyped: number;
  temporary: number;
  notes?: string;
}

export interface DiceTermResult {
  notation: string;
  rolls: number[];
  subtotal: number;
}

export interface RollResult {
  expression: string;
  finalExpression: string;
  terms: DiceTermResult[];
  modifierBreakdown: RollModifiers;
  baseModifier: number;
  total: number;
  label: RollLabel;
  createdAt: string;
}
