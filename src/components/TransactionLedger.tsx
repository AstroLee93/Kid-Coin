import React, { useState } from 'react';
import { KidProfile, Transaction, Category } from '../types';
import { playCoinSound } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  DollarSign, 
  Filter, 
  Calendar, 
  Tag, 
  X,
  Sparkles,
  ShoppingBag,
  Gift,
  Coins
} from 'lucide-react';

interface TransactionLedgerProps {
  kid: KidProfile;
  onUpdateKid: (updated: KidProfile) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  kid,
  onUpdateKid,
}) => {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New transaction form state
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('allowance');
  const [description, setDescription] = useState('');
  const [contributeToGoal, setContributeToGoal] = useState(true);

  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];

  const filteredTransactions = kid.transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalIn = kid.transactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOut = kid.transactions
    .filter((tx) => tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      kidId: kid.id,
      type,
      amount: Number(val.toFixed(2)),
      category,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      goalContribution: type === 'deposit' && contributeToGoal ? primaryGoal?.id : undefined,
    };

    let updatedGoals = [...kid.goals];
    let newTotalSaved = kid.totalSaved;
    let newAvailableCash = kid.availableCash;

    if (type === 'deposit') {
      if (contributeToGoal && primaryGoal) {
        newTotalSaved = Number((kid.totalSaved + val).toFixed(2));
        updatedGoals = updatedGoals.map((g) =>
          g.id === primaryGoal.id
            ? { ...g, currentSaved: Number((g.currentSaved + val).toFixed(2)) }
            : g
        );
      } else {
        newAvailableCash = Number((kid.availableCash + val).toFixed(2));
      }
      playCoinSound();
      sendKidNotification(
        '💰 Transaction Recorded!',
        `Added +$${val.toFixed(2)} (${description}) to ${contributeToGoal ? primaryGoal?.title || 'goal' : 'available cash'}!`,
        'allowance'
      );
    } else {
      // Withdrawal
      newAvailableCash = Math.max(0, Number((kid.availableCash - val).toFixed(2)));
      sendKidNotification(
        '🛍️ Spending Logged',
        `Spent $${val.toFixed(2)} on ${description}. Kept on track!`,
        'chore'
      );
    }

    onUpdateKid({
      ...kid,
      totalSaved: newTotalSaved,
      availableCash: newAvailableCash,
      goals: updatedGoals,
      transactions: [newTx, ...kid.transactions],
    });

    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'gift':
        return <Gift className="w-3.5 h-3.5 text-pink-500" />;
      case 'allowance':
      case 'chore':
      case 'lemonade_stand':
        return <Coins className="w-3.5 h-3.5 text-emerald-500" />;
      case 'snack':
      case 'toy':
      case 'game':
        return <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div id="transaction-ledger-card" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs m-0">
      {/* Header with Title & Add Transaction button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Encrypted Finance Ledger</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {kid.transactions.length} Records
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Real-time tracking of every dollar earned, saved, or spent
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'deposit'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Money In
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'withdrawal'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Money Out
            </button>
          </div>

          <button
            id="add-transaction-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Total Money In</span>
          </div>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">+${totalIn.toFixed(2)}</span>
        </div>

        <div className="p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-orange-900 dark:text-orange-200">Total Spent</span>
          </div>
          <span className="text-sm font-black text-orange-600 dark:text-orange-400">-${totalOut.toFixed(2)}</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No transactions found in this view.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isDeposit
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="flex items-center gap-1 capitalize">
                        {getCategoryIcon(tx.category)}
                        {tx.category.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      {tx.goalContribution && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold truncate">
                            🎯 Goal Direct
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div
                    className={`text-sm font-black ${
                      isDeposit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {isDeposit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Record Financial Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="mt-4 space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('deposit');
                    setCategory('allowance');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    type === 'deposit'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  + Money In (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('withdrawal');
                    setCategory('snack');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    type === 'withdrawal'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  - Money Out (Spent)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {type === 'deposit' ? (
                    <>
                      <option value="allowance">Weekly Allowance</option>
                      <option value="chore">Chore Bounty</option>
                      <option value="gift">Birthday / Gift Money</option>
                      <option value="lemonade_stand">Lemonade Stand / Small Business</option>
                      <option value="other">Other Deposit</option>
                    </>
                  ) : (
                    <>
                      <option value="snack">Snack / Ice Cream</option>
                      <option value="toy">Toy or Collectible</option>
                      <option value="game">Video Game / App In-Game</option>
                      <option value="other">Other Purchase</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Note / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lawn mowing or Grandma's card"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Option to contribute directly to active dream goal */}
              {type === 'deposit' && primaryGoal && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contributeToGoal}
                    onChange={(e) => setContributeToGoal(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-amber-600 accent-amber-500"
                  />
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Apply directly to <strong>{primaryGoal.title}</strong> countdown!
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
