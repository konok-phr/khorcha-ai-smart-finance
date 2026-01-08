import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'mobile_banking' | 'other';
  balance: number;
  icon: string;
  color: string;
  is_default: boolean;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data as Account[] || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'balance' | 'is_default'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          ...account,
          balance: 0,
          is_default: accounts.length === 0,
        })
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => [...prev, data as Account]);
      toast.success('অ্যাকাউন্ট যোগ করা হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('অ্যাকাউন্ট যোগ করতে সমস্যা হয়েছে');
      return null;
    }
  }, [user, accounts.length]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('অ্যাকাউন্ট মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('অ্যাকাউন্ট মুছতে সমস্যা হয়েছে');
    }
  }, []);

  return {
    accounts,
    isLoading,
    addAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
};
