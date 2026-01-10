import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { AIChatbot } from '@/components/AIChatbot';
import { FloatingActions } from '@/components/FloatingActions';
import { BottomNav } from '@/components/BottomNav';
import { StatsView } from '@/components/StatsView';
import { AccountsView } from '@/components/AccountsView';
import { LoansView } from '@/components/LoansView';
import { CreditCardsView } from '@/components/CreditCardsView';
import { SettingsView } from '@/components/SettingsView';
import { RecurringView } from '@/components/RecurringView';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { SavingsGoalsView } from '@/components/SavingsGoalsView';
import { ReportsView } from '@/components/ReportsView';
import { InvestmentsView } from '@/components/InvestmentsView';
import { AdminUsersView } from '@/components/AdminUsersView';
import { Onboarding } from '@/components/Onboarding';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isAdmin, completeOnboarding } = useUserProfile();
  
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  } = useTransactions();

  const {
    accounts,
    addToBalance,
    deductFromBalance,
    getDefaultAccount,
  } = useAccounts();

  useBudgetAlerts({ transactions, enabled: true });

  const handleAddTransaction = useCallback(async (transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    transaction_date?: string;
    account_id?: string;
  }) => {
    let accountId = transaction.account_id;
    if (!accountId) {
      const defaultAccount = getDefaultAccount();
      if (defaultAccount) {
        accountId = defaultAccount.id;
      }
    }

    const result = await addTransaction({
      ...transaction,
      account_id: accountId,
    } as any);

    if (result && accountId) {
      if (transaction.type === 'income') {
        await addToBalance(accountId, transaction.amount);
      } else {
        await deductFromBalance(accountId, transaction.amount);
      }
    }

    return result;
  }, [addTransaction, addToBalance, deductFromBalance, getDefaultAccount]);

  const handleUpdateAccountBalance = useCallback(async (accountId: string, amount: number, isAddition: boolean) => {
    if (isAddition) {
      return await addToBalance(accountId, amount);
    } else {
      return await deductFromBalance(accountId, amount);
    }
  }, [addToBalance, deductFromBalance]);

  if (authLoading || profileLoading) {
    return <LoadingSpinner fullScreen message="Khorcha AI লোড হচ্ছে..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show onboarding for first-time users
  if (profile && !profile.has_completed_onboarding) {
    return (
      <AnimatePresence>
        <Onboarding onComplete={completeOnboarding} />
      </AnimatePresence>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Motivational Quote */}
            <MotivationalQuote />
            
            <BalanceCard
              balance={balance}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
            
            <section>
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                সাম্প্রতিক লেনদেন
              </h2>
              <TransactionList
                transactions={transactions.slice(0, 10)}
                onDelete={deleteTransaction}
                onEdit={updateTransaction}
                isLoading={isLoading}
              />
            </section>
          </>
        );
      case 'stats':
        return <StatsView transactions={transactions} />;
      case 'reports':
        return <ReportsView transactions={transactions} />;
      case 'goals':
        return <SavingsGoalsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'recurring':
        return <RecurringView />;
      case 'credit-cards':
        return <CreditCardsView />;
      case 'loans':
        return <LoansView />;
      case 'accounts':
        return <AccountsView />;
      case 'admin':
        return <AdminUsersView />;
      case 'settings':
        return <SettingsView transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      <Header />
      
      {/* Desktop Layout */}
      <div className="lg:flex lg:min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card lg:p-4 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
          <DesktopNav activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 space-y-6 max-w-lg lg:max-w-4xl lg:px-8">
          {renderContent()}
        </main>
      </div>

      {activeTab === 'home' && (
        <FloatingActions
          onOpenManual={() => setShowManualForm(true)}
          onOpenAI={() => setShowAIChat(true)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <AnimatePresence>
        {showManualForm && (
          <ManualEntryForm
            onSubmit={handleAddTransaction}
            onClose={() => setShowManualForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIChat && (
          <AIChatbot
            onAddTransaction={handleAddTransaction}
            onClose={() => setShowAIChat(false)}
            accounts={accounts}
            onUpdateAccountBalance={handleUpdateAccountBalance}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Desktop Navigation Component
import { Home, BarChart3, Wallet, HandCoins, CreditCard, Settings, RefreshCw, FileText, Target, LineChart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const desktopNavItems = [
  { id: 'home', label: 'হোম', icon: Home },
  { id: 'stats', label: 'স্ট্যাটস', icon: BarChart3 },
  { id: 'reports', label: 'রিপোর্ট', icon: FileText },
  { id: 'goals', label: 'সেভিংস গোল', icon: Target },
  { id: 'investments', label: 'বিনিয়োগ', icon: LineChart },
  { id: 'recurring', label: 'রিকারিং', icon: RefreshCw },
  { id: 'credit-cards', label: 'ক্রেডিট কার্ড', icon: CreditCard },
  { id: 'loans', label: 'ধার', icon: HandCoins },
  { id: 'accounts', label: 'অ্যাকাউন্ট', icon: Wallet },
  { id: 'admin', label: 'অ্যাডমিন', icon: ShieldCheck },
  { id: 'settings', label: 'সেটিংস', icon: Settings },
];

const DesktopNav = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  return (
    <nav className="space-y-2">
      {desktopNavItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
              isActive 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="desktopActiveTab"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Index;
