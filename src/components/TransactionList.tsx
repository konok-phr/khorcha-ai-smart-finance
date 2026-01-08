import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Filter, X, Calendar, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

const getCategoryInfo = (type: 'income' | 'expense', categoryId: string) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.id === categoryId) || { label: categoryId, icon: '📦' };
};

const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const TransactionList = ({ transactions, onDelete, isLoading }: TransactionListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = t.description.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const categoryInfo = getCategoryInfo(t.type, t.category);
        const matchesCategoryLabel = categoryInfo.label.toLowerCase().includes(query);
        if (!matchesDescription && !matchesCategory && !matchesCategoryLabel) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const txDate = new Date(t.transaction_date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateFilter === 'today') {
          const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
          if (txDay.getTime() !== today.getTime()) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (txDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter]);

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={hasActiveFilters ? 'gradient-primary' : ''}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 shadow-card space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3" /> ধরন
                  </label>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব</SelectItem>
                      <SelectItem value="income">আয়</SelectItem>
                      <SelectItem value="expense">খরচ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> সময়
                  </label>
                  <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব</SelectItem>
                      <SelectItem value="today">আজ</SelectItem>
                      <SelectItem value="week">৭ দিন</SelectItem>
                      <SelectItem value="month">৩০ দিন</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ক্যাটাগরি</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব</SelectItem>
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  ফিল্টার মুছুন
                </Button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {(searchQuery || hasActiveFilters) && (
        <p className="text-sm text-muted-foreground">
          {filteredTransactions.length}টি লেনদেন পাওয়া গেছে
        </p>
      )}

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <Card className="p-8 text-center shadow-card">
          <p className="text-muted-foreground">কোনো লেনদেন নেই</p>
          <p className="text-sm text-muted-foreground mt-1">
            নতুন লেনদেন যোগ করতে নিচের বোতাম ব্যবহার করুন
          </p>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-8 text-center shadow-card">
          <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">কোনো লেনদেন পাওয়া যায়নি</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            ফিল্টার মুছুন
          </Button>
        </Card>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {filteredTransactions.slice(0, visibleCount).map((transaction, index) => {
              const category = getCategoryInfo(transaction.type, transaction.category);
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="p-4 shadow-card hover:shadow-float transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                        {category.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {transaction.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{category.label}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.transaction_date)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-income' : 'text-expense'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-expense"
                        onClick={() => onDelete(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More Button */}
          {filteredTransactions.length > visibleCount && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setVisibleCount((prev) => prev + 12)}
              >
                আরো দেখুন ({filteredTransactions.length - visibleCount}টি বাকি)
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
