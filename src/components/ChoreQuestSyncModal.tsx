import React, { useState } from 'react';
import { KidProfile, Chore } from '../types';
import { 
  getChoreQuestConfig, 
  saveChoreQuestConfig, 
  fetchFromChoreQuest, 
  parseChoreQuestPayload,
  SAMPLE_CHOREQUEST_DATA,
  PORTAINER_DOCKER_COMPOSE_SNIPPET 
} from '../lib/choreQuestSync';
import { playCoinSound, playMilestoneFanfare } from '../lib/sound';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Server, 
  FileText, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Coins,
  Upload
} from 'lucide-react';

interface ChoreQuestSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile;
  onUpdateKid: (updated: KidProfile) => void;
}

export const ChoreQuestSyncModal: React.FC<ChoreQuestSyncModalProps> = ({
  isOpen,
  onClose,
  kid,
  onUpdateKid,
}) => {
  const [config, setConfig] = useState(() => getChoreQuestConfig());
  const [activeTab, setActiveTab] = useState<'live' | 'json' | 'docker' | 'sample'>('live');
  
  // Live pull state
  const [isPulling, setIsPulling] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Manual JSON import state
  const [jsonInput, setJsonInput] = useState('');
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveEndpoint = (newEndpoint: string) => {
    const updated = { ...config, endpoint: newEndpoint };
    setConfig(updated);
    saveChoreQuestConfig(updated);
  };

  const handleSaveRatio = (ratio: number) => {
    const updated = { ...config, pointRatio: ratio };
    setConfig(updated);
    saveChoreQuestConfig(updated);
  };

  const applyImportedChores = (newChores: Chore[], sourceLabel: string) => {
    let finalChores: Chore[];
    if (mergeMode === 'replace') {
      finalChores = newChores;
    } else {
      // Avoid duplicate IDs
      const existingIds = new Set(newChores.map((c) => c.id));
      const filteredExisting = kid.chores.filter((c) => !existingIds.has(c.id));
      finalChores = [...newChores, ...filteredExisting];
    }

    onUpdateKid({
      ...kid,
      chores: finalChores,
    });

    const updatedConfig = { ...config, lastSyncedAt: new Date().toLocaleTimeString() };
    setConfig(updatedConfig);
    saveChoreQuestConfig(updatedConfig);

    playMilestoneFanfare();
    setStatusMsg({
      type: 'success',
      text: `Successfully imported ${newChores.length} quests from ${sourceLabel}!`,
    });
  };

  // 1. Live Fetch from Raspberry Pi
  const handleLivePull = async () => {
    setIsPulling(true);
    setStatusMsg({ type: 'info', text: `Connecting to ${config.endpoint}...` });

    try {
      const res = await fetchFromChoreQuest(config.endpoint, kid.id, config.pointRatio);
      if (res.success && res.chores.length > 0) {
        applyImportedChores(res.chores, 'Chore-Quest live container');
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Fetch failed: ${err.message || 'Unknown network error'}. Check that your container is running on the Pi and CORS is enabled, or use the JSON import tab!`,
      });
    } finally {
      setIsPulling(false);
    }
  };

  // 2. Sample Data Quick Load
  const handleLoadSample = () => {
    const parsed = parseChoreQuestPayload(SAMPLE_CHOREQUEST_DATA, kid.id, config.pointRatio);
    if (parsed.chores.length > 0) {
      applyImportedChores(parsed.chores, 'AstroLee93/Chore-Quest Portainer Stack Demo');
    }
  };

  // 3. Manual JSON Import
  const handleJsonSubmit = () => {
    if (!jsonInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste JSON data or chore list from Chore-Quest.' });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const result = parseChoreQuestPayload(parsed, kid.id, config.pointRatio);
      if (result.chores.length > 0) {
        applyImportedChores(result.chores, 'Chore-Quest JSON');
        setJsonInput('');
      } else {
        setStatusMsg({
          type: 'error',
          text: 'Found JSON, but could not identify any chore tasks inside it.',
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: 'Invalid JSON format. Please verify the copied text.',
      });
    }
  };

  const handleCopyCompose = () => {
    navigator.clipboard.writeText(PORTAINER_DOCKER_COMPOSE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Chore-Quest Integration
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Portainer • Pi
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Sync quests from your active <strong>AstroLee93/Chore-Quest</strong> container into KidCoin savings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exchange Rate & Settings Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Points-to-Cash Exchange Rate:</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1 Chore-Quest Point = <strong>${config.pointRatio.toFixed(2)}</strong> (e.g. 50 pts = ${(50 * config.pointRatio).toFixed(2)})
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: '10 pts = $1.00', value: 0.10 },
                { label: '5 pts = $1.00', value: 0.20 },
                { label: '2 pts = $1.00', value: 0.50 },
                { label: '1 pt = $1.00', value: 1.00 },
              ].map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => handleSaveRatio(rate.value)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    config.pointRatio === rate.value
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'live'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Live Pi Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('sample')}
            className={`pb-2 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sample'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>1-Click Demo Stack</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste / Upload JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`pb-2 px-3 text-xs font-black border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'docker'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Portainer Compose YAML</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : statusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <RotateCw className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-spin" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: LIVE HTTP PULL */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Chore-Quest Pi Endpoint (URL or IP:Port):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => handleSaveEndpoint(e.target.value)}
                    placeholder="http://localhost:5000 or http://raspberrypi.local:5000"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleLivePull}
                    disabled={isPulling}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                    <span>{isPulling ? 'Connecting...' : 'Pull Chores'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Point this to your Raspberry Pi's IP on your home network (e.g. <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://192.168.1.150:5000</code> or <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://raspberrypi.local:5000</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
                <h4 className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-600" />
                  <span>How it connects to your Portainer stack:</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>KidCoin queries the Chore-Quest REST endpoints (<code className="font-mono">/api/chores</code> or <code className="font-mono">/chores</code>) for active family chores.</li>
                  <li>Each chore's quest point value is converted directly into cash savings based on your exchange rate.</li>
                  <li>When chores are completed in KidCoin, the cash is deposited toward your kid's verified countdown target (e.g. PS5, Switch, bike)!</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Import Mode:</span>
                  <button
                    onClick={() => setMergeMode(mergeMode === 'merge' ? 'replace' : 'merge')}
                    className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {mergeMode === 'merge' ? '➕ Merge with existing' : '⚠️ Replace all existing'}
                  </button>
                </div>

                <button
                  onClick={handleLoadSample}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test with Demo Quests</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DEMO STACK */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                <span className="text-3xl">⚔️</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Ready-to-Test Chore-Quest Stack
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Click below to instantly import 5 authentic quests from the AstroLee93/Chore-Quest schema into this profile:
                </p>
              </div>

              <div className="space-y-2">
                {SAMPLE_CHOREQUEST_DATA.map((sample) => (
                  <div 
                    key={sample.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {sample.category === 'cleaning' ? '🧹' : sample.category === 'pets' ? '🐾' : sample.category === 'school' ? '📚' : '🌿'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{sample.task}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                        {sample.points} pts
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        +${(sample.points * config.pointRatio).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLoadSample}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Import Demo Chore-Quest Quests Now</span>
              </button>
            </div>
          )}

          {/* TAB 3: JSON UPLOAD OR PASTE */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                Paste Chore-Quest JSON payload or state:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`[\n  { "id": 1, "task": "Mow front yard", "points": 50, "category": "yard" },\n  { "id": 2, "task": "Do math flashcards", "points": 25, "category": "school" }\n]`}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setJsonInput(JSON.stringify(SAMPLE_CHOREQUEST_DATA, null, 2))}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 underline"
                >
                  Insert sample JSON snippet
                </button>

                <button
                  onClick={handleJsonSubmit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Parse & Import Quests</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DOCKER COMPOSE GUIDE */}
          {activeTab === 'docker' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Add both services to the same <strong>Portainer Stack</strong> on your Raspberry Pi:
                </p>
                <button
                  onClick={handleCopyCompose}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy YAML'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-56">
                <pre>{PORTAINER_DOCKER_COMPOSE_SNIPPET}</pre>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                💡 <strong>Tip:</strong> By running on the shared bridge network <code className="font-mono font-bold">pi-stack-net</code>, KidCoin can contact Chore-Quest directly without exposing ports outside your Pi!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            {config.lastSyncedAt ? (
              <span>Last synced: {config.lastSyncedAt}</span>
            ) : (
              <span>Stack: AstroLee93/Chore-Quest</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
