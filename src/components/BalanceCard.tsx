import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const BalanceCard = ({ balance, totalIncome, totalExpense }: BalanceCardProps) => {
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <Card className="overflow-hidden border-0 shadow-float relative">
        {/* Background gradient with pattern */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative p-6 text-primary-foreground">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Wallet className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="text-sm font-medium opacity-90">মোট ব্যালেন্স</span>
                <p className="text-xs opacity-60">এই মাসে</p>
              </div>
            </div>
            {savingsRate > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <span className="text-xs font-medium">
                  💰 {savingsRate.toFixed(0)}% সঞ্চয়
                </span>
              </motion.div>
            )}
          </div>
          
          {/* Balance Amount */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="text-4xl lg:text-5xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </div>
          </motion.div>

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-4 transition-colors cursor-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-green-400/30 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-200" />
                </div>
                <span className="text-sm font-medium opacity-90">আয়</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-4 transition-colors cursor-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-400/30 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-red-200" />
                </div>
                <span className="text-sm font-medium opacity-90">খরচ</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
