import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useBudgets, Budget } from '@/hooks/useBudgets';
import { Transaction } from '@/hooks/useTransactions';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

interface UseBudgetAlertsProps {
  transactions: Transaction[];
  enabled?: boolean;
}

export const useBudgetAlerts = ({ transactions, enabled = true }: UseBudgetAlertsProps) => {
  const { budgets } = useBudgets();
  const { preferences, isLoaded } = useNotificationPreferences();

  const getSpentAmount = useCallback((budget: Budget) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (budget.period) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'weekly':
        start = startOfWeek(now, { weekStartsOn: 6 });
        end = endOfWeek(now, { weekStartsOn: 6 });
        break;
      case 'monthly':
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.category &&
        isWithinInterval(new Date(t.transaction_date), { start, end })
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const checkBudgetAlerts = useCallback(() => {
    if (!enabled || budgets.length === 0 || !isLoaded) return;

    const categoryLabels: Record<string, string> = {
      'খাবার': 'খাবার', 'পরিবহন': 'পরিবহন', 'বিল': 'বিল',
      'কেনাকাটা': 'কেনাকাটা', 'স্বাস্থ্য': 'স্বাস্থ্য', 'বিনোদন': 'বিনোদন',
      'শিক্ষা': 'শিক্ষা', 'অন্যান্য': 'অন্যান্য',
      food: 'খাবার', transport: 'পরিবহন', bills: 'বিল',
      shopping: 'কেনাকাটা', health: 'স্বাস্থ্য', entertainment: 'বিনোদন',
      education: 'শিক্ষা', others: 'অন্যান্য'
    };

    budgets.forEach(budget => {
      const spent = getSpentAmount(budget);
      const percentage = (spent / budget.amount) * 100;
      const categoryLabel = categoryLabels[budget.category] || budget.category;

      // Check user preferences before showing alerts
      if (percentage >= 100 && preferences.budgetAlerts) {
        toast.error(`⚠️ ${categoryLabel} বাজেট ছাড়িয়ে গেছে!`, {
          description: `৳${spent.toLocaleString('bn-BD')} / ৳${budget.amount.toLocaleString('bn-BD')} (${Math.round(percentage)}%)`,
          duration: 5000,
        });
      } else if (percentage >= 80 && preferences.budgetWarningThreshold) {
        toast.warning(`⚡ ${categoryLabel} বাজেট ${Math.round(percentage)}% শেষ`, {
          description: `বাকি আছে ৳${(budget.amount - spent).toLocaleString('bn-BD')}`,
          duration: 4000,
        });
      }
    });
  }, [budgets, getSpentAmount, enabled, preferences, isLoaded]);

  // Check on mount and when transactions change
  useEffect(() => {
    // Small delay to avoid running on initial mount with empty data
    const timer = setTimeout(() => {
      checkBudgetAlerts();
    }, 1000);

    return () => clearTimeout(timer);
  }, [transactions.length]); // Only check when transaction count changes

  return {
    checkBudgetAlerts,
    getSpentAmount,
    budgets,
  };
};
