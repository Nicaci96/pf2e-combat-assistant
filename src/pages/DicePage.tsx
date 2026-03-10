import { useState } from 'react';
import { rollExpression } from '../features/dice/engine';
import type { RollLabel, RollModifiers } from '../features/dice/types';
import { useAppStore } from '../store/appStore';

const labels: RollLabel[] = ['attack', 'damage', 'perception', 'fortitude', 'reflex', 'will', 'skill check', 'custom'];
const emptyMods: RollModifiers = { circumstance: 0, status: 0, item: 0, untyped: 0, temporary: 0, notes: '' };

export function DicePage() {
  const addRoll = useAppStore((s) => s.addRoll);
  const rolls = useAppStore((s) => s.rolls.slice(0, 20));
  const [formula, setFormula] = useState('1d20+0');
  const [label, setLabel] = useState<RollLabel>('attack');
  const [mods, setMods] = useState<RollModifiers>(emptyMods);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const onRoll = async () => {
    try {
      const result = rollExpression(formula, label, mods);
      await addRoll(result);
      setError('');
      setResultMessage(`${result.label} -> ${result.total} usando ${result.finalExpression}`);
    } catch (err) {
      setError((err as Error).message);
      setResultMessage('');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="card space-y-3">
        <h2 className="text-lg">Tiri di dado</h2>
        <div>
          <label className="field-label" htmlFor="roll-formula">Formula</label>
          <input id="roll-formula" className="input" value={formula} onChange={(e) => setFormula(e.target.value)} aria-describedby="roll-formula-help" />
          <p id="roll-formula-help" className="field-help">Esempio: 1d20+12 oppure 2d8+4.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="roll-label">Tipo di tiro</label>
          <select id="roll-label" className="input" value={label} onChange={(e) => setLabel(e.target.value as RollLabel)}>
            {labels.map((entry) => <option key={entry}>{entry}</option>)}
          </select>
        </div>
        <fieldset className="space-y-2 rounded border border-slate-700 p-3">
          <legend className="px-1 text-sm font-medium">Modificatori</legend>
          {(['circumstance', 'status', 'item', 'untyped', 'temporary'] as const).map((key) => (
            <div key={key}>
              <label className="field-label" htmlFor={`mod-${key}`}>{key}</label>
              <input id={`mod-${key}`} className="input" type="number" value={mods[key]} onChange={(e) => setMods({ ...mods, [key]: Number(e.target.value) })} />
            </div>
          ))}
        </fieldset>
        <button className="btn" onClick={onRoll}>Lancia</button>
        <div aria-live="polite" className="text-sm">
          {resultMessage && <p className="feedback-success">{resultMessage}</p>}
        </div>
        {error && <p className="feedback-error text-sm" role="alert">{error}</p>}
      </section>
      <section className="card">
        <h2 className="mb-2 text-lg">Cronologia</h2>
        {rolls.length === 0 ? <p className="text-sm text-slate-300">Nessun tiro ancora. Quando lanci i dadi, il risultato comparira qui.</p> : (
          <ul className="space-y-1 text-sm">
            {rolls.map((roll, index) => <li key={index}>{roll.label} | {roll.finalExpression} = <b>{roll.total}</b></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
