import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Bot, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface AIChatbotProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

// Simple AI parser to extract transaction info from Bengali/English text
const parseTransactionFromMessage = (message: string): Omit<Transaction, 'id' | 'createdAt'> | null => {
  const lowerMessage = message.toLowerCase();
  
  // Detect transaction type
  const isExpense = lowerMessage.includes('খরচ') || lowerMessage.includes('কিন') || 
    lowerMessage.includes('দিয়েছি') || lowerMessage.includes('spent') || 
    lowerMessage.includes('paid') || lowerMessage.includes('bought');
  
  const isIncome = lowerMessage.includes('আয়') || lowerMessage.includes('পেয়েছি') || 
    lowerMessage.includes('বেতন') || lowerMessage.includes('received') || 
    lowerMessage.includes('earned') || lowerMessage.includes('salary');

  if (!isExpense && !isIncome) return null;

  // Extract amount (look for numbers)
  const amountMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
  
  if (amount <= 0) return null;

  // Detect category
  const type = isIncome ? 'income' : 'expense';
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  let category = 'others';
  
  // Expense categories detection
  if (lowerMessage.includes('খাবার') || lowerMessage.includes('food') || lowerMessage.includes('রেস্টুরেন্ট')) {
    category = 'food';
  } else if (lowerMessage.includes('যাতায়াত') || lowerMessage.includes('transport') || lowerMessage.includes('uber') || lowerMessage.includes('রিক্সা')) {
    category = 'transport';
  } else if (lowerMessage.includes('শপিং') || lowerMessage.includes('shopping') || lowerMessage.includes('কেনা')) {
    category = 'shopping';
  } else if (lowerMessage.includes('বিল') || lowerMessage.includes('bill') || lowerMessage.includes('ইলেকট্রিক')) {
    category = 'bills';
  } else if (lowerMessage.includes('স্বাস্থ্য') || lowerMessage.includes('health') || lowerMessage.includes('ডাক্তার') || lowerMessage.includes('ওষুধ')) {
    category = 'health';
  } else if (lowerMessage.includes('বেতন') || lowerMessage.includes('salary')) {
    category = 'salary';
  } else if (lowerMessage.includes('ব্যবসা') || lowerMessage.includes('business')) {
    category = 'business';
  } else if (lowerMessage.includes('ফ্রিল্যান্স') || lowerMessage.includes('freelance')) {
    category = 'freelance';
  }

  return {
    type,
    amount,
    category,
    description: message.slice(0, 50),
    date: new Date(),
  };
};

export const AIChatbot = ({ onAddTransaction, onClose }: AIChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'আসসালামু আলাইকুম! 👋 আমি Khorcha AI। আপনার লেনদেন রেকর্ড করতে আমাকে বলুন। যেমন: "আজ 500 টাকা খাবারে খরচ করেছি" বা "25000 টাকা বেতন পেয়েছি"',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transaction = parseTransactionFromMessage(input);
    
    let responseContent: string;
    
    if (transaction) {
      onAddTransaction(transaction);
      const categoryInfo = transaction.type === 'income' 
        ? INCOME_CATEGORIES.find(c => c.id === transaction.category)
        : EXPENSE_CATEGORIES.find(c => c.id === transaction.category);
      
      responseContent = `✅ লেনদেন রেকর্ড করা হয়েছে!\n\n${categoryInfo?.icon} ${transaction.type === 'income' ? 'আয়' : 'খরচ'}: ৳${transaction.amount.toLocaleString('bn-BD')}\n📁 ক্যাটাগরি: ${categoryInfo?.label || transaction.category}\n\nআর কিছু যোগ করতে চান?`;
    } else {
      responseContent = 'দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে এভাবে বলুন:\n\n• "500 টাকা খাবারে খরচ করেছি"\n• "বাসে 50 টাকা দিয়েছি"\n• "25000 টাকা বেতন পেয়েছি"';
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background sm:items-center sm:justify-center sm:p-4 sm:bg-foreground/20 sm:backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="flex flex-col h-full sm:h-[600px] sm:max-h-[80vh] w-full sm:max-w-md sm:rounded-2xl overflow-hidden"
      >
        <Card className="flex flex-col h-full border-0 sm:border rounded-none sm:rounded-2xl shadow-float">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border gradient-primary">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-foreground">Khorcha AI</h3>
              <p className="text-xs text-primary-foreground/70">আপনার স্মার্ট সহায়ক</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-secondary text-secondary-foreground rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="আপনার লেনদেন লিখুন..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim()}
                className="gradient-primary shadow-button shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
