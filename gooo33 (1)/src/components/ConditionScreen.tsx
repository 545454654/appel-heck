import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCcw,
  Download,
  ChevronRight,
  User,
  LoaderCircle,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import greenbetLogo from '../assets/images/greenbet_logo_1787875455201.jpg';
import { saveActivationRequest } from '../firebase';

interface ConditionScreenProps {
  onNavigate: (screen: string) => void;
  onSetUserID: (id: string) => void;
  selectedGame: string;
  onSetSelectedGame: (game: string) => void;
}

export default function ConditionScreen({
  onNavigate,
  onSetUserID,
  selectedGame,
  onSetSelectedGame,
}: ConditionScreenProps) {
  const [platform, setPlatform] = useState<'greenbet' | null>('greenbet');
  const [game, setGame] = useState<'apple' | 'crash' | null>(
    (selectedGame as 'apple' | 'crash') || 'apple'
  );
  const [userIdInput, setUserIdInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error'
  >('idle');

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('A1111');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  const handleSelectGame = (g: 'apple' | 'crash') => {
    setGame(g);
    onSetSelectedGame(g);
  };

  const handleSubmit = () => {
    if (!userIdInput.trim() || !platform) return;
    setIsSubmitting(true);
    setVerificationStatus('verifying');
    setShowModal(true);

    // Save ID and activation details to Firebase
    saveActivationRequest(userIdInput.trim(), game || 'apple', 'greenbet');

    setTimeout(() => {
      setIsSubmitting(false);
      onSetUserID(userIdInput.trim());
      setVerificationStatus('success');
      setTimeout(() => {
        setShowModal(false);
        onNavigate('keygen');
      }, 3500);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-transparent overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-8 scrollbar-hide">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="p-2 hover:bg-white/5 rounded-full ring-1 ring-white/10 transition-all cursor-pointer"
          >
            <RefreshCcw className="w-5 h-5 text-green-400" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-orbitron text-white/90">
              الشروط والأحكام
            </h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {/* Step 01: Platform Selection (Greenbet Only) */}
        <section className="space-y-4">
          <div className="flex items-center justify-end gap-2 mb-2">
            <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
              المنصة المعتمدة
            </h3>
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <span className="text-[10px] font-bold text-green-400 font-mono">01</span>
            </div>
          </div>

          <div className="w-full">
            <button
              onClick={() => setPlatform('greenbet')}
              className={`w-full relative p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all cursor-pointer ${
                platform === 'greenbet'
                  ? 'bg-gradient-to-r from-green-500/15 via-emerald-500/10 to-green-500/5 border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-400 font-mono">OFFICIAL PARTNER</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-black text-white tracking-wider font-orbitron block">
                    Greenbet
                  </span>
                  <span className="text-[10px] text-green-400 font-bold font-cairo">
                    المنصة الرسمية المعتمدة
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={greenbetLogo}
                    alt="Greenbet Logo"
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-black text-[8px] text-white font-black">
                    ✓
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Step 1.5: Game Selection */}
        <AnimatePresence mode="wait">
          {platform && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <div className="flex items-center justify-end gap-2 mb-2">
                  <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
                    اختر اللعبة
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <span className="text-[10px] font-bold text-green-400 font-mono">1.5</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectGame('apple')}
                    className={`relative p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      game === 'apple'
                        ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src="https://cdn.phototourl.com/free/2026-07-17-388e2c51-99d0-4576-8b6d-420c7e8f7a3b.jpg"
                        alt="Apple of fortune Logo"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                      />
                      {game === 'apple' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-black text-[8px] text-white">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white text-center leading-tight font-cairo">
                      Apple of Fortune
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectGame('crash')}
                    className={`relative p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      game === 'crash'
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src="https://cdn.phototourl.com/free/2026-07-17-bdde0a56-8095-4e40-9087-8bb52f52e3e0.jpg"
                        alt="Crash Logo"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                      />
                      {game === 'crash' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center border border-black text-[8px] text-white">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white text-center leading-tight font-cairo">
                      Crash
                    </span>
                  </button>
                </div>
              </section>

              {game && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Step 02: Greenbet Registration Link */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
                        جاهزية النظام
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <span className="text-[10px] font-bold text-green-400 font-mono">02</span>
                      </div>
                    </div>

                    <a
                      href="https://refpa79184.com/L?tag=d_5828346m_132250c_&site=5828346&ad=132250"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row-reverse items-center justify-between p-4 bg-gradient-to-r from-green-500/10 via-white/5 to-transparent rounded-2xl border border-green-500/20 cursor-pointer hover:bg-green-500/15 transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    >
                      <div className="flex flex-row-reverse items-center gap-3">
                        <Download className="w-5 h-5 text-green-400 animate-bounce" />
                        <div className="text-right">
                          <span className="text-sm font-bold text-white block leading-relaxed font-cairo">
                            رابط تحميل وتسجيل منصة Greenbet
                          </span>
                          <span className="text-[10px] text-green-400 font-medium font-cairo">
                            سجل حسابك باستخدام البروموكود لتفعيل الروبوت
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 rotate-180" />
                    </a>
                  </section>

                  {/* Step 03: VIP Promo Code E1111 */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
                        البروموكود VIP
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <span className="text-[10px] font-bold text-green-400 font-mono">03</span>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="p-1 glass rounded-2xl flex flex-row-reverse items-center gap-2 relative z-0 border-green-500/20 bg-black/40">
                        <div className="flex-1 py-4 pr-6 font-mono text-2xl font-black tracking-[0.25em] text-green-400 text-right drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                          E1111
                        </div>
                        <button
                          onClick={handleCopyPromo}
                          className={`ml-1 px-6 py-3 rounded-xl font-black text-xs flex flex-row-reverse items-center gap-2 transition-all font-cairo cursor-pointer ${
                            copiedPromo
                              ? 'bg-green-500 text-white animate-bounce shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                              : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:brightness-110 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                          }`}
                        >
                          {copiedPromo ? 'تم النسخ' : 'نسخ الكود'}
                        </button>
                      </div>
                      <AnimatePresence>
                        {copiedPromo && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-green-600 rounded-2xl text-white font-black text-sm font-cairo shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                          >
                            تم نسخ البروموكود E1111 بنجاح
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Step 04: Investment Requirements (300 EGP) */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
                        متطلبات الاستثمار
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <span className="text-[10px] font-bold text-green-400 font-mono">04</span>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-500/20 via-white/5 to-white/5 rounded-3xl border border-green-500/20 flex flex-row-reverse items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      <div className="space-y-1 text-right">
                        <span className="text-xs font-bold text-green-400 uppercase font-cairo">
                          الحد الأدنى للإيداع
                        </span>
                        <h4 className="text-3xl font-black font-orbitron text-white">
                          300 EGP
                        </h4>
                        <p className="text-[11px] text-white/60 font-cairo">
                          أدنى مبلغ إيداع هو 300 جنيه لتفعيل السكريبت وتوافق الخوارزمية
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <Wallet className="w-7 h-7 text-green-400" />
                      </div>
                    </div>
                  </section>

                  {/* Step 05: ID Registration */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white/60 uppercase font-cairo">
                        تفعيل الـ ID
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <span className="text-[10px] font-bold text-green-400 font-mono">05</span>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-white/20 group-focus-within:text-green-400" />
                      </div>
                      <input
                        type="number"
                        value={userIdInput}
                        onChange={(e) => setUserIdInput(e.target.value)}
                        placeholder="أدخل الـ ID الخاص بك في Greenbet لتفعيل الاشتراك"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white focus:outline-none focus:border-green-500/50 transition-all font-mono text-right"
                      />
                    </div>
                  </section>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Submit Button */}
      <AnimatePresence>
        {platform && game && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent border-t border-white/5 max-w-lg mx-auto z-[50]"
          >
            <button
              onClick={handleSubmit}
              disabled={!userIdInput || isSubmitting}
              className="w-full py-5 bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 rounded-2xl font-black text-white shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase font-cairo cursor-pointer"
            >
              {isSubmitting ? 'جاري تفعيل الحساب في Greenbet...' : 'إرسال طلب التفعيل'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal / Scanning / Verification Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-green-500/10 blur-[80px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-[100px]" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className={`relative w-full max-w-[320px] bg-zinc-950/90 backdrop-blur-md px-5 py-6 rounded-[1.75rem] border flex flex-col items-center gap-5 overflow-hidden transition-all duration-500 ${
                verificationStatus === 'error'
                  ? 'border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2)]'
                  : 'border-green-500/30 shadow-[0_0_35px_rgba(34,197,94,0.2)]'
              }`}
            >
              {verificationStatus === 'error' ? (
                <>
                  <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-red-500 to-transparent" />
                  <div className="absolute top-0 right-0 h-16 w-[2px] bg-gradient-to-b from-red-500 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
                  <div className="absolute bottom-0 left-0 h-16 w-[2px] bg-gradient-to-t from-red-500 to-transparent" />

                  <div className="relative flex items-center justify-center w-20 h-20">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 border border-red-500/20 rounded-full blur-[2px]"
                    />
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      <span className="text-red-500 text-2xl font-black">!</span>
                    </div>
                  </div>

                  <div className="text-center space-y-3 w-full">
                    <div className="space-y-1.5">
                      <span className="text-[9px] tracking-[0.2em] font-black text-red-400 uppercase block font-cairo">
                        فشل التحقق
                      </span>
                      <h4 className="text-base font-bold text-white tracking-wide font-cairo">
                        خطأ في تفعيل حسابك
                      </h4>
                      <p className="text-xs text-red-400/90 font-medium leading-relaxed font-cairo px-2">
                        خطأ في تفعيل حسابك يرجي التحقق من id الخاص بك
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-center gap-1.5 text-white/30">
                      <span className="text-[9px] tracking-widest font-black uppercase font-cairo">
                        جاري إعادة التوجيه...
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-green-500 to-transparent" />
                  <div className="absolute top-0 right-0 h-16 w-[2px] bg-gradient-to-b from-green-500 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
                  <div className="absolute bottom-0 left-0 h-16 w-[2px] bg-gradient-to-t from-cyan-500 to-transparent" />

                  <div className="relative flex items-center justify-center w-24 h-24">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-t-2 border-r-[1px] border-b-[1.5px] border-l-0 border-green-400 rounded-full opacity-80"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-2 border-b-2 border-l-[1px] border-t-[1.5px] border-r-0 border-emerald-500 rounded-full opacity-90"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-1 border border-green-500/30 rounded-full blur-[1px]"
                    />
                    <div className="relative w-15 h-15 rounded-full overflow-hidden border border-green-500/40 bg-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                      <img
                        src={
                          game === 'apple'
                            ? 'https://cdn.phototourl.com/free/2026-07-17-388e2c51-99d0-4576-8b6d-420c7e8f7a3b.jpg'
                            : 'https://cdn.phototourl.com/free/2026-07-17-bdde0a56-8095-4e40-9087-8bb52f52e3e0.jpg'
                        }
                        alt={game === 'apple' ? 'Apple of Fortune' : 'Crash'}
                        referrerPolicy="no-referrer"
                        className="w-[88%] h-[88%] rounded-full object-cover relative z-10"
                      />
                      <div className="w-full h-full rounded-full bg-green-500/20 blur-sm absolute" />
                    </div>
                  </div>

                  <div className="text-center space-y-4 w-full">
                    <div className="space-y-0.5">
                      <span className="text-[9px] tracking-[0.2em] font-black text-green-400 uppercase block font-cairo">
                        رابط المعالجة الذكي
                      </span>
                      <h4 className="text-sm font-bold font-cairo text-white tracking-wide">
                        تفعيل حساب {game === 'apple' ? 'Apple of Fortune' : 'Crash'}
                      </h4>
                      <p className="text-[10px] text-white/50 font-cairo">
                        جاري فحص وتأكيد تفعيل اشتراك الـ ID في Greenbet
                      </p>
                    </div>

                    <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-white/5 text-right">
                      {[
                        {
                          label: 'جاري فحص الـ ID في سيرفر Greenbet',
                          delay: 0.3,
                        },
                        { label: 'التحقق من تفعيل البروموكود E1111', delay: 1.5 },
                        { label: 'تحليل عمليات الإيداع النشطة بالشبكة', delay: 2.8 },
                        { label: 'التحقق من تخطي الحد الأدنى للإيداع (300 EGP)', delay: 3.8 },
                      ].map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: step.delay, duration: 0.5 }}
                          className="flex flex-row-reverse items-center justify-between gap-2.5 text-right text-xs"
                        >
                          <div className="flex flex-row-reverse items-center gap-2">
                            <div className="relative flex items-center justify-center">
                              <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-green-400"
                              />
                            </div>
                            <span className="text-[10px] font-medium text-white/80 font-cairo">
                              {step.label}
                            </span>
                          </div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: step.delay + 0.6 }}
                            className="text-[7.5px] font-mono font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20"
                          >
                            نشط
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-center gap-1.5 text-white/40">
                      <LoaderCircle className="w-3.5 h-3.5 text-green-400 animate-spin" />
                      <span className="text-[8.5px] tracking-widest font-black uppercase font-mono">
                        GREENBET ENGINE CONNECTED
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
