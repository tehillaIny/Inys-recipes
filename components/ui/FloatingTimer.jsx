import React, { useState, useEffect } from 'react';
import { Play, Pause, BellRing, X } from 'lucide-react';

export default function FloatingTimer({ initialSeconds, label, onClose }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);

  //איפוס הטיימר
  useEffect(() => {
    setSeconds(initialSeconds);
    setIsPaused(false);
  }, [initialSeconds, label]);

  // מנוע הספירה לאחור
  useEffect(() => {
    let interval;
    if (!isPaused && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            playAlarm();
            setIsPaused(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, seconds]);

  // מנוע הצפצוף
  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (time) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + time);
        osc.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.2);
      };
      playBeep(0); playBeep(0.4); playBeep(0.8);
    } catch(e) {}
  };

  // עיצוב השניות לתצוגת שעון (00:00)
  const formatTimerDisplay = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-700/50 flex items-center justify-between z-50 animate-in slide-in-from-bottom-8" dir="rtl">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium tracking-wide">{label}</span>
        <span className={`text-3xl font-mono font-black tracking-wider mt-1 ${seconds === 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {formatTimerDisplay(seconds)}
        </span>
      </div>
      <div className="flex items-center gap-2.5 border-r border-gray-700/50 pr-4 ml-1">
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          className={`p-3 rounded-full transition-colors ${seconds === 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {seconds === 0 ? <BellRing className="w-6 h-6 animate-bounce" /> : (isPaused ? <Play className="w-6 h-6 text-green-400 fill-current" /> : <Pause className="w-6 h-6 text-amber-400 fill-current" />)}
        </button>
        <button 
          onClick={onClose} 
          className="p-3 bg-gray-800 rounded-full hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}