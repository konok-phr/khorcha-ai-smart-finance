import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface ManualEntryFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const ManualEntryForm = ({ onSubmit, onClose }: ManualEntryFormProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(),
    });

    setAmount('');
    setCategory('');
    setDescription('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-float">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">নতুন লেনদেন যোগ করুন</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(''); }}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-expense text-expense-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                খরচ
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(''); }}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  type === 'income'
                    ? 'bg-income text-income-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                আয়
              </button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">পরিমাণ (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-2xl font-semibold h-14"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>ক্যাটাগরি</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Input
                id="description"
                placeholder="লেনদেনের বিবরণ লিখুন"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg gradient-primary shadow-button hover:opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              লেনদেন যোগ করুন
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};
