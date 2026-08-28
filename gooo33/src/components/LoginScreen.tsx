import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, Users, ExternalLink } from 'lucide-react';
import appleHackLogo from '../assets/images/apple_hack_logo_1787875444610.jpg';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
  onSetUserID: (id: string) => void;
  passwordValue: string;
  onPasswordChange: (val: string) => void;
  correctKey: string;
}

export default function LoginScreen({
  onNavigate,
  onSetUserID: _onSetUserID,
  passwordValue,
  onPasswordChange,
  correctKey,
}: LoginScreenProps) {
  const [userCount, setUserCount] = useState(1542);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setUserCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = prev + delta;
        return next < 1000 || next > 2000 ? prev : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    if (passwordValue === correctKey || (correctKey && passwordValue.trim() === correctKey.trim())) {
      onNavigate('main');
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto px-6 py-8 bg-transparent relative overflow-hidden">
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-6 left-6 right-6 z-[100] p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-xl rounded-2xl flex items-center gap-3"
          >
            <Lock className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-white font-bold text-sm font-cairo">
              خطأ في الكود! تأكد من الكود المكتوب
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-10 sm:mb-16 px-4 py-3 glass rounded-2xl border-green-500/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase leading-none font-cairo">
              المستخدمين الآن
            </span>
            <motion.span
              key={userCount}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm font-mono font-bold text-white leading-none mt-0.5"
            >
              {userCount.toLocaleString()}
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          />
          <span className="text-xs font-bold text-white/80 font-cairo">
            الحالة: نشط
          </span>
        </div>
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-green-500/20 blur-[30px] opacity-40 rounded-full" />
          <img
            src={appleHackLogo}
            alt="Apple Hack Logo"
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-3xl object-cover relative z-10 border-2 border-green-500/40 mx-auto drop-shadow-[0_0_20px_rgba(34,197,94,0.35)]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-black font-orbitron tracking-tighter text-center">
            <span className="text-white">Apple </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-emerald-300 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              Hack
            </span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-green-400/80 tracking-widest uppercase text-center block mt-1">
            GREENBET VIP EDITION
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase ml-1 text-right w-full block font-cairo">
              كلمة المرور الآمنة
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-white/20 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type="password"
                value={passwordValue}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="أدخل كود الوصول"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all text-right font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={passwordValue.length === 0}
            className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-500 rounded-2xl font-bold text-white shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-2 font-cairo cursor-pointer"
          >
            تسجيل الدخول للنظام
            <ShieldCheck className="w-5 h-5 group-hover:animate-pulse" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-4 py-8 border-t border-white/5"
      >
        <p className="text-sm text-white/40 font-cairo">
          ليس لديك كلمة مرور؟
        </p>
        <button
          onClick={() => onNavigate('condition')}
          className="flex flex-row-reverse items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-green-500/20 text-green-400 font-bold text-sm transition-all font-cairo cursor-pointer shadow-[0_0_12px_rgba(34,197,94,0.15)]"
        >
          احصل على كلمة المرور
          <ExternalLink className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
