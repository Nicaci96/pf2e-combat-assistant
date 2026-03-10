import type { ActionEntry, Attack, Creature, ParsedCreatureResult } from '../../types/creature';
import { makeStableId } from '../../lib/stableId';

const LEVEL_RE = /^(.*?)\s*[-–—]\s*(?:Creatura|Creature)\s*(\d+)$/i;
const ALIGNMENT_LINE_RE = /^([A-Z]{1,2}|Unaligned|Senza Allineamento)\s+(\S+)\s+(.+)$/i;
const RARITY_RE = /^(Comune|Non Comune|Raro|Unico|Common|Uncommon|Rare|Unique)$/i;
const PERCEPTION_RE = /^(?:Percezione|Perception)\s*([+-]\d+)(.*)$/i;
const LANGUAGES_RE = /^(?:Lingue|Languages)\s+(.+)$/i;
const SKILLS_RE = /^(?:Abilita|Abilità|Abilita'|Skills)\s+(.+)$/i;
const ABILITY_RE = /\b(For|Des|Cos|Int|Sag|Car)\s*([+-]\d+|[-—])/gi;
const AC_RE = /^(?:CA|AC)\s*(\d+)(.*)$/i;
const ITALIAN_SAVES_RE = /^Tempra\s*([+-]\d+)\s*Riflessi\s*([+-]\d+)\s*Volont[aà]\s*([+-]\d+)/i;
const ENGLISH_SAVES_RE = /^Fortitude\s*([+-]\d+)\s*Reflex\s*([+-]\d+)\s*Will\s*([+-]\d+)/i;
const HP_RE = /^(?:PF|HP)\s*(\d+)(.*)$/i;
const SPEED_RE = /^(?:Velocita|Velocità|Speed)\s+(.+)$/i;
const OBJECTS_RE = /^(?:Oggetti|Items)\s+(.+)$/i;
const ATTACK_RE = /^(Melee|Ranged)\s*(?:[>•???¦?])?\s*(.+?)\s*([+-]\d+)\s*(\([^)]*\))?\s*,\s*(?:Danni|Damage)\s+(.+)$/i;
const SEPARATOR_RE = /^[-—-]{3,}$/;
const ACTION_HEADER_RE = /^(?:AZIONI|Actions?)$/i;
const REACTION_HEADER_RE = /^(?:REAZIONI|Reactions?)$/i;
const FREE_ACTION_HEADER_RE = /^(?:AZIONI GRATUITE|Free Actions?)$/i;
const SPELLS_HEADER_RE = /^(?:INCANTESIMI\s*\/\s*MAGIA|Spells?)$/i;
const NOTES_HEADER_RE = /^(?:NOTE\s*\/\s*PARSER HINTS|Parser Hints?)$/i;
const ATTACK_HEADER_RE = /^(?:Attacchi|Attacks)$/i;
const ACTION_LINE_RE = /^(.+?)\s+(\[reaction\]|\[free-action\]|[???¦?]+)\s*(\([^)]*\))?\s*(.*)$/i;

type Section = 'neutral' | 'actions' | 'reactions' | 'freeActions' | 'spells' | 'parserHints';

function normalizeLine(value: string): string {
  return value
    .replace(/â€”/g, '-')
    .replace(/â€“/g, '-')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/âŸ¡/g, '?')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¬/g, 'ì')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¹/g, 'ù')
    .replace(/Â/g, '')
    .trim();
}

function splitSemicolonSegments(raw: string): string[] {
  return raw
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function appendNoteBlock(blocks: string[], title: string, values: string[]): void {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length === 0) return;
  blocks.push(`${title}:\n${cleaned.map((value) => `- ${value}`).join('\n')}`);
}

function parseSkills(raw: string): Array<{ name: string; bonus: number }> {
  return raw
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*([+-]\d+)$/);
      if (!match) return null;
      return { name: match[1].trim(), bonus: Number(match[2]) };
    })
    .filter((value): value is { name: string; bonus: number } => value !== null);
}

function parseAbilities(line: string): { abilities: Creature['abilities']; missing: string[] } {
  const abilities: Creature['abilities'] = {};
  const missing: string[] = [];

  for (const match of line.matchAll(ABILITY_RE)) {
    const rawValue = match[2];
    if (rawValue === '-' || rawValue === '—') {
      missing.push(`${match[1]} non applicabile`);
      continue;
    }

    const value = Number(rawValue);
    switch (match[1].toLowerCase()) {
      case 'for':
        abilities.str = value;
        break;
      case 'des':
        abilities.dex = value;
        break;
      case 'cos':
        abilities.con = value;
        break;
      case 'int':
        abilities.int = value;
        break;
      case 'sag':
        abilities.wis = value;
        break;
      case 'car':
        abilities.cha = value;
        break;
    }
  }

  return { abilities, missing };
}

