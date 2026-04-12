import { useState, useEffect } from 'react';
import api from '../api';

export default function Workouts() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [archiveData, setArchiveData] = useState(null);
  const [activePhase, setActivePhase] = useState(1);
  const [showLogModal, setShowLogModal] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getProfile()
      .then(res => { setProfile(res.data); loadPlan(res.data); })
      .catch(console.error);
    api.getArchive()
      .then(res => setArchiveData(res.data))
      .catch(console.error);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadPlan = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.generateWorkoutPlan({
        fitness_goal: profileData?.fitnessGoal || 'maintenance',
        activity_level: profileData?.activityLevel || 'moderate',
        available_days: 4,
      });
      setPlan(res.data.plan);
    } catch (e) {
      console.error('ML service not running, using default plan');
      setPlan(defaultPlan);
    } finally { setLoading(false); }
  };

  const defaultPlan = {
    name: 'Power-Building Core',
    sessions: [
      { day: 'Monday', type: 'Push', duration: 75, exercises: ['Barbell Bench Press 4×8-10', 'Overhead Press 3×12', 'Incline DB Flys 3×15', 'Tricep Pushdowns 3×15'] },
      { day: 'Tuesday', type: 'Pull', duration: 70, exercises: ['Barbell Rows 4×8', 'Pull-ups 4×8', 'Face Pulls 3×15', 'Bicep Curls 3×12'] },
      { day: 'Thursday', type: 'Legs', duration: 80, exercises: ['Back Squat 5×5', 'Romanian Deadlift 4×8', 'Leg Press 3×12', 'Calf Raises 4×20'] },
      { day: 'Saturday', type: 'Shoulders', duration: 60, exercises: ['Lateral Raises 4×15', 'Arnold Press 3×12', 'Rear Delt Flys 3×15', 'Shrugs 3×15'] },
    ]
  };

  const typeColors = {
    'push': 'text-primary', 'pull': 'text-secondary', 'legs': 'text-tertiary',
    'shoulders': 'text-primary', 'hiit': 'text-secondary', 'cardio': 'text-tertiary',
    'full body': 'text-primary', 'tempo': 'text-secondary', 'long run': 'text-tertiary',
    'recovery': 'text-on-surface-variant', 'mobility': 'text-on-surface-variant', 'strength': 'text-primary'
  };

  const phases = [
    { label: 'Phase 01 — Prime', name: 'Metabolic Prime', desc: 'GPP Foundation', weeks: '1-3' },
    { label: 'Phase 02 — Active', name: 'Volume Accumulation', desc: 'Hypertrophy Focus', weeks: '4-7' },
    { label: 'Phase 03 — Later', name: 'Peak Realization', desc: 'Strength Peak', weeks: '8-10' },
  ];

  const lifts = [
    { name: 'Deadlift (Conventional)', current: 245, unit: 'kg', delta: '+12.5', color: 'text-primary' },
    { name: 'Barbell Back Squat', current: 180, unit: 'kg', delta: '+5.0', color: 'text-secondary' },
    { name: 'Weighted Pull-Up', current: '+45', unit: 'kg', delta: '±0.0', color: 'text-on-surface-variant' },
  ];

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg">{toast}</div>}
      {showLogModal && <QuickLogModal onClose={() => setShowLogModal(false)} onSaved={() => { setShowLogModal(false); showToast('Session logged!'); }} />}

      {/* Current Protocol */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/20 border border-primary/40 text-primary font-label text-[8px] font-bold uppercase tracking-widest px-2 py-1">ACTIVE</span>
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <button onClick={() => loadPlan(profile)}
                className="ml-auto border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary px-3 py-1 font-label text-[8px] uppercase tracking-widest transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">refresh</span>
                Regenerate
              </button>
            </div>
            <div>
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Current Protocol</span>
              <h1 className="font-headline text-5xl font-black uppercase leading-tight tracking-tighter mt-1">
                {loading ? 'Generating...' : (plan?.name || 'Hypertrophy')}<br/>
                <span className="text-primary italic">
                  {profile?.fitnessGoal?.replace('_', ' ').toUpperCase() || 'Phase II'}
                </span>
              </h1>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowLogModal(true)}
                className="border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 font-label text-[9px] uppercase tracking-widest transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">add</span>
                Log Session
              </button>
              <button onClick={() => loadPlan(profile)} disabled={loading}
                className="border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary px-4 py-2 font-label text-[9px] uppercase tracking-widest transition-colors disabled:opacity-50">
                {loading ? 'Generating AI Plan...' : 'Refresh AI Plan'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container p-4 border border-outline-variant/10">
              <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Total Sessions</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="font-headline text-4xl font-black text-primary">{archiveData?.totalSessions ?? '--'}</span>
                <span className="font-label text-[8px] text-on-surface-variant mb-1">All Time</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-surface-container p-3 border border-outline-variant/10">
                <span className="block font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Last Session</span>
                <span className="font-headline text-sm font-black text-primary uppercase truncate">
                  {archiveData?.sessions?.[0]?.name || archiveData?.sessions?.[0]?.type || 'None yet'}
                </span>
              </div>
              <div className="flex-1 bg-surface-container p-3 border border-outline-variant/10">
                <span className="block font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Last Date</span>
                <span className="font-headline text-sm font-black text-secondary uppercase">
                  {archiveData?.sessions?.[0]?.date || '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generated Weekly Plan */}
      {plan && (
        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight">AI-Generated Weekly Plan</h3>
            <span className="font-label text-[9px] text-primary uppercase tracking-widest font-bold">8 Week Program</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plan.sessions.map((session, i) => (
              <div key={i} className="bg-surface-container border border-outline-variant/10 hover:border-primary/30 transition-colors p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{session.day}</span>
                  <span className={`font-headline font-bold text-xs uppercase ${typeColors[session.type?.toLowerCase()] || 'text-on-surface'}`}>
                    {session.type}
                  </span>
                </div>
                <span className="font-label text-[7px] text-on-surface-variant uppercase">Duration: {session.duration}min</span>
                <ul className="mt-3 space-y-1">
                  {session.exercises.map((ex, j) => (
                    <li key={j} className="font-label text-[8px] text-on-surface-variant flex items-start gap-1.5">
                      <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                      {ex}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowLogModal(true)}
                  className="mt-4 w-full border border-primary/20 text-primary font-label text-[7px] uppercase tracking-widest py-1.5 hover:bg-primary/10 transition-colors">
                  Start This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Roadmap */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Phase Roadmap</h3>
          <div className="flex gap-2">
            <button onClick={() => setActivePhase(p => Math.max(0, p - 1))} className="w-7 h-7 border border-outline-variant/30 hover:border-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            <button onClick={() => setActivePhase(p => Math.min(2, p + 1))} className="w-7 h-7 border border-outline-variant/30 hover:border-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {phases.map((phase, i) => (
            <div key={i} onClick={() => setActivePhase(i)}
              className={`p-4 border cursor-pointer transition-all ${activePhase === i ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface-container hover:bg-surface-variant/20'}`}>
              <span className={`font-label text-[8px] uppercase tracking-widest font-bold ${activePhase === i ? 'text-primary' : 'text-on-surface-variant'}`}>{phase.label}</span>
              <h4 className="font-headline font-bold text-sm uppercase mt-2 leading-tight">{phase.name}</h4>
              <p className="font-label text-[8px] text-on-surface-variant mt-1">{phase.desc}</p>
              {activePhase === i && (
                <div className="mt-3 h-1 w-full bg-surface-variant">
                  <div className="h-full bg-primary" style={{ width: i === 0 ? '100%' : i === 1 ? '64%' : '0%' }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}

// ─── Quick Log Modal ────────────────────────────────────────────────────────────
function QuickLogModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', type: 'strength', durationMinutes: 60, intensity: 'medium', caloriesBurned: 400 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logWorkout({ ...form, date: new Date().toISOString().split('T')[0] });
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline text-2xl font-black uppercase italic mb-6">Quick Log</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Session Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-sm px-3 py-2 outline-none">
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="push">Push</option>
                <option value="pull">Pull</option>
                <option value="legs">Legs</option>
                <option value="mobility">Mobility</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (min)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Intensity</label>
              <select value={form.intensity} onChange={e => setForm({...form, intensity: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-sm px-3 py-2 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Calories</label>
              <input type="number" value={form.caloriesBurned} onChange={e => setForm({...form, caloriesBurned: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"/>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-widest py-3 disabled:opacity-50 hover:bg-primary-dim transition-colors">
            {saving ? 'Saving...' : 'Log Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
