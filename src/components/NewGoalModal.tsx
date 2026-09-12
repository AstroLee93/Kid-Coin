import React, { useState, useEffect } from 'react';
import { SavingsGoal, KidProfile } from '../types';
import { POPULAR_RETAIL_DATABASE, RetailProduct } from '../lib/retailCatalog';
import {
  ShieldCheck,
  Sparkles,
  X,
  Gamepad2,
  Tv,
  Boxes,
  Headphones,
  Bike,
  Tablet,
  Coins,
  Laptop,
  Search,
  Barcode,
  Store,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ArrowRight,
  Info,
  Camera,
  Layers,
  ShoppingBag,
  Trash2,
  Target
} from 'lucide-react';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goal: SavingsGoal) => void;
  kid?: KidProfile;
  onDeleteGoal?: (goalId: string) => void;
}

const RETAILER_PRESETS = [
  { id: 'all', label: 'All Stores', icon: '🏪', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'amazon', label: 'Amazon (ASIN)', icon: '📦', color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'bestbuy', label: 'Best Buy (SKU)', icon: '🏷️', color: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'target', label: 'Target (DPCI)', icon: '🎯', color: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300' },
  { id: 'walmart', label: 'Walmart (Item#)', icon: '🏬', color: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300' },
  { id: 'microcenter', label: 'Micro Center (SKU)', icon: '💻', color: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'apple', label: 'Apple', icon: '🍎', color: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' },
];

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  onClose,
  onSelectGoal,
  kid,
  onDeleteGoal,
}) => {
  // Navigation tabs: 'ai-retail' | 'catalog' | 'custom' | 'manage'
  const [activeTab, setActiveTab] = useState<'ai-retail' | 'catalog' | 'custom' | 'manage'>('ai-retail');

  // AI Retail Lookup state
  const [selectedRetailer, setSelectedRetailer] = useState('all');
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'gemini-ai' | 'local-database' | null>(null);

  // Barcode Scanner Simulator State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerBeep, setScannerBeep] = useState(false);

  // Custom goal fields
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customCategory, setCustomCategory] = useState('Gaming');

  // Deletion tracking in manage tab
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Accumulated funds ready to reallocate to any new goal
  const accumulatedFunds = kid
    ? (kid.totalSaved > 0 
        ? kid.totalSaved 
        : (kid.goals.find(g => g.priority === 'primary')?.currentSaved || kid.goals[0]?.currentSaved || 0))
    : 0;

  useEffect(() => {
    if (!isOpen) {
      setSearchResult(null);
      setSearchError(null);
      setLookupQuery('');
      setShowScannerModal(false);
      setDeletingGoalId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Perform AI & Retail Database Lookup
  const handlePerformLookup = async (queryText?: string, retailerFilter?: string) => {
    const q = (queryText !== undefined ? queryText : lookupQuery).trim();
    const r = retailerFilter !== undefined ? retailerFilter : selectedRetailer;

    if (!q) {
      setSearchError('Please enter a SKU, Barcode, Item#, or product name.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const resp = await fetch('/api/retail-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, retailer: r }),
      });

      const data = await resp.json();

      if (resp.ok && data.success && data.product) {
        setSearchResult(data.product);
        setSearchSource(data.source || 'gemini-ai');
      } else {
        setSearchError(data.message || `No product found matching "${q}". Try checking the code digits.`);
      }
    } catch (err: any) {
      setSearchError(`Lookup service connection error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Import product directly as Goal
  const handleImportProductAsGoal = (product: any) => {
    const rawCost = typeof product.targetCost === 'number' ? product.targetCost : parseFloat(product.targetCost || product.currentCost || 0);
    const cost = Number((isNaN(rawCost) ? 0 : rawCost).toFixed(2));
    const reallocated = Math.min(cost, accumulatedFunds);
    const percent = cost > 0 ? (reallocated / cost) * 100 : 0;
    
    const newGoal: SavingsGoal = {
      id: `goal-${product.sku || product.id || Date.now()}`,
      title: product.name || product.title,
      category: product.category || 'Electronics',
      targetCost: cost,
      isVerified: true,
      verifiedSource: `${product.retailer || 'Retail Store'} (SKU: ${product.sku || product.itemNumber || 'Verified'})`,
      currentSaved: reallocated,
      priority: 'primary',
      icon: product.icon || 'Gamepad2',
      createdAt: new Date().toISOString().split('T')[0],
      retailer: product.retailer,
      sku: product.sku,
      barcode: product.barcode,
      itemNumber: product.itemNumber,
      modelNumber: product.modelNumber,
      specs: product.specs,
      description: product.description,
      whyKidsLoveIt: product.whyKidsLoveIt,
      productUrl: product.productUrl,
      milestones: [
        { percent: 25, label: `Bronze 25% ($${(cost * 0.25).toFixed(2)})`, rewardXP: 100, reached: percent >= 25, reachedAt: percent >= 25 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 50, label: `Silver 50% ($${(cost * 0.5).toFixed(2)})`, rewardXP: 250, reached: percent >= 50, reachedAt: percent >= 50 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 75, label: `Gold 75% ($${(cost * 0.75).toFixed(2)})`, rewardXP: 350, reached: percent >= 75, reachedAt: percent >= 75 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 100, label: `Platinum 100% ($${cost.toFixed(2)})`, rewardXP: 500, reached: percent >= 100, reachedAt: percent >= 100 ? new Date().toISOString().split('T')[0] : undefined },
      ],
    };

    onSelectGoal(newGoal);
    onClose();
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customCost);
    if (!customTitle.trim() || isNaN(cost) || cost <= 0) return;

    const reallocated = Math.min(cost, accumulatedFunds);
    const percent = cost > 0 ? (reallocated / cost) * 100 : 0;

    const newGoal: SavingsGoal = {
      id: `goal-custom-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      targetCost: Number(cost.toFixed(2)),
      isVerified: false,
      currentSaved: reallocated,
      priority: 'primary',
      icon: 'Gamepad2',
      createdAt: new Date().toISOString().split('T')[0],
      milestones: [
        { percent: 25, label: `Bronze 25% ($${(cost * 0.25).toFixed(2)})`, rewardXP: 100, reached: percent >= 25, reachedAt: percent >= 25 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 50, label: `Silver 50% ($${(cost * 0.5).toFixed(2)})`, rewardXP: 250, reached: percent >= 50, reachedAt: percent >= 50 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 75, label: `Gold 75% ($${(cost * 0.75).toFixed(2)})`, rewardXP: 350, reached: percent >= 75, reachedAt: percent >= 75 ? new Date().toISOString().split('T')[0] : undefined },
        { percent: 100, label: `Platinum 100% ($${cost.toFixed(2)})`, rewardXP: 500, reached: percent >= 100, reachedAt: percent >= 100 ? new Date().toISOString().split('T')[0] : undefined },
      ],
    };

    onSelectGoal(newGoal);
    onClose();
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-red-500" />;
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-yellow-500" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5 text-slate-500" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-emerald-500" />;
      case 'Tablet':
        return <Tablet className="w-5 h-5 text-sky-500" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getRetailerBadge = (retailer: string) => {
    const r = (retailer || '').toLowerCase();
    if (r.includes('amazon')) {
      return { bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700', label: 'Amazon' };
    }
    if (r.includes('best buy')) {
      return { bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700', label: 'Best Buy' };
    }
    if (r.includes('target')) {
      return { bg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700', label: 'Target' };
    }
    if (r.includes('walmart')) {
      return { bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700', label: 'Walmart' };
    }
    if (r.includes('micro center')) {
      return { bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700', label: 'Micro Center' };
    }
    if (r.includes('apple')) {
      return { bg: 'bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700', label: 'Apple' };
    }
    return { bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700', label: retailer || 'Store' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span>Goal Selection & AI Retail Importer</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Import wishlist goals via SKUs, Barcodes, or Item#s from Amazon, Best Buy, Target, Walmart, Micro Center & more!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accumulated Funds Protection & Reallocation Banner */}
        {accumulatedFunds > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0 text-base">
                💰
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>${accumulatedFunds.toFixed(2)} Accumulated Funds Ready</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Auto-Reallocation
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Creating or picking any goal will immediately transfer all ${accumulatedFunds.toFixed(2)} to fuel the new goal countdown!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 mt-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ai-retail')}
            className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeTab === 'ai-retail'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>AI Retail SKU / UPC</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>✏️ Custom</span>
          </button>
          {kid && kid.goals && kid.goals.length > 0 && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
                activeTab === 'manage'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Goals ({kid.goals.length})</span>
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          
          {/* TAB 1: AI RETAIL SKU, BARCODE & ITEM# IMPORTER */}
          {activeTab === 'ai-retail' && (
            <div className="space-y-4">
              
              {/* Retailer Filter Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Filter by Store (Amazon, Best Buy, Target, Walmart, Micro Center):
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {RETAILER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedRetailer(preset.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
                        selectedRetailer === preset.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Lookup Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformLookup();
                }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Paste SKU, Barcode / UPC (12 digits), or Item# (e.g. 6522854, 711719570530, B0CL5KNB9M)..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    {lookupQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setLookupQuery('');
                          setSearchResult(null);
                          setSearchError(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Scan Barcode Button */}
                  <button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    title="Scan Barcode / Test Scanner"
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    <Barcode className="w-4 h-4 text-indigo-500" />
                    <span className="hidden sm:inline">Barcode</span>
                  </button>

                  {/* Query Button */}
                  <button
                    type="submit"
                    disabled={isSearching || !lookupQuery.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>Look Up</span>
                  </button>
                </div>
              </form>

              {/* Sample Quick-Pick Chips */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                  <span>Quick Test Verified Retailer Codes:</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Click to import</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Best Buy PS5 (SKU: 6522854)', query: '6522854', store: 'bestbuy' },
                    { label: 'Target Switch OLED (DPCI: 207-00-0199)', query: '207-00-0199', store: 'target' },
                    { label: 'Amazon LEGO Falcon (ASIN: B07NDXZV2B)', query: 'B07NDXZV2B', store: 'amazon' },
                    { label: 'Micro Center RTX 4060 PC (SKU: 654321)', query: '654321', store: 'microcenter' },
                    { label: 'Walmart Scooter (Item# 345678912)', query: '345678912', store: 'walmart' },
                    { label: 'Apple AirPods 4 (UPC: 195949692484)', query: '195949692484', store: 'apple' },
                    { label: 'Micro Center ROG Ally (SKU: 589214)', query: '589214', store: 'microcenter' },
                    { label: 'Target Zelda (UPC: 045496599188)', query: '045496599188', store: 'target' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setLookupQuery(chip.query);
                        setSelectedRetailer(chip.store);
                        handlePerformLookup(chip.query, chip.store);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{searchError}</div>
                </div>
              )}

              {/* Active Search Result Card */}
              {searchResult && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/50 shadow-md space-y-4 animate-in fade-in zoom-in-95">
                  
                  {/* Top Bar with Badges and Store */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getRetailerBadge(searchResult.retailer).bg}`}>
                        {getRetailerBadge(searchResult.retailer).label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Verified Retail MSRP</span>
                      </span>
                      {searchSource && (
                        <span className="text-[10px] font-bold text-slate-500 bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                          {searchSource === 'gemini-ai' ? '🤖 Gemini AI Match' : '📁 Verified Store Catalog'}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        ${searchResult.targetCost?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Product Title and Description */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      {getItemIcon(searchResult.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {searchResult.name || searchResult.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {searchResult.description}
                      </p>
                    </div>
                  </div>

                  {/* Retail Identifier Tags */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    {searchResult.sku && (
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Store SKU</span>
                        <strong className="text-slate-800 dark:text-slate-200">{searchResult.sku}</strong>
                      </div>
                    )}
                    {searchResult.barcode && (
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">UPC / Barcode</span>
                        <strong className="text-slate-800 dark:text-slate-200">{searchResult.barcode}</strong>
                      </div>
                    )}
                    {searchResult.itemNumber && (
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Item# / ASIN</span>
                        <strong className="text-slate-800 dark:text-slate-200">{searchResult.itemNumber}</strong>
                      </div>
                    )}
                    {searchResult.modelNumber && (
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Model#</span>
                        <strong className="text-slate-800 dark:text-slate-200">{searchResult.modelNumber}</strong>
                      </div>
                    )}
                  </div>

                  {/* Specs & Why Kids Love It */}
                  {searchResult.specs && searchResult.specs.length > 0 && (
                    <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Product Specs:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {searchResult.specs.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {searchResult.whyKidsLoveIt && (
                    <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
                      <strong>Kid Appeal: </strong>
                      {searchResult.whyKidsLoveIt}
                    </div>
                  )}

                  {/* Countdown Milestones Breakdown */}
                  <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                      Savings Countdown Milestones:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                      <div className="p-1.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                        25% Bronze (${(searchResult.targetCost * 0.25).toFixed(2)})
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        50% Silver (${(searchResult.targetCost * 0.50).toFixed(2)})
                      </div>
                      <div className="p-1.5 rounded-xl bg-yellow-100 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200">
                        75% Gold (${(searchResult.targetCost * 0.75).toFixed(2)})
                      </div>
                      <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                        100% Launch! (${searchResult.targetCost.toFixed(2)})
                      </div>
                    </div>
                  </div>

                  {/* Fund Reallocation Notice if funds exist */}
                  {accumulatedFunds > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <span>💰 Starting Boost:</span>
                          <strong className="text-emerald-900 dark:text-emerald-100 font-black">
                            ${Math.min(searchResult.targetCost, accumulatedFunds).toFixed(2)}
                          </strong>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-black">
                            {((Math.min(searchResult.targetCost, accumulatedFunds) / searchResult.targetCost) * 100).toFixed(0)}% already achieved!
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Remaining to reach 100%: ${(Math.max(0, searchResult.targetCost - accumulatedFunds)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={() => handleImportProductAsGoal(searchResult)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>
                      {accumulatedFunds > 0 
                        ? `🚀 Set Goal & Reallocate $${Math.min(searchResult.targetCost, accumulatedFunds).toFixed(2)}` 
                        : '🚀 Set as My Active Savings Rocket Goal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              )}

              {/* Browse Catalog by Store Section when no active result */}
              {!searchResult && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Popular Retail Registry (Amazon, Best Buy, Target, Walmart, Micro Center)
                    </h4>
                    <span className="text-[11px] text-slate-500">Click any product to import</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {POPULAR_RETAIL_DATABASE.filter((p) => {
                      if (selectedRetailer === 'all') return true;
                      return p.retailer.toLowerCase().includes(selectedRetailer.toLowerCase());
                    }).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleImportProductAsGoal(product)}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all cursor-pointer flex items-start justify-between gap-2.5 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                            {getItemIcon(product.icon)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${getRetailerBadge(product.retailer).bg}`}>
                                {product.retailer}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                SKU: {product.sku || product.itemNumber}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                              {product.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              UPC: {product.barcode}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            ${product.currentCost.toFixed(2)}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                            Select →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: POPULAR CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-3">
              {POPULAR_RETAIL_DATABASE.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleImportProductAsGoal(item)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getItemIcon(item.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          {item.retailer}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        SKU: {item.sku} • UPC: {item.barcode}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-black text-amber-600 dark:text-amber-400">
                      ${item.currentCost.toFixed(2)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Select Target →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CUSTOM MANUAL GOAL */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustomGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Goal Name / Wishlist Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hoverboard or Special Drone"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 149.99"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys & LEGO">Toys & LEGO</option>
                    <option value="Tech & PC">Tech & PC</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Fashion & Clothes">Fashion & Clothes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {accumulatedFunds > 0 
                    ? `Set as Active Goal & Reallocate $${accumulatedFunds.toFixed(2)}`
                    : 'Set as Active Goal'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: MANAGE GOALS & REALLOCATION */}
          {activeTab === 'manage' && kid && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Manage Savings Goals & Protection</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Removing a goal protects all your accumulated funds inside your vault and reallocates them to your active target.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Vault Balance</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ${kid.totalSaved.toFixed(2)}
                  </div>
                </div>
              </div>

              {kid.goals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Target className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">No Goals on Your List</div>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Use the AI Retail Importer or Catalog tabs to add your next savings adventure!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai-retail')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    + Find Goal via SKU/UPC
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {kid.goals.map((g) => {
                    const isPrimary = g.priority === 'primary';
                    const pct = Math.min(100, Math.round((g.currentSaved / (g.targetCost || 1)) * 100));

                    return (
                      <div
                        key={g.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPrimary
                            ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/10'
                            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                              {getItemIcon(g.icon || 'Gamepad2')}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {g.title}
                                </h5>
                                {isPrimary ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                    Active Target
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Secondary
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <span>Target: ${g.targetCost.toFixed(2)}</span>
                                <span>•</span>
                                <span>Accumulated: ${g.currentSaved.toFixed(2)}</span>
                                <span>•</span>
                                <span>{pct}%</span>
                              </div>

                              {g.sku && (
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  SKU: {g.sku} {g.retailer ? `(${g.retailer})` : ''}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Switch to primary by re-selecting it
                                  onSelectGoal({ ...g, priority: 'primary' });
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 cursor-pointer min-h-[36px]"
                                title="Reallocate funds to make this your primary target"
                              >
                                Set Primary
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeletingGoalId(deletingGoalId === g.id ? null : g.id)}
                              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 cursor-pointer min-h-[36px]"
                              title="Remove goal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Inlined Deletion Confirmation */}
                        {deletingGoalId === g.id && (
                          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs animate-in fade-in">
                            <div className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                              Remove "{g.title}" from your list?
                            </div>
                            <p className="text-rose-700 dark:text-rose-400 text-[11px] mb-2 leading-relaxed">
                              🛡️ <strong>Zero Money Lost:</strong> Your banked funds (${g.currentSaved.toFixed(2)}) remain safe in your vault and will reallocate to your next goal!
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDeletingGoalId(null)}
                                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer min-h-[32px]"
                              >
                                Keep Goal
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteGoal?.(g.id);
                                  setDeletingGoalId(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer min-h-[32px] shadow-xs"
                              >
                                Yes, Delete & Reallocate
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Barcode Scanner Simulator Modal */}
        {showScannerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-950 text-white rounded-3xl max-w-md w-full p-5 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-black text-white">Retail Barcode & UPC Scanner</h4>
                </div>
                <button
                  onClick={() => setShowScannerModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder simulation */}
              <div className="relative aspect-video rounded-2xl bg-black border-2 border-dashed border-emerald-500/60 overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse" />
                <Camera className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
                <p className="text-xs text-slate-300 text-center font-mono">
                  Align product barcode / UPC within frame
                </p>
                <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                  [ LASER ACTIVE • 12-DIGIT UPC SENSOR ]
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  Simulate Real Box Scan:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {[
                    { label: 'PS5 (711719570530)', code: '711719570530' },
                    { label: 'Switch (045496883386)', code: '045496883386' },
                    { label: 'AirPods 4 (195949692484)', code: '195949692484' },
                    { label: 'LEGO Falcon (673419304191)', code: '673419304191' },
                    { label: 'RTX 4060 PC (884116443210)', code: '884116443210' },
                    { label: 'ROG Ally (810086532456)', code: '810086532456' },
                  ].map((scan) => (
                    <button
                      key={scan.code}
                      type="button"
                      onClick={() => {
                        setScannerBeep(true);
                        setLookupQuery(scan.code);
                        setShowScannerModal(false);
                        handlePerformLookup(scan.code, 'all');
                        setTimeout(() => setScannerBeep(false), 500);
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-left transition-colors cursor-pointer"
                    >
                      {scan.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Scanner
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
