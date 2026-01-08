import { motion } from 'framer-motion';
import { Plus, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionsProps {
  onOpenManual: () => void;
  onOpenAI: () => void;
  onOpenCall?: () => void;
}

export const FloatingActions = ({ onOpenManual, onOpenAI, onOpenCall }: FloatingActionsProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30"
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

        {onOpenCall && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onOpenCall}
              className="rounded-full h-11 w-11 p-0 bg-green-500 hover:bg-green-600 text-white shadow-lg"
            >
              <Phone className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
