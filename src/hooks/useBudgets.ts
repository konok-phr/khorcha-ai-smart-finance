import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBudgets(data as Budget[] || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          ...budget,
        })
        .select()
        .single();

      if (error) throw error;
      setBudgets(prev => [...prev, data as Budget]);
      toast.success('বাজেট সেট করা হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('বাজেট সেট করতে সমস্যা হয়েছে');
      return null;
    }
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('বাজেট মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('বাজেট মুছতে সমস্যা হয়েছে');
    }
  }, []);

  return {
    budgets,
    isLoading,
    addBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
