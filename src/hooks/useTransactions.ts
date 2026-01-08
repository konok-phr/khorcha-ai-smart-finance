import { useState, useCallback } from 'react';
import { Transaction } from '@/types/transaction';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      amount: 250,
      category: 'food',
      description: 'দুপুরের খাবার',
      date: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      type: 'income',
      amount: 50000,
      category: 'salary',
      description: 'মাসিক বেতন',
      date: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: '3',
      type: 'expense',
      amount: 1500,
      category: 'transport',
      description: 'উবার যাত্রা',
      date: new Date(Date.now() - 172800000),
      createdAt: new Date(Date.now() - 172800000),
    },
  ]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  };
};
