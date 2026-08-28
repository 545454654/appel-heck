import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  LayoutGrid,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import appleHackLogo from '../assets/images/apple_hack_logo_1787875444610.jpg';
import greenbetLogo from '../assets/images/greenbet_logo_1787875455201.jpg';
import goodAppleImg from '../assets/images/apple_good_icon_1787879088298.jpg';
import badAppleImg from '../assets/images/apple_bad_icon_1787879101290.jpg';
import { rtdb } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

interface WinnerItem {
  id: string;
  idDisplay: string;
  betAmount: string;
  winAmount: string;
}

interface MainScreenProps {
  userID: string;
  sessionTimeLeft: number;
  selectedGame: string;
}

const SUPER_USERS = ['1729018123'];

// مصفوفة تعريفية للصفوف بترتيب عكسي لتظهر بالشكل الصحيح على الشاشة (من الأعلى x349.68 إلى الأسفل x1.23)
const targetRows = [
  { mult: 'x349.68', row: 9 }, // أعلى صف
  { mult: 'x69.93', row: 8 },
  { mult: 'x27.92', row: 7 },
  { mult: 'x11.18', row: 6 },
  { mult: 'x6.71', row: 5 },
  { mult: 'x4.02', row: 4 },
  { mult: 'x2.41', row: 3 },
  { mult: 'x1.93', row: 2 },
  { mult: 'x1.54', row: 1 },
  { mult: 'x1.23', row: 0 }, // أسفل صف يبدأ منه المشغل
];

// مكون التفاحة المضيئة (السليمة الخضراء/الحمراء والتالفة المقطومة)
function AppleItem({ isSafe }: { isSafe: boolean }) {
  if (isSafe) {
    return (
      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className="relative flex items-center justify-center w-full h-full p-0.5"
      >
        <img
          src={goodAppleImg}
          alt="تفاحة سليمة"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-full drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="relative flex items-center justify-center w-full h-full p-0.5"
    >
      <img
        src={badAppleImg}
        alt="تفاحة مقطومة"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-full opacity-80 filter brightness-90 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]"
      />
    </motion.div>
  );
}

