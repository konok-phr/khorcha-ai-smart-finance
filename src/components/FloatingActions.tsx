import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
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
      transition={{ delay: 0.5 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:bottom-8 lg:right-8 lg:left-auto lg:translate-x-0"
    >
      <div className="flex items-center gap-2 p-2 bg-card rounded-full shadow-float border border-border">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onOpenManual}
            variant="secondary"
            className="rounded-full h-11 px-4 gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">ম্যানুয়াল</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onOpenAI}
            className="rounded-full h-11 px-4 gap-2 gradient-primary shadow-button"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI চ্যাট</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
