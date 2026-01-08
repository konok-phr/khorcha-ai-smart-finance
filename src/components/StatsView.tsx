import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats, DateRange } from '@/hooks/useStats';
import { Transaction } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/types/transaction';
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

export const StatsView = ({ transactions }: StatsViewProps) => {
  const [range, setRange] = useState<DateRange>('monthly');
  const stats = useStats(transactions, range);

  const ranges: { id: DateRange; label: string }[] = [
    { id: 'daily', label: 'আজ' },
    { id: 'weekly', label: 'সপ্তাহ' },
    { id: 'monthly', label: 'মাস' },
  ];

  const pieData = stats.categoryBreakdown.map((item, idx) => ({
    name: getCategoryLabel(item.category),
    value: item.amount,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl">
        {ranges.map(r => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              range === r.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

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
