import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface EditTransactionDialogProps {
  transaction: Transaction;
  onSave: (id: string, updates: {
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
  }) => Promise<boolean>;
  onClose: () => void;
}

export const EditTransactionDialog = ({ transaction, onSave, onClose }: EditTransactionDialogProps) => {
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [description, setDescription] = useState(transaction.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset category when type changes
  useEffect(() => {
    const validCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const isValidCategory = validCategories.some(c => c.id === category);
    if (!isValidCategory) {
      setCategory(validCategories[0]?.id || '');
    }
  }, [type, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    const success = await onSave(transaction.id, {
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim() || categories.find(c => c.id === category)?.label || category,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-float">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">লেনদেন সম্পাদনা</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-expense text-expense-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                খরচ
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  type === 'income'
                    ? 'bg-income text-income-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                আয়
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                পরিমাণ (৳)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-2xl font-bold h-14 text-center"
                min="0"
                step="any"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ক্যাটাগরি
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="ক্যাটাগরি বাছুন" />
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
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                বিবরণ
              </label>
              <Input
                placeholder="বিবরণ লিখুন..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full h-12 gradient-primary text-primary-foreground font-medium shadow-button hover:shadow-button-hover"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  সংরক্ষণ হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  সংরক্ষণ করুন
                </span>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};
