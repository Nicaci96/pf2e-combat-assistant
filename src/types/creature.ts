export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | 'Unaligned';

export interface DefenseBlock {
  ac: number;
  raisedShieldAc?: number;
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  hp: number;
  resistances: string[];
}

export interface Attack {
  id: string;
  rangeType: 'Melee' | 'Ranged';
  name: string;
  bonus: number;
  traits: string;
  damage: string;
}

export interface ActionEntry {
  id: string;
  name: string;
  description: string;
  rollHint?: string;
}

export type MacroCategory = 'checks' | 'saves' | 'strikes' | 'damage' | 'skill actions' | 'custom actions';

export interface Macro {
  id: string;
  creatureId: string;
  category: MacroCategory;
  label: string;
  expression: string;
  linkedActionId?: string;
}

export interface Creature {
  id: string;
  name: string;
  level: number;
  alignment: Alignment | string;
  size: string;
  traits: string[];
  tags: string[];
  notes: string;
  imageDataUrl?: string;
  perception: number;
  languages: string[];
  skills: Array<{ name: string; bonus: number }>;
  abilities: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  defenses: DefenseBlock;
  speed: string;
  attacks: Attack[];
  reactions: ActionEntry[];
  actions: ActionEntry[];
  macros: Macro[];
  unparsedText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedCreatureResult {
  creature: Partial<Creature>;
  warnings: string[];
  errors: string[];
  unparsedText: string;
}
