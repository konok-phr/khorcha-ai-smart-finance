import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Bot, User, Camera, Check, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Account } from '@/hooks/useAccounts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transaction_date?: string;
  account_name?: string | null;
  confirm?: boolean;
  question?: string;
}

interface AIChatbotProps {
  onAddTransaction: (transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    transaction_date?: string;
    account_id?: string;
  }) => Promise<any>;
  onClose: () => void;
  accounts?: Account[];
  onUpdateAccountBalance?: (accountId: string, amount: number, isAddition: boolean) => Promise<boolean>;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const AIChatbot = ({ onAddTransaction, onClose, accounts = [], onUpdateAccountBalance }: AIChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'আসসালামু আলাইকুম! 👋 আমি Khorcha AI।\n\n🗣️ সহজ ভাষায় বলুন:\n• "500 tk rikshaw"\n• "uber 150"\n• "bkash e 1000 pelam"\n\n📸 রিসিটের ছবি দিতে পারেন\n📅 তারিখ: "gotokal", "5 tarikh"',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবি ৫MB এর কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const findAccountByName = (accountName: string | null | undefined): Account | undefined => {
    if (!accountName || !accounts.length) return undefined;
    
    const lowerName = accountName.toLowerCase();
    return accounts.find(a => 
      a.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(a.name.toLowerCase()) ||
      (a.type === 'cash' && (lowerName.includes('cash') || lowerName.includes('নগদ'))) ||
      (a.type === 'mobile_banking' && (
        lowerName.includes('bkash') || lowerName.includes('বিকাশ') ||
        lowerName.includes('nagad') || lowerName.includes('নগদ') ||
        lowerName.includes('rocket')
      ))
    );
  };

  const getDefaultAccount = (): Account | undefined => {
    return accounts.find(a => a.is_default) || accounts.find(a => a.type === 'cash') || accounts[0];
  };

  const parseTransaction = (text: string): TransactionData | null => {
    try {
      // Match JSON with optional confirm field
      const jsonMatch = text.match(/\{[^{}]*"type"[^{}]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.type && parsed.amount && parsed.category) {
          return parsed as TransactionData;
        }
      }
    } catch {
      // Not a transaction response
    }
    return null;
  };

  // Handle confirmation response
  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingTransaction) return;
    
    if (confirmed) {
      await addTransactionToDb(pendingTransaction);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ বাতিল করা হয়েছে। আবার বলুন কি যোগ করতে চান?'
      }]);
    }
    setPendingTransaction(null);
  };

  // Add transaction to database
  const addTransactionToDb = async (transaction: TransactionData) => {
    let targetAccount = findAccountByName(transaction.account_name);
    if (!targetAccount) {
      targetAccount = getDefaultAccount();
    }

    const transactionData: any = {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
    };

    if (transaction.transaction_date) {
      transactionData.transaction_date = transaction.transaction_date;
    }

    if (targetAccount) {
      transactionData.account_id = targetAccount.id;
    }

    const result = await onAddTransaction(transactionData);
    
    if (result) {
      if (targetAccount && onUpdateAccountBalance) {
        const isAddition = transaction.type === 'income';
        await onUpdateAccountBalance(targetAccount.id, transaction.amount, isAddition);
      }

      const categoryLabels: Record<string, string> = {
        food: 'খাবার', transport: 'যাতায়াত', shopping: 'শপিং',
        bills: 'বিল', health: 'স্বাস্থ্য', entertainment: 'বিনোদন',
        education: 'শিক্ষা', salary: 'বেতন', business: 'ব্যবসা',
        investment: 'বিনিয়োগ', freelance: 'ফ্রিল্যান্স', gift: 'উপহার', others: 'অন্যান্য'
      };
      
      const accountInfo = targetAccount ? `\n💳 ${targetAccount.name}` : '';
      const dateInfo = transaction.transaction_date ? `\n📅 ${transaction.transaction_date}` : '';
      
      toast.success('✅ লেনদেন সংরক্ষিত!');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ সংরক্ষিত!\n\n${transaction.type === 'income' ? '💰' : '💸'} ৳${transaction.amount.toLocaleString('bn-BD')}\n📁 ${categoryLabels[transaction.category] || transaction.category}${dateInfo}${accountInfo}`
      }]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'এই রিসিট দেখে লেনদেন যোগ করুন',
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    const userImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      // Build message content
      let messageContent: any;
      if (userImage) {
        messageContent = [
          { type: 'text', text: userInput || 'এই রিসিট/বিল থেকে লেনদেনের তথ্য বের করো' },
          { type: 'image_url', image_url: { url: userImage } }
        ];
      } else {
        messageContent = userInput;
      }

      const apiMessages = [...messages, { role: 'user' as const, content: messageContent, image: userImage }]
        .filter((m): m is ChatMessage => 'id' in m)
        .map(m => ({
          role: m.role,
          content: m.image ? [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.image } }
          ] : m.content,
        }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI সার্ভিসে সমস্যা হয়েছে');
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Check if response contains a transaction
      const transaction = parseTransaction(assistantContent);
      if (transaction) {
        // Check if AI is asking for confirmation
        if (transaction.confirm && transaction.question) {
          setPendingTransaction(transaction);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: `🤔 ${transaction.question}` } : m
            )
          );
        } else {
          // Direct add without confirmation
          setMessages(prev => prev.filter(m => m.id !== assistantId));
          await addTransactionToDb(transaction);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'AI সার্ভিসে সমস্যা হয়েছে');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন। 🙏',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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
              <p className="text-xs text-primary-foreground/70">📸 রিসিট স্ক্যান • 📅 তারিখ বোঝে</p>
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
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-secondary text-secondary-foreground rounded-tl-none'
                    }`}
                  >
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="Receipt" 
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && messages[messages.length - 1]?.content === '' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
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

          {/* Image Preview */}
          {selectedImage && (
            <div className="px-4 py-2 border-t border-border">
              <div className="relative inline-block">
                <img src={selectedImage} alt="Selected" className="h-16 rounded-lg" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-expense text-expense-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Buttons */}
          {pendingTransaction && (
            <div className="px-4 py-3 border-t border-border bg-secondary/50">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmation(true)}
                  className="flex-1 bg-income hover:bg-income/90 text-income-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  হ্যাঁ, যোগ করুন
                </Button>
                <Button
                  onClick={() => handleConfirmation(false)}
                  variant="outline"
                  className="flex-1 border-expense text-expense hover:bg-expense/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  না
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping || !!pendingTransaction}
                className="shrink-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={pendingTransaction ? "উপরে হ্যাঁ/না চাপুন..." : "লিখুন বা ছবি দিন..."}
                className="flex-1"
                disabled={isTyping || !!pendingTransaction}
              />
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && !selectedImage) || isTyping || !!pendingTransaction}
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
