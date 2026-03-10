import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { generateMacros } from '../features/macros/generator';
import { rollExpression } from '../features/dice/engine';

export function CreatureDetailPage() {
  const { id } = useParams();
  const creatures = useAppStore((s) => s.creatures);
  const upsert = useAppStore((s) => s.upsertCreature);
  const addRoll = useAppStore((s) => s.addRoll);
  const markCreatureUsed = useAppStore((s) => s.markCreatureUsed);
  const creature = useMemo(() => creatures.find((entry) => entry.id === id), [creatures, id]);
  const [temp, setTemp] = useState(0);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!creature) return;
    setNotesDraft(creature.notes);
  }, [creature?.id, creature?.notes]);

  useEffect(() => {
    if (!creature) return;
    void markCreatureUsed(creature.id);
  }, [creature?.id, markCreatureUsed]);

  useEffect(() => {
    if (!creature || notesDraft === creature.notes) return undefined;

    setStatusMessage('Salvataggio note in corso...');
    const timeout = window.setTimeout(() => {
      void upsert({ ...creature, notes: notesDraft, updatedAt: new Date().toISOString() })
        .then(() => {
          setErrorMessage('');
          setStatusMessage('Note salvate.');
        })
        .catch(() => {
          setStatusMessage('');
          setErrorMessage('Le note non possono essere salvate.');
        });
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [creature, notesDraft, upsert]);

  if (!creature) return <div className="card">Creatura non trovata</div>;

  const onImage = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_500_000) {
      setStatusMessage('');
      setErrorMessage('Immagine troppo grande. Scegli un file sotto 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      await upsert({ ...creature, imageDataUrl: String(reader.result), updatedAt: new Date().toISOString() });
      setErrorMessage('');
      setStatusMessage('Immagine salvata.');
    };
    reader.readAsDataURL(file);
  };

  const rebuildMacros = async () => {
    await upsert({ ...creature, macros: generateMacros(creature), updatedAt: new Date().toISOString() });
    setErrorMessage('');
    setStatusMessage('Macro rigenerate.');
  };

  const runMacro = async (expr: string, label: string) => {
    const result = rollExpression(expr, 'custom', { circumstance: 0, status: 0, item: 0, untyped: 0, temporary: temp });
    result.label = 'custom';
    result.expression = `${label}: ${expr}`;
    await addRoll(result);
    await markCreatureUsed(creature.id);
    setErrorMessage('');
    setStatusMessage(`${label} lanciato per ${creature.name}.`);
  };

  const macrosByCategory = creature.macros.reduce<Record<string, typeof creature.macros>>((acc, macro) => {
    acc[macro.category] ??= [];
    acc[macro.category].push(macro);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <section className="card grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl">{creature.name}</h2>
          <p>Livello {creature.level} • {creature.alignment} • {creature.size}</p>
          <p>Tratti: {creature.traits.join(', ')}</p>
          <p>CA {creature.defenses.ac} | PF {creature.defenses.hp} | Velocita {creature.speed}</p>
        </div>
        <div>
          {creature.imageDataUrl ? <img src={creature.imageDataUrl} alt={creature.name} className="h-40 rounded object-cover" /> : <p>Nessuna immagine</p>}
          <label className="field-label mt-2" htmlFor="creature-image">Immagine creatura</label>
          <input id="creature-image" className="mt-2" type="file" accept="image/*" onChange={(e) => void onImage(e.target.files?.[0])} />
          <p className="field-help">Per non gonfiare lo storage locale, usa immagini leggere sotto 1.5 MB.</p>
        </div>
      </section>
      <section className="card">
        <h3 className="mb-2">Note</h3>
        <label className="field-label" htmlFor="creature-notes">Note di sessione e note extra importate</label>
        <textarea id="creature-notes" className="input min-h-28" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} aria-describedby="notes-help" />
        <p id="notes-help" className="field-help">Le note vengono salvate automaticamente dopo una breve pausa. Il testo non strutturato importato dal parser viene aggiunto qui in modo discreto.</p>
      </section>
      <section className="card">
        <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h3>Macro</h3>
          <div className="flex gap-2">
            <div>
              <label className="field-label" htmlFor="temp-mod">Mod temporaneo</label>
              <input id="temp-mod" type="number" className="input w-28" value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
            </div>
            <button className="btn" onClick={() => void rebuildMacros()}>Rigenera macro</button>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(macrosByCategory).map(([category, macros]) => (
            <section key={category}>
              <h4 className="mb-2 text-sm font-semibold">{category}</h4>
              <ul className="grid gap-2 md:grid-cols-2">
                {macros.map((macro) => (
                  <li key={macro.id} className="rounded border border-slate-700 p-2 text-sm">
                    <b>{macro.label}</b>
                    <p className="mt-1 text-slate-300">{macro.expression}</p>
                    <button className="btn mt-2" onClick={() => void runMacro(macro.expression, macro.label)}>Lancia</button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <section className="card" aria-live="polite">
        {statusMessage && <p className="feedback-success text-sm">{statusMessage}</p>}
        {errorMessage && <p className="feedback-error text-sm" role="alert">{errorMessage}</p>}
      </section>
    </div>
  );
}
