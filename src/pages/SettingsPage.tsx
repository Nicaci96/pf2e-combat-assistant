import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { isCreatureArray } from '../lib/validation';

export function SettingsPage() {
  const creatures = useAppStore((s) => s.creatures);
  const importCreatures = useAppStore((s) => s.importCreatures);
  const resetAll = useAppStore((s) => s.resetAll);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onExport = () => {
    const blob = new Blob([JSON.stringify(creatures, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pf2e-creatures.json';
    link.click();
    URL.revokeObjectURL(url);
    setErrorMessage('');
    setStatusMessage('Creature esportate correttamente.');
  };

  const onImport = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!isCreatureArray(parsed)) {
        throw new Error('Il file non e un export valido di creature.');
      }
      await importCreatures(parsed);
      setErrorMessage('');
      setStatusMessage(`${parsed.length} creature importate.`);
    } catch (error) {
      setStatusMessage('');
      setErrorMessage((error as Error).message);
    }
  };

  const onReset = async () => {
    if (!confirmReset) {
      setStatusMessage('');
      setErrorMessage('Conferma prima il reset del database locale.');
      return;
    }

    if (!window.confirm('Vuoi davvero eliminare i dati locali? L\'azione non e reversibile.')) {
      return;
    }

    await resetAll();
    setConfirmReset(false);
    setErrorMessage('');
    setStatusMessage('Database locale azzerato. Le creature di esempio sono state ripristinate.');
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="mb-2 text-lg">Impostazioni</h2>
        <p className="mb-4 text-sm text-slate-300">Esporta un backup JSON, importa solo file validi e gestisci il tema dell'interfaccia.</p>
        <button className="btn mr-2" onClick={onExport}>Esporta JSON creature</button>
        <label className="field-label mt-4" htmlFor="import-json">Importa JSON creature</label>
        <input id="import-json" type="file" accept="application/json" onChange={(e) => void onImport(e.target.files?.[0])} />
        <p className="field-help">Accetta solo export JSON completi dell'app.</p>
      </section>
      <section className="card">
        <div className="mb-3 flex items-start gap-2 text-sm">
          <input id="confirm-reset" type="checkbox" checked={confirmReset} onChange={(e) => setConfirmReset(e.target.checked)} />
          <label htmlFor="confirm-reset">Ho capito che il reset elimina i dati locali e ripristina solo le creature di esempio.</label>
        </div>
        <button className="btn btn-danger" onClick={() => void onReset()}>Reset database locale</button>
      </section>
      <section className="card">
        <label className="field-label" htmlFor="theme-select">Tema</label>
        <select id="theme-select" className="input w-40" value={theme} onChange={(e) => void setTheme(e.target.value as 'dark' | 'light')}>
          <option value="dark">Scuro</option>
          <option value="light">Chiaro</option>
        </select>
        <p className="field-help">La scelta viene applicata subito e viene salvata per la prossima apertura.</p>
      </section>
      <section className="card" aria-live="polite">
        {statusMessage && <p className="feedback-success text-sm">{statusMessage}</p>}
        {errorMessage && <p className="feedback-error text-sm" role="alert">{errorMessage}</p>}
      </section>
    </div>
  );
}
