import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Plus, CreditCard, Trash2, Receipt, Calendar, AlertTriangle } from 'lucide-react';
import { format, setDate, isAfter, isBefore, addMonths } from 'date-fns';
import { bn } from 'date-fns/locale';

const CARD_COLORS = [
  { value: '#8B5CF6', label: 'বেগুনি' },
  { value: '#3B82F6', label: 'নীল' },
  { value: '#10B981', label: 'সবুজ' },
  { value: '#F59E0B', label: 'কমলা' },
  { value: '#EF4444', label: 'লাল' },
  { value: '#EC4899', label: 'গোলাপী' },
  { value: '#6366F1', label: 'ইন্ডিগো' },
  { value: '#1F2937', label: 'কালো' },
];

export const CreditCardsView = () => {
  const { 
    creditCards, 
    isLoading, 
    addCreditCard, 
    payBill, 
    deleteCreditCard,
    totalCreditLimit,
    totalBalance,
    availableCredit 
  } = useCreditCards();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  
  const [formData, setFormData] = useState({
    card_name: '',
    card_number_last4: '',
    credit_limit: '',
    bill_generation_date: '1',
    due_date: '15',
    color: '#8B5CF6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.card_name || !formData.credit_limit) return;

    await addCreditCard({
      card_name: formData.card_name,
      card_number_last4: formData.card_number_last4,
      credit_limit: parseFloat(formData.credit_limit),
      bill_generation_date: parseInt(formData.bill_generation_date),
      due_date: parseInt(formData.due_date),
      color: formData.color,
    });

    setFormData({
      card_name: '',
      card_number_last4: '',
      credit_limit: '',
      bill_generation_date: '1',
      due_date: '15',
      color: '#8B5CF6',
    });
    setIsAddOpen(false);
  };

  const handlePayBill = async () => {
    if (!selectedCard || !payAmount) return;
    await payBill(selectedCard, parseFloat(payAmount));
    setPayAmount('');
    setSelectedCard(null);
    setIsPayOpen(false);
  };

  const getNextDueDate = (dueDay: number) => {
    const today = new Date();
    let dueDate = setDate(today, dueDay);
    if (isBefore(dueDate, today)) {
      dueDate = setDate(addMonths(today, 1), dueDay);
    }
    return dueDate;
  };

  const getDaysUntilDue = (dueDay: number) => {
    const dueDate = getNextDueDate(dueDay);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3 text-center">
            <p className="text-xs opacity-80">মোট লিমিট</p>
            <p className="text-lg font-bold">৳{totalCreditLimit.toLocaleString('bn-BD')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-3 text-center">
            <p className="text-xs opacity-80">বকেয়া</p>
            <p className="text-lg font-bold">৳{totalBalance.toLocaleString('bn-BD')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-3 text-center">
            <p className="text-xs opacity-80">ব্যবহারযোগ্য</p>
            <p className="text-lg font-bold">৳{availableCredit.toLocaleString('bn-BD')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Card Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            নতুন ক্রেডিট কার্ড যোগ করুন
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন ক্রেডিট কার্ড</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>কার্ডের নাম *</Label>
              <Input
                value={formData.card_name}
                onChange={(e) => setFormData(prev => ({ ...prev, card_name: e.target.value }))}
                placeholder="যেমন: BRAC Visa"
                required
              />
            </div>
            <div>
              <Label>কার্ড নম্বর (শেষ ৪ ডিজিট)</Label>
              <Input
                value={formData.card_number_last4}
                onChange={(e) => setFormData(prev => ({ ...prev, card_number_last4: e.target.value.slice(0, 4) }))}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <Label>ক্রেডিট লিমিট (৳) *</Label>
              <Input
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                placeholder="100000"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>বিল তারিখ</Label>
                <Select
                  value={formData.bill_generation_date}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bill_generation_date: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>পেমেন্ট তারিখ</Label>
                <Select
                  value={formData.due_date}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, due_date: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>কার্ডের রং</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">যোগ করুন</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pay Bill Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>বিল পেমেন্ট</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>পেমেন্ট পরিমাণ (৳)</Label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="পরিমাণ লিখুন"
              />
            </div>
            <Button onClick={handlePayBill} className="w-full">পেমেন্ট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Cards List */}
      <div className="space-y-3">
        {creditCards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>কোনো ক্রেডিট কার্ড নেই</p>
            </CardContent>
          </Card>
        ) : (
          creditCards.map(card => {
            const usedPercent = (Number(card.current_balance) / Number(card.credit_limit)) * 100;
            const daysUntilDue = getDaysUntilDue(card.due_date);
            const isDueSoon = daysUntilDue <= 7;
            const nextDueDate = getNextDueDate(card.due_date);

            return (
              <Card 
                key={card.id} 
                className="overflow-hidden"
                style={{ borderLeftColor: card.color || '#8B5CF6', borderLeftWidth: '4px' }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{card.card_name}</h3>
                      {card.card_number_last4 && (
                        <p className="text-sm text-muted-foreground">•••• {card.card_number_last4}</p>
                      )}
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: card.color || '#8B5CF6' }}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Balance Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>বকেয়া: ৳{Number(card.current_balance).toLocaleString('bn-BD')}</span>
                      <span>লিমিট: ৳{Number(card.credit_limit).toLocaleString('bn-BD')}</span>
                    </div>
                    <Progress value={usedPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {usedPercent.toFixed(0)}% ব্যবহৃত
                    </p>
                  </div>

                  {/* Due Date Info */}
                  <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${isDueSoon ? 'bg-red-50 text-red-700' : 'bg-muted'}`}>
                    {isDueSoon && <AlertTriangle className="w-4 h-4" />}
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      পরবর্তী পেমেন্ট: {format(nextDueDate, 'd MMMM', { locale: bn })} 
                      ({daysUntilDue} দিন বাকি)
                    </span>
                  </div>

                  {/* Dates Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>
                      <Receipt className="w-3 h-3 inline mr-1" />
                      বিল তারিখ: প্রতি মাসের {card.bill_generation_date}
                    </div>
                    <div>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      পেমেন্ট তারিখ: প্রতি মাসের {card.due_date}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedCard(card.id);
                        setIsPayOpen(true);
                      }}
                      disabled={Number(card.current_balance) === 0}
                    >
                      বিল পেমেন্ট
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCreditCard(card.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
