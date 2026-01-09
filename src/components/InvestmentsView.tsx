import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Plus, Edit2, Trash2, 
  ChevronDown, ChevronUp, LineChart, Coins, Building2,
  CircleDollarSign, Bitcoin, Package, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useInvestments, Investment } from '@/hooks/useInvestments';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

const investmentTypes = [
  { value: 'stock', label: 'স্টক', icon: LineChart },
  { value: 'mutual_fund', label: 'মিউচুয়াল ফান্ড', icon: Building2 },
  { value: 'fd', label: 'ফিক্সড ডিপোজিট', icon: CircleDollarSign },
  { value: 'gold', label: 'সোনা', icon: Coins },
  { value: 'crypto', label: 'ক্রিপ্টো', icon: Bitcoin },
  { value: 'other', label: 'অন্যান্য', icon: Package },
];

const getTypeIcon = (type: string) => {
  const typeInfo = investmentTypes.find(t => t.value === type);
  return typeInfo?.icon || Package;
};

const getTypeLabel = (type: string) => {
  const typeInfo = investmentTypes.find(t => t.value === type);
  return typeInfo?.label || type;
};

export const InvestmentsView = () => {
  const { investments, isLoading, addInvestment, updateInvestment, deleteInvestment, stats } = useInvestments();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock' as Investment['type'],
    symbol: '',
    quantity: '',
    buy_price: '',
    current_price: '',
    buy_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'stock',
      symbol: '',
      quantity: '',
      buy_price: '',
      current_price: '',
      buy_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingInvestment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const investmentData = {
      name: formData.name,
      type: formData.type,
      symbol: formData.symbol || undefined,
      quantity: parseFloat(formData.quantity) || 0,
      buy_price: parseFloat(formData.buy_price) || 0,
      current_price: parseFloat(formData.current_price) || 0,
      buy_date: formData.buy_date,
      notes: formData.notes || undefined,
      is_active: true,
    };

    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, investmentData);
    } else {
      await addInvestment(investmentData);
    }
    
    setIsAddOpen(false);
    resetForm();
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol || '',
      quantity: investment.quantity.toString(),
      buy_price: investment.buy_price.toString(),
      current_price: investment.current_price.toString(),
      buy_date: investment.buy_date,
      notes: investment.notes || '',
    });
    setEditingInvestment(investment);
    setIsAddOpen(true);
  };

  const handleUpdatePrice = async (investment: Investment, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      await updateInvestment(investment.id, { current_price: price });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-6">
          <h3 className="text-sm font-medium text-primary-foreground/80">মোট পোর্টফোলিও মূল্য</h3>
          <p className="text-3xl font-bold text-primary-foreground mt-1">
            {formatCurrency(stats.currentValue)}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              {stats.totalGainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span className={`text-sm font-medium ${stats.totalGainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(Math.abs(stats.totalGainLoss))} ({stats.totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-2">
            মোট বিনিয়োগ: {formatCurrency(stats.totalInvested)}
          </p>
        </div>
      </Card>

      {/* Add Button */}
      <Button 
        onClick={() => { resetForm(); setIsAddOpen(true); }}
        className="w-full gradient-primary"
      >
        <Plus className="w-4 h-4 mr-2" />
        নতুন বিনিয়োগ যোগ করুন
      </Button>

      {/* Investments List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">আপনার বিনিয়োগসমূহ</h3>
        
        {investments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <LineChart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">কোনো বিনিয়োগ নেই</p>
              <p className="text-sm text-muted-foreground mt-1">
                স্টক, মিউচুয়াল ফান্ড, সোনা ইত্যাদি ট্র্যাক করুন
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {investments.map((investment, index) => {
              const Icon = getTypeIcon(investment.type);
              const investedAmount = investment.buy_price * investment.quantity;
              const currentValue = investment.current_price * investment.quantity;
              const gainLoss = currentValue - investedAmount;
              const gainLossPercent = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;
              const isExpanded = expandedId === investment.id;

              return (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : investment.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{investment.name}</p>
                              <div className="flex items-center gap-1">
                                {gainLoss >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {gainLossPercent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                {getTypeLabel(investment.type)}
                                {investment.symbol && ` • ${investment.symbol}`}
                              </p>
                              <p className="text-sm font-medium">{formatCurrency(currentValue)}</p>
                            </div>
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
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-border">
                              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">পরিমাণ</p>
                                  <p className="font-medium">{investment.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ক্রয় মূল্য</p>
                                  <p className="font-medium">{formatCurrency(investment.buy_price)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">বর্তমান মূল্য</p>
                                  <p className="font-medium">{formatCurrency(investment.current_price)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">লাভ/ক্ষতি</p>
                                  <p className={`font-medium ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">মোট বিনিয়োগ</p>
                                  <p className="font-medium">{formatCurrency(investedAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">ক্রয় তারিখ</p>
                                  <p className="font-medium">
                                    {format(new Date(investment.buy_date), 'd MMM yyyy', { locale: bn })}
                                  </p>
                                </div>
                              </div>

                              {investment.notes && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm text-muted-foreground">{investment.notes}</p>
                                </div>
                              )}

                              {/* Update Price */}
                              <div className="mt-4 flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="নতুন মূল্য"
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdatePrice(investment, (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(investment)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => deleteInvestment(investment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>{editingInvestment ? 'বিনিয়োগ সম্পাদনা' : 'নতুন বিনিয়োগ'}</SheetTitle>
            <SheetDescription>
              আপনার বিনিয়োগের বিবরণ দিন
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6 overflow-y-auto max-h-[calc(90vh-120px)] pb-6">
            <div className="space-y-2">
              <Label>বিনিয়োগের নাম *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="যেমন: গ্রামীণফোন শেয়ার"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>ধরন *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Investment['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>সিম্বল/কোড</Label>
              <Input
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                placeholder="যেমন: GP, BRAC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>পরিমাণ *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  required
                  step="any"
                />
              </div>
              <div className="space-y-2">
                <Label>ক্রয় মূল্য (প্রতি ইউনিট) *</Label>
                <Input
                  type="number"
                  value={formData.buy_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, buy_price: e.target.value }))}
                  placeholder="০"
                  required
                  step="any"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বর্তমান মূল্য *</Label>
                <Input
                  type="number"
                  value={formData.current_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_price: e.target.value }))}
                  placeholder="০"
                  required
                  step="any"
                />
              </div>
              <div className="space-y-2">
                <Label>ক্রয় তারিখ *</Label>
                <Input
                  type="date"
                  value={formData.buy_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, buy_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>নোট</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="অতিরিক্ত তথ্য..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" className="flex-1 gradient-primary">
                {editingInvestment ? 'আপডেট করুন' : 'যোগ করুন'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};
