import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Account } from '@/hooks/useAccounts';

type CallState = 'idle' | 'ringing' | 'connected' | 'listening' | 'processing' | 'speaking' | 'ended';

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transaction_date?: string;
  account_name?: string | null;
  unclear?: boolean;
  question?: string;
}

interface VoiceCallDialerProps {
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

export const VoiceCallDialer = ({ onAddTransaction, onClose, accounts = [], onUpdateAccountBalance }: VoiceCallDialerProps) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create ring tone using Web Audio API
  const playRingTone = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    // Ring pattern: 1s on, 2s off
    let isPlaying = true;
    const ringInterval = setInterval(() => {
      isPlaying = !isPlaying;
      gainNode.gain.value = isPlaying ? 0.3 : 0;
    }, 1000);
    
    return () => {
      clearInterval(ringInterval);
      oscillator.stop();
      audioContext.close();
    };
  }, []);

  // Text to Speech
  const speak = useCallback(async (text: string): Promise<void> => {
    try {
      setCallState('speaking');
      setStatusText('Khorcha AI বলছে...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) throw new Error('TTS failed');

      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      });
    }
  }, []);

  // Speech Recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('আপনার ব্রাউজার ভয়েস সাপোর্ট করে না');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'bn-BD';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setCallState('listening');
      setStatusText('শুনছি... বলুন');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
    };

    recognition.onend = () => {
      if (transcript) {
        processVoiceInput(transcript);
      } else {
        setCallState('connected');
        setStatusText('কিছু শুনতে পেলাম না, আবার বলুন');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setCallState('connected');
      setStatusText('শুনতে পারিনি, আবার চেষ্টা করুন');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [transcript]);

  // Process voice input with AI
  const processVoiceInput = async (text: string) => {
    try {
      setCallState('processing');
      setStatusText('বুঝছি...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transcript: text }),
        }
      );

      if (!response.ok) throw new Error('Voice chat failed');

      const data = await response.json();
      const aiResponse = data.response;

      // Try to parse as JSON
      try {
        const jsonMatch = aiResponse.match(/\{[^{}]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as TransactionData;
          
          if (parsed.unclear && parsed.question) {
            // AI needs clarification
            await speak(parsed.question);
            setCallState('connected');
            setTimeout(() => startListening(), 500);
          } else if (parsed.type && parsed.amount && parsed.category) {
            // Valid transaction
            await saveTransaction(parsed);
          } else {
            await speak('আবার বলুন, কত টাকা এবং কি খরচ?');
            setCallState('connected');
            setTimeout(() => startListening(), 500);
          }
        } else {
          // Not JSON, AI is asking something
          await speak(aiResponse || 'আবার বলুন প্লিজ');
          setCallState('connected');
          setTimeout(() => startListening(), 500);
        }
      } catch {
        await speak('বুঝতে পারিনি, আবার বলুন');
        setCallState('connected');
        setTimeout(() => startListening(), 500);
      }
    } catch (error) {
      console.error('Process error:', error);
      await speak('একটু সমস্যা হয়েছে, আবার বলুন');
      setCallState('connected');
      setTimeout(() => startListening(), 500);
    }
  };

  // Save transaction
  const saveTransaction = async (transaction: TransactionData) => {
    const findAccountByName = (name: string | null | undefined) => {
      if (!name || !accounts.length) return undefined;
      const lowerName = name.toLowerCase();
      return accounts.find(a => 
        a.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(a.name.toLowerCase())
      );
    };

    const getDefaultAccount = () => {
      return accounts.find(a => a.is_default) || accounts.find(a => a.type === 'cash') || accounts[0];
    };

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

      const confirmMsg = `সংরক্ষিত হয়েছে! ${transaction.amount} টাকা ${categoryLabels[transaction.category] || transaction.category}। আর কিছু যোগ করবেন?`;
      
      toast.success('✅ লেনদেন সংরক্ষিত!');
      await speak(confirmMsg);
      setTranscript('');
      setCallState('connected');
      setTimeout(() => startListening(), 500);
    }
  };

  // Start call
  const startCall = useCallback(async () => {
    setCallState('ringing');
    setStatusText('রিং হচ্ছে...');
    
    const stopRing = playRingTone();
    
    // Answer after 3 seconds
    setTimeout(async () => {
      stopRing();
      setCallState('connected');
      setStatusText('কল কানেক্টেড');
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      
      // AI greeting
      await speak('আসসালামু আলাইকুম! আমি খরচা এ আই। আপনি কি যোগ করতে চান?');
      
      // Start listening
      startListening();
    }, 3000);
  }, [playRingTone, speak, startListening]);

  // End call
  const endCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    speechSynthesis.cancel();
    
    setCallState('ended');
    setStatusText('কল শেষ');
    
    setTimeout(() => {
      onClose();
    }, 1000);
  }, [onClose]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call on mount
  useEffect(() => {
    startCall();
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col"
      >
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-3 text-white/70 text-sm">
          <span>{new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex gap-1">
            <div className="w-4 h-4">📶</div>
            <div className="w-4 h-4">🔋</div>
          </div>
        </div>

        {/* Call Info */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Avatar */}
          <motion.div
            animate={callState === 'ringing' ? { scale: [1, 1.1, 1] } : callState === 'speaking' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative mb-8"
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              callState === 'ringing' ? 'bg-green-500/20 ring-4 ring-green-500/50' :
              callState === 'listening' ? 'bg-blue-500/20 ring-4 ring-blue-500/50' :
              callState === 'speaking' ? 'bg-purple-500/20 ring-4 ring-purple-500/50' :
              'bg-primary/20 ring-4 ring-primary/30'
            }`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            {/* Pulse rings for ringing */}
            {callState === 'ringing' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-500"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-500"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                />
              </>
            )}
            
            {/* Sound waves for listening */}
            {callState === 'listening' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full"
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Caller Name */}
          <h2 className="text-2xl font-semibold text-white mb-2">Khorcha AI</h2>
          
          {/* Status */}
          <p className="text-white/60 mb-2">{statusText}</p>
          
          {/* Duration */}
          {callState !== 'ringing' && callState !== 'idle' && (
            <p className="text-white/40 text-sm">{formatDuration(callDuration)}</p>
          )}

          {/* Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 px-6 py-3 bg-white/10 rounded-2xl max-w-xs"
            >
              <p className="text-white/80 text-sm text-center">"{transcript}"</p>
            </motion.div>
          )}
        </div>

        {/* Call Actions */}
        <div className="px-6 pb-12">
          <div className="flex justify-center items-center gap-8">
            {/* Mute Button */}
            {callState !== 'ringing' && callState !== 'ended' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/80'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>
            )}

            {/* End Call Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>

            {/* Speaker Button */}
            {callState !== 'ringing' && callState !== 'ended' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/80"
              >
                <User className="w-6 h-6" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
