import { motion } from 'framer-motion';
import { Plus, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionsProps {
  onOpenManual: () => void;
  onOpenAI: () => void;
}

export const FloatingActions = ({ onOpenManual, onOpenAI }: FloatingActionsProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:bottom-8 lg:right-8 lg:left-auto lg:translate-x-0"
    >
      <div className="flex items-center gap-3 p-2.5 bg-card/95 backdrop-blur-xl rounded-2xl shadow-float border border-border/50">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onOpenManual}
            variant="secondary"
            className="rounded-xl h-12 px-5 gap-2 font-medium hover:bg-secondary/80 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">ম্যানুয়াল</span>
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, rotate: 1 }} 
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={onOpenAI}
            className="rounded-xl h-12 px-5 gap-2.5 gradient-primary shadow-button hover:shadow-button-hover font-medium transition-all"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bot className="w-5 h-5" />
            </motion.div>
            <span>AI সহায়ক</span>
          </Button>
          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-xl opacity-60" />
        </motion.div>
      </div>
    </motion.div>
  );
};
