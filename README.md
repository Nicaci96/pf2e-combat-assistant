# PF2e Combat Assistant MVP

Local-first Pathfinder 2e combat helper built with React + TypeScript + Vite + Tailwind + Zustand.

## Features
- Dashboard with recent creatures and recent rolls.
- Dice roller with deterministic parsing and typed modifiers (circumstance, status, item, untyped, temporary).
- Creature archive with search/filter.
- Creature detail page with editable notes, image upload (stored locally), macro buttons.
- Deterministic template import (`Template pronto per importazione`) with parse preview, warnings/errors, and macro preview.
- Local persistence using IndexedDB (`idb`) with `localStorage` fallback.
- Settings for JSON export/import and local reset.
- Preloaded sample creatures (including Hellknight example).

## Setup
```bash
npm install
npm run dev
```

## Tests
```bash
npm run test
```

## Deterministic parser guarantees
The parser (`src/features/parser/parser.ts`) uses only:
- regex
- section tokens (`Attacchi`, `Azioni`, `Reazione`)
- explicit per-line matching rules

No AI/LLM/inference API/runtime model is used.

## Template assumptions
- Line 1: `Name — Creatura <level>`
- Line 2: `<alignment> <size> <traits/type>`
- `Percezione`, `Lingue`, `Abilità`, `CA...Tempra...Riflessi...Volontà`, `PF`, `Velocità` lines map directly to structured fields.
- Attack lines start with `Melee` or `Ranged` and include `Danni`.
- `Azioni` and `Reazione` delimit action sections.
- Parenthetical traits/details are preserved.

## Parser limitations
- Requires the documented template vocabulary in Italian.
- Does not resolve PF2e rules logic (conditions/effects remain text descriptions).
- Complex/variant damage notations are preserved as string but not semantically decomposed.
- Unrecognized lines are moved into `unparsedText` and surfaced in UI.

## Architecture decisions
1. **Feature-first modules** under `src/features/*` for dice/parser/macros.
2. **Single Zustand store** (`src/store/appStore.ts`) for creatures/roll history and persistence integration.
3. **Local persistence adapter** (`src/lib/storage.ts`) abstracts IndexedDB/fallback localStorage.
4. **Type-safe domain model** in `src/types/creature.ts` to keep parser/output/editor coherent.

## Next improvements
- Encounter builder + initiative tracker + turn order.
- Per-encounter HP/conditions state separate from creature archive records.
- Better image compression pipeline and thumbnails.
- Stronger parser diagnostics UI with per-line highlighting.
