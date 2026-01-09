import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'কিভাবে নতুন লেনদেন যোগ করব?',
    answer: 'হোম স্ক্রিনে নিচের দিকে "+" বাটনে ক্লিক করুন। সেখান থেকে ম্যানুয়ালি বা AI এর মাধ্যমে লেনদেন যোগ করতে পারবেন।',
  },
  {
    question: 'AI চ্যাটবট কিভাবে কাজ করে?',
    answer: 'AI বাটনে ক্লিক করে চ্যাট খুলুন। বাংলায় বা ইংরেজিতে আপনার খরচ বলুন, যেমন "আজ ১০০ টাকা চা খেয়েছি"। AI স্বয়ংক্রিয়ভাবে সেটা লেনদেনে রূপান্তর করবে।',
  },
  {
    question: 'বাজেট সীমা কিভাবে সেট করব?',
    answer: 'সেটিংস থেকে "বাজেট সীমা" তে যান। সেখানে প্রতিটি ক্যাটাগরির জন্য মাসিক বাজেট সেট করতে পারবেন। বাজেট অতিক্রম করলে আপনাকে জানানো হবে।',
  },
  {
    question: 'রিকারিং লেনদেন কী?',
    answer: 'প্রতি মাসে যে খরচ বা আয় নিয়মিত হয় (যেমন বাড়ি ভাড়া, বিদ্যুৎ বিল, বেতন) সেগুলো রিকারিং হিসেবে সেট করলে স্বয়ংক্রিয়ভাবে রিমাইন্ডার পাবেন।',
  },
  {
    question: 'ক্রেডিট কার্ড ট্র্যাক কিভাবে করব?',
    answer: '"আরও" মেনু থেকে "ক্রেডিট কার্ড" এ যান। সেখানে আপনার কার্ড যোগ করে বিল ডেট, ডিউ ডেট এবং ব্যালেন্স ট্র্যাক করতে পারবেন।',
  },
  {
    question: 'ডাটা এক্সপোর্ট কিভাবে করব?',
    answer: 'সেটিংস থেকে "রিপোর্ট এক্সপোর্ট" এ যান। CSV বা TXT ফরম্যাটে আপনার সব লেনদেনের ডাটা ডাউনলোড করতে পারবেন।',
  },
  {
    question: 'একাধিক অ্যাকাউন্ট রাখা যাবে?',
    answer: 'হ্যাঁ! "আরও" মেনু থেকে "অ্যাকাউন্ট" এ গিয়ে নতুন অ্যাকাউন্ট (ব্যাংক, bKash, নগদ ইত্যাদি) যোগ করতে পারবেন।',
  },
  {
    question: 'আমার ডাটা কি নিরাপদ?',
    answer: 'হ্যাঁ, আপনার সব ডাটা এনক্রিপ্টেড এবং শুধুমাত্র আপনার অ্যাকাউন্ট থেকে এক্সেস করা যায়। আমরা আপনার ডাটা কারো সাথে শেয়ার করি না।',
  },
];

export const HelpSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">সাহায্য ও সাপোর্ট</h3>
      </div>

      {/* Quick Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-4 shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">সাহায্য প্রয়োজন?</p>
              <p className="text-sm text-muted-foreground mt-1">
                নিচের সাধারণ প্রশ্নগুলো দেখুন অথবা আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="font-medium">সাধারণ প্রশ্নাবলী (FAQ)</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                <AccordionTrigger className="px-4 text-left text-sm hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </motion.div>

      {/* Contact Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <p className="text-sm font-medium text-muted-foreground px-1">যোগাযোগ</p>
        
        <Card className="p-4 shadow-card">
          <a 
            href="mailto:support@khorcha.app" 
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">ইমেইল সাপোর্ট</p>
              <p className="text-sm text-muted-foreground">support@khorcha.app</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 shadow-card bg-muted/30">
          <div className="text-center space-y-2">
            <p className="text-2xl">💰</p>
            <p className="font-semibold">Khorcha AI</p>
            <p className="text-xs text-muted-foreground">
              সংস্করণ 1.0.0 • Made with ❤️ in Bangladesh
            </p>
            <p className="text-xs text-muted-foreground">
              © ২০২৬ Khorcha AI. সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
