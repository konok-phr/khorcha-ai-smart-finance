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
      
      let accountsList = data as Account[] || [];
      
      // Auto-create Cash account if none exists
      if (accountsList.length === 0) {
        const { data: newCash, error: cashError } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: 'নগদ',
            type: 'cash',
            icon: '💵',
            color: '#10B981',
            balance: 0,
            is_default: true,
          })
          .select()
          .single();
        
        if (!cashError && newCash) {
          accountsList = [newCash as Account];
        }
      }
      
      setAccounts(accountsList);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const getDefaultAccount = useCallback(() => {
    return accounts.find(a => a.is_default) || accounts.find(a => a.type === 'cash') || accounts[0];
  }, [accounts]);

  const setDefaultAccount = useCallback(async (accountId: string) => {
    if (!user) return false;

    try {
      // First, unset all defaults
      const { error: unsetError } = await supabase
        .from('accounts')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (unsetError) throw unsetError;

      // Then set the new default
      const { error: setError } = await supabase
        .from('accounts')
        .update({ is_default: true })
        .eq('id', accountId);

      if (setError) throw setError;

      setAccounts(prev => 
        prev.map(a => ({ ...a, is_default: a.id === accountId }))
      );

      toast.success('ডিফল্ট অ্যাকাউন্ট পরিবর্তন হয়েছে!');
      return true;
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('ডিফল্ট অ্যাকাউন্ট পরিবর্তন করতে সমস্যা হয়েছে');
      return false;
    }
  }, [user]);

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

  const updateBalance = useCallback(async (accountId: string, amount: number, isAddition: boolean) => {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return false;

      const newBalance = isAddition 
        ? Number(account.balance) + amount 
        : Number(account.balance) - amount;

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

      if (error) throw error;
      
      setAccounts(prev => 
        prev.map(a => a.id === accountId ? { ...a, balance: newBalance } : a)
      );
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  }, [accounts]);

  const addToBalance = useCallback(async (accountId: string, amount: number) => {
    return updateBalance(accountId, amount, true);
  }, [updateBalance]);

  const deductFromBalance = useCallback(async (accountId: string, amount: number) => {
    return updateBalance(accountId, amount, false);
  }, [updateBalance]);

  const transfer = useCallback(async (fromAccountId: string, toAccountId: string, amount: number) => {
    if (!user) return false;
    
    try {
      const fromAccount = accounts.find(a => a.id === fromAccountId);
      const toAccount = accounts.find(a => a.id === toAccountId);
      
      if (!fromAccount || !toAccount) {
        toast.error('অ্যাকাউন্ট পাওয়া যায়নি');
        return false;
      }

      if (Number(fromAccount.balance) < amount) {
        toast.error('অপর্যাপ্ত ব্যালেন্স');
        return false;
      }

      // Update from account
      const { error: fromError } = await supabase
        .from('accounts')
        .update({ balance: Number(fromAccount.balance) - amount })
        .eq('id', fromAccountId);

      if (fromError) throw fromError;

      // Update to account
      const { error: toError } = await supabase
        .from('accounts')
        .update({ balance: Number(toAccount.balance) + amount })
        .eq('id', toAccountId);

      if (toError) throw toError;

      setAccounts(prev => 
        prev.map(a => {
          if (a.id === fromAccountId) return { ...a, balance: Number(a.balance) - amount };
          if (a.id === toAccountId) return { ...a, balance: Number(a.balance) + amount };
          return a;
        })
      );

      toast.success(`৳${amount.toLocaleString('bn-BD')} ট্রান্সফার সম্পন্ন!`);
      return true;
    } catch (error) {
      console.error('Error transferring:', error);
      toast.error('ট্রান্সফার করতে সমস্যা হয়েছে');
      return false;
    }
  }, [user, accounts]);

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
    addToBalance,
    deductFromBalance,
    transfer,
    getDefaultAccount,
    setDefaultAccount,
    refetch: fetchAccounts,
  };
};
