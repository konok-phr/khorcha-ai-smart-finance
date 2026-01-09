import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, X, Calendar, Tag, Download, 
  TrendingUp, TrendingDown, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

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
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatShortDate = (dateStr: string) => {
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

const History = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { transactions, isLoading, deleteTransaction } = useTransactions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => {
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
        } else if (dateFilter === 'year') {
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          if (txDate < yearAgo) return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.transaction_date).getTime();
        const dateB = new Date(b.transaction_date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' 
          ? Number(b.amount) - Number(a.amount)
          : Number(a.amount) - Number(b.amount);
      }
    });

    return result;
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter, sortBy, sortOrder]);

  // Group transactions by month
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = new Intl.DateTimeFormat('bn-BD', { month: 'long', year: 'numeric' }).format(date);
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(t);
    });

    return Object.entries(groups).map(([key, txs]) => {
      const date = new Date(txs[0].transaction_date);
      const label = new Intl.DateTimeFormat('bn-BD', { month: 'long', year: 'numeric' }).format(date);
      const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      
      return { key, label, transactions: txs, income, expense };
    });
  }, [filteredTransactions]);

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  };

  const toggleMonth = (key: string) => {
    const newCollapsed = new Set(collapsedMonths);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedMonths(newCollapsed);
  };

  // Summary stats
  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">লেনদেনের ইতিহাস</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4 max-w-2xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-income" />
            <p className="text-xs text-muted-foreground">মোট আয়</p>
            <p className="text-sm font-semibold text-income">{formatCurrency(summary.income)}</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingDown className="w-5 h-5 mx-auto mb-1 text-expense" />
            <p className="text-xs text-muted-foreground">মোট খরচ</p>
            <p className="text-sm font-semibold text-expense">{formatCurrency(summary.expense)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">ব্যালেন্স</p>
            <p className={`text-sm font-semibold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="text-xs text-muted-foreground">{summary.count}টি লেনদেন</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
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
                  <div className="grid grid-cols-2 gap-3">
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
                        <Calendar className="w-3 h-3" /> সময়কাল
                      </label>
                      <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব সময়</SelectItem>
                          <SelectItem value="today">আজ</SelectItem>
                          <SelectItem value="week">গত ৭ দিন</SelectItem>
                          <SelectItem value="month">গত ৩০ দিন</SelectItem>
                          <SelectItem value="year">গত ১ বছর</SelectItem>
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

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">সাজানো</label>
                      <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
                        const [by, order] = v.split('-');
                        setSortBy(by as any);
                        setSortOrder(order as any);
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">তারিখ (নতুন আগে)</SelectItem>
                          <SelectItem value="date-asc">তারিখ (পুরাতন আগে)</SelectItem>
                          <SelectItem value="amount-desc">পরিমাণ (বেশি আগে)</SelectItem>
                          <SelectItem value="amount-asc">পরিমাণ (কম আগে)</SelectItem>
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
        </div>

        {/* Transaction List by Month */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">কোনো লেনদেন পাওয়া যায়নি</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                ফিল্টার মুছুন
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedTransactions.map((group) => {
              const isExpanded = !collapsedMonths.has(group.key);
              
              return (
                <Card key={group.key} className="overflow-hidden">
                  <button
                    onClick={() => toggleMonth(group.key)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium">{group.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.transactions.length}টি লেনদেন
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-income">+{formatCurrency(group.income)}</p>
                        <p className="text-sm text-expense">-{formatCurrency(group.expense)}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border divide-y divide-border">
                          {group.transactions.map((transaction) => {
                            const category = getCategoryInfo(transaction.type, transaction.category);
                            
                            return (
                              <div
                                key={transaction.id}
                                className="p-4 flex items-center gap-3"
                              >
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                                  {category.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{category.label}</span>
                                    <span>•</span>
                                    <span>{formatShortDate(transaction.transaction_date)}</span>
                                  </div>
                                </div>
                                
                                <p className={`font-semibold text-sm ${
                                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                                }`}>
                                  {transaction.type === 'income' ? '+' : '-'}
                                  {formatCurrency(Number(transaction.amount))}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
