import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CreditCard {
  id: string;
  card_name: string;
  card_number_last4: string | null;
  credit_limit: number;
  current_balance: number;
  bill_generation_date: number;
  due_date: number;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCreditCards = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCreditCards = useCallback(async () => {
    if (!user) {
      setCreditCards([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreditCards(data as CreditCard[] || []);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      toast.error('ক্রেডিট কার্ড লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCreditCards();
  }, [fetchCreditCards]);

  const addCreditCard = useCallback(async (card: {
    card_name: string;
    card_number_last4?: string;
    credit_limit: number;
    bill_generation_date: number;
    due_date: number;
    color?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          card_name: card.card_name,
          card_number_last4: card.card_number_last4 || null,
          credit_limit: card.credit_limit,
          bill_generation_date: card.bill_generation_date,
          due_date: card.due_date,
          color: card.color || '#8B5CF6',
        })
        .select()
        .single();

      if (error) throw error;

      setCreditCards(prev => [data as CreditCard, ...prev]);
      toast.success('ক্রেডিট কার্ড যোগ করা হয়েছে!');
      return data;
    } catch (error) {
      console.error('Error adding credit card:', error);
      toast.error('ক্রেডিট কার্ড যোগ করতে সমস্যা হয়েছে');
      return null;
    }
  }, [user]);

  const updateCreditCard = useCallback(async (id: string, updates: Partial<CreditCard>) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success('ক্রেডিট কার্ড আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating credit card:', error);
      toast.error('ক্রেডিট কার্ড আপডেট করতে সমস্যা হয়েছে');
    }
  }, []);

  const updateBalance = useCallback(async (id: string, amount: number) => {
    const card = creditCards.find(c => c.id === id);
    if (!card) return;

    const newBalance = Number(card.current_balance) + amount;
    await updateCreditCard(id, { current_balance: newBalance });
  }, [creditCards, updateCreditCard]);

  const payBill = useCallback(async (id: string, amount: number) => {
    const card = creditCards.find(c => c.id === id);
    if (!card) return;

    const newBalance = Math.max(0, Number(card.current_balance) - amount);
    await updateCreditCard(id, { current_balance: newBalance });
    toast.success('বিল পেমেন্ট সফল হয়েছে!');
  }, [creditCards, updateCreditCard]);

  const deleteCreditCard = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCreditCards(prev => prev.filter(c => c.id !== id));
      toast.success('ক্রেডিট কার্ড মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting credit card:', error);
      toast.error('ক্রেডিট কার্ড মুছতে সমস্যা হয়েছে');
    }
  }, []);

  const totalCreditLimit = creditCards.reduce((sum, c) => sum + Number(c.credit_limit), 0);
  const totalBalance = creditCards.reduce((sum, c) => sum + Number(c.current_balance), 0);
  const availableCredit = totalCreditLimit - totalBalance;

  return {
    creditCards,
    isLoading,
    addCreditCard,
    updateCreditCard,
    updateBalance,
    payBill,
    deleteCreditCard,
    totalCreditLimit,
    totalBalance,
    availableCredit,
    refetch: fetchCreditCards,
  };
};
