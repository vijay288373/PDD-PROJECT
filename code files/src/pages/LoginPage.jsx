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
  lbl_email: { en: "Email Address", hi: "ईमेल पता", ta: "மின்னஞ்சல் முகவரி", te: "ఈమెయిల్ చిరునామా", es: "Dirección de correo electrónico" },
  lbl_password: { en: "Password", hi: "पासवर्ड", ta: "கடவுச்சொல்", te: "పాస్‌వర్డ్", es: "Contraseña" },
  
  welcome_back: { en: "Welcome Back! 🌾", hi: "आपका स्वागत है! 🌾", ta: "மீண்டும் வருக! 🌾", te: "స్వాగతం! 🌾", es: "¡Bienvenido de nuevo! 🌾" },
  logged_in_success: { en: "Logged in successfully as Demo Farmer.", hi: "डेमो किसान के रूप में सफलतापूर्वक लॉग इन किया गया।", ta: "டெமோ விவசாயியாக வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.", te: "డెమో రైతుగా విజయవంతంగా లాగిన్ అయ్యారు.", es: "Sesión iniciada con éxito como agricultor de demostración." },
  account_created: { en: "Account Created! 🎉", hi: "खाता सफलतापूर्वक बन गया! 🎉", ta: "கணக்கு உருவாக்கப்பட்டது! 🎉", te: "ఖాతా సృష్టించబడింది! 🎉", es: "¡Cuenta creada! 🎉" },
  welcome_user: { en: "Welcome to Agri Guard AI", hi: "एग्री गार्ड एआई में आपका स्वागत है", ta: "Agri Guard AI க்கு உங்களை வரவேற்கிறோம்", te: "Agri Guard AI కి స్వాగతం", es: "Bienvenido a Agri Guard IA" },
  demo_active: { en: "Demo Account Active! 👨‍🌾", hi: "डेमो खाता सक्रिय! 👨‍🌾", ta: "டெமோ கணக்கு செயல்படுகிறது! 👨‍🌾", te: "డెమో ఖాతా సక్రియంగా ఉంది! 👨‍🌾", es: "¡Cuenta de demostración activa! 👨‍🌾" },
  demo_active_desc: { en: "Entered as Demo Farmer. Happy farming!", hi: "डेमो किसान के रूप में प्रवेश किया। शुभ कृषि!", ta: "டெமோ விவசாயியாக நுழைந்துள்ளீர்கள். வாழ்த்துகள்!", te: "డెమో రైతుగా ప్రవేశించారు. హ్యాపీ ఫార్మింగ్!", es: "Ingresado como Agricultor de Demostración. ¡Feliz cultivo!" }
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans px-4">
      {/* Botanical Organic Gradient Background */}
      <div className="absolute inset-0 bg-radial-at-t from-emerald-950 via-teal-950 to-slate-950" />
      <div className="absolute inset-0 bg-radial-at-b from-green-950/40 via-transparent to-transparent pointer-events-none" />

      {/* Floating Animated Botanical Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* CSS Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-emerald-500/20"
            style={{
              width: dot.size,
              height: dot.size,
              left: `${dot.x}%`,
              top: `${dot.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Glassmorphism Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl overflow-hidden p-6 md:p-8"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3"
          >
            <Sprout className="w-8 h-8 text-slate-950 font-bold" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            {t("app_name", langCode)}
          </h1>
          <p className="text-xs text-emerald-500/80 font-medium tracking-wide mt-1 uppercase">
            {t("tagline", langCode)}
          </p>
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

        {/* Action Error Alerts */}
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

        {/* Input Form */}
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
                placeholder="••••••••"
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

          {/* Action Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || isTypingDemo}
            className="w-full py-6 mt-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("processing", langCode)}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{isSignIn ? t("sign_in_to_farm", langCode) : t("create_account", langCode)}</span>
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950/60 backdrop-blur-md px-3 text-slate-500 font-semibold tracking-wider">
              {t("quick_sandbox_access", langCode)}
            </span>
          </div>
        </div>

        {/* Demo Account Access Button */}
        <Button
          id="btn-demo-login"
          type="button"
          onClick={handleDemoAccess}
          disabled={isLoading || isTypingDemo}
          className="w-full py-6 bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isTypingDemo ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{t("simulating_entry", langCode)}</span>
            </>
          ) : (
            <>
              <Tractor className="w-5 h-5 text-emerald-400" />
              <span>{t("use_demo_farmer", langCode)}</span>
            </>
          )}
        </Button>

        {/* App Highlights Subtitles */}
        <div className="mt-6 flex justify-center gap-4 text-xxs text-slate-500 border-t border-white/5 pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("live_ai_diagnose", langCode)}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("mandi_tracking", langCode)}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> {t("weather_alerts_label", langCode)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
