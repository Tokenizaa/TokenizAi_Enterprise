/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localStore } from './supabaseClient';
import { FinancialTransaction, DepartmentBudget } from '../types';

export const financialService = {
  getTransactions(): FinancialTransaction[] {
    return localStore.getFinancialTransactions();
  },

  getDepartmentBudgets(): DepartmentBudget[] {
    return localStore.getDepartmentBudgets();
  },

  getSummaryMetrics() {
    const transactions = localStore.getFinancialTransactions();
    const budgets = localStore.getDepartmentBudgets();

    const totalRevenue = transactions
      .filter(t => t.type === 'revenue' && t.status === 'settled')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'settled')
      .reduce((sum, t) => sum + t.amount, 0);

    const cloudAIExpense = transactions
      .filter(t => t.category === 'Infraestrutura Cloud & IA' && t.status === 'settled')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAllocatedBudget = budgets.reduce((sum, b) => sum + b.allocated_budget, 0);
    const totalConsumedBudget = budgets.reduce((sum, b) => sum + b.consumed_budget, 0);

    return {
      totalRevenue,
      totalExpense,
      netCashFlow: totalRevenue - totalExpense,
      cloudAIExpense,
      pendingExpenses,
      totalAllocatedBudget,
      totalConsumedBudget,
      budgetExecutionPercent: totalAllocatedBudget > 0
        ? Math.round((totalConsumedBudget / totalAllocatedBudget) * 100)
        : 0,
      isDemo: true, // Flagged demonstrative as required
    };
  },

  createTransaction(data: Omit<FinancialTransaction, 'id' | 'is_demo'>): FinancialTransaction {
    const newTx: FinancialTransaction = {
      ...data,
      id: `fin-${Date.now()}`,
      is_demo: true,
    };

    localStore.updateFinancialTransactions(prev => [newTx, ...prev]);
    localStore.logAudit({
      user_id: 'usr-001',
      user_email: 'admin@nettoscorp.com',
      action: 'CREATE',
      resource: 'financial_transactions',
      resource_id: newTx.id,
      details: { amount: newTx.amount, category: newTx.category, type: newTx.type },
    });

    return newTx;
  },
};
