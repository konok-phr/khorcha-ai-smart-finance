import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Loan {
  id: string;
  person_name: string;
  amount: number;
  direction: 'borrowed' | 'lent';
  status: 'pending' | 'paid';
  loan_date: string;
  due_date: string | null;
  note: string | null;
  created_at: string;
}

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLoans = useCallback(async () => {
    if (!user) {
      setLoans([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('loan_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoans((data as Loan[]) || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('ধার তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const addLoan = useCallback(
    async (loan: {
      person_name: string;
      amount: number;
      direction: 'borrowed' | 'lent';
      loan_date?: string;
      due_date?: string;
      note?: string;
    }) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('loans')
          .insert({
            user_id: user.id,
            person_name: loan.person_name,
            amount: loan.amount,
            direction: loan.direction,
            loan_date: loan.loan_date || new Date().toISOString().split('T')[0],
            due_date: loan.due_date || null,
            note: loan.note || null,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        setLoans((prev) => [data as Loan, ...prev]);
        toast.success('ধার যোগ করা হয়েছে!');
        return data;
      } catch (error) {
        console.error('Error adding loan:', error);
        toast.error('ধার যোগ করতে সমস্যা হয়েছে');
        return null;
      }
    },
    [user]
  );

  const markAsPaid = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('loans').update({ status: 'paid' }).eq('id', id);

      if (error) throw error;

      setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'paid' as const } : l)));
      toast.success('ধার পরিশোধ হয়েছে!');
    } catch (error) {
      console.error('Error marking loan as paid:', error);
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    }
  }, []);

  const deleteLoan = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('loans').delete().eq('id', id);

      if (error) throw error;

      setLoans((prev) => prev.filter((l) => l.id !== id));
      toast.success('ধার মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  }, []);

  // Calculate totals
  const totalBorrowed = loans
    .filter((l) => l.direction === 'borrowed' && l.status === 'pending')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  const totalLent = loans
    .filter((l) => l.direction === 'lent' && l.status === 'pending')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  return {
    loans,
    isLoading,
    addLoan,
    markAsPaid,
    deleteLoan,
    totalBorrowed,
    totalLent,
    refetch: fetchLoans,
  };
};
