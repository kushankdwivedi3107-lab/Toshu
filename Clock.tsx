import { useState, useEffect } from 'react';
import { X, Clock as ClockIcon, Bell, Timer as TimerIcon, Gauge, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Theme } from '../App';

type ClockMode = 'clock' | 'alarm' | 'timer' | 'stopwatch';

interface ClockProps {
  onClose: () => void;
  theme: Theme;
}

export function Clock({ onClose, theme }: ClockProps) {
  const [mode, setMode] = useState<ClockMode>('clock');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [alarmTime, setAlarmTime] = useState('09:00');
  const [alarmSet, setAlarmSet] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const bgClass = theme === 'dark' ? 'bg-gray-800' : theme === 'bw' ? 'bg-white border-4 border-black' : theme === 'paper' ? 'bg-[#FFFEF9] border-2 border-amber-900/20' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : theme === 'paper' ? 'text-amber-900' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-400' : theme === 'bw' ? 'text-gray-700' : theme === 'paper' ? 'text-amber-700' : 'text-gray-600';
  const buttonClass = theme === 'dark' 
    ? 'bg-gray-700 text-white hover:bg-gray-600' 
    : theme === 'bw'
    ? 'bg-white border-2 border-black hover:bg-black hover:text-white'
    : theme === 'paper'
    ? 'bg-amber-50 border border-amber-900/30 text-amber-900 hover:bg-amber-100'
    : 'bg-gray-100 hover:bg-gray-200';
  const activeButtonClass = theme === 'bw' ? 'bg-black text-white' : theme === 'paper' ? 'bg-amber-900 text-white' : 'bg-red-500 text-white';

  // Play beep sound
  const playBeep = () => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check alarm
      if (alarmSet && mode === 'alarm') {
        const currentTimeStr = now.toTimeString().slice(0, 5);
        if (currentTimeStr === alarmTime) {
          playBeep();
          setTimeout(playBeep, 600);
          setTimeout(playBeep, 1200);
          try { fetch('/api/alarm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: 400, frequency: 1200 }) }); } catch (e) {}
          alert('⏰ Alarm!');
          setAlarmSet(false);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarmTime, alarmSet, mode]);

  // Timer countdown
  useEffect(() => {
    if (timerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      const interval = setInterval(() => {
            if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setTimerRunning(false);
            playBeep();
            setTimeout(playBeep, 400);
            setTimeout(playBeep, 800);
            try { fetch('/api/alarm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: 300, frequency: 1000 }) }); } catch (e) {}
            alert('⏰ Timer finished!');
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, timerMinutes, timerSeconds]);

  // Stopwatch
  useEffect(() => {
    if (stopwatchRunning) {
      const interval = setInterval(() => {
        setStopwatchTime(t => t + 10);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [stopwatchRunning]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatStopwatch = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className={`${bgClass} rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative overflow-hidden`}>
        {/* Decorative elements for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg ${buttonClass} transition-colors z-10`}
        >
          <X size={20} />
        </button>

        {/* Sound Toggle */}
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`absolute top-4 right-16 p-2 rounded-lg ${buttonClass} transition-colors`}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode('clock')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-sm ${
              mode === 'clock' ? `${activeButtonClass} shadow-lg scale-105` : buttonClass
            }`}
          >
            <ClockIcon size={20} />
            Clock
          </button>
          <button
            onClick={() => setMode('alarm')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-sm ${
              mode === 'alarm' ? `${activeButtonClass} shadow-lg scale-105` : buttonClass
            }`}
          >
            <Bell size={20} />
            Alarm
          </button>
          <button
            onClick={() => setMode('timer')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-sm ${
              mode === 'timer' ? `${activeButtonClass} shadow-lg scale-105` : buttonClass
            }`}
          >
            <TimerIcon size={20} />
            Timer
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-sm ${
              mode === 'stopwatch' ? `${activeButtonClass} shadow-lg scale-105` : buttonClass
            }`}
          >
            <Gauge size={20} />
            Stopwatch
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[450px] flex flex-col items-center justify-center">
          {mode === 'clock' && (
            <div className="text-center space-y-8 w-full">
              {/* Elegant Clock Display */}
              <div className="relative">
                <div className={`text-8xl ${textClass} font-extralight tracking-wide mb-6 font-mono`}>
                  {formatTime(currentTime)}
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 blur-2xl -z-10 rounded-full"></div>
              </div>
              
              <div className={`text-2xl ${secondaryTextClass} mb-8 tracking-wide`}>
                {formatDate(currentTime)}
              </div>
              
              {/* Weather Info Card */}
              <div className={`flex items-center justify-center gap-10 mt-10 p-8 ${theme === 'dark' ? 'bg-gray-700/50' : theme === 'bw' ? 'bg-gray-50 border-2 border-gray-300' : theme === 'paper' ? 'bg-amber-50/50 border border-amber-900/20' : 'bg-gradient-to-br from-blue-50 to-orange-50'} rounded-2xl backdrop-blur-sm shadow-lg`}>
                <div className="text-center">
                  <div className="text-6xl mb-3">☀️</div>
                  <div className={`text-sm ${secondaryTextClass} tracking-wide`}>Sunny</div>
                </div>
                <div className="h-20 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className={`text-6xl ${textClass} font-light`}>24°</div>
                  <div className={`text-sm ${secondaryTextClass} mt-2 tracking-wide`}>Temperature</div>
                </div>
                <div className="h-20 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className={`text-3xl ${textClass} mb-3`}>💧 65%</div>
                  <div className={`text-sm ${secondaryTextClass} tracking-wide`}>Humidity</div>
                </div>
              </div>
            </div>
          )}

          {mode === 'alarm' && (
            <div className="text-center space-y-8 w-full max-w-md">
              <div className="relative">
                <Bell size={80} className={`mx-auto ${alarmSet ? 'text-red-500 animate-pulse' : secondaryTextClass} mb-8`} />
                {alarmSet && (
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <h3 className={`text-3xl ${textClass} mb-6`}>Set Alarm</h3>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className={`w-full text-4xl text-center p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white border-2 border-gray-600' 
                    : theme === 'bw'
                    ? 'bg-white border-4 border-black'
                    : theme === 'paper'
                    ? 'bg-amber-50 border-2 border-amber-900/30 text-amber-900'
                    : 'bg-gray-50 border-2 border-gray-300'
                } font-mono shadow-lg`}
              />
              <button 
                onClick={() => setAlarmSet(!alarmSet)}
                className={`w-full py-5 rounded-2xl ${alarmSet ? 'bg-gray-500 hover:bg-gray-600' : activeButtonClass} text-xl mt-6 shadow-lg transition-all transform hover:scale-105`}
              >
                {alarmSet ? '🔔 Cancel Alarm' : '⏰ Set Alarm'}
              </button>
              {alarmSet && (
                <p className={`text-sm ${secondaryTextClass} mt-4 animate-pulse`}>
                  Alarm set for {alarmTime}
                </p>
              )}
            </div>
          )}

          {mode === 'timer' && (
            <div className="text-center space-y-6 w-full max-w-md">
              <div className="relative">
                <div className={`text-8xl ${textClass} font-light mb-8 font-mono`}>
                  {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
                </div>
                {timerRunning && (
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                  </div>
                )}
              </div>
              
              {!timerRunning && (
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <label className={`block text-sm ${secondaryTextClass} mb-2 tracking-wide`}>Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                      className={`w-full text-3xl text-center p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white' 
                          : theme === 'bw'
                          ? 'bg-white border-2 border-black'
                          : theme === 'paper'
                          ? 'bg-amber-50 border border-amber-900/30 text-amber-900'
                          : 'bg-gray-50'
                      } font-mono shadow-md`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm ${secondaryTextClass} mb-2 tracking-wide`}>Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
                      className={`w-full text-3xl text-center p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white' 
                          : theme === 'bw'
                          ? 'bg-white border-2 border-black'
                          : theme === 'paper'
                          ? 'bg-amber-50 border border-amber-900/30 text-amber-900'
                          : 'bg-gray-50'
                      } font-mono shadow-md`}
                    />
                  </div>
                </div>
              )}

              {/* Quick Timer Presets */}
              {!timerRunning && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <button onClick={() => { setTimerMinutes(5); setTimerSeconds(0); }} className={`py-3 rounded-xl ${buttonClass} shadow-md hover:shadow-lg transition-all`}>5m</button>
                  <button onClick={() => { setTimerMinutes(10); setTimerSeconds(0); }} className={`py-3 rounded-xl ${buttonClass} shadow-md hover:shadow-lg transition-all`}>10m</button>
                  <button onClick={() => { setTimerMinutes(25); setTimerSeconds(0); }} className={`py-3 rounded-xl ${buttonClass} shadow-md hover:shadow-lg transition-all`}>25m</button>
                  <button onClick={() => { setTimerMinutes(45); setTimerSeconds(0); }} className={`py-3 rounded-xl ${buttonClass} shadow-md hover:shadow-lg transition-all`}>45m</button>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-5 rounded-2xl ${activeButtonClass} flex items-center justify-center gap-3 text-xl shadow-lg transition-all transform hover:scale-105`}
                >
                  {timerRunning ? <><Pause size={28} /> Pause</> : <><Play size={28} /> Start</>}
                </button>
                <button 
                  onClick={() => { setTimerRunning(false); setTimerMinutes(25); setTimerSeconds(0); }}
                  className={`px-8 py-5 rounded-2xl ${buttonClass} shadow-lg transition-all transform hover:scale-105`}
                >
                  <RotateCcw size={28} />
                </button>
              </div>
            </div>
          )}

          {mode === 'stopwatch' && (
            <div className="text-center space-y-8 w-full max-w-md">
              <div className="relative">
                <div className={`text-7xl ${textClass} font-light mb-8 font-mono tracking-wider`}>
                  {formatStopwatch(stopwatchTime)}
                </div>
                {stopwatchRunning && (
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStopwatchRunning(!stopwatchRunning)}
                  className={`flex-1 py-5 rounded-2xl ${activeButtonClass} flex items-center justify-center gap-3 text-xl shadow-lg transition-all transform hover:scale-105`}
                >
                  {stopwatchRunning ? <><Pause size={28} /> Pause</> : <><Play size={28} /> Start</>}
                </button>
                <button 
                  onClick={() => { setStopwatchRunning(false); setStopwatchTime(0); }}
                  className={`px-8 py-5 rounded-2xl ${buttonClass} shadow-lg transition-all transform hover:scale-105`}
                >
                  <RotateCcw size={28} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}