import React, { useState } from 'react';
import { BudgetItem, UserProfile, LanguageCode } from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import {
  BudgetSummary,
  evaluatePermissions,
} from '../utils/weddingLogic';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface BudgetFinanceViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  budgetSummary: BudgetSummary;
  budgetItems: BudgetItem[];
  onAddBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  onUpdatePayment: (itemId: string, newPaidAmount: number) => void;
  onUpdateTotalBudget: (newBudget: number) => void;
}

export const BudgetFinanceView: React.FC<BudgetFinanceViewProps> = ({
  currentLang,
  currentUser,
  budgetSummary,
  budgetItems,
  onAddBudgetItem,
  onUpdatePayment,
  onUpdateTotalBudget,
}) => {
  const t = TRANSLATIONS[currentLang];
  const canEditBudget = evaluatePermissions(currentUser.role, 'edit_budget');

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Florals');
  const [newExpenseEstimated, setNewExpenseEstimated] = useState(3000);
  const [newExpenseActual, setNewExpenseActual] = useState(3000);
  const [newExpensePaid, setNewExpensePaid] = useState(1000);
  const [newExpenseDueDate, setNewExpenseDueDate] = useState('2026-08-15');

  const [editingBudgetCap, setEditingBudgetCap] = useState(false);
  const [tempBudgetCap, setTempBudgetCap] = useState(budgetSummary.totalBudget);

  const categories = Object.keys(budgetSummary.categoryBreakdown);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName.trim()) return;
    const est = Number(newExpenseEstimated) || 0;
    const act = Number(newExpenseActual) || 0;
    const paid = Number(newExpensePaid) || 0;

    let status: BudgetItem['status'] = 'pending';
    if (paid >= act && act > 0) status = 'paid';
    else if (paid > 0) status = 'partial';

    onAddBudgetItem({
      name: newExpenseName,
      category: newExpenseCategory,
      estimatedCost: est,
      actualCost: act,
      paidAmount: paid,
      dueDate: newExpenseDueDate,
      status,
    });

    setShowAddExpenseModal(false);
    setNewExpenseName('');
  };

  const handleSaveBudgetCap = () => {
    onUpdateTotalBudget(Number(tempBudgetCap) || budgetSummary.totalBudget);
    setEditingBudgetCap(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Role Permissions Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.navBudgetFinance}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time cashflow management, scheduled vendor disbursements, and contingency reserves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canEditBudget && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Read-Only ({currentUser.roleTitle})</span>
            </div>
          )}

          {canEditBudget && (
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Line Item</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Target Budget */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.totalBudget}</span>
            <Wallet className="w-4 h-4 text-stone-400" />
          </div>

          {editingBudgetCap ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempBudgetCap}
                onChange={(e) => setTempBudgetCap(Number(e.target.value))}
                className="w-full text-lg font-mono px-2 py-1 border border-stone-300 rounded"
              />
              <button
                onClick={handleSaveBudgetCap}
                className="text-xs bg-stone-900 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
              ${budgetSummary.totalBudget.toLocaleString()}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
            <span>Cap allocation</span>
            {canEditBudget && !editingBudgetCap && (
              <button
                onClick={() => setEditingBudgetCap(true)}
                className="text-rose-700 hover:text-rose-900 text-[11px] font-medium cursor-pointer"
              >
                Edit Cap
              </button>
            )}
          </div>
        </div>

        {/* Spent to date */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.spentToDate}</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            ${budgetSummary.totalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            <span className="font-semibold tabular-nums text-stone-800">{budgetSummary.percentSpent}%</span> of cap committed
          </div>
        </div>

        {/* Paid Disbursements */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Disbursed to Vendors</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            ${budgetSummary.totalPaid.toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Remaining unpaid: <strong className="tabular-nums font-semibold">${(budgetSummary.totalSpent - budgetSummary.totalPaid).toLocaleString()}</strong>
          </div>
        </div>

        {/* Remaining Cushion */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.remainingBudget}</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-serif font-bold tabular-nums ${
            budgetSummary.remainingBudget < 0 ? 'text-red-700' : 'text-stone-900'
          }`}>
            ${budgetSummary.remainingBudget.toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            {budgetSummary.isOverBudget ? (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Over Budget Warning
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">Contingency intact</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Progress Meters */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-serif font-bold text-stone-900">
          Category Allocation & Commitments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const data = budgetSummary.categoryBreakdown[cat];
            const percentOfTotal = budgetSummary.totalBudget > 0
              ? Math.min(100, Math.round((data.spent / budgetSummary.totalBudget) * 100))
              : 0;

            return (
              <div key={cat} className="p-3.5 bg-stone-50 rounded-lg border border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-stone-800">{cat}</strong>
                  <span className="font-mono tabular-nums text-stone-700 font-medium">
                    ${data.spent.toLocaleString()} <span className="text-stone-400">/ est. ${data.estimated.toLocaleString()}</span>
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      data.spent > data.estimated ? 'bg-amber-700' : 'bg-rose-900'
                    }`}
                    style={{ width: `${Math.min(100, (data.spent / (data.estimated || 1)) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Paid: ${data.paid.toLocaleString()}</span>
                  <span>{percentOfTotal}% of total budget</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Schedule & Expense Ledger */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Payment Schedule & Milestone Disbursements
            </h2>
            <p className="text-xs text-stone-500">
              Upcoming contractual installment dates and payment reconciliation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2.5 px-4">Line Item & Category</th>
                <th className="py-2.5 px-4 text-right">Contracted</th>
                <th className="py-2.5 px-4 text-right">Paid to Date</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Status</th>
                {canEditBudget && <th className="py-2.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {budgetItems.map((item) => {
                const balanceDue = Math.max(0, item.actualCost - item.paidAmount);
                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900 block">{item.name}</span>
                      <span className="text-[11px] text-stone-400">{item.category}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-stone-900">
                      ${item.actualCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-800">
                      ${item.paidAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-600">
                      ${balanceDue.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-stone-600">
                      {item.dueDate}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.status === 'partial'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {canEditBudget && (
                      <td className="py-3 px-4 text-right">
                        {item.status !== 'paid' && (
                          <button
                            onClick={() => onUpdatePayment(item.id, item.actualCost)}
                            className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-800 px-2.5 py-1 rounded font-medium cursor-pointer"
                          >
                            Mark Fully Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add Budget Line Item
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Record a new contract, vendor retainer, or logistical expense.
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  placeholder="e.g. Vintage Alfa Romeo Chauffeur"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Florals">Florals</option>
                    <option value="Photography">Photography</option>
                    <option value="Music & DJ">Music & DJ</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Cake & Confection">Cake & Confection</option>
                    <option value="Bridal Attire">Bridal Attire</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Contingency">Contingency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newExpenseDueDate}
                    onChange={(e) => setNewExpenseDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estimated ($)
                  </label>
                  <input
                    type="number"
                    value={newExpenseEstimated}
                    onChange={(e) => setNewExpenseEstimated(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Actual ($)
                  </label>
                  <input
                    type="number"
                    value={newExpenseActual}
                    onChange={(e) => setNewExpenseActual(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Paid to Date ($)
                  </label>
                  <input
                    type="number"
                    value={newExpensePaid}
                    onChange={(e) => setNewExpensePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
                >
                  Save Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
