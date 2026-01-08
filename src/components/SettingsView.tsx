import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Shield, HelpCircle, Sparkles, Target, RefreshCw, Download, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetView } from './BudgetView';
import { RecurringView } from './RecurringView';
import { ExportView } from './ExportView';
import { Transaction } from '@/hooks/useTransactions';

type SettingsSection = 'main' | 'budget' | 'recurring' | 'export';

interface SettingsViewProps {
  transactions?: Transaction[];
}

export const SettingsView = ({ transactions = [] }: SettingsViewProps) => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const menuItems = [
    { 
      id: 'budget' as const, 
      icon: Target, 
      label: 'বাজেট সীমা', 
      description: 'ক্যাটাগরি অনুযায়ী খরচের লিমিট সেট করুন',
      color: 'text-primary'
    },
    { 
      id: 'recurring' as const, 
      icon: RefreshCw, 
      label: 'রিকারিং লেনদেন', 
      description: 'মাসিক বিল, বেতন স্বয়ংক্রিয়ভাবে যোগ',
      color: 'text-income'
    },
    { 
      id: 'export' as const, 
      icon: Download, 
      label: 'রিপোর্ট এক্সপোর্ট', 
      description: 'CSV বা TXT ফরম্যাটে ডাউনলোড করুন',
      color: 'text-accent-foreground'
    },
  ];

  const otherItems = [
    { icon: User, label: 'প্রোফাইল', description: 'আপনার তথ্য পরিবর্তন করুন', disabled: true },
    { icon: Shield, label: 'নিরাপত্তা', description: 'পাসওয়ার্ড পরিবর্তন করুন', disabled: true },
    { icon: HelpCircle, label: 'সাহায্য', description: 'সাধারণ প্রশ্ন ও উত্তর', disabled: true },
  ];

  if (activeSection !== 'main') {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setActiveSection('main')}
          className="gap-2 text-muted-foreground"
        >
          ← ফিরে যান
        </Button>
        
        {activeSection === 'budget' && <BudgetView transactions={transactions} />}
        {activeSection === 'recurring' && <RecurringView />}
        {activeSection === 'export' && <ExportView transactions={transactions} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Khorcha AI ব্যবহারকারী</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Feature Items */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground px-1">ফিচারসমূহ</p>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 shadow-card hover:shadow-float cursor-pointer transition-all"
                onClick={() => setActiveSection(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Other Menu Items */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground px-1">অন্যান্য</p>
        {otherItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + menuItems.length) * 0.1 }}
            >
              <Card className="p-4 shadow-card opacity-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                    শীঘ্রই
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          className="w-full h-12 text-expense border-expense/20 hover:bg-expense/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          লগআউট
        </Button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        Khorcha AI v1.0.0 • Made with ❤️ in Bangladesh
      </p>
    </div>
  );
};
