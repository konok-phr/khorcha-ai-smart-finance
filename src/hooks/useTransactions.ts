import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('লেনদেন লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          transaction_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data as Transaction, ...prev]);
      toast.success('লেনদেন সংরক্ষিত হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('লেনদেন সংরক্ষণে সমস্যা হয়েছে');
      return null;
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('লেনদেন মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('লেনদেন মুছতে সমস্যা হয়েছে');
    }
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
    refetch: fetchTransactions,
  };
};
