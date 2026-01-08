import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-effect border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-button"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Khorcha AI</h1>
              <p className="text-xs text-muted-foreground">আপনার স্মার্ট অর্থ সহায়ক</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
