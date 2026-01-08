import { useMemo } from 'react';
import { Transaction } from '@/hooks/useTransactions';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, subDays, format, eachDayOfInterval } from 'date-fns';
import { bn } from 'date-fns/locale';

export type DateRange = 'daily' | 'weekly' | 'monthly' | 'custom';

interface StatsResult {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  dailyTrend: { date: string; income: number; expense: number }[];
  periodLabel: string;
}

export const useStats = (
  transactions: Transaction[],
  range: DateRange,
  customStart?: Date,
  customEnd?: Date
) => {
  return useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let periodLabel: string;

    switch (range) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        periodLabel = 'আজ';
        break;
      case 'weekly':
        start = startOfWeek(now, { weekStartsOn: 6 }); // Saturday
        end = endOfWeek(now, { weekStartsOn: 6 });
        periodLabel = 'এই সপ্তাহ';
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        periodLabel = format(now, 'MMMM yyyy', { locale: bn });
        break;
      case 'custom':
        start = customStart || subDays(now, 30);
        end = customEnd || now;
        periodLabel = `${format(start, 'd MMM', { locale: bn })} - ${format(end, 'd MMM', { locale: bn })}`;
        break;
    }

    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return isWithinInterval(date, { start, end });
    });

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;

    // Category breakdown for expenses
    const expenseByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const categoryBreakdown = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily trend for charts
    const days = eachDayOfInterval({ start, end });
    const dailyTrend = days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return format(tDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      return {
        date: format(day, 'd MMM', { locale: bn }),
        income: dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        expense: dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0),
      };
    });

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      categoryBreakdown,
      dailyTrend,
      periodLabel,
    } as StatsResult;
  }, [transactions, range, customStart, customEnd]);
};
