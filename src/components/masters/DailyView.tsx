import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sun, 
  Clock, 
  CheckSquare, 
  Headphones, 
  Navigation, 
  QrCode, 
  Play, 
  Square, 
  Volume2, 
  Sparkles,
  Award 
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { soundEngine } from '../../services/soundEffects';
import { voiceEngine } from '../../services/voiceService';

export const DailyView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'briefing' | 'alarms' | 'attendance' | 'focus' | 'traffic' | 'qr'>('briefing');

  // Morning briefing state
  const [briefingText, setBriefingText] = useState('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  // Alarms state
  const [alarms, setAlarms] = useState([
    { id: '1', time: '08:00', label: 'Morning Clara Briefing & Coffee', enabled: true },
    { id: '2', time: '14:00', label: 'Midday Milestone Check', enabled: true },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('09:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Sprint Standup');

  // Attendance state
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [tasks, setTasks] = useState<string[]>([
    'Review Clara 10 Master module test results',
    'Verify zero static fallback integrity',
  ]);
  const [newTask, setNewTask] = useState('');

  // Focus sound state
  const [focusPlaying, setFocusPlaying] = useState(false);
  const [focusType, setFocusType] = useState<'rain' | 'whitenoise' | 'space' | 'lofi'>('rain');

  // Traffic state
  const [origin, setOrigin] = useState('Bandra West, Mumbai');
  const [destination, setDestination] = useState('Chhatrapati Shivaji Maharaj International Airport (BOM)');
  const [trafficReport, setTrafficReport] = useState('');
  const [isTrafficLoading, setIsTrafficLoading] = useState(false);

  // QR state
  const [qrText, setQrText] = useState('https://clara.cloud.internal/session/f35a1c9d');

  // Generate morning briefing
  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await claraApi.runDaily('briefing', {
        schedule: 'Sprint review at 10 AM, Design sync at 2 PM, Product roadmap at 4:30 PM',
        location: 'Mumbai & Global',
      });
      setBriefingText(res.briefing || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleSpeakBriefing = () => {
    if (briefingText) {
      voiceEngine.speak(briefingText);
    }
  };

  const handleToggleFocus = (type: 'rain' | 'whitenoise' | 'space' | 'lofi') => {
    if (focusPlaying && focusType === type) {
      soundEngine.stopFocusSound();
      setFocusPlaying(false);
    } else {
      setFocusType(type);
      soundEngine.startFocusSound(type);
      setFocusPlaying(true);
    }
  };

  const handleAddAlarm = () => {
    if (!newAlarmTime) return;
    setAlarms((prev) => [
      ...prev,
      { id: Date.now().toString(), time: newAlarmTime, label: newAlarmLabel || 'Alarm', enabled: true },
    ]);
  };

  const handleTestAlarmChime = () => {
    soundEngine.playAlarmChime();
  };

  const handleToggleClock = () => {
    if (!clockedIn) {
      setClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setClockedIn(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, newTask.trim()]);
    setNewTask('');
  };

  const handleCalculateTraffic = async () => {
    setIsTrafficLoading(true);
    try {
      const res = await claraApi.runDaily('traffic', { origin, destination });
      setTrafficReport(res.trafficReport || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsTrafficLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 4: ClaraDaily</h2>
              <span className="text-xs text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded font-mono">
                Functions 36–45
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated morning briefing, smart alarms, attendance ledger, focus soundscapes, and traffic API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => handleToggleClock()}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2 border transition-all ${
              clockedIn
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{clockedIn ? `Clocked In (${clockInTime})` : 'Clock In to Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Daily Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'briefing', label: 'Morning Briefing', icon: Sun },
          { id: 'alarms', label: 'Smart Alarms', icon: Clock },
          { id: 'attendance', label: 'Attendance & Tasks', icon: CheckSquare },
          { id: 'focus', label: 'Focus Audio', icon: Headphones },
          { id: 'traffic', label: 'Live Traffic', icon: Navigation },
          { id: 'qr', label: 'QR Hub', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Morning Briefing */}
      {activeSection === 'briefing' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Clara Executive Morning Briefing</h3>
              <p className="text-xs text-slate-400">Synthesizes weather, priority meetings, and global tech headlines.</p>
            </div>
            <div className="flex items-center gap-2">
              {briefingText && (
                <button
                  onClick={handleSpeakBriefing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Read Aloud</span>
                </button>
              )}
              <button
                onClick={handleGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingBriefing ? 'Generating Briefing...' : 'Generate Today\'s Briefing'}</span>
              </button>
            </div>
          </div>

          {briefingText ? (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {briefingText}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-400">
              Click "Generate Today's Briefing" to compile a customized executive briefing for today.
            </div>
          )}
        </div>
      )}

      {/* Smart Alarms */}
      {activeSection === 'alarms' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Cloud Alarms & Push Reminders</h3>
            <button
              onClick={handleTestAlarmChime}
              className="text-xs text-amber-400 hover:underline"
            >
              Test Alarm Sound
            </button>
          </div>

          <div className="flex gap-2 text-xs">
            <input
              type="time"
              value={newAlarmTime}
              onChange={(e) => setNewAlarmTime(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newAlarmLabel}
              onChange={(e) => setNewAlarmLabel(e.target.value)}
              placeholder="Alarm label or purpose..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddAlarm}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
            >
              Add Alarm
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-white font-mono">{alarm.time}</span>
                  <span className="text-slate-300">{alarm.label}</span>
                </div>
                <button
                  onClick={() =>
                    setAlarms((prev) =>
                      prev.map((a) => (a.id === alarm.id ? { ...a, enabled: !a.enabled } : a))
                    )
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                    alarm.enabled
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {alarm.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance & Tasks */}
      {activeSection === 'attendance' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Attendance & Productivity Ledger</h3>
            <span className="text-xs text-emerald-400 font-mono">
              Productivity Score: 96%
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Status:</span>
              <span className="text-sm font-bold text-white">
                {clockedIn ? `Active Session since ${clockInTime}` : 'Clocked Out'}
              </span>
            </div>
            <button
              onClick={handleToggleClock}
              className={`px-4 py-2 rounded-xl font-semibold ${
                clockedIn ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-300">Daily Tasks:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Log a milestone or task..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddTask}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950/50 rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-amber-500" />
                  <span className="text-slate-300">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Audio */}
      {activeSection === 'focus' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Focus Mode Binaural Synthesizer</h3>
            <span className="text-xs text-indigo-400">WebAudio Realtime Generator</span>
          </div>
          <p className="text-xs text-slate-400">
            Synthesizes continuous procedural ambient soundscapes to promote deep state flow with zero streaming latency.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'rain', label: 'Gentle Rain', desc: 'Brown noise with lowpass filter' },
              { id: 'space', label: 'Deep Space', desc: 'Resonant sub-bass drone' },
              { id: 'lofi', label: 'Lo-Fi Warmth', desc: 'Analog tape lowpass hum' },
              { id: 'whitenoise', label: 'White Noise', desc: 'Full spectrum static' },
            ].map((sound) => {
              const active = focusPlaying && focusType === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleToggleFocus(sound.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    active
                      ? 'bg-amber-950/80 border-amber-600 text-white shadow-lg shadow-amber-950/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{sound.label}</span>
                    {active ? (
                      <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{sound.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Traffic */}
      {activeSection === 'traffic' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Live Traffic & Transit API Hub</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Departure Origin:</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Destination Target:</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCalculateTraffic}
              disabled={isTrafficLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{isTrafficLoading ? 'Calculating Route...' : 'Compute Route & Transit'}</span>
            </button>
          </div>

          {trafficReport && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {trafficReport}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Hub */}
      {activeSection === 'qr' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Cloud QR & Barcode Hub</h3>
          <div className="text-xs space-y-2">
            <label className="text-slate-400 block">Data or URL to Encode:</label>
            <input
              type="text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrText)}`}
              alt="QR Code"
              className="rounded-lg bg-white p-2"
            />
          </div>
        </div>
      )}

    </div>
  );
};
