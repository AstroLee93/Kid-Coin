import React, { useState } from 'react';
import { KidProfile } from '../types';
import { encryptData, decryptData } from '../lib/crypto';
import { sendKidNotification } from '../lib/notifications';
import { 
  Server, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  X, 
  Lock, 
  Terminal, 
  Layers, 
  Cpu, 
  ShieldCheck,
  FileCode2
} from 'lucide-react';

interface PiDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  kids: KidProfile[];
  onImportKids: (kids: KidProfile[]) => void;
}

export const PiDeploymentModal: React.FC<PiDeploymentModalProps> = ({
  isOpen,
  onClose,
  kids,
  onImportKids,
}) => {
  const [activeTab, setActiveTab] = useState<'portainer' | 'docker' | 'cpp' | 'backup'>('portainer');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [masterPassphrase, setMasterPassphrase] = useState('SecretKidPiPin2025');
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Export encrypted .enc file
  const handleExportEncryptedVault = async () => {
    try {
      const json = JSON.stringify(kids, null, 2);
      const encrypted = await encryptData(json, masterPassphrase);
      
      const blob = new Blob([encrypted], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kidcoin_vault_encrypted_${new Date().toISOString().split('T')[0]}.enc`;
      a.click();
      URL.revokeObjectURL(url);

      sendKidNotification(
        '🔐 Encrypted Vault Exported!',
        'Saved as AES-256-GCM encrypted database file ready for Raspberry Pi.',
        'security'
      );
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Import encrypted .enc file
  const handleImportEncryptedVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const cipherText = event.target?.result as string;
      try {
        const decryptedJson = await decryptData(cipherText, masterPassphrase);
        const parsed = JSON.parse(decryptedJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportKids(parsed);
          setImportStatus('✅ Vault decrypted & loaded successfully!');
          sendKidNotification(
            '🔓 Vault Restored!',
            'Encrypted database successfully loaded into memory.',
            'security'
          );
        } else {
          setImportStatus('❌ Invalid vault data format.');
        }
      } catch {
        setImportStatus('❌ Decryption failed! Check your master passphrase.');
      }
    };
    reader.readAsText(file);
  };

  const portainerStackYaml = `version: '3.8'

# KidCoin Vault - Portainer Stack for Raspberry Pi (Offline Encrypted Finance)
services:
  # 1. C++ Backend with SQLCipher (SQLite AES-256)
  kidcoin-cpp-backend:
    image: ghcr.io/your-user/kidcoin-cpp-backend:arm64
    container_name: kidcoin-cpp-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - DB_KEY=\${KIDCOIN_ENCRYPTION_KEY:-SuperSecurePin2025}
      - DB_PATH=/data/kids_vault.encrypted.db
      - BIND_HOST=0.0.0.0
      - PORT=8080
    volumes:
      - kidcoin-encrypted-data:/data
    networks:
      - kidcoin-lan

  # 2. KidCoin Web UI (Clean, low-latency interface)
  kidcoin-web-ui:
    image: ghcr.io/your-user/kidcoin-web-ui:latest
    container_name: kidcoin-web-ui
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_BACKEND_URL=http://kidcoin-cpp-backend:8080
      - VITE_CHOREQUEST_URL=http://chore-quest:5000
    depends_on:
      - kidcoin-cpp-backend
    networks:
      - kidcoin-lan

  # 3. AstroLee93/Chore-Quest (Pi Chore Tracker Integration)
  chore-quest:
    image: astrolee93/chore-quest:latest
    container_name: chore-quest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    networks:
      - kidcoin-lan

volumes:
  kidcoin-encrypted-data:
    driver: local

networks:
  kidcoin-lan:
    driver: bridge`;

  const cppSourceCode = `// KidCoin C++ Backend with SQLite3 SQLCipher (AES-256 Encrypted)
// Compiles natively on Raspberry Pi OS (Debian 12 Bookworm arm64)
#include <crow.h>
#include <sqlite3.h>
#include <iostream>
#include <string>

int main() {
    crow::SimpleApp app;
    sqlite3* db = nullptr;

    const char* dbPath = std::getenv("DB_PATH") ? std::getenv("DB_PATH") : "/data/kids_vault.encrypted.db";
    const char* dbKey = std::getenv("DB_KEY") ? std::getenv("DB_KEY") : "SuperSecurePin2025";

    // 1. Open SQLite Database
    if (sqlite3_open(dbPath, &db) == SQLITE_OK) {
        // 2. Apply SQLCipher 256-bit AES encryption key
        sqlite3_key(db, dbKey, static_cast<int>(strlen(dbKey)));
        std::cout << "[KidCoin C++] Encrypted database mounted at: " << dbPath << std::endl;

        // 3. Initialize schema for multi-kid profiles
        const char* createTablesSQL = 
            "CREATE TABLE IF NOT EXISTS kids ("
            "  id TEXT PRIMARY KEY,"
            "  name TEXT NOT NULL,"
            "  age INTEGER,"
            "  avatar_id TEXT,"
            "  total_saved REAL DEFAULT 0.0"
            ");"
            "CREATE TABLE IF NOT EXISTS goals ("
            "  id TEXT PRIMARY KEY,"
            "  kid_id TEXT,"
            "  title TEXT,"
            "  target_cost REAL,"
            "  current_saved REAL,"
            "  is_verified INTEGER"
            ");";

        char* errMsg = nullptr;
        sqlite3_exec(db, createTablesSQL, nullptr, nullptr, &errMsg);
    }

    // Health Endpoint
    CROW_ROUTE(app, "/api/health")([](){
        crow::json::wvalue res;
        res["status"] = "ok";
        res["engine"] = "C++ Crow v1.1";
        res["encryption"] = "SQLCipher-AES256";
        res["hardware"] = "Raspberry Pi (Local Host)";
        return res;
    });

    // Run low-latency async HTTP server on port 8080
    app.port(8080).multithreaded().run();

    if (db) sqlite3_close(db);
    return 0;
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Raspberry Pi & Portainer Deployment Guide
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Offline Stack
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Self-hosted C++ backend with AES-256 SQLCipher encrypted database
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('portainer')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'portainer'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Portainer Stack</span>
          </button>
          <button
            onClick={() => setActiveTab('cpp')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cpp'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>C++ & SQLCipher</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Vault Backup</span>
          </button>
        </div>

        {/* Tab 1: Portainer Stack */}
        {activeTab === 'portainer' && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-200">
              <strong>Quick Deploy in Portainer:</strong>
              <ol className="list-decimal list-inside mt-1.5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Log in to Portainer on your Raspberry Pi (e.g. <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">http://raspberrypi.local:9000</code>).</li>
                <li>Go to <strong>Stacks</strong> → <strong>Add Stack</strong>. Name it <code className="font-bold">kidcoin-vault</code>.</li>
                <li>Paste the Compose YAML below into the Web editor.</li>
                <li>Click <strong>Deploy the stack</strong>. Access your kid finance app at <code className="font-bold">http://raspberrypi.local:3000</code> on your home Wi-Fi!</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                {portainerStackYaml}
              </pre>
              <button
                onClick={() => copyToClipboard(portainerStackYaml, 'portainer')}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'portainer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'portainer' ? 'Copied!' : 'Copy YAML'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: C++ & SQLCipher */}
        {activeTab === 'cpp' && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
              <strong>Native C++ High Performance & Security:</strong>
              <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                Uses <strong>SQLCipher</strong> (256-bit AES database encryption) so all personal finance records, chores, and balances on the Raspberry Pi microSD card remain 100% encrypted at rest.
              </p>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                {cppSourceCode}
              </pre>
              <button
                onClick={() => copyToClipboard(cppSourceCode, 'cpp')}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cpp' ? 'Copied!' : 'Copy C++ Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Encrypted Backup */}
        {activeTab === 'backup' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Master Vault Passphrase (AES-256)
                </label>
                <input
                  type="text"
                  value={masterPassphrase}
                  onChange={(e) => setMasterPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Used to derive the PBKDF2 256-bit encryption key when transferring data to your Raspberry Pi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleExportEncryptedVault}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Encrypted Vault (.enc)</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restore from .enc Backup</span>
                  <input
                    type="file"
                    accept=".enc"
                    onChange={handleImportEncryptedVault}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="text-xs font-bold pt-2 text-slate-800 dark:text-slate-200">
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
