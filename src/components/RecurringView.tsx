import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, RefreshCw, TrendingUp, TrendingDown, Bell, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRecurringTransactions, RecurringTransaction } from '@/hooks/useRecurringTransactions';
import { format, differenceInDays, isToday, isTomorrow, addDays } from 'date-fns';
import { bn } from 'date-fns/locale';

const categories = {
  income: ['বেতন', 'ভাড়া', 'ফ্রিল্যান্স', 'ব্যবসা', 'বিনিয়োগ', 'অন্যান্য'],
  expense: ['খাবার', 'পরিবহন', 'বিল', 'কেনাকাটা', 'স্বাস্থ্য', 'বিনোদন', 'শিক্ষা', 'EMI', 'সাবস্ক্রিপশন', 'অন্যান্য']
};

export const RecurringView = () => {
  const { recurringTransactions, isLoading, addRecurringTransaction, deleteRecurringTransaction, toggleActive } = useRecurringTransactions();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);

  // Get upcoming reminders (due within 7 days)
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = addDays(today, 7);
    
    return recurringTransactions
      .filter(t => t.is_active)
      .filter(t => {
        const nextDateObj = new Date(t.next_date);
        return nextDateObj >= today && nextDateObj <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.next_date).getTime() - new Date(b.next_date).getTime());
  }, [recurringTransactions]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'আজ';
    if (isTomorrow(date)) return 'আগামীকাল';
    const days = differenceInDays(date, new Date());
    return `${days} দিন বাকি`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !description) return;

    await addRecurringTransaction({
      type,
      category,
      amount: parseFloat(amount),
      description,
      frequency,
      next_date: nextDate,
    });

    setCategory('');
    setAmount('');
    setDescription('');
    setShowForm(false);
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'প্রতিদিন';
      case 'weekly': return 'প্রতি সপ্তাহে';
      case 'monthly': return 'প্রতি মাসে';
      case 'yearly': return 'প্রতি বছরে';
      default: return freq;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Reminders Section */}
      {upcomingReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">আসন্ন রিমাইন্ডার</h3>
          </div>
          <div className="grid gap-2">
            {upcomingReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={`p-3 border-l-4 ${
                  isToday(new Date(reminder.next_date))
                    ? 'border-l-expense bg-expense/5'
                    : isTomorrow(new Date(reminder.next_date))
                    ? 'border-l-warning bg-warning/5'
                    : 'border-l-primary bg-primary/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      reminder.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                    }`}>
                      {reminder.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-income" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{reminder.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{reminder.category}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                          isToday(new Date(reminder.next_date)) ? 'text-expense' : 'text-warning'
                        }`}>
                          {getDateLabel(reminder.next_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    reminder.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {reminder.type === 'income' ? '+' : '-'}৳{Number(reminder.amount).toLocaleString('bn-BD')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">রিকারিং লেনদেন</h3>
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === 'expense' ? 'default' : 'outline'}
                    className={`flex-1 ${type === 'expense' ? 'bg-expense hover:bg-expense/90' : ''}`}
                    onClick={() => { setType('expense'); setCategory(''); }}
                  >
                    <TrendingDown className="w-4 h-4 mr-1" />
                    খরচ
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'income' ? 'default' : 'outline'}
                    className={`flex-1 ${type === 'income' ? 'bg-income hover:bg-income/90' : ''}`}
                    onClick={() => { setType('income'); setCategory(''); }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    আয়
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ক্যাটাগরি</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="বাছুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[type].map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ফ্রিকোয়েন্সি</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">প্রতিদিন</SelectItem>
                        <SelectItem value="weekly">প্রতি সপ্তাহে</SelectItem>
                        <SelectItem value="monthly">প্রতি মাসে</SelectItem>
                        <SelectItem value="yearly">প্রতি বছরে</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="যেমন: বাড়ির ভাড়া, ইলেকট্রিক বিল"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>পরিমাণ (৳)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>পরবর্তী তারিখ</Label>
                    <Input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                    />
                  </div>
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
      ) : recurringTransactions.length === 0 ? (
        <Card className="p-6 text-center shadow-card">
          <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">কোনো রিকারিং লেনদেন নেই</p>
          <p className="text-sm text-muted-foreground">মাসিক বিল, বেতন ইত্যাদি যোগ করুন</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recurringTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 shadow-card ${!transaction.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-income" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                          {transaction.category}
                        </span>
                        <span>•</span>
                        <span>{getFrequencyLabel(transaction.frequency)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>পরবর্তী: {format(new Date(transaction.next_date), 'd MMM yyyy', { locale: bn })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-income' : 'text-expense'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}৳{Number(transaction.amount).toLocaleString('bn-BD')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={transaction.is_active}
                        onCheckedChange={(checked) => toggleActive(transaction.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-expense"
                        onClick={() => deleteRecurringTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
