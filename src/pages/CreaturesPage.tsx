import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export function CreaturesPage() {
  const creatures = useAppStore((s) => s.creatures);
  const recentCreatureIds = useAppStore((s) => s.recentCreatureIds);
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<'recent' | 'name' | 'level'>('recent');

  const filtered = useMemo(() => {
    const recentIndex = new Map(recentCreatureIds.map((id, index) => [id, index]));

    return creatures
      .filter((creature) => {
        const query = q.toLowerCase();
        if (query && !`${creature.name} ${creature.traits.join(' ')} ${creature.tags.join(' ')}`.toLowerCase().includes(query)) return false;
        if (level && creature.level !== Number(level)) return false;
        if (tag && !creature.tags.join(' ').toLowerCase().includes(tag.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'level') return b.level - a.level || a.name.localeCompare(b.name);

        const aIndex = recentIndex.get(a.id);
        const bIndex = recentIndex.get(b.id);
        if (aIndex !== undefined || bIndex !== undefined) {
          return (aIndex ?? Number.MAX_SAFE_INTEGER) - (bIndex ?? Number.MAX_SAFE_INTEGER);
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [creatures, level, q, recentCreatureIds, sort, tag]);

  return (
    <div className="card">
      <h2 className="mb-3 text-lg">Archivio creature</h2>
      <p className="mb-4 text-sm text-slate-300">Filtra per nome, livello o tag. L'ordinamento predefinito privilegia le creature usate davvero di recente.</p>
      <div className="mb-3 grid gap-3 md:grid-cols-4">
        <div>
          <label className="field-label" htmlFor="creature-search">Cerca creature</label>
          <input id="creature-search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Goblin, undead, scout..." />
        </div>
        <div>
          <label className="field-label" htmlFor="creature-level">Livello esatto</label>
          <input id="creature-level" className="input" type="number" inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Qualsiasi livello" />
        </div>
        <div>
          <label className="field-label" htmlFor="creature-tag">Tag contiene</label>
          <input id="creature-tag" className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="boss, summon..." />
        </div>
        <div>
          <label className="field-label" htmlFor="creature-sort">Ordina per</label>
          <select id="creature-sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name' | 'level')}>
            <option value="recent">Uso recente</option>
            <option value="level">Livello decrescente</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      </div>
      <p className="mb-3 text-sm" aria-live="polite">{filtered.length} creature trovate.</p>
      {filtered.length === 0 ? (
        <div className="rounded border border-dashed border-slate-600 p-4 text-sm text-slate-300">
          Nessuna creatura corrisponde ai filtri attuali. Prova a rimuovere un filtro o importa una nuova scheda.
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {filtered.map((creature) => <li key={creature.id}><Link className="text-blue-300" to={`/creatures/${creature.id}`}>{creature.name}</Link> - Livello {creature.level} - {creature.traits.join(', ')}</li>)}
        </ul>
      )}
    </div>
  );
}
