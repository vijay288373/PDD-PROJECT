import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, Tractor, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/useLang.jsx';
import { t } from '@/lib/i18n';

const DEPRECATED_LOCAL_LABELS = {
  lbl_email: { en: "Email Address", hi: "à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¤¾", ta: "à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯ à®®à¯à®•à®µà®°à®¿", te: "à°ˆà°®à±†à°¯à°¿à°²à± à°šà°¿à°°à±à°¨à°¾à°®à°¾", es: "DirecciÃ³n de correo electrÃ³nico" },
  lbl_password: { en: "Password", hi: "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡", ta: "à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯", te: "à°ªà°¾à°¸à±â€Œà°µà°°à±à°¡à±", es: "ContraseÃ±a" },
  
  welcome_back: { en: "Welcome Back! ðŸŒ¾", hi: "à¤†à¤ªà¤•à¤¾ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ! ðŸŒ¾", ta: "à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®µà®°à¯à®•! ðŸŒ¾", te: "à°¸à±à°µà°¾à°—à°¤à°‚! ðŸŒ¾", es: "Â¡Bienvenido de nuevo! ðŸŒ¾" },
  logged_in_success: { en: "Logged in successfully as Demo Farmer.", hi: "à¤¡à¥‡à¤®à¥‹ à¤•à¤¿à¤¸à¤¾à¤¨ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤²à¥‰à¤— à¤‡à¤¨ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾à¥¤", ta: "à®Ÿà¯†à®®à¯‹ à®µà®¿à®µà®šà®¾à®¯à®¿à®¯à®¾à®• à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®‰à®³à¯à®¨à¯à®´à¯ˆà®¨à¯à®¤à¯à®³à¯à®³à¯€à®°à¯à®•à®³à¯.", te: "à°¡à±†à°®à±‹ à°°à±ˆà°¤à±à°—à°¾ à°µà°¿à°œà°¯à°µà°‚à°¤à°‚à°—à°¾ à°²à°¾à°—à°¿à°¨à± à°…à°¯à±à°¯à°¾à°°à±.", es: "SesiÃ³n iniciada con Ã©xito como agricultor de demostraciÃ³n." },
  account_created: { en: "Account Created! ðŸŽ‰", hi: "à¤–à¤¾à¤¤à¤¾ à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¬à¤¨ à¤—à¤¯à¤¾! ðŸŽ‰", ta: "à®•à®£à®•à¯à®•à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸŽ‰", te: "à°–à°¾à°¤à°¾ à°¸à±ƒà°·à±à°Ÿà°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿! ðŸŽ‰", es: "Â¡Cuenta creada! ðŸŽ‰" },
  welcome_user: { en: "Welcome to Agri Guard AI", hi: "à¤à¤—à¥à¤°à¥€ à¤—à¤¾à¤°à¥à¤¡ à¤à¤†à¤ˆ à¤®à¥‡à¤‚ à¤†à¤ªà¤•à¤¾ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ", ta: "Agri Guard AI à®•à¯à®•à¯ à®‰à®™à¯à®•à®³à¯ˆ à®µà®°à®µà¯‡à®±à¯à®•à®¿à®±à¯‹à®®à¯", te: "Agri Guard AI à°•à°¿ à°¸à±à°µà°¾à°—à°¤à°‚", es: "Bienvenido a Agri Guard IA" },
  demo_active: { en: "Demo Account Active! ðŸ‘¨â€ðŸŒ¾", hi: "à¤¡à¥‡à¤®à¥‹ à¤–à¤¾à¤¤à¤¾ à¤¸à¤•à¥à¤°à¤¿à¤¯! ðŸ‘¨â€ðŸŒ¾", ta: "à®Ÿà¯†à®®à¯‹ à®•à®£à®•à¯à®•à¯ à®šà¯†à®¯à®²à¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯! ðŸ‘¨â€ðŸŒ¾", te: "à°¡à±†à°®à±‹ à°–à°¾à°¤à°¾ à°¸à°•à±à°°à°¿à°¯à°‚à°—à°¾ à°‰à°‚à°¦à°¿! ðŸ‘¨â€ðŸŒ¾", es: "Â¡Cuenta de demostraciÃ³n activa! ðŸ‘¨â€ðŸŒ¾" },
  demo_active_desc: { en: "Entered as Demo Farmer. Happy farming!", hi: "à¤¡à¥‡à¤®à¥‹ à¤•à¤¿à¤¸à¤¾à¤¨ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤•à¤¿à¤¯à¤¾à¥¤ à¤¶à¥à¤­ à¤•à¥ƒà¤·à¤¿!", ta: "à®Ÿà¯†à®®à¯‹ à®µà®¿à®µà®šà®¾à®¯à®¿à®¯à®¾à®• à®¨à¯à®´à¯ˆà®¨à¯à®¤à¯à®³à¯à®³à¯€à®°à¯à®•à®³à¯. à®µà®¾à®´à¯à®¤à¯à®¤à¯à®•à®³à¯!", te: "à°¡à±†à°®à±‹ à°°à±ˆà°¤à±à°—à°¾ à°ªà±à°°à°µà±‡à°¶à°¿à°‚à°šà°¾à°°à±. à°¹à±à°¯à°¾à°ªà±€ à°«à°¾à°°à±à°®à°¿à°‚à°—à±!", es: "Ingresado como Agricultor de DemostraciÃ³n. Â¡Feliz cultivo!" }
};

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const { langCode } = useLang();

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTypingDemo, setIsTypingDemo] = useState(false);

  // Floating background ambient light circles
  const [dots, setDots] = useState([]);
  useEffect(() => {
    setDots(
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 6,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * -20,
      }))
    );
  }, []);

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(t("fill_all_credentials", langCode));
      return;
    }

    if (email.indexOf('@') === -1) {
      setErrorMsg(t("invalid_email", langCode));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t("password_short", langCode));
      return;
    }

    if (!isSignIn && !fullName.trim()) {
      setErrorMsg(t("enter_full_name", langCode));
      return;
    }

    setIsLoading(true);
    try {
      if (isSignIn) {
        await login(email, password);
        toast({
          title: t("welcome_back", langCode),
          description: t("logged_in_success", langCode),
          variant: "default",
        });
      } else {
        await register(fullName, email, password);
        toast({
          title: t("account_created", langCode),
          description: `${t("welcome_user", langCode)}, ${fullName}!`,
          variant: "default",
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated typewriter entry for Demo Farmer
  const handleDemoAccess = () => {
    if (isTypingDemo || isLoading) return;
    setIsTypingDemo(true);
    setIsSignIn(true);
    setErrorMsg('');
    
    // Clear inputs first
    setEmail('');
    setPassword('');
    setFullName('');

    const targetEmail = 'farmer@agriguard.com';
    const targetPassword = 'password123';
    
    let currentEmail = '';
    let currentPassword = '';
    
    // Type email
    let emailIdx = 0;
    const typeEmailInterval = setInterval(() => {
      if (emailIdx < targetEmail.length) {
        currentEmail += targetEmail[emailIdx];
        setEmail(currentEmail);
        emailIdx++;
      } else {
        clearInterval(typeEmailInterval);
        
        // Type password after email
        let passIdx = 0;
        const typePasswordInterval = setInterval(() => {
          if (passIdx < targetPassword.length) {
            currentPassword += targetPassword[passIdx];
            setPassword(currentPassword);
            passIdx++;
          } else {
            clearInterval(typePasswordInterval);
            
            // Auto submit with slight delay
            setTimeout(async () => {
              setIsTypingDemo(false);
              setIsLoading(true);
              try {
                await login(targetEmail, targetPassword);
                toast({
                  title: t("demo_active", langCode),
                  description: t("demo_active_desc", langCode),
                });
              } catch (err) {
                setErrorMsg(err.message);
                setIsLoading(false);
              }
            }, 500);
          }
        }, 80);
      }
    }, 60);
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-slate-950 font-sans">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-emerald-400/20 blur-[1px]"
            style={{ width: dot.size, height: dot.size, left: `${dot.x}%`, top: `${dot.y}%` }}
            animate={{ y: [0, -100, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* â”€â”€ LEFT PANEL (hidden on mobile, shown on md+) â”€â”€ */}
      <div className="hidden md:flex relative z-10 w-1/2 flex-col items-start justify-between p-12 border-r border-white/5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sprout className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            {t("app_name", langCode)}
          </span>
        </div>

        {/* Hero content */}
        <div className="max-w-md">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="text-6xl mb-6"
          >ðŸŒ¾</motion.div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Your Smart<br />
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Farming Mentor
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            AI-powered crop advisory, real-time mandi prices, and precision weather alerts â€” designed for India's small farmers (0â€“10 acres).
          </p>
          <div className="space-y-4">
            {[
              { icon: 'ðŸŒ¿', title: 'Smart Crop Advisor', desc: 'Get zone-based crop recommendations with ICAR data' },
              { icon: 'ðŸ“Š', title: 'Live APMC Prices', desc: 'Real-time mandi prices from your nearest markets' },
              { icon: 'ðŸŒ¦ï¸', title: 'Weather Intelligence', desc: '7-day forecast with crop-specific impact alerts' },
              { icon: 'ðŸ”¬', title: 'AI Plant Scan', desc: 'Diagnose diseases from a simple photo of your crop' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-slate-400 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">Â© 2025 AgriGuard AI Â· Built for Bharat's Farmers</p>
      </div>

      {/* â”€â”€ RIGHT PANEL â€” Login Form â”€â”€ */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md bg-white/8 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(16,185,129,0.15)] rounded-3xl p-8"
        >
          {/* Brand Header (visible on mobile only) */}
          <div className="flex flex-col items-center mb-6 text-center md:hidden">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
              <Sprout className="w-8 h-8 text-slate-950 font-bold" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              {t("app_name", langCode)}
            </h1>
            <p className="text-xs text-emerald-500/80 font-medium tracking-wide mt-1 uppercase">
              {t("tagline", langCode)}
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-extrabold text-white">Welcome back ðŸ‘‹</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your farm dashboard</p>
          </div>

          {/* Tab Switcher */}
          <div className="relative flex bg-slate-900/60 p-1 rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => { setIsSignIn(true); setErrorMsg(''); }}
              disabled={isTypingDemo || isLoading}
              className="relative flex-1 py-2 text-sm font-semibold rounded-lg focus:outline-none transition-colors"
              style={{ color: isSignIn ? '#090d16' : '#94a3b8' }}
            >
              {isSignIn && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-300 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("sign_in", langCode)}</span>
            </button>
            <button
              onClick={() => { setIsSignIn(false); setErrorMsg(''); }}
              disabled={isTypingDemo || isLoading}
              className="relative flex-1 py-2 text-sm font-semibold rounded-lg focus:outline-none transition-colors"
              style={{ color: !isSignIn ? '#090d16' : '#94a3b8' }}
            >
              {!isSignIn && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-300 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("create_account", langCode)}</span>
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2.5 mb-5 text-sm text-destructive"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isSignIn && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <label className="text-xs text-emerald-400 font-semibold mb-1 block">
                    {t("lbl_full_name", langCode)}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/60" />
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading || isTypingDemo}
                      className="pl-10 py-5 bg-slate-900/40 border-white/10 text-white placeholder-slate-500 focus-visible:ring-emerald-500 rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <label className="text-xs text-emerald-400 font-semibold mb-1 block">
                {t("lbl_email", langCode)}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/60" />
                <Input
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isTypingDemo}
                  className="pl-10 py-5 bg-slate-900/40 border-white/10 text-white placeholder-slate-500 focus-visible:ring-emerald-500 rounded-xl"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-emerald-400 font-semibold">
                  {t("lbl_password", langCode)}
                </label>
                {isSignIn && (
                  <a href="#forgot" className="text-xxs text-emerald-500 hover:text-emerald-400 font-medium">
                    {t("forgot_password", langCode)}
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/60" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isTypingDemo}
                  className="pl-10 pr-10 py-5 bg-slate-900/40 border-white/10 text-white placeholder-slate-500 focus-visible:ring-emerald-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isTypingDemo}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isTypingDemo}
              className="w-full py-6 mt-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>{t("processing", langCode)}</span></>
              ) : (
                <><Sparkles className="w-5 h-5" /><span>{isSignIn ? t("sign_in_to_farm", langCode) : t("create_account", langCode)}</span></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950/60 backdrop-blur-md px-3 text-slate-500 font-semibold tracking-wider">
                {t("quick_sandbox_access", langCode)}
              </span>
            </div>
          </div>

          {/* Demo Button */}
          <Button
            id="btn-demo-login"
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading || isTypingDemo}
            className="w-full py-5 bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isTypingDemo ? (
              <><Loader2 className="w-5 h-5 animate-spin text-emerald-400" /><span className="text-emerald-400 font-semibold">{t("simulating_entry", langCode)}</span></>
            ) : (
              <><Tractor className="w-5 h-5 text-emerald-400" /><span>{t("use_demo_farmer", langCode)}</span></>
            )}
          </Button>

          {/* Footer tags */}
          <div className="mt-5 flex justify-center gap-4 text-xxs text-slate-500 border-t border-white/5 pt-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("live_ai_diagnose", langCode)}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("mandi_tracking", langCode)}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("weather_alerts_label", langCode)}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

