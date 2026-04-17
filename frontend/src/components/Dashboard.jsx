import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// ─── Log Workout Modal ────────────────────────────────────────────────────────
function LogWorkoutModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: 'Push Day - Hypertrophy',
    type: 'strength',
    durationMinutes: 75,
    intensity: 'high',
    caloriesBurned: 480,
    sets: 16,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logWorkout({ ...form, date: new Date().toISOString().split('T')[0] });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save. Is the backend running?');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter mb-6">Log Session</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Session Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none transition-colors"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none">
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="mobility">Mobility</option>
                <option value="push">Push</option>
                <option value="pull">Pull</option>
                <option value="legs">Legs</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Intensity</label>
              <select value={form.intensity} onChange={e => setForm({...form, intensity: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (min)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Calories Burned</label>
              <input type="number" value={form.caloriesBurned} onChange={e => setForm({...form, caloriesBurned: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
            <div className="col-span-2">
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none resize-none"/>
            </div>
          </div>
          {error && <p className="text-error font-label text-xs">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-on-primary hover:bg-primary-dim transition-colors font-headline font-bold uppercase tracking-widest py-3 disabled:opacity-50">
            {saving ? 'Saving...' : 'Log Session'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard Component ───────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res.data);
    } catch (e) {
      console.error('Dashboard fetch failed', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const recommendation = data?.recommendedWorkoutType?.toUpperCase() || 'HYPERTROPHY';
  const targetKcal = data?.targetCalories || 2400;
  const burned = data?.totalCaloriesBurned || 0;
  const streak = data?.workoutStreak || 0;
  const readiness = data?.readinessScore || 94;
  const username = data?.username || 'USER_01';
  const weeklyData = data?.weeklyData || [];

  const getRecoveryStatus = (pct) => {
    if (pct > 80) return { status: 'Fully Recharged', color: 'text-tertiary', statusColor: 'text-on-surface-variant', icon: 'check_circle' };
    if (pct > 50) return { status: 'Recovering', color: 'text-primary', statusColor: 'text-on-surface-variant', icon: null };
    return { status: 'Action Required', color: 'text-secondary', statusColor: 'text-error', icon: 'warning' };
  };

  const muscleRecovery = data?.muscleRecovery || { chest: 100, legs: 100, back: 100 };
  const muscleGroups = [
    { name: 'CHEST', pct: muscleRecovery.chest, ...getRecoveryStatus(muscleRecovery.chest) },
    { name: 'LEGS', pct: muscleRecovery.legs, ...getRecoveryStatus(muscleRecovery.legs) },
    { name: 'BACK', pct: muscleRecovery.back, ...getRecoveryStatus(muscleRecovery.back) },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Calibrating Neural Systems...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg animate-pulse">
          {toast}
        </div>
      )}
      {showModal && <LogWorkoutModal onClose={() => setShowModal(false)} onSaved={() => { fetchDashboard(); showToast('Session logged!'); }} />}

      {/* Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-low p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-outline-variant/10">
          <div className="absolute inset-0 z-0">
            <img alt="cyber background" className="w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3cDKprrx9qMzTJ3rrLbL-7jgDJZkya2FZtc8umHerNwg4iijjls5rCTChchM3ThwbAnnJeYi7fjA70WrCeEduSVgMWmfe8HoOjqv7oeG280PVCIUOFv4edxYqFV5jRTrSiHHqkb08Q1WlzQ08FcA6gHVwWgi9pujl5YNf6RW5F4vp3J_MzQj5Yy4ShgRqWYE4cbymiGl35P9_yGwOHmT6-CBKvaoucyhGn5vBzl8cfp7Fmni2nN4FDTWCWoz7BpWUVynj5MG25uc"/>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 to-transparent"></div>
          </div>
          <div className="relative z-10">
            <h1 className="font-headline text-5xl md:text-6xl font-black italic tracking-tighter uppercase">
              Welcome Back,<br/>{username.toUpperCase()}
            </h1>
            <p className="text-on-surface-variant font-label text-xs mt-2 max-w-sm leading-relaxed">
              Your neural systems are optimized. Today's session is pre-loaded for peak {recommendation.toLowerCase()} output.
            </p>
          </div>
          <div className="relative z-10 flex gap-12 mt-8">
            <div>
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-secondary">Calories Burned</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-3xl font-black text-secondary">{burned}</span>
                <span className="font-label text-[10px] text-on-surface-variant">kcal</span>
              </div>
            </div>
            <div>
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-tertiary">Target</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-3xl font-black text-tertiary">{targetKcal}</span>
                <span className="font-label text-[10px] text-on-surface-variant">kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Readiness */}
        <div className="bg-primary p-8 flex flex-col justify-between min-h-[260px] cursor-pointer hover:bg-primary-dim transition-colors">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-primary-fixed-variant font-bold">System Readiness</span>
          <div>
            <h2 className="font-headline text-8xl md:text-9xl font-black tracking-tighter text-on-primary-fixed-variant italic">
              {readiness}<span className="text-5xl">%</span>
            </h2>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-label text-[10px] uppercase font-bold text-on-primary-fixed-variant">Optimization Status</span>
              <span className="font-label text-[10px] font-black text-on-primary-fixed-variant uppercase">
                {readiness > 85 ? 'Peak' : readiness > 65 ? 'Good' : 'Recovering'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-on-primary-fixed-variant/20">
              <div className="h-full bg-on-primary-fixed-variant transition-all duration-1000" style={{ width: `${readiness}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Recovery */}
      <div className="mt-2">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Muscle Recovery Status</h3>
          <span className="ml-auto font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Last Updated: Today</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {muscleGroups.map((mg) => (
            <div key={mg.name} className="bg-surface-container-high p-5 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-4">
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Muscle Group</span>
                <span className={`font-headline text-xl font-black italic tracking-tight ${mg.color}`}>{mg.name}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-headline text-4xl font-black">{mg.pct}%</span>
                  <span className={`block font-label text-[8px] uppercase tracking-wider mt-1 ${mg.statusColor}`}>{mg.status}</span>
                </div>
                {mg.icon && (
                  <span className={`material-symbols-outlined text-[20px] ${mg.statusColor}`}>{mg.icon}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Push Day + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Today's Protocol */}
        <div className="lg:col-span-2 bg-surface-container-high border border-outline-variant/10 flex flex-col sm:flex-row overflow-hidden min-h-[320px]">
          <div className="w-full sm:w-1/2 relative min-h-[200px]">
            <img alt="workout focus" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"/>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-high"></div>
            <div className="absolute bottom-4 left-4 bg-primary/20 border border-primary text-primary font-label text-[8px] font-bold uppercase px-2 py-1">AI Suggested</div>
          </div>
          <div className="w-full sm:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-headline text-3xl font-black tracking-tighter italic uppercase leading-none mb-4">
                PUSH DAY -<br/>{recommendation}
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Barbell Bench Press', target: '4 × 8-10' },
                  { name: 'Overhead Press (Seated)', target: '3 × 12' },
                  { name: 'Incline DB Flys', target: '3 × 15' },
                ].map((ex, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <div>
                      <span className="block font-label text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Exercise {String(i+1).padStart(2,'0')}</span>
                      <span className="font-headline font-semibold text-sm">{ex.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-label text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Target</span>
                      <span className="font-headline font-bold text-sm text-primary">{ex.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex mt-6 gap-2">
              <button onClick={() => setShowModal(true)}
                className="flex-1 bg-primary text-on-primary hover:bg-primary-dim transition-colors font-headline font-bold text-sm tracking-widest uppercase py-3 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                Start Session
              </button>
              <button className="bg-surface-variant/30 hover:bg-surface-variant transition-colors px-4 border border-outline-variant/20 flex items-center justify-center">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Streak + Nutrition */}
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-surface-container-high border border-outline-variant/10 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant block mb-1">Protocol Consistency</span>
                <h4 className="font-headline font-bold uppercase tracking-widest text-sm">Workout Streak</h4>
              </div>
              <span className="font-headline text-2xl font-black italic text-primary">{streak}_D</span>
            </div>
            <div className="flex items-end gap-1 h-20 mt-4">
              {weeklyData.map((day, i) => {
                const maxSessions = Math.max(...weeklyData.map(d => d.sessions || 0), 1);
                const h = day.sessions > 0 ? Math.max(20, (day.sessions / maxSessions) * 100) : 10;
                const isToday = i === weeklyData.length - 1;
                const label = ['M','T','W','T','F','S','S'][i];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className={`w-full rounded-t-sm transition-all ${isToday && day.sessions > 0 ? 'bg-primary shadow-[0_0_8px_rgba(243,255,202,0.4)]' : day.sessions > 0 ? 'bg-primary/50' : 'bg-surface-variant'}`}
                      style={{ height: `${h}%` }}></div>
                    <span className={`font-label text-[7px] uppercase ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-high border border-outline-variant/10 p-5 flex flex-col justify-between group cursor-pointer hover:border-secondary/40 transition-colors"
               onClick={() => navigate('/nutrition')}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant block mb-1">Metabolic Status</span>
                <h4 className="font-headline font-bold uppercase tracking-widest text-sm">Today's Intake</h4>
              </div>
              <span className="font-headline text-2xl font-black italic text-secondary">
                {data?.totalCaloriesConsumed || 0}
              </span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center text-[8px] font-label uppercase tracking-widest">
                <span className="text-on-surface-variant">Macro Target Check</span>
                <span className="text-secondary font-bold">In Range</span>
              </div>
              <div className="flex gap-1 h-1">
                <div className="flex-1 bg-primary" style={{ opacity: Math.min(1, (data?.totalProtein || 0) / 150) }}></div>
                <div className="flex-1 bg-secondary" style={{ opacity: Math.min(1, (data?.totalCarbs || 0) / 250) }}></div>
                <div className="flex-1 bg-tertiary" style={{ opacity: Math.min(1, (data?.totalFats || 0) / 70) }}></div>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-label text-[7px] text-on-surface-variant uppercase">P: {data?.totalProtein || 0}g / C: {data?.totalCarbs || 0}g / F: {data?.totalFats || 0}g</span>
                <span className="material-symbols-outlined text-secondary text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
