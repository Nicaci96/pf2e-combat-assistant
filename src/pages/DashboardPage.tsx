import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export function DashboardPage() {
  const creatures = useAppStore((s) => s.creatures);
  const rolls = useAppStore((s) => s.rolls.slice(0, 8));
  const recentCreatureIds = useAppStore((s) => s.recentCreatureIds);

  const recent = recentCreatureIds.reduce<typeof creatures>((list, id) => {
    const creature = creatures.find((entry) => entry.id === id);
    if (creature) list.push(creature);
    return list;
  }, []).slice(0, 5);

  const fallbackRecent = [...creatures].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const visibleRecent = recent.length > 0 ? recent : fallbackRecent;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="card">
        <h2 className="mb-2 text-lg">Creature usate di recente</h2>
        <p className="mb-3 text-sm text-slate-300">Questa lista mostra le creature aperte o usate davvero di recente, non semplicemente le prime nell'archivio.</p>
        <ul className="space-y-1 text-sm">
          {visibleRecent.map((creature) => (
            <li key={creature.id}><Link className="text-blue-300" to={`/creatures/${creature.id}`}>{creature.name}</Link> (Lv {creature.level})</li>
          ))}
        </ul>
        <Link to="/import" className="btn mt-3 inline-block">Crea o importa una creatura</Link>
      </section>
      <section className="card">
        <h2 className="mb-2 text-lg">Tiri recenti</h2>
        {rolls.length === 0 ? <p className="text-sm text-slate-300">Nessun tiro registrato ancora.</p> : (
          <ul className="space-y-1 text-sm">
            {rolls.map((roll, index) => <li key={`${roll.createdAt}-${index}`}>{new Date(roll.createdAt).toLocaleTimeString()} - {roll.label}: <b>{roll.total}</b> ({roll.finalExpression})</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
