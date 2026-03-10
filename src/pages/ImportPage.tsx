import { useMemo, useState } from 'react';
import { parseCreatureTemplate } from '../features/parser/parser';
import { CREATURE_TEMPLATE_EXAMPLE, CREATURE_TEMPLATE_GUIDE, TEMPLATE_NAME } from '../features/parser/template';
import { generateMacros } from '../features/macros/generator';
import type { Creature } from '../types/creature';
import { useAppStore } from '../store/appStore';

export function ImportPage() {
  const upsert = useAppStore((s) => s.upsertCreature);
  const [text, setText] = useState(CREATURE_TEMPLATE_EXAMPLE);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const parsed = useMemo(() => parseCreatureTemplate(text), [text]);

  const previewCreature = useMemo(() => {
    const candidate = parsed.creature as Creature;
    if (!candidate.id || !candidate.name || candidate.level === undefined || !candidate.defenses || candidate.perception === undefined) return null;
    return { ...candidate, macros: generateMacros(candidate) };
  }, [parsed]);

  const onSave = async () => {
    if (!previewCreature) return;

    try {
      await upsert({ ...previewCreature, updatedAt: new Date().toISOString() });
      setSaveError('');
      setSaveMessage(`Creatura "${previewCreature.name}" salvata con successo.`);
    } catch {
      setSaveMessage('');
      setSaveError('La creatura non puo essere salvata. Riprova.');
    }
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="mb-2 text-lg">Importa creatura da template</h2>
        <p className="mb-4 text-sm text-slate-300">Incolla una creatura nel template standard, poi controlla anteprima e diagnostica prima di salvarla.</p>
        <div className="mb-3 rounded border border-slate-700 p-3 text-sm text-slate-200">
          <p className="font-medium">Suggerimenti rapidi</p>
          <p>1. Mantieni l'intestazione nel formato "Nome - Creatura X".</p>
          <p>2. Usa una riga per ogni blocco principale: percezione, difese, velocita, attacchi, sezioni azioni.</p>
          <p>3. Il testo non convertito in campi strutturati viene conservato automaticamente nelle note extra.</p>
        </div>
        <label className="field-label" htmlFor="creature-template">Template creatura</label>
        <textarea id="creature-template" className="input min-h-80" value={text} onChange={(e) => setText(e.target.value)} aria-describedby="template-help template-diagnostics" aria-invalid={parsed.errors.length > 0} />
        <p id="template-help" className="field-help">Puoi partire dal template guida o dall'esempio reale qui sotto e sostituire i dati con la tua creatura.</p>
      </section>
      <section className="card space-y-4">
        <div>
          <h3 className="font-semibold">{TEMPLATE_NAME}</h3>
          <p className="text-sm text-slate-300">Il parser supporta anche sezioni opzionali come magia, reazioni, azioni gratuite e parser hints.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => setText(CREATURE_TEMPLATE_GUIDE)}>Carica template guida</button>
            <button type="button" className="btn" onClick={() => setText(CREATURE_TEMPLATE_EXAMPLE)}>Carica esempio reale</button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Template guida</p>
          <pre className="whitespace-pre-wrap text-xs">{CREATURE_TEMPLATE_GUIDE}</pre>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Esempio reale: Sentinella delle Catacombe</p>
          <pre className="whitespace-pre-wrap text-xs">{CREATURE_TEMPLATE_EXAMPLE}</pre>
        </div>
      </section>
      <section className="card">
        <h3 className="mb-2">Anteprima</h3>
        <div id="template-diagnostics" className="space-y-2">
          {parsed.errors.length > 0 && (
            <div role="alert" className="feedback-error text-sm">
              <p className="font-medium">Errori</p>
              <ul className="list-disc pl-5">
                {parsed.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          )}
          {parsed.warnings.length > 0 && (
            <div className="text-sm text-amber-200" aria-live="polite">
              <p className="font-medium">Controlli consigliati</p>
              <ul className="list-disc pl-5">
                {parsed.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </div>
          )}
        </div>
        {previewCreature ? (
          <div className="text-sm">
            <p><b>{previewCreature.name}</b> livello {previewCreature.level}</p>
            <p>Percezione +{previewCreature.perception}</p>
            <p>Attacchi: {previewCreature.attacks.map((attack) => `${attack.name} +${attack.bonus} (${attack.damage})`).join('; ')}</p>
            <p>Macro generate: {previewCreature.macros.length}</p>
            {previewCreature.notes && <p className="mt-2 text-xs text-slate-300">Le informazioni non mappate in campi dedicati sono gia state spostate nelle note extra della creatura.</p>}
            <button className="btn mt-2" onClick={() => void onSave()}>Salva creatura</button>
          </div>
        ) : parsed.errors.length === 0 ? (
          <p className="text-sm text-slate-300">Completa i campi obbligatori per sbloccare l'anteprima.</p>
        ) : null}
        <div className="mt-3 text-sm" aria-live="polite">
          {saveMessage && <p className="feedback-success">{saveMessage}</p>}
          {saveError && <p className="feedback-error" role="alert">{saveError}</p>}
        </div>
      </section>
    </div>
  );
}
