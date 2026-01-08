import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: boolean;
  account_id?: string;
}

export const useRecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecurringTransactions = useCallback(async () => {
    if (!user) {
      setRecurringTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_date', { ascending: true });

      if (error) throw error;
      setRecurringTransactions(data as RecurringTransaction[] || []);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecurringTransactions();
  }, [fetchRecurringTransactions]);

  const addRecurringTransaction = useCallback(async (transaction: Omit<RecurringTransaction, 'id' | 'is_active'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          ...transaction,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setRecurringTransactions(prev => [...prev, data as RecurringTransaction]);
      toast.success('রিকারিং লেনদেন যোগ হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      toast.error('রিকারিং লেনদেন যোগ করতে সমস্যা হয়েছে');
      return null;
    }
  }, [user]);

  const deleteRecurringTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('রিকারিং লেনদেন মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  }, []);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      setRecurringTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, is_active: isActive } : t)
      );
      toast.success(isActive ? 'সক্রিয় করা হয়েছে' : 'নিষ্ক্রিয় করা হয়েছে');
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
    }
  }, []);

  return {
    recurringTransactions,
    isLoading,
    addRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
    refetch: fetchRecurringTransactions,
  };
};
