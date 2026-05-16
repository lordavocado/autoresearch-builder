import { useState } from 'react';
import { FlaskConical, TrendingDown, Plus, X, Upload } from 'lucide-react';
import type { Experiment } from '../lib/supabase';
import { BpbChart } from './BpbChart';

interface ExperimentTrackerProps {
  experiments: Experiment[];
  onAdd: (exp: Omit<Experiment, 'id' | 'created_at'>) => void;
  onImport: (tsv: string) => Promise<number>;
  conversationId: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    keep: 'bg-success-moss/10 text-success-moss',
    discard: 'bg-action-orange/10 text-action-orange',
    crash: 'bg-error-red/10 text-error-red',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[status] || ''}`}>
      {status}
    </span>
  );
}

export function ExperimentTracker({ experiments, onAdd, onImport, conversationId }: ExperimentTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importTsv, setImportTsv] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [form, setForm] = useState({
    commit_hash: '',
    val_bpb: '',
    memory_gb: '',
    status: 'keep' as 'keep' | 'discard' | 'crash',
    description: '',
  });

  const keptExperiments = experiments.filter(e => e.status === 'keep' && e.val_bpb > 0);
  const bestBpb = keptExperiments.reduce((min, e) => Math.min(min, e.val_bpb), Infinity);
  const totalKept = experiments.filter(e => e.status === 'keep').length;
  const totalDiscarded = experiments.filter(e => e.status === 'discard').length;
  const totalCrashed = experiments.filter(e => e.status === 'crash').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      conversation_id: conversationId,
      commit_hash: form.commit_hash,
      val_bpb: parseFloat(form.val_bpb) || 0,
      memory_gb: parseFloat(form.memory_gb) || 0,
      status: form.status,
      description: form.description,
    });
    setForm({ commit_hash: '', val_bpb: '', memory_gb: '', status: 'keep', description: '' });
    setShowForm(false);
  };

  const handleImport = async () => {
    if (!importTsv.trim()) return;
    setImportStatus('Importing...');
    const count = await onImport(importTsv);
    setImportStatus(`Imported ${count} experiments`);
    setImportTsv('');
    setTimeout(() => { setImportStatus(''); setShowImport(false); }, 2000);
  };

  return (
    <div className="border-l border-steel-gray bg-fog-gray w-80 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-steel-gray bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical size={14} className="text-deep-plum" />
            <h3 className="text-sm font-semibold text-ink-blue tracking-[-0.01em]">Experiments</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowImport(!showImport); setShowForm(false); }}
              className="p-1.5 rounded-md hover:bg-fog-gray transition-colors"
              title="Import results.tsv"
            >
              <Upload size={13} className="text-slate-text" />
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setShowImport(false); }}
              className="p-1.5 rounded-md hover:bg-fog-gray transition-colors"
            >
              {showForm ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {experiments.length > 0 && (
        <div className="grid grid-cols-4 gap-1 p-3 border-b border-steel-gray bg-white">
          <div className="text-center">
            <p className="text-[9px] text-slate-text uppercase tracking-wider">Best</p>
            <p className="text-[11px] font-mono font-medium text-success-moss">
              {bestBpb === Infinity ? '--' : bestBpb.toFixed(4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-text uppercase tracking-wider">Kept</p>
            <p className="text-[11px] font-mono font-medium text-deep-plum">{totalKept}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-text uppercase tracking-wider">Disc.</p>
            <p className="text-[11px] font-mono font-medium text-action-orange">{totalDiscarded}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-text uppercase tracking-wider">Crash</p>
            <p className="text-[11px] font-mono font-medium text-error-red">{totalCrashed}</p>
          </div>
        </div>
      )}

      {/* Progress chart */}
      {keptExperiments.length >= 2 && (
        <div className="p-3 border-b border-steel-gray bg-white">
          <BpbChart experiments={experiments} />
        </div>
      )}

      {/* Import form */}
      {showImport && (
        <div className="p-3 border-b border-steel-gray bg-white space-y-2">
          <p className="text-[11px] text-slate-text">Paste your results.tsv content below:</p>
          <textarea
            value={importTsv}
            onChange={e => setImportTsv(e.target.value)}
            placeholder={"commit\tval_bpb\tmemory_gb\tstatus\tdescription\na1b2c3d\t0.9979\t44.0\tkeep\tbaseline"}
            rows={4}
            className="w-full px-3 py-2 text-[10px] font-mono rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30 resize-none"
          />
          {importStatus && <p className="text-[10px] text-success-moss">{importStatus}</p>}
          <button
            onClick={handleImport}
            disabled={!importTsv.trim()}
            className="w-full py-1.5 text-xs font-medium bg-deep-plum text-white rounded-md hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Import Experiments
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-steel-gray bg-white space-y-2">
          <input
            placeholder="Commit hash (7 chars)"
            value={form.commit_hash}
            onChange={e => setForm({ ...form, commit_hash: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30"
          />
          <div className="flex gap-2">
            <input
              placeholder="val_bpb"
              value={form.val_bpb}
              onChange={e => setForm({ ...form, val_bpb: e.target.value })}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30"
            />
            <input
              placeholder="Memory GB"
              value={form.memory_gb}
              onChange={e => setForm({ ...form, memory_gb: e.target.value })}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30"
            />
          </div>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as 'keep' | 'discard' | 'crash' })}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30"
          >
            <option value="keep">Keep</option>
            <option value="discard">Discard</option>
            <option value="crash">Crash</option>
          </select>
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-steel-gray bg-fog-gray focus:outline-none focus:border-deep-plum/30"
          />
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-medium bg-deep-plum text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Log Experiment
          </button>
        </form>
      )}

      {/* Experiment list */}
      <div className="flex-1 overflow-y-auto p-2">
        {experiments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <TrendingDown size={24} className="text-steel-gray mb-2" />
            <p className="text-xs text-slate-text mb-2">No experiments logged yet.</p>
            <p className="text-[10px] text-slate-text leading-relaxed">
              Run training and log results, or import your results.tsv file.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...experiments].reverse().map(exp => (
              <div
                key={exp.id}
                className="bg-white rounded-lg p-3 shadow-[0_0_0_1px_rgba(17,26,74,0.04),0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-[10px] font-mono text-slate-text">{exp.commit_hash || '-------'}</code>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-mono font-medium text-ink-blue">
                    {exp.val_bpb > 0 ? exp.val_bpb.toFixed(6) : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-text font-mono">
                    {exp.memory_gb > 0 ? `${exp.memory_gb.toFixed(1)} GB` : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-text leading-snug">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
