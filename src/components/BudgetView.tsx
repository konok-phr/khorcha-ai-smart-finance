import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useBudgets, Budget } from '@/hooks/useBudgets';
import { Transaction } from '@/hooks/useTransactions';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const expenseCategories = [
  'খাবার', 'পরিবহন', 'বিল', 'কেনাকাটা', 'স্বাস্থ্য', 
  'বিনোদন', 'শিক্ষা', 'অন্যান্য'
];

interface BudgetViewProps {
  transactions: Transaction[];
}

export const BudgetView = ({ transactions }: BudgetViewProps) => {
  const { budgets, isLoading, addBudget, deleteBudget } = useBudgets();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    await addBudget({
      category,
      amount: parseFloat(amount),
      period,
    });

    setCategory('');
    setAmount('');
    setShowForm(false);
  };

  const getSpentAmount = (budget: Budget) => {
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
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'দৈনিক';
      case 'weekly': return 'সাপ্তাহিক';
      case 'monthly': return 'মাসিক';
      default: return period;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">বাজেট সীমা</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          যোগ করুন
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 shadow-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ক্যাটাগরি</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="বাছুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>সময়কাল</Label>
                    <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">দৈনিক</SelectItem>
                        <SelectItem value="weekly">সাপ্তাহিক</SelectItem>
                        <SelectItem value="monthly">মাসিক</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>বাজেট পরিমাণ (৳)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">সেভ করুন</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    বাতিল
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">লোড হচ্ছে...</div>
      ) : budgets.length === 0 ? (
        <Card className="p-6 text-center shadow-card">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">কোনো বাজেট সেট করা হয়নি</p>
          <p className="text-sm text-muted-foreground">খরচ নিয়ন্ত্রণে রাখতে বাজেট সেট করুন</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget, index) => {
            const spent = getSpentAmount(budget);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            const isWarning = percentage >= 80 && !isOverBudget;

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 shadow-card ${isOverBudget ? 'border-expense/50 bg-expense/5' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                          {getPeriodLabel(budget.period)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-semibold ${isOverBudget ? 'text-expense' : 'text-foreground'}`}>
                          ৳{spent.toLocaleString('bn-BD')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / ৳{budget.amount.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(isOverBudget || isWarning) && (
                        <AlertTriangle className={`w-4 h-4 ${isOverBudget ? 'text-expense' : 'text-yellow-500'}`} />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-expense"
                        onClick={() => deleteBudget(budget.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isOverBudget ? '[&>div]:bg-expense' : isWarning ? '[&>div]:bg-yellow-500' : ''}`}
                  />
                  {isOverBudget && (
                    <p className="text-xs text-expense mt-2">
                      ⚠️ বাজেট ছাড়িয়ে গেছে ৳{(spent - budget.amount).toLocaleString('bn-BD')}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
