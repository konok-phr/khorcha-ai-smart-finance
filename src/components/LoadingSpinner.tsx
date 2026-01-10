import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ 
  fullScreen = false, 
  message = 'লোড হচ্ছে...', 
  size = 'md' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} rounded-full border-2 border-primary/20 border-t-primary`}
        />
        
        {/* Inner pulsing icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="gradient-primary rounded-full p-2 shadow-button">
            <Wallet className={`${iconSizes[size]} text-primary-foreground`} />
          </div>
        </motion.div>

        {/* Glowing dots */}
        {size !== 'sm' && (
          <>
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-accent rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
            />
          </>
        )}
      </div>

      {/* Loading text with shimmer effect */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground font-medium text-sm"
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.span>
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex items-center justify-center"
      >
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        {content}
      </motion.div>
    );
  }

  return content;
};

// Skeleton loading variants
export const TransactionSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="p-4 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded shimmer" />
            <div className="h-3 w-24 bg-muted rounded shimmer" />
          </div>
          <div className="h-5 w-20 bg-muted rounded shimmer" />
        </div>
      </motion.div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-6 rounded-2xl bg-card border border-border"
  >
    <div className="space-y-4">
      <div className="h-4 w-24 bg-muted rounded shimmer" />
      <div className="h-8 w-40 bg-muted rounded shimmer" />
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-muted rounded shimmer" />
        <div className="h-4 w-20 bg-muted rounded shimmer" />
      </div>
    </div>
  </motion.div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="p-4 rounded-xl bg-card border border-border"
      >
        <div className="space-y-3">
          <div className="h-10 w-10 rounded-lg bg-muted shimmer" />
          <div className="h-3 w-16 bg-muted rounded shimmer" />
          <div className="h-5 w-24 bg-muted rounded shimmer" />
        </div>
      </motion.div>
    ))}
  </div>
);