function makeId(prefix: string, seed: string): string {
  return makeStableId(prefix, seed);
}

function parseActionLine(lineText: string, prefix = ''): Omit<ActionEntry, 'id'> {
  const match = lineText.match(ACTION_LINE_RE);
  if (!match) {
    return { name: `${prefix}${lineText}`.trim(), description: '' };
  }

  const [, rawName, icon, rawTraits, rawTail] = match;
  const details = [rawTraits ? rawTraits.slice(1, -1) : '', rawTail.trim()].filter(Boolean).join(' ; ');
  const inferredPrefix = icon.toLowerCase() === '[free-action]' ? '[Gratuita] ' : '';
  return {
    name: `${prefix || inferredPrefix}${rawName.trim()}`.trim(),
    description: details
  };
}

export function parseCreatureTemplate(input: string): ParsedCreatureResult {
  const lines = input
    .split(/\r?\n/)
    .map((line, index) => ({ lineNumber: index + 1, text: normalizeLine(line) }))
    .filter((line) => line.text.length > 0 && !SEPARATOR_RE.test(line.text));

  const warnings: string[] = [];
  const errors: string[] = [];
  const unparsed: string[] = [];
  const extraNotes: string[] = [];
  const passiveEntries: string[] = [];
  const spellEntries: string[] = [];
  const parserHintEntries: string[] = [];

  if (lines.length < 4) {
    return { creature: {}, warnings, errors: ['Input troppo corto per il template'], unparsedText: input };
  }

  const creature: Partial<Creature> = {
    id: makeId('creature', normalizeLine(input)),
    traits: [],
    tags: [],
    notes: '',
    skills: [],
    languages: [],
    attacks: [],
    reactions: [],
    actions: [],
    abilities: {},
    defenses: {
      ac: 10,
      saves: { fortitude: 0, reflex: 0, will: 0 },
      hp: 1,
      resistances: []
    },
    speed: '0 m'
  };

  const first = lines[0].text.match(LEVEL_RE);
  if (first) {
    creature.name = first[1].trim();
    creature.level = Number(first[2]);
  } else {
    errors.push('Riga 1: usa "Nome - Creatura X" oppure "Name - Creature X"');
    unparsed.push(lines[0].text);
  }

  let bodyStart = 1;
  const second = lines[1].text.match(ALIGNMENT_LINE_RE);
  if (second) {
    creature.alignment = second[1];
    creature.size = second[2];
    creature.traits = second[3].split(/[(),]/).map((trait) => trait.trim()).filter(Boolean);
  } else {
    warnings.push('Riga 2: allineamento, taglia o tratti non sono stati riconosciuti');
    unparsed.push(lines[1].text);
  }

  if (lines[2] && RARITY_RE.test(lines[2].text)) {
    creature.tags?.push(lines[2].text);
    bodyStart = 2;
  }

  let section: Section = 'neutral';
  let activeAction: ActionEntry | null = null;

  for (const line of lines.slice(bodyStart + 1)) {
    if (ATTACK_HEADER_RE.test(line.text)) {
      section = 'neutral';
      activeAction = null;
      continue;
    }
    if (ACTION_HEADER_RE.test(line.text)) {
      section = 'actions';
      activeAction = null;
      continue;
    }
    if (REACTION_HEADER_RE.test(line.text)) {
      section = 'reactions';
      activeAction = null;
      continue;
    }
    if (FREE_ACTION_HEADER_RE.test(line.text)) {
      section = 'freeActions';
      activeAction = null;
      continue;
    }
    if (SPELLS_HEADER_RE.test(line.text)) {
      section = 'spells';
      activeAction = null;
      continue;
    }
    if (NOTES_HEADER_RE.test(line.text)) {
      section = 'parserHints';
      activeAction = null;
      continue;
    }

    const perception = line.text.match(PERCEPTION_RE);
    if (perception) {
      creature.perception = Number(perception[1]);
      appendNoteBlock(extraNotes, 'Sensi e percezione extra', splitSemicolonSegments(perception[2]));
      continue;
    }

    const languages = line.text.match(LANGUAGES_RE);
    if (languages) {
      const [spoken, ...extras] = splitSemicolonSegments(languages[1]);
      creature.languages = spoken ? spoken.split(',').map((value) => value.trim()).filter(Boolean) : [];
      appendNoteBlock(extraNotes, 'Comunicazioni extra', extras);
      continue;
    }

    const skills = line.text.match(SKILLS_RE);
    if (skills) {
      creature.skills = parseSkills(skills[1]);
      continue;
    }

    if (/^For\s+/i.test(line.text)) {
      const { abilities, missing } = parseAbilities(line.text);
      creature.abilities = abilities;
      appendNoteBlock(extraNotes, 'Caratteristiche non numeriche', missing);
      continue;
    }

    const objects = line.text.match(OBJECTS_RE);
    if (objects) {
      appendNoteBlock(extraNotes, 'Oggetti', [objects[1]]);
      continue;
    }

    const ac = line.text.match(AC_RE);
    if (ac && creature.defenses) {
      creature.defenses.ac = Number(ac[1]);
      const shield = ac[2].match(/con\s*scudo\s*alzato\s*(\d+)/i);
      creature.defenses.raisedShieldAc = shield ? Number(shield[1]) : undefined;
      const savesInline = ac[2].match(ITALIAN_SAVES_RE) ?? ac[2].match(ENGLISH_SAVES_RE);
      if (savesInline) {
        creature.defenses.saves.fortitude = Number(savesInline[1]);
        creature.defenses.saves.reflex = Number(savesInline[2]);
        creature.defenses.saves.will = Number(savesInline[3]);
      }
      continue;
    }

    const italianSaves = line.text.match(ITALIAN_SAVES_RE);
    if (italianSaves && creature.defenses) {
      creature.defenses.saves.fortitude = Number(italianSaves[1]);
      creature.defenses.saves.reflex = Number(italianSaves[2]);
      creature.defenses.saves.will = Number(italianSaves[3]);
      continue;
    }

    const englishSaves = line.text.match(ENGLISH_SAVES_RE);
    if (englishSaves && creature.defenses) {
      creature.defenses.saves.fortitude = Number(englishSaves[1]);
      creature.defenses.saves.reflex = Number(englishSaves[2]);
      creature.defenses.saves.will = Number(englishSaves[3]);
      continue;
    }

    const hp = line.text.match(HP_RE);
    if (hp && creature.defenses) {
      creature.defenses.hp = Number(hp[1]);
      const extras = splitSemicolonSegments(hp[2]);
      const resistances = extras.find((entry) => /^(?:Resistenze|Resistances)\s+/i.test(entry));
      if (resistances) {
        creature.defenses.resistances = resistances.replace(/^(?:Resistenze|Resistances)\s+/i, '').split(',').map((value) => value.trim()).filter(Boolean);
      }
      appendNoteBlock(
        extraNotes,
        'Difese aggiuntive',
        extras.filter((entry) => entry !== resistances)
      );
      continue;
    }

    const speed = line.text.match(SPEED_RE);
    if (speed) {
      creature.speed = speed[1].trim();
      continue;
    }

    const attack = line.text.match(ATTACK_RE);
    if (attack) {
      const entry: Attack = {
        id: makeId('atk', `${creature.id}|${line.lineNumber}|${line.text}`),
        rangeType: attack[1] as Attack['rangeType'],
        name: attack[2].trim(),
        bonus: Number(attack[3]),
        traits: attack[4]?.slice(1, -1) ?? '',
        damage: attack[5].trim()
      };
      creature.attacks?.push(entry);
      continue;
    }

    if (section === 'actions' || section === 'reactions' || section === 'freeActions') {
      const looksLikeFollowUp = /^(Successo|Successo Critico|Fallimento|Fallimento Critico|Effetto|Trigger|Requisiti|Bersaglio|Area|Frequenza|Tiro salvezza)\b/i.test(line.text);
      if (activeAction && looksLikeFollowUp) {
        activeAction.description = activeAction.description ? `${activeAction.description}\n${line.text}` : line.text;
        continue;
      }

      const parsedAction = parseActionLine(line.text, section === 'freeActions' ? '[Gratuita] ' : '');
      activeAction = {
        id: makeId('action', `${creature.id}|${line.lineNumber}|${parsedAction.name}`),
        name: parsedAction.name,
        description: parsedAction.description
      };

      if (section === 'reactions') {
        creature.reactions?.push(activeAction);
      } else {
        creature.actions?.push(activeAction);
      }
      continue;
    }

    if (section === 'spells') {
      spellEntries.push(line.text);
      continue;
    }

    if (section === 'parserHints') {
      parserHintEntries.push(line.text);
      continue;
    }

    passiveEntries.push(line.text);
    unparsed.push(`${line.lineNumber}: ${line.text}`);
  }

  if (creature.perception === undefined) {
    warnings.push('Percezione non trovata');
  }
  if ((creature.attacks?.length ?? 0) === 0) {
    warnings.push('Nessun attacco riconosciuto');
  }

  appendNoteBlock(extraNotes, 'Capacita passive e testo libero', passiveEntries);
  appendNoteBlock(extraNotes, 'Magia e incantesimi', spellEntries);
  appendNoteBlock(extraNotes, 'Parser hints', parserHintEntries);

  creature.unparsedText = unparsed.join('\n');
  creature.notes = extraNotes.join('\n\n');
  creature.updatedAt = new Date().toISOString();
  creature.createdAt = new Date().toISOString();

  return { creature, warnings, errors, unparsedText: creature.unparsedText };
}
