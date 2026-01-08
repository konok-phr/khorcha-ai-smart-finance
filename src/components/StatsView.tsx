import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStats, DateRange } from '@/hooks/useStats';
import { Transaction } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/types/transaction';
import { Calendar, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, setMonth, setYear } from 'date-fns';
import { bn } from 'date-fns/locale';

interface StatsViewProps {
  transactions: Transaction[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryLabel = (categoryId: string) => {
  const cat = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
  return cat ? `${cat.icon} ${cat.label}` : categoryId;
};

// Generate month options (last 24 months)
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = subMonths(now, i);
    options.push({
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: bn }),
    });
  }
  return options;
};

// Generate year options (last 5 years)
const generateYearOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const y = now.getFullYear() - i;
    options.push({ value: y.toString(), label: `${y}` });
  }
  return options;
};

export const StatsView = ({ transactions }: StatsViewProps) => {
  const [rangeType, setRangeType] = useState<'preset' | 'custom'>('preset');
  const [presetRange, setPresetRange] = useState<DateRange>('monthly');
  const [customMode, setCustomMode] = useState<'single' | 'range'>('single');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [startMonth, setStartMonth] = useState(format(subMonths(new Date(), 5), 'yyyy-MM'));
  const [endMonth, setEndMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const yearOptions = useMemo(() => generateYearOptions(), []);

  // Calculate custom date range
  const { customStart, customEnd, effectiveRange } = useMemo(() => {
    if (rangeType === 'preset') {
      return { customStart: undefined, customEnd: undefined, effectiveRange: presetRange };
    }

    if (customMode === 'single') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      return {
        customStart: startOfMonth(d),
        customEnd: endOfMonth(d),
        effectiveRange: 'custom' as DateRange,
      };
    } else {
      const [sy, sm] = startMonth.split('-').map(Number);
      const [ey, em] = endMonth.split('-').map(Number);
      return {
        customStart: startOfMonth(new Date(sy, sm - 1, 1)),
        customEnd: endOfMonth(new Date(ey, em - 1, 1)),
        effectiveRange: 'custom' as DateRange,
      };
    }
  }, [rangeType, presetRange, customMode, selectedMonth, startMonth, endMonth]);

  const stats = useStats(transactions, effectiveRange, customStart, customEnd);

  const pieData = stats.categoryBreakdown.map((item, idx) => ({
    name: getCategoryLabel(item.category),
    value: item.amount,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="p-4 shadow-card space-y-3">
        {/* Quick Presets */}
        <div className="flex gap-2">
          {[
            { id: 'daily' as DateRange, label: 'আজ' },
            { id: 'weekly' as DateRange, label: 'সপ্তাহ' },
            { id: 'monthly' as DateRange, label: 'মাস' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRangeType('preset');
                setPresetRange(r.id);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                rangeType === 'preset' && presetRange === r.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setRangeType('custom')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              rangeType === 'custom'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            কাস্টম
          </button>
        </div>

        {/* Custom Date Selector */}
        {rangeType === 'custom' && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={customMode === 'single' ? 'default' : 'outline'}
                onClick={() => setCustomMode('single')}
                className="flex-1"
              >
                একটি মাস
              </Button>
              <Button
                size="sm"
                variant={customMode === 'range' ? 'default' : 'outline'}
                onClick={() => setCustomMode('range')}
                className="flex-1"
              >
                রেঞ্জ
              </Button>
            </div>

            {customMode === 'single' ? (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="মাস বাছুন" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="শুরু" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="শেষ" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Period Label */}
        <p className="text-sm text-muted-foreground text-center pt-1">
          📅 {stats.periodLabel}
        </p>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-income" />
              </div>
              <span className="text-sm text-muted-foreground">আয়</span>
            </div>
            <p className="text-xl font-bold text-income">{formatCurrency(stats.totalIncome)}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-expense" />
              </div>
              <span className="text-sm text-muted-foreground">খরচ</span>
            </div>
            <p className="text-xl font-bold text-expense">{formatCurrency(stats.totalExpense)}</p>
          </Card>
        </motion.div>
      </div>

      {/* Trend Chart */}
      {stats.dailyTrend.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {stats.periodLabel} - ট্রেন্ড
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyTrend}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `৳${v/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    name="আয়"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                    name="খরচ"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-4">ক্যাটাগরি অনুযায়ী খরচ</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {stats.categoryBreakdown.slice(0, 4).map((item, idx) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm flex-1 truncate">
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="text-sm font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {stats.transactionCount === 0 && (
        <Card className="p-8 text-center shadow-card">
          <p className="text-muted-foreground">এই সময়ে কোনো লেনদেন নেই</p>
        </Card>
      )}
    </div>
  );
};