export default function MainScreen({
  userID,
  sessionTimeLeft,
  selectedGame,
}: MainScreenProps) {
  const [onlineCount, setOnlineCount] = useState(1892);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [winners, setWinners] = useState<WinnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [applePredictions, setApplePredictions] = useState<Record<string, any>>({});
  const [crashTarget, setCrashTarget] = useState<number | null>(null);
  const [currentCrashVal, setCurrentCrashVal] = useState(0);
  const [crashStatus, setCrashStatus] = useState<
    'idle' | 'scanning' | 'counting' | 'complete'
  >('idle');
  const [crashHistory, setCrashHistory] = useState<number[]>([
    1.45, 2.1, 1.15, 4.8, 1.95, 3.2,
  ]);
  const [rawCrashPre, setRawCrashPre] = useState(() =>
    (1 + Math.random() * 4).toFixed(2)
  );

  // Superuser Firebase RTDB Fetch for Crash
  useEffect(() => {
    if (selectedGame === 'crash' && SUPER_USERS.includes(userID.trim())) {
      const fetchCrashData = async () => {
        try {
          const res = await fetch(
            'https://x-men-256cc-default-rtdb.firebaseio.com/pre/hipr/hipr.json'
          );
          if (res.ok) {
            const data = await res.json();
            let parsed = '1.00';
            if (data != null) {
              if (typeof data === 'object') {
                if (data.hipr !== undefined) {
                  parsed = String(data.hipr);
                } else {
                  const keys = Object.keys(data);
                  parsed = keys.length > 0 ? String(data[keys[0]]) : JSON.stringify(data);
                }
              } else {
                parsed = String(data);
              }
            }
            parsed = parsed.replace(/[^\d.]/g, '');
            if (!parsed || isNaN(Number(parsed))) parsed = '1.00';
            setRawCrashPre(parsed);
          }
        } catch (err) {
          console.error('Error fetching RTDB:', err);
        }
      };
      fetchCrashData();
      const interval = setInterval(fetchCrashData, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGame, userID]);

  // توليد التوقعات بناء على الصعوبة التدريجية للصفوف وهيكلة Firebase m11
  const generatePredictions = async (): Promise<Record<string, any>> => {
    const finalObject: Record<string, any> = {};

    // نمر على 10 صفوف (من 0 إلى 9)
    for (let r = 0; r < 10; r++) {
      // تحديد عدد التفاحات السليمة بالصف بناء على رقم الصف
      let safeCount = 4;
      if (r >= 4 && r < 7) safeCount = 3; // الصفوف 4، 5، 6
      if (r >= 7 && r < 9) safeCount = 2; // الصفوف 7، 8
      if (r >= 9) safeCount = 1; // الصف التاسع والأخير

      // تحديد أماكن التفاح السليم بشكل عشوائي داخل الأعمدة الـ 5
      const safeCols: number[] = [];
      while (safeCols.length < safeCount) {
        const randomCol = Math.floor(Math.random() * 5); // اختيار عمود عشوائي من 0 إلى 4
        if (!safeCols.includes(randomCol)) {
          safeCols.push(randomCol);
        }
      }

      // كتابة القيم للخانة (تحويل الصف والعمود لرمز الخانة من 1 لـ 50)
      for (let c = 0; c < 5; c++) {
        const mIndex = r * 5 + c + 1; // المعادلة السحرية لحساب رقم الخانة الفريد
        const value = safeCols.includes(c) ? '1' : '0'; // 1 = سليمة، 0 = تالفة

        // الهيكل المعتمد داخل الفايربيز
        finalObject[`m${mIndex}`] = { [`m${mIndex}`]: value };
      }
    }

    // الآن نقوم برفع الكائن بالكامل إلى الفايربيز تحت مسار m11
    try {
      const rRef = ref(rtdb, 'm11');
      await set(rRef, finalObject);
    } catch (err) {
      console.error('Firebase m11 write error:', err);
    }

    return finalObject;
  };

  // الاستماع المباشر للتوقعات من مسار m11 في Firebase
  useEffect(() => {
    if (selectedGame === 'apple') {
      try {
        const m11Ref = ref(rtdb, 'm11');
        const unsubscribe = onValue(m11Ref, (snapshot) => {
          const data = snapshot.val();
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setApplePredictions(data);
          }
        });
        return () => unsubscribe();
      } catch (err) {
        console.error('Error connecting to m11 RTDB:', err);
      }
    }
  }, [selectedGame]);

  // دالة التحقق من سلامة التفاحة بناء على التوقعات ومعادلة الإحداثيات (m1 إلى m50)
  const isSafeApple = (rowIdx: number, colIdx: number) => {
    if (!applePredictions || Object.keys(applePredictions).length === 0) return false;

    // 1. حساب الرقم التسلسلي للخانة
    const mIndex = rowIdx * 5 + colIdx + 1;
    const mKey = `m${mIndex}`;

    // 2. قراءة الكائن المقابل للخانة من التوقعات المجلوبة
    const mObj = (applePredictions as any)[mKey];

    // 3. التحقق من القيمة والتأكد أنها تساوي "1"
    if (mObj && typeof mObj === 'object' && mObj[mKey] === '1') {
      return true; // التفاحة سليمة!
    }

    return false; // التفاحة تالفة
  };

  // Winner generator helper
  const generateWinner = (): WinnerItem => {
    const rawId = Math.floor(100000000 + Math.random() * 900000000).toString();
    const maskedId = `${rawId.slice(0, 3)}***${rawId.slice(6)}`;
    const betOptions = [300, 500, 1000, 1500, 2000, 3000, 5000];
    const bet = betOptions[Math.floor(Math.random() * betOptions.length)];
    const multOptions = [1.23, 1.54, 1.93, 2.41, 4.02, 6.71, 11.18];
    const mult = multOptions[Math.floor(Math.random() * multOptions.length)];
    const win = Math.floor(bet * mult);
    return {
      id: rawId + Math.random(),
      idDisplay: maskedId,
      betAmount: `${bet} EGP`,
      winAmount: `${win} EGP`,
    };
  };

  // Online users ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = prev + delta;
        return next < 1000 || next > 2000 ? prev : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Winners ticker updates
  useEffect(() => {
    setWinners(Array.from({ length: 5 }, generateWinner));
    const timer = setInterval(() => {
      setWinners((prev) => [generateWinner(), ...prev.slice(0, 4)]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Apple Start Prediction (توليد ورفع التوقعات وإظهار كافة التفاحات السليمة)
  const handleApplePredict = async () => {
    setIsLoading(true);
    try {
      const newObj = await generatePredictions();
      setApplePredictions(newObj);
      setHasRevealed(true);
    } catch (err) {
      console.error('Prediction fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apple Reset / Sync (توليد جولة جديدة ورفعها إلى Firebase Realtime Database)
  const handleAppleReset = async () => {
    setIsLoading(true);
    try {
      const newPredictions = await generatePredictions();
      setApplePredictions(newPredictions);
      setHasRevealed(true);
    } catch (err) {
      console.error('Reset synchronization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Crash Start Prediction
  const handleCrashPredict = async () => {
    setCrashStatus('scanning');
    setIsLoading(true);
    setCrashTarget(null);
    setCurrentCrashVal(0);

    await new Promise((r) => setTimeout(r, 400));

    let finalMult = 1;
    if (SUPER_USERS.includes(userID.trim())) {
      finalMult = parseFloat(rawCrashPre) || 1;
    } else {
      finalMult = +(1 + Math.random() * 4).toFixed(2);
      setRawCrashPre(finalMult.toFixed(2));
    }

    setCrashTarget(finalMult);
    setCrashStatus('counting');

    const totalDuration = 800;
    const steps = 30;
    const intervalTime = totalDuration / steps;
    let currentStep = 0;

    const countInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const startVal = finalMult < 1 ? 0 : 1;
      const eased = startVal + (finalMult - startVal) * Math.pow(progress, 1.3);
      setCurrentCrashVal(+eased.toFixed(2));

      if (currentStep >= steps) {
        clearInterval(countInterval);
        setCurrentCrashVal(finalMult);
        setCrashStatus('complete');
        setIsLoading(false);
        setCrashHistory((prev) => [finalMult, ...prev.slice(0, 5)]);
      }
    }, intervalTime);
  };

  const handleCrashReset = () => {
    setCrashStatus('idle');
    setCurrentCrashVal(0);
    setCrashTarget(null);
  };

  // Time format helper
  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return { h, m, s };
  };

  const { h: hours, m: minutes, s: seconds } = formatTime(sessionTimeLeft);
  const timeCards = [
    { label: 'ساعة', val: hours, max: 1 },
    { label: 'دقيقة', val: minutes, max: 60 },
    { label: 'ثانية', val: seconds, max: 60 },
  ];

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-transparent overflow-hidden">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src={appleHackLogo}
            alt="Apple Hack Logo"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-cover border-2 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          />
          <div>
            <h1 className="text-lg font-black font-orbitron tracking-tight text-white flex items-center gap-1.5">
              Apple <span className="text-green-400">Hack</span>
            </h1>
            <span className="text-[9px] text-green-400/80 font-bold font-mono block -mt-0.5">
              GREENBET ENGINE VIP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-green-500/20">
          <Users className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[10px] font-mono font-bold text-white/90">
            {onlineCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-20 space-y-6 scrollbar-hide">
        {/* 3 Circular RGB Countdown Dials */}
        <div className="flex justify-center gap-4 py-1 px-2">
          {timeCards.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-3 flex-1"
            >
              <div className="relative w-full aspect-square max-w-[80px] flex items-center justify-center group rounded-full">
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.7, 0.3],
                    backgroundColor: [
                      'rgba(34,197,94,0.2)',
                      'rgba(16,185,129,0.3)',
                      'rgba(6,182,212,0.25)',
                      'rgba(34,197,94,0.2)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-dashed border-green-500/40"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-1.5 rounded-full border border-dotted border-white/30"
                />

                <svg className="w-full h-full -rotate-90 relative z-10 p-1.5">
                  <defs>
                    <linearGradient
                      id={`grad-time-${idx}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke={`url(#grad-time-${idx})`}
                    strokeWidth="4"
                    strokeDasharray="250"
                    animate={{
                      strokeDashoffset: 250 - (item.val / item.max) * 250,
                    }}
                    transition={{
                      strokeDashoffset: { duration: 1, ease: 'linear' },
                    }}
                    fill="transparent"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[8px] font-black text-green-400 uppercase mb-0.5 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)] font-cairo"
                  >
                    {item.label[0]}
                  </motion.span>
                  <span className="text-lg md:text-xl font-orbitron font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter">
                    {item.val.toString().padStart(2, '0')}
                  </span>
                </div>

                <motion.div
                  animate={{ top: ['20%', '80%', '20%'], opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-1/2 -translate-x-1/2 w-10 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] z-30"
                />
              </div>
              <span className="text-[8px] font-black text-white/50 uppercase font-orbitron group-hover:text-green-400 transition-all font-cairo">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Game Area */}
        {selectedGame === 'apple' ? (
          <>
            {/* Hidden RTDB inputs for fallback synchronization */}
            <div className="hidden" id="firebase-apple-predictions">
              {Array.from({ length: 50 }).map((_, i) => {
                const num = i + 1;
                const key = `m${num}`;
                const val =
                  applePredictions &&
                  applePredictions[key] &&
                  applePredictions[key][key] !== undefined
                    ? String(applePredictions[key][key])
                    : '1';
                return (
                  <input
                    key={num}
                    type="text"
                    id={`apple-m-${num}`}
                    value={val}
                    readOnly
                    className="hidden"
                  />
                );
              })}
            </div>

            {/* Apple Grid Card */}
            <div className="p-3 glass rounded-[1.75rem] border-green-500/20 space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[9px] font-black uppercase text-white/70 font-cairo">
                    خوارزمية Apple of Fortune
                  </span>
                </div>
                <div className="flex flex-row-reverse items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-green-400 uppercase font-mono">
                    GREENBET SYNC (m11 Active)
                  </span>
                </div>
              </div>

              {/* 10 Rows with targetRows order (from row 9 at top to row 0 at bottom) */}
              <div className="flex flex-col gap-1 items-center w-full">
                {targetRows.map((rowInfo, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex items-center justify-between w-full max-w-[420px] bg-white/[0.01] py-0.5 px-1.5 rounded-xl border border-white/5 gap-1.5"
                  >
                    {/* Odds Multiplier Badge */}
                    <div className="relative flex items-center justify-center min-w-[52px] h-8">
                      <div className="px-1.5 py-0.5 rounded-md border border-green-500/30 bg-green-500/10 font-mono text-[10px] font-black text-green-400 text-center relative tracking-wide drop-shadow-[0_0_4px_rgba(34,197,94,0.25)]">
                        <span className="absolute -top-[1px] -left-[1px] w-1 h-1 border-t border-l border-green-400 rounded-tl" />
                        <span className="absolute -bottom-[1px] -right-[1px] w-1 h-1 border-b border-r border-green-400 rounded-br" />
                        <span className="absolute -top-[1px] -right-[1px] w-1 h-1 border-t border-r border-green-400 rounded-tr" />
                        <span className="absolute -bottom-[1px] -left-[1px] w-1 h-1 border-b border-l border-green-400 rounded-bl" />
                        {rowInfo.mult}
                      </div>
                    </div>

                    {/* 5 Column Cells */}
                    <div className="grid grid-cols-5 gap-1.5 flex-1 justify-items-center">
                      {Array.from({ length: 5 }).map((_, cIdx) => {
                        const isSafe = isSafeApple(rowInfo.row, cIdx);
                        return (
                          <motion.div
                            key={cIdx}
                            className={`w-[36px] h-[36px] rounded-lg border flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                              hasRevealed
                                ? isSafe
                                  ? 'border-green-500/60 bg-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.45)]'
                                  : 'border-red-500/30 bg-red-950/20 shadow-[0_0_6px_rgba(239,68,68,0.2)]'
                                : 'border-white/5 bg-white/[0.02]'
                            }`}
                            animate={hasRevealed && isSafe ? { scale: [1, 1.06, 1] } : {}}
                            transition={{ duration: 0.25 }}
                          >
                            {hasRevealed && <AppleItem isSafe={isSafe} />}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apple Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <button
                onClick={handleApplePredict}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 rounded-xl font-black text-white text-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] flex flex-row-reverse items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 font-cairo cursor-pointer"
              >
                <Play
                  className={`w-4 h-4 fill-current ${
                    isLoading ? 'animate-pulse' : ''
                  }`}
                />
                <span className="flex-1 text-center">ابدأ التوقع</span>
              </button>

              <button
                onClick={handleAppleReset}
                disabled={isLoading}
                className="w-full py-3.5 bg-white/5 rounded-xl font-black text-white text-sm border border-white/10 flex flex-row-reverse items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 font-cairo cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="flex-1 text-center">إعادة تعيين</span>
              </button>
            </div>
          </>
        ) : (
          /* Crash Game View */
          <>
            {/* Recent Multipliers History */}
            <div className="space-y-1.5 px-2 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-wider font-cairo">
                  سجل التوقعات الأخيرة
                </span>
                <div className="flex flex-row-reverse items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[7.5px] font-bold text-white/40 uppercase font-cairo">
                    متصل
                  </span>
                </div>
              </div>

              <div className="flex flex-row-reverse gap-1.5 items-center overflow-x-auto scrollbar-hide py-1">
                {crashHistory.map((mult, idx) => {
                  const isHigh = mult >= 3;
                  const isSuperHigh = mult >= 7;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`px-2 py-1 rounded-lg font-mono text-[10px] font-black border tracking-wider flex items-center gap-0.5 shrink-0 ${
                        isSuperHigh
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
                          : isHigh
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                          : 'bg-green-500/10 border-green-500/30 text-green-400'
                      }`}
                    >
                      {isSuperHigh && <Zap className="w-2.5 h-2.5 text-purple-400" />}
                      x{mult.toFixed(2)}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Radar Target Display */}
            <div className="flex items-center justify-center w-full py-2">
              <div className="relative w-full max-w-[200px] aspect-square rounded-[20px] border-2 border-green-500/80 bg-transparent flex flex-col items-center justify-center p-4 shadow-[0_0_25px_rgba(34,197,94,0.25)] hover:border-green-400/90 transition-all duration-500 group overflow-hidden">
                {/* 4 Cyber Corners */}
                <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-green-400 opacity-60 rounded-tl" />
                <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-green-400 opacity-60 rounded-br" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-green-400 opacity-60 rounded-tr" />
                <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-green-400 opacity-60 rounded-bl" />

                {/* Laser Scanning Beam */}
                {crashStatus === 'scanning' && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"
                  />
                )}

                <div className="hidden" id="hidden-prediction-data">
                  {rawCrashPre}
                </div>

                <div className="text-center space-y-1 relative z-20">
                  <AnimatePresence mode="wait">
                    {crashStatus === 'scanning' ? (
                      <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <LoaderCircle className="w-6 h-6 text-green-400 animate-spin" />
                        <span className="text-[9px] font-black text-green-400 tracking-wider font-mono animate-pulse uppercase">
                          LOCKED TARGET...
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="value"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.35)] font-cairo">
                          x{currentCrashVal.toFixed(2)}
                        </span>
                        {crashStatus === 'counting' && (
                          <span className="text-[9px] font-black tracking-widest text-white/40 uppercase mt-1.5 font-cairo">
                            توقع الارتفاع الحالي
                          </span>
                        )}
                        {crashStatus === 'idle' && (
                          <span className="text-[9px] font-black text-white/30 uppercase mt-1.5 font-cairo">
                            جاهز للتنبؤ
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Crash Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <button
                onClick={handleCrashPredict}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 rounded-xl font-black text-white text-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] flex flex-row-reverse items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 font-cairo cursor-pointer"
              >
                <Play
                  className={`w-4 h-4 fill-current ${
                    isLoading ? 'animate-pulse' : ''
                  }`}
                />
                <span className="flex-1 text-center tracking-wider text-sm">
                  ابدأ التوقع
                </span>
              </button>

              <button
                onClick={handleCrashReset}
                disabled={isLoading}
                className="w-full py-3.5 bg-white/5 rounded-xl font-black text-white text-sm border border-white/10 flex flex-row-reverse items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 font-cairo cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="flex-1 text-center">إعادة تعيين</span>
              </button>
            </div>
          </>
        )}

        {/* Live Winners Ticker */}
        <div className="space-y-4">
          <div className="flex flex-row-reverse items-center gap-2 px-2">
            <Trophy className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-black uppercase text-white/40 font-cairo">
              قائمة الفائزين المباشرة - Greenbet
            </span>
          </div>

          <div className="space-y-2 bg-white/[0.02] p-4 rounded-3xl border border-white/5">
            <div className="grid grid-cols-3 text-center border-b border-white/10 pb-3 text-xs font-black text-green-300 tracking-wider font-cairo">
              <div>الـ ID</div>
              <div>مبلغ الرهان</div>
              <div>مبلغ الفوز</div>
            </div>

            <div className="space-y-2 pt-2">
              <AnimatePresence initial={false}>
                {winners.map((win) => (
                  <motion.div
                    key={win.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-3 text-center items-center py-3 px-1 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 text-xs font-medium"
                  >
                    <div className="font-mono text-white/80 tracking-wide">
                      {win.idDisplay}
                    </div>
                    <div className="text-white/60 font-mono">{win.betAmount}</div>
                    <div className="font-mono text-green-400 font-bold tracking-tight bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/10 w-fit mx-auto shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                      {win.winAmount}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Initial Welcome / ID Approved Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-green-500/10 blur-[80px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-[100px]" />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="relative w-full max-w-[300px] bg-zinc-950/90 backdrop-blur-md px-5 py-6 rounded-[1.75rem] border border-green-500/30 flex flex-col items-center gap-5 shadow-[0_0_35px_rgba(34,197,94,0.2)] text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-green-500 to-transparent" />
              <div className="absolute top-0 right-0 h-16 w-[2px] bg-gradient-to-b from-green-500 to-transparent" />
              <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
              <div className="absolute bottom-0 left-0 h-16 w-[2px] bg-gradient-to-t from-cyan-500 to-transparent" />

              <div className="space-y-4 flex flex-col items-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border-t-2 border-r-[1.5px] border-l-0 border-b-0 border-green-400 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-2 border-b-2 border-l-[1.5px] border-r-0 border-t-0 border-emerald-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500/10 rounded-full blur-[4px] -z-10"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-green-500/30 bg-zinc-950 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                    <img
                      src={
                        selectedGame === 'apple'
                          ? 'https://cdn.phototourl.com/free/2026-07-17-388e2c51-99d0-4576-8b6d-420c7e8f7a3b.jpg'
                          : 'https://cdn.phototourl.com/free/2026-07-17-bdde0a56-8095-4e40-9087-8bb52f52e3e0.jpg'
                      }
                      alt={selectedGame === 'apple' ? 'Apple of Fortune' : 'Crash'}
                      referrerPolicy="no-referrer"
                      className="w-[90%] h-[90%] rounded-full object-cover relative z-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] tracking-[0.2em] font-black text-green-400 uppercase font-cairo">
                    Apple Hack VIP System
                  </span>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5 flex items-center justify-center gap-1 mx-auto">
                    <ShieldCheck className="w-3 h-3 text-green-400" />
                    <span className="text-[8.5px] font-bold text-green-400 font-mono">
                      GREENBET ID APPROVED
                    </span>
                  </div>
                  <div className="pt-1">
                    <p className="text-[10px] text-white/50 mb-0.5 font-cairo">
                      تم تفعيل سكريبت {selectedGame === 'apple' ? 'Apple of Fortune' : 'Crash'}
                    </p>
                    <h3 className="text-base font-black font-orbitron tracking-tight text-white break-all drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      {userID || 'VIP USER'}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-3 bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 rounded-2xl font-black text-[11px] text-white shadow-lg shadow-green-500/25 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider font-cairo cursor-pointer"
              >
                ابدأ التوقع الآن
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
