import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'fd' | 'gold' | 'crypto' | 'other';
  symbol?: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  buy_date: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvestments = async () => {
    if (!user) {
      setInvestments([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments((data as Investment[]) || []);
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      toast({
        title: "ত্রুটি",
        description: "বিনিয়োগ লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert({
          ...investment,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setInvestments(prev => [data as Investment, ...prev]);
      toast({
        title: "সফল!",
        description: "বিনিয়োগ যোগ করা হয়েছে",
      });
      return data;
    } catch (error: any) {
      console.error('Error adding investment:', error);
      toast({
        title: "ত্রুটি",
        description: "বিনিয়োগ যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInvestments(prev => prev.map(inv => inv.id === id ? data as Investment : inv));
      toast({
        title: "সফল!",
        description: "বিনিয়োগ আপডেট করা হয়েছে",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating investment:', error);
      toast({
        title: "ত্রুটি",
        description: "বিনিয়োগ আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "সফল!",
        description: "বিনিয়োগ মুছে ফেলা হয়েছে",
      });
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast({
        title: "ত্রুটি",
        description: "বিনিয়োগ মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  // Calculate portfolio stats
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.buy_price * inv.quantity), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    investments,
    isLoading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    refetch: fetchInvestments,
    stats: {
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercent,
    },
  };
};
