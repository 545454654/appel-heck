import React, { useState, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import ConditionScreen from './components/ConditionScreen';
import KeygenScreen from './components/KeygenScreen';
import MainScreen from './components/MainScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [userID, setUserID] = useState<string>('');
  const [correctKey, setCorrectKey] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('apple');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes

  // Countdown timer for session
  useEffect(() => {
    if (currentScreen === 'main' || currentScreen === 'keygen') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScreen]);

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#0a0a0a] text-white select-none overflow-x-hidden font-cairo">
      {/* Particle Canvas Background */}
      <ParticleBackground />

      {/* Screen Router */}
      <div className="relative z-10 w-full min-h-[100dvh]">
        {currentScreen === 'splash' && (
          <SplashScreen onComplete={() => setCurrentScreen('condition')} />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSetUserID={(id) => setUserID(id)}
            passwordValue={passwordValue}
            onPasswordChange={(val) => setPasswordValue(val)}
            correctKey={correctKey}
          />
        )}

        {currentScreen === 'condition' && (
          <ConditionScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSetUserID={(id) => setUserID(id)}
            selectedGame={selectedGame}
            onSetSelectedGame={(game) => setSelectedGame(game)}
          />
        )}

        {currentScreen === 'keygen' && (
          <KeygenScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onCopyKey={(key) => {
              setCorrectKey(key);
              setPasswordValue(key);
            }}
            timeLeft={timeLeft}
          />
        )}

        {currentScreen === 'main' && (
          <MainScreen
            userID={userID}
            sessionTimeLeft={timeLeft}
            selectedGame={selectedGame}
          />
        )}
      </div>
    </div>
  );
}
