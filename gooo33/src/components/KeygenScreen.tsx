import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, ShieldCheck, Check, Copy, LogIn } from 'lucide-react';
import { saveKeyGenerated } from '../firebase';

interface KeygenScreenProps {
  onNavigate: (screen: string) => void;
  onCopyKey: (key: string) => void;
  timeLeft: number;
}

export default function KeygenScreen({
  onNavigate,
  onCopyKey,
  timeLeft: _timeLeft,
}: KeygenScreenProps) {
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const chars = 'ABCDEF0123456789';
    const randBlock = () =>
      Array.from({ length: 4 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    const newKey = `${randBlock()}-${randBlock()}-${randBlock()}-${randBlock()}`;
    setGeneratedKey(newKey);
    saveKeyGenerated(newKey, 'VIP_USER', 'apple');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnter = () => {
    onCopyKey(generatedKey);
    onNavigate('main');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[1000] overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-green-500/10 blur-[85px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[220px] h-[220px] rounded-full bg-cyan-500/10 blur-[110px]" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 120 }}
        className="relative w-full max-w-[300px] bg-zinc-950/90 backdrop-blur-md px-5 py-6 rounded-[1.75rem] border border-green-500/30 shadow-[0_0_35px_rgba(34,197,94,0.25)] text-center overflow-hidden flex flex-col gap-4"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-green-500 to-transparent" />
        <div className="absolute top-0 right-0 h-16 w-[2px] bg-gradient-to-b from-green-500 to-transparent" />
        <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
        <div className="absolute bottom-0 left-0 h-16 w-[2px] bg-gradient-to-t from-cyan-500 to-transparent" />

        {/* Animated Cyber Key Rings */}
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-t-2 border-r-[1px] border-b-0 border-l-0 border-green-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-1.5 border-b-2 border-l-[1px] border-t-0 border-r-0 border-emerald-500 rounded-full opacity-70"
          />
          <div className="relative w-11 h-11 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.4)]">
            <Key className="w-5 h-5 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-1.5">
          <span className="text-[8px] tracking-[0.25em] font-black text-green-400 uppercase font-cairo">
            Apple Hack VIP System
          </span>
          <h2 className="text-base font-black font-orbitron text-white">
            تم إنشاء المفتاح بنجاح
          </h2>
          <div className="flex items-center justify-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5 w-fit mx-auto">
            <ShieldCheck className="w-3 h-3 text-green-400" />
            <span className="text-[8px] font-bold text-green-400 font-mono">
              GREENBET VIP ACCESS
            </span>
          </div>
        </div>

        {/* Key Display Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-cyan-400 rounded-2xl blur-[12px] opacity-10 group-hover:opacity-25 transition-all duration-300" />
          <div className="relative bg-black/60 p-3 rounded-2xl border border-green-500/20 text-center space-y-2">
            <div className="flex justify-between items-center text-[7.5px] font-black text-green-400 uppercase tracking-widest px-1 font-cairo">
              <span>تشفير 256-BIT</span>
              <span>مفتاح الدخول</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] rounded-xl py-1.5 px-2.5 border border-white/5 gap-2">
              <span className="text-[11px] sm:text-[12px] font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-green-100 to-green-300 tracking-wider break-all text-left flex-1 selection:bg-green-500/30">
                {generatedKey}
              </span>
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                  copied
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-green-400 hover:border-green-500/30'
                }`}
                title="نسخ المفتاح"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="w-full py-3 bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-500 rounded-2xl font-black text-[11px] text-white shadow-lg shadow-green-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex flex-row-reverse items-center justify-center gap-2 font-cairo cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          دخول إلى سكريبت Apple Hack
        </button>
      </motion.div>
    </div>
  );
}
