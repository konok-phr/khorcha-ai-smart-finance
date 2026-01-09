import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BENGALI_MONEY_QUOTES = [
  { quote: "সঞ্চয় হলো ভবিষ্যতের নিরাপত্তা।", author: "প্রবাদ" },
  { quote: "আয় অনুযায়ী ব্যয় কর, তাহলে কখনো ঋণী হবে না।", author: "বাংলা প্রবাদ" },
  { quote: "একটি টাকা বাঁচানো মানে একটি টাকা উপার্জন করা।", author: "বেঞ্জামিন ফ্র্যাঙ্কলিন" },
  { quote: "ধনী হতে চাইলে প্রথমে সঞ্চয় করতে শেখো।", author: "ওয়ারেন বাফেট" },
  { quote: "আজকের ছোট সঞ্চয় আগামীকালের বড় সম্পদ।", author: "প্রবাদ" },
  { quote: "টাকা গাছে ধরে না, তাই হিসাব করে খরচ করো।", author: "বাংলা প্রবাদ" },
  { quote: "যে টাকার মূল্য বোঝে, সে কখনো দরিদ্র হয় না।", author: "প্রবাদ" },
  { quote: "প্রয়োজন আর চাহিদার মধ্যে পার্থক্য বোঝো।", author: "আর্থিক জ্ঞান" },
  { quote: "বাজেট হলো আর্থিক স্বাধীনতার প্রথম পদক্ষেপ।", author: "প্রবাদ" },
  { quote: "আজ যা সঞ্চয় করবে, কাল তা তোমাকে রক্ষা করবে।", author: "প্রবাদ" },
  { quote: "অপচয় করো না, অভাব আসবে না।", author: "বাংলা প্রবাদ" },
  { quote: "ছোট ছোট খরচ এড়িয়ে যাও, বড় সঞ্চয় হবে।", author: "প্রবাদ" },
  { quote: "ধৈর্য ধরো, সঞ্চয় করো, সফল হবে।", author: "আর্থিক জ্ঞান" },
  { quote: "নিজের ইনকাম থেকে প্রথমে সঞ্চয় করো, বাকিটা খরচ করো।", author: "রিচ ড্যাড পুওর ড্যাড" },
  { quote: "আর্থিক শৃঙ্খলা জীবনে শান্তি আনে।", author: "প্রবাদ" },
  { quote: "টাকা তোমার দাস হোক, তুমি টাকার দাস নও।", author: "প্রবাদ" },
  { quote: "জরুরি তহবিল না থাকলে জরুরি অবস্থায় ভুগতে হয়।", author: "আর্থিক জ্ঞান" },
  { quote: "খরচ কমাও, সঞ্চয় বাড়াও, স্বপ্ন পূরণ করো।", author: "প্রবাদ" },
  { quote: "আয়ের ২০% সঞ্চয় করো, বাকি ৮০% দিয়ে চলো।", author: "৮০/২০ নিয়ম" },
  { quote: "ঋণ এড়িয়ে চলো, স্বাধীনতা পাবে।", author: "প্রবাদ" },
];

export const MotivationalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * BENGALI_MONEY_QUOTES.length);
    return BENGALI_MONEY_QUOTES[randomIndex];
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const getNewQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * BENGALI_MONEY_QUOTES.length);
      } while (BENGALI_MONEY_QUOTES[newIndex].quote === currentQuote.quote);
      setCurrentQuote(BENGALI_MONEY_QUOTES[newIndex]);
      setIsAnimating(false);
    }, 300);
  };

  // Auto-change quote every 30 seconds
  useEffect(() => {
    const interval = setInterval(getNewQuote, 30000);
    return () => clearInterval(interval);
  }, [currentQuote]);

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Quote className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.quote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium text-foreground leading-relaxed">
                "{currentQuote.quote}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                — {currentQuote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={getNewQuote}
          disabled={isAnimating}
          className="shrink-0 h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </Card>
  );
};
