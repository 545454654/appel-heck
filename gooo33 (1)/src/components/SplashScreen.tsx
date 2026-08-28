import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import appleHackLogo from '../assets/images/apple_hack_logo_1787875444610.jpg';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-transparent relative overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: '100vh', x: `${Math.random() * 100}vw` }}
          animate={{
            opacity: [0, 1, 0],
            y: '-10vh',
            x: `${Math.random() * 100 - 50}vw`,
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
          className="absolute w-1 h-1 bg-blue-100 rounded-full blur-[1px] z-0"
        />
      ))}

      <div className="flex flex-col items-center justify-between h-[100dvh] py-24 w-full relative z-10">
        <div />
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-green-500/30 blur-[40px] opacity-60 rounded-full" />
            <img
              src={appleHackLogo}
              alt="Apple Hack Logo"
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-3xl object-cover relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] border-2 border-green-500/40"
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-8 bg-green-500/20 blur-[60px] rounded-full" />
            <h1 className="text-4xl md:text-6xl font-black font-orbitron text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-emerald-300 to-cyan-400">
                Apple{' '}
              </span>
              <span className="text-white">Hack</span>
            </h1>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full relative z-10 px-4">
          <p className="text-[12px] font-bold text-blue-300/60 uppercase font-cairo drop-shadow-[0_0_5px_rgba(59,130,246,0.4)]">
            جاري تحضير تجربة سحرية
          </p>
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 relative"
            >
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  left: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-white/30 skew-x-12"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
