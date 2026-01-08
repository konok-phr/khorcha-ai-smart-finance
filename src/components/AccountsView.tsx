import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Trash2, Building2, Smartphone, Banknote, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account, useAccounts } from '@/hooks/useAccounts';

const ACCOUNT_TYPES = [
  { id: 'cash', label: 'নগদ', icon: '💵' },
  { id: 'bank', label: 'ব্যাংক', icon: '🏦' },
  { id: 'card', label: 'কার্ড', icon: '💳' },
  { id: 'mobile_banking', label: 'মোবাইল ব্যাংকিং', icon: '📱' },
  { id: 'other', label: 'অন্যান্য', icon: '💰' },
] as const;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const AccountsView = () => {
  const { accounts, isLoading, addAccount, deleteAccount } = useAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const typeInfo = ACCOUNT_TYPES.find(t => t.id === type);
    await addAccount({
      name,
      type,
      icon: typeInfo?.icon || '💰',
      color: '#10B981',
    });

    setName('');
    setType('bank');
    setShowAddForm(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  if (isLoading) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 gradient-hero text-primary-foreground shadow-float">
          <p className="text-sm opacity-80 mb-1">মোট ব্যালেন্স</p>
          <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-sm opacity-70 mt-2">{accounts.length}টি অ্যাকাউন্ট</p>
        </Card>
      </motion.div>

      {/* Add Account Button */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="w-full gradient-primary shadow-button"
      >
        <Plus className="w-4 h-4 mr-2" />
        নতুন অ্যাকাউন্ট যোগ করুন
      </Button>

      {/* Accounts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {accounts.map((account, index) => {
            const typeInfo = ACCOUNT_TYPES.find(t => t.id === account.type);
            
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                      {account.icon || typeInfo?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{typeInfo?.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(Number(account.balance))}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-expense"
                      onClick={() => deleteAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {accounts.length === 0 && (
          <Card className="p-8 text-center shadow-card">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">কোনো অ্যাকাউন্ট নেই</p>
            <p className="text-sm text-muted-foreground mt-1">
              আপনার ব্যাংক, কার্ড বা মোবাইল ব্যাংকিং অ্যাকাউন্ট যোগ করুন
            </p>
          </Card>
        )}
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
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
                  <h2 className="text-xl font-semibold">নতুন অ্যাকাউন্ট</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>অ্যাকাউন্টের ধরন</Label>
                    <Select value={type} onValueChange={(v) => setType(v as Account['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="flex items-center gap-2">
                              <span>{t.icon}</span>
                              <span>{t.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">অ্যাকাউন্টের নাম</Label>
                    <Input
                      id="name"
                      placeholder="যেমন: ডাচ বাংলা ব্যাংক"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-primary shadow-button">
                    <Plus className="w-4 h-4 mr-2" />
                    অ্যাকাউন্ট যোগ করুন
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
