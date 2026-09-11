import React, { useState } from 'react';
import { KidProfile, Chore, ParentAdminConfig, ChoreQuestFamilyDatabase } from '../types';
import { 
  getChoreQuestConfig, 
  saveChoreQuestConfig, 
  fetchFromChoreQuest, 
  pushToChoreQuest,
  parseChoreQuestPayload,
  mergeChoreQuestDatabaseIntoVault,
  exportVaultToChoreQuestDatabase,
  applyChoreQuestMonthlyInterest,
  SAMPLE_CHOREQUEST_FAMILY_DB,
  PORTAINER_DOCKER_COMPOSE_SNIPPET 
} from '../lib/choreQuestSync';
import { playCoinSound, playMilestoneFanfare } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
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
  Upload,
  Download,
  Percent,
  Rocket,
  ShieldCheck,
  Users
} from 'lucide-react';

interface ChoreQuestSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile;
  onUpdateKid: (updated: KidProfile) => void;
  allKids?: KidProfile[];
  onUpdateKids?: (kids: KidProfile[]) => void;
  parentAdmin?: ParentAdminConfig;
  onUpdateParentAdmin?: (config: ParentAdminConfig) => void;
}

export const ChoreQuestSyncModal: React.FC<ChoreQuestSyncModalProps> = ({
  isOpen,
  onClose,
  kid,
  onUpdateKid,
  allKids = [],
  onUpdateKids,
  parentAdmin,
  onUpdateParentAdmin,
}) => {
  const [config, setConfig] = useState(() => {
    const saved = getChoreQuestConfig();
    return {
      ...saved,
      endpoint: parentAdmin?.choreQuestEndpoint || saved.endpoint,
      pointRatio: parentAdmin?.kidCoinRatio ?? saved.pointRatio ?? 0.10,
    };
  });

  const [activeTab, setActiveTab] = useState<'live' | 'familyDb' | 'settings' | 'docker' | 'sample'>('live');
  
  // Live pull/push state
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Manual JSON import/export state
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [jsonExportCopied, setJsonExportCopied] = useState(false);

  // Monthly interest booster state
  const [interestReport, setInterestReport] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentKids = allKids.length > 0 ? allKids : [kid];

  const handleSaveEndpoint = (newEndpoint: string) => {
    const updated = { ...config, endpoint: newEndpoint };
    setConfig(updated);
    saveChoreQuestConfig(updated);
    if (parentAdmin && onUpdateParentAdmin) {
      onUpdateParentAdmin({ ...parentAdmin, choreQuestEndpoint: newEndpoint });
    }
  };

  const handleSaveRatio = (ratio: number) => {
    const updated = { ...config, pointRatio: ratio };
    setConfig(updated);
    saveChoreQuestConfig(updated);
    if (parentAdmin && onUpdateParentAdmin) {
      onUpdateParentAdmin({ ...parentAdmin, kidCoinRatio: ratio });
    }
  };

  const handleToggleAutoDeposit = (enabled: boolean) => {
    if (parentAdmin && onUpdateParentAdmin) {
      onUpdateParentAdmin({ ...parentAdmin, autoDepositChoresToGoal: enabled });
    }
  };

  const handleSaveInterestRate = (rate: number) => {
    if (parentAdmin && onUpdateParentAdmin) {
      onUpdateParentAdmin({ ...parentAdmin, bankInterestRateMonthlyPercent: rate });
    }
  };

  // 1. Live Fetch from Chore-Quest container (Pull)
  const handleLivePull = async (syncAllKids: boolean) => {
    setIsPulling(true);
    setStatusMsg({ type: 'info', text: `Contacting Chore-Quest at ${config.endpoint}...` });

    try {
      const res = await fetchFromChoreQuest(config.endpoint, kid.id, config.pointRatio);
      if (res.success) {
        if (res.familyDb && syncAllKids && onUpdateKids && parentAdmin && onUpdateParentAdmin) {
          const merged = mergeChoreQuestDatabaseIntoVault(res.familyDb, currentKids, parentAdmin);
          onUpdateKids(merged.updatedKids);
          onUpdateParentAdmin(merged.updatedConfig);

          playMilestoneFanfare();
          setStatusMsg({
            type: 'success',
            text: `Synced entire Family Database! Updated ${merged.importedKidCount} kids and ${merged.importedChoreCount} chore quests with ${config.endpoint}.`,
          });
        } else if (res.chores.length > 0) {
          // Sync just for this kid
          const existingIds = new Set(res.chores.map((c) => c.id));
          const filteredExisting = kid.chores.filter((c) => !existingIds.has(c.id));
          const finalChores = [...res.chores, ...filteredExisting];

          onUpdateKid({ ...kid, chores: finalChores });

          playCoinSound();
          setStatusMsg({
            type: 'success',
            text: `Imported ${res.chores.length} chore quests directly into ${kid.name}'s bounty board!`,
          });
        }
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Connection failed: ${err.message || 'Unknown network error'}. Ensure the Chore-Quest container is running, or paste/import your Chore-Quest JSON!`,
      });
    } finally {
      setIsPulling(false);
    }
  };

  // 2. Push Family Database back to Chore-Quest container
  const handleLivePush = async () => {
    if (!parentAdmin) {
      setStatusMsg({ type: 'error', text: 'Parent admin configuration required to push database.' });
      return;
    }

    setIsPushing(true);
    setStatusMsg({ type: 'info', text: `Pushing updated family database to ${config.endpoint}...` });

    try {
      const exportDb = exportVaultToChoreQuestDatabase(currentKids, parentAdmin);
      const res = await pushToChoreQuest(config.endpoint, exportDb);

      if (res.success) {
        playMilestoneFanfare();
        setStatusMsg({
          type: 'success',
          text: `Success: Pushed ${exportDb.kids.length} kids and ${exportDb.chores.length} chore quests to Chore-Quest container!`,
        });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Push failed: ${err.message || 'Network error'}` });
    } finally {
      setIsPushing(false);
    }
  };

  // 3. Load Sample Demo Database
  const handleLoadSampleDatabase = () => {
    if (onUpdateKids && parentAdmin && onUpdateParentAdmin) {
      const merged = mergeChoreQuestDatabaseIntoVault(SAMPLE_CHOREQUEST_FAMILY_DB, currentKids, parentAdmin);
      onUpdateKids(merged.updatedKids);
      onUpdateParentAdmin(merged.updatedConfig);

      playMilestoneFanfare();
      setStatusMsg({
        type: 'success',
        text: `Loaded authentic AstroLee93/Chore-Quest Family Demo Database (Leo, Maya, Sam, chores & settings)!`,
      });
    } else {
      const parsed = parseChoreQuestPayload(SAMPLE_CHOREQUEST_FAMILY_DB, kid.id, config.pointRatio);
      onUpdateKid({ ...kid, chores: parsed.chores });
      playCoinSound();
      setStatusMsg({
        type: 'success',
        text: `Loaded sample chore quests for ${kid.name}!`,
      });
    }
  };

  // 4. JSON Import
  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste Chore-Quest JSON content.' });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.kids && parsed.chores && onUpdateKids && parentAdmin && onUpdateParentAdmin) {
        const merged = mergeChoreQuestDatabaseIntoVault(parsed, currentKids, parentAdmin);
        onUpdateKids(merged.updatedKids);
        onUpdateParentAdmin(merged.updatedConfig);
        setJsonInput('');
        playMilestoneFanfare();
        setStatusMsg({
          type: 'success',
          text: `Family database restored! Loaded ${merged.importedKidCount} kids and ${merged.importedChoreCount} chore quests.`,
        });
      } else {
        const result = parseChoreQuestPayload(parsed, kid.id, config.pointRatio);
        if (result.chores.length > 0) {
          const existingIds = new Set(result.chores.map((c) => c.id));
          const filtered = kid.chores.filter((c) => !existingIds.has(c.id));
          onUpdateKid({ ...kid, chores: [...result.chores, ...filtered] });
          setJsonInput('');
          playCoinSound();
          setStatusMsg({
            type: 'success',
            text: `Imported ${result.chores.length} chore quests from JSON!`,
          });
        } else {
          setStatusMsg({ type: 'error', text: 'Could not find valid chores or family records in the pasted JSON.' });
        }
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Invalid JSON format. Please verify the copied text.' });
    }
  };

  // 5. JSON Export
  const handleExportJson = () => {
    if (!parentAdmin) return;
    const exportDb = exportVaultToChoreQuestDatabase(currentKids, parentAdmin);
    const jsonStr = JSON.stringify(exportDb, null, 2);
    
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chorequest_family_db_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    sendKidNotification(
      'Chore-Quest Database Exported! 📦',
      'Full JSON database ready to import into AstroLee93/Chore-Quest.',
      'chore'
    );
  };

  const handleCopyJsonExport = () => {
    if (!parentAdmin) return;
    const exportDb = exportVaultToChoreQuestDatabase(currentKids, parentAdmin);
    navigator.clipboard.writeText(JSON.stringify(exportDb, null, 2));
    setJsonExportCopied(true);
    setTimeout(() => setJsonExportCopied(false), 2000);
  };

  // 6. Run Chore-Quest Bank of Mom & Dad Compound Interest Booster
  const handleRunMonthlyInterest = () => {
    if (!parentAdmin || !onUpdateParentAdmin || !onUpdateKids) return;

    const result = applyChoreQuestMonthlyInterest(currentKids, parentAdmin);
    onUpdateKids(result.updatedKids);
    onUpdateParentAdmin(result.updatedConfig);

    setInterestReport(result.message);
    if (result.totalInterestPaid > 0) {
      playMilestoneFanfare();
      sendKidNotification(
        '📈 Bank of Mom & Dad Interest Paid!',
        result.message,
        'milestone'
      );
    }
  };

  const handleCopyCompose = () => {
    navigator.clipboard.writeText(PORTAINER_DOCKER_COMPOSE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Chore-Quest Integration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Sync with <code className="font-mono text-indigo-600 dark:text-indigo-400">AstroLee93/Chore-Quest</code> on your Raspberry Pi or home network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Live Container Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('familyDb')}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'familyDb'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family Database (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Points, Rates & Booster</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'docker'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Portainer Compose</span>
          </button>

          <button
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sample'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Family</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm">
          
          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RotateCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">{statusMsg.text}</div>
            </div>
          )}

          {/* TAB 1: LIVE CONTAINER SYNC */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chore-Quest Host / Container Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={config.endpoint}
                    onChange={(e) => handleSaveEndpoint(e.target.value)}
                    placeholder="http://localhost:5000 or http://raspberrypi.local:5000"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveEndpoint(config.endpoint)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">
                  KidCoin Vault uses an internal backend proxy route to contact your Chore-Quest container directly, eliminating browser CORS issues on your local Pi network.
                </p>
              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📥</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200">
                        Pull from Chore-Quest
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Imports chores & stars into KidCoin
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => handleLivePull(false)}
                      disabled={isPulling}
                      className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPulling ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                      <span>Pull Chores for {kid.name}</span>
                    </button>
                    {allKids.length > 1 && (
                      <button
                        onClick={() => handleLivePull(true)}
                        disabled={isPulling}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Sync All {allKids.length} Kids</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📤</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                        Push to Chore-Quest
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Sends updated balances & goals
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={handleLivePush}
                      disabled={isPushing}
                      className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPushing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Push Family Database</span>
                    </button>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 text-center">
                      Updates <code className="font-mono">/api/database</code> in Chore-Quest
                    </p>
                  </div>
                </div>
              </div>

              {/* Endpoint connection test badge */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Target: {config.endpoint}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  Ratio: 10 ⭐ = ${(10 * config.pointRatio).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: FAMILY DATABASE (JSON IMPORT/EXPORT) */}
          {activeTab === 'familyDb' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Export Family Database (Chore-Quest Schema)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyJsonExport}
                      className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {jsonExportCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{jsonExportCopied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .json</span>
                    </button>
                  </div>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Exports your kid profiles, savings goals, star balances, chore quests, and compound interest settings into the standard <code className="font-mono">FamilyDatabase</code> format used by AstroLee93/Chore-Quest.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Import Chore-Quest JSON (Manual Sync)
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`Paste full Chore-Quest JSON here, e.g.:\n{\n  "settings": { "kidCoinRatio": 0.10 },\n  "kids": [ ... ],\n  "chores": [ ... ]\n}`}
                  rows={6}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleImportJson}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Parse & Merge Family Database</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS, POINT RATIO & COMPOUND INTEREST BOOSTER */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* 1. Point to Cash Ratio */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>Point-to-Cash Exchange Ratio (kidCoinRatio)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      How much real cash each Chore-Quest star/point is worth
                    </p>
                  </div>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    ${config.pointRatio.toFixed(2)} / star
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.01"
                    max="1.00"
                    step="0.01"
                    value={config.pointRatio}
                    onChange={(e) => handleSaveRatio(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Ratio Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '10:1 (10★ = $1)', ratio: 0.10 },
                    { label: '5:1 (5★ = $1)', ratio: 0.20 },
                    { label: '2:1 (2★ = $1)', ratio: 0.50 },
                    { label: '1:1 (1★ = $1)', ratio: 1.00 },
                  ].map((p) => (
                    <button
                      key={p.ratio}
                      type="button"
                      onClick={() => handleSaveRatio(p.ratio)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Math.abs(config.pointRatio - p.ratio) < 0.001
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Bank of Mom & Dad Compound Interest */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      <span>Bank of Mom & Dad Compound Interest</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Matches AstroLee93/Chore-Quest <code className="font-mono">applyMonthlyInterest</code> algorithm
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {parentAdmin?.bankInterestRateMonthlyPercent ?? 5}% monthly
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={parentAdmin?.bankInterestRateMonthlyPercent ?? 5}
                    onChange={(e) => handleSaveInterestRate(parseInt(e.target.value, 10))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Last interest month: <strong>{parentAdmin?.lastInterestCalculatedMonth || 'Not run yet'}</strong>
                  </span>
                  <button
                    onClick={handleRunMonthlyInterest}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>📈</span>
                    <span>Run Monthly Interest Now</span>
                  </button>
                </div>

                {interestReport && (
                  <div className="p-2.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                    {interestReport}
                  </div>
                )}
              </div>

              {/* 3. Auto-Deposit Chores to Goal Rocket */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-sky-500" />
                    <span>Auto-Deposit Chores to Primary Goal</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    When completed, chore reward cash goes straight into the target savings countdown
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAutoDeposit(!(parentAdmin?.autoDepositChoresToGoal ?? true))}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    (parentAdmin?.autoDepositChoresToGoal ?? true) ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      (parentAdmin?.autoDepositChoresToGoal ?? true) ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PORTAINER DOCKER COMPOSE */}
          {activeTab === 'docker' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white">
                    Combined Raspberry Pi Portainer Stack
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Deploy both Chore-Quest (port 5000) and KidCoin Vault (port 3000) on your home network
                  </p>
                </div>
                <button
                  onClick={handleCopyCompose}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Compose YAML'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                {PORTAINER_DOCKER_COMPOSE_SNIPPET}
              </pre>
            </div>
          )}

          {/* TAB 5: DEMO FAMILY (Leo, Maya, Sam) */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                <h4 className="font-black text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <span>🏰</span>
                  <span>AstroLee93/Chore-Quest Authentic Demo Database</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Loads the official Chore-Quest starter family: <strong>Leo (🦁)</strong>, <strong>Maya (🦄)</strong>, and <strong>Sam (🚀)</strong> with active chores (Mow Lawn, Dishes, Math Quest, Vacuuming), categories, stars, and verified savings targets!
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleLoadSampleDatabase}
                    className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Load Demo Family Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-xs">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Chore-Quest Sync Protocol v1</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
