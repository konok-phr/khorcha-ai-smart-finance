import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, Wallet, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড চেক করুন।");
        } else {
          toast.success("স্বাগতম! লগইন সফল হয়েছে।");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        } else {
          toast.success("অ্যাকাউন্ট তৈরি হয়েছে! লগইন করুন।");
          setIsLogin(true);
        }
      }
    } catch (err) {
      toast.error("কিছু একটা সমস্যা হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="relative inline-block"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-button relative"
            >
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            {/* Animated sparkle */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full gradient-accent flex items-center justify-center shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold text-foreground mt-4">
              Hisab <span className="text-gradient-primary">AI</span>
            </h1>
            <p className="text-muted-foreground mt-1">আপনার স্মার্ট অর্থ সহায়ক</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 shadow-float border-border/50 backdrop-blur-sm bg-card/95">
            {/* Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary/80 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  isLogin ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                লগইন
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  !isLogin ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                রেজিস্টার
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  ইমেইল
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-medium gradient-primary shadow-button hover:shadow-button-hover rounded-xl gap-2 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      অপেক্ষা করুন...
                    </span>
                  ) : (
                    <>
                      {isLogin ? "লগইন করুন" : "রেজিস্টার করুন"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Features hint */}
            <div className="mt-6 pt-5 border-t border-border/50">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-primary">✓</span> AI সহায়ক
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-primary">✓</span> রিসিট স্ক্যান
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-primary">✓</span> স্মার্ট বিশ্লেষণ
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
