import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data as SavingsGoal[] || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('লক্ষ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (goal: {
    name: string;
    target_amount: number;
    target_date?: string | null;
    icon?: string;
    color?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name: goal.name,
          target_amount: goal.target_amount,
          target_date: goal.target_date || null,
          icon: goal.icon || '🎯',
          color: goal.color || '#10B981',
        })
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data as SavingsGoal, ...prev]);
      toast.success('নতুন লক্ষ্য যোগ করা হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('লক্ষ্য যোগ করতে সমস্যা হয়েছে');
      return null;
    }
  }, [user]);

  const updateGoalAmount = useCallback(async (id: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newAmount = goal.current_amount + amount;
      const isCompleted = newAmount >= goal.target_amount;

      const { error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newAmount,
          is_completed: isCompleted 
        })
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === id 
          ? { ...g, current_amount: newAmount, is_completed: isCompleted }
          : g
      ));

      if (isCompleted) {
        toast.success('🎉 অভিনন্দন! আপনার লক্ষ্য পূরণ হয়েছে!');
      } else {
        toast.success('জমা হয়েছে!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    }
  }, [goals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('লক্ষ্য মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  }, []);

  return {
    goals,
    isLoading,
    addGoal,
    updateGoalAmount,
    deleteGoal,
    refetch: fetchGoals,
  };
};
