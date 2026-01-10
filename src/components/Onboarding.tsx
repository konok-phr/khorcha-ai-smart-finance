import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Brain, Shield, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Wallet,
    title: 'স্বাগতম Khorcha AI তে!',
    description: 'আপনার ব্যক্তিগত আর্থিক ব্যবস্থাপনা এখন আরও সহজ। প্রতিটি খরচ ট্র্যাক করুন, বাজেট তৈরি করুন।',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Brain,
    title: 'AI সহায়তা',
    description: 'AI চ্যাটবট দিয়ে সহজেই লেনদেন যোগ করুন। শুধু বলুন "৫০০ টাকা খাবারে খরচ" - বাকিটা AI করবে!',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'স্মার্ট বিশ্লেষণ',
    description: 'চার্ট ও রিপোর্ট দিয়ে আপনার খরচের প্যাটার্ন বুঝুন। সেভিংস গোল সেট করুন ও ট্র্যাক করুন।',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'নিরাপদ ও সুরক্ষিত',
    description: 'আপনার সব ডেটা এনক্রিপ্টেড ও সুরক্ষিত। শুধুমাত্র আপনিই আপনার তথ্য দেখতে পারবেন।',
    color: 'from-blue-500 to-cyan-500',
  },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${slide.color} opacity-10 blur-3xl rounded-full`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr ${slide.color} opacity-10 blur-3xl rounded-full`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.1 }}
              className={`w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-float`}
            >
              <Icon className="w-14 h-14 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground mb-4"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg leading-relaxed mb-8"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={prevSlide}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              পূর্ববর্তী
            </Button>
          )}
          
          <Button
            onClick={nextSlide}
            className={`flex-1 gradient-primary text-primary-foreground shadow-button hover:shadow-button-hover ${
              currentSlide === 0 ? 'w-full' : ''
            }`}
          >
            {currentSlide === slides.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                শুরু করুন
              </>
            ) : (
              <>
                পরবর্তী
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip button */}
        {currentSlide < slides.length - 1 && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="w-full mt-4 text-muted-foreground"
          >
            এড়িয়ে যান
          </Button>
        )}
      </div>
    </motion.div>
  );
};
