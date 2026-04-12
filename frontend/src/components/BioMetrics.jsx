import { useState, useEffect } from 'react';
import api from '../api';

export default function BioMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.getBiometricStats();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const hrvData = data?.hrvData || Array(7).fill({ hrv: 0 });
  const maxHrv = Math.max(...hrvData.map(d => d.hrv || 0), 1);

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg">{toast}</div>}
      {showSleepModal && <SleepLogModal onClose={() => setShowSleepModal(false)} onSaved={() => { fetchData(); showToast('Sleep logged!'); }} />}
      {showHydrationModal && <HydrationModal current={data?.todayLiters || 0} target={data?.targetLiters || 4} onClose={() => setShowHydrationModal(false)} onSaved={() => { fetchData(); showToast('Hydration updated!'); }} />}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Real-Time Analysis</span>
          <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mt-1">Bio-Metrics</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant">HRV Score</span>
            <span className="font-headline text-2xl font-black text-primary">{data?.avgHrvScore || '--'}</span>
          </div>
        </div>
      </div>

      {/* HRV + Sleep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Heart Rate Variability</h3>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">7-Day Moving Average</p>
            </div>
            <div className="text-right">
              <span className="font-headline text-3xl font-black text-primary">{data?.avgHrvScore || '--'}</span>
              <span className="block font-label text-[8px] text-on-surface-variant uppercase tracking-widest">ms</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-28 mt-4">
            {hrvData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className={`w-full rounded-t-sm transition-all ${d.hrv === Math.max(...hrvData.map(x=>x.hrv||0)) && d.hrv > 0 ? 'bg-primary shadow-[0_0_10px_rgba(243,255,202,0.5)]' : d.hrv > 0 ? 'bg-surface-bright' : 'bg-surface-variant'}`}
                  style={{ height: `${Math.max(5, (d.hrv / maxHrv) * 90)}%` }}></div>
                <span className="font-label text-[7px] text-on-surface-variant uppercase">{days[i]}</span>
              </div>
            ))}
          </div>
          <p className="font-label text-[9px] text-on-surface-variant mt-3">
            {data?.avgHrvScore > 70 ? '✓ HRV is optimal. Ready for high intensity.' : 'HRV is low. Prioritize recovery today.'}
          </p>
        </div>

        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Sleep Quality</h3>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-1 capitalize">{data?.sleepQuality || 'No data yet'}</p>
            </div>
            <button onClick={() => setShowSleepModal(true)}
              className="border border-primary/30 bg-primary/10 text-primary font-label text-[8px] uppercase tracking-widest px-2 py-1 hover:bg-primary/20 transition-colors">
              Log Sleep
            </button>
          </div>
          <div className="flex items-center justify-center my-4">
            <h2 className="font-headline text-7xl font-black tracking-tighter text-on-surface">
              {data?.sleepHours ? `${Math.floor(data.sleepHours)}:${String(Math.round((data.sleepHours % 1) * 60)).padStart(2,'0')}` : '--:--'}
            </h2>
          </div>
          <div className="relative h-10">
            <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
              <polyline points="0,30 30,20 60,35 90,15 120,38 150,12 180,28 210,8 240,32 270,18 300,30"
                fill="none" stroke="#00eefc" strokeWidth="1.5" strokeLinejoin="round"/>
              <polyline points="0,30 30,20 60,35 90,15 120,38 150,12 180,28 210,8 240,32 270,18 300,30 300,40 0,40 Z"
                fill="#00eefc" fillOpacity="0.08"/>
            </svg>
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-label text-[8px] text-on-surface-variant">{data?.bedTime || '--:--'}</span>
            <span className="font-label text-[8px] text-on-surface-variant">{data?.wakeTime || '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Metabolic + Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Metabolic Load</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Basal Metabolic Rate', value: data?.bmr ? `${data.bmr.toLocaleString()} kcal` : '-- kcal', color: 'text-primary' },
              { label: 'Active Burn Today', value: '-- kcal', color: 'text-secondary' },
              { label: 'Protocol Status', value: 'Optimal', color: 'text-tertiary' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                <span className={`font-headline font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Hydration Monitor</h3>
            <button onClick={() => setShowHydrationModal(true)}
              className="border border-secondary/30 bg-secondary/10 text-secondary font-label text-[8px] uppercase tracking-widest px-2 py-1 hover:bg-secondary/20 transition-colors">
              Log Details
            </button>
          </div>
          <div>
            <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Current / Target</span>
            <div className="flex items-end gap-2 mt-2">
              <span className="font-headline text-6xl font-black text-on-surface">{data?.todayLiters ?? '--'}</span>
              <span className="font-headline text-2xl text-on-surface-variant mb-2">/ {data?.targetLiters ?? 4}L</span>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-surface-variant">
            <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${data?.hydrationPercentage ?? 0}%` }}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-label text-[8px] text-on-surface-variant">0L</span>
            <span className="font-label text-[8px] text-secondary font-bold">{data?.hydrationPercentage ?? 0}%</span>
            <span className="font-label text-[8px] text-on-surface-variant">{data?.targetLiters ?? 4}L</span>
          </div>
          <div className="mt-4 border border-outline-variant/20 bg-surface-variant/20 p-3">
            <p className="font-label text-[9px] text-on-surface-variant leading-relaxed">
              <span className="text-secondary font-bold mr-1">◆</span>
              {(data?.hydrationPercentage ?? 0) >= 75
                ? 'Great hydration! Keep it up through your session.'
                : 'Stay hydrated. Aim to drink water every 30 minutes.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights — Neural Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high border border-outline-variant/10 p-6 flex gap-6 group hover:border-error/40 transition-colors">
          <div className="w-24 h-24 rounded-sm overflow-hidden flex-shrink-0 bg-surface-variant border border-outline-variant/20">
            <img alt="circadian" className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 transition-opacity" src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60"/>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full animate-pulse ${data?.bedTime && data.bedTime !== '--:--' ? 'bg-secondary' : 'bg-error'}`}></span>
                <span className={`font-label text-[8px] uppercase tracking-widest font-bold ${data?.bedTime && data.bedTime !== '--:--' ? 'text-secondary' : 'text-error'}`}>
                  {data?.bedTime && data.bedTime !== '--:--' ? 'Temporal Alignment' : 'Temporal Drift'}
                </span>
              </div>
              <h3 className="font-headline font-bold text-base uppercase tracking-tight">Circadian Rhythm Analysis</h3>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant leading-relaxed">
              {data?.bedTime && data.bedTime !== '--:--'
                ? `System detected rest initiation at ${data.bedTime}. Maintenance of this 24-hour cycle is critical for neural recovery and HRV stability.`
                : 'Insufficient temporal data. Log consistent sleep cycles to enable deep-learning circadian optimization.'}
            </p>
          </div>
        </div>
        
        <div className="bg-surface-container-high border border-outline-variant/10 p-6 flex gap-6 group hover:border-primary/40 transition-colors">
          <div className="w-24 h-24 rounded-sm overflow-hidden flex-shrink-0 bg-surface-variant border border-outline-variant/20">
            <img alt="vo2 max" className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 transition-opacity" src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&auto=format&fit=crop&q=60"/>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span className="font-label text-[8px] text-primary uppercase tracking-widest font-bold">Aerobic Efficiency</span>
              </div>
              <h3 className="font-headline font-bold text-base uppercase tracking-tight">VO2 Max Trajectory</h3>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant leading-relaxed">
              {(data?.avgHrvScore ?? 0) > 65
                ? 'Oxygen processing systems demonstrate high efficiency. Sustained Zone 2 and VO2 Max intervals are recommended for further optimization.'
                : 'Current aerobic capacity shows high metabolic toll. Prioritize low-intensity recovery sessions to stabilize base aerobic threshold.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sleep Log Modal ───────────────────────────────────────────────────────────
function SleepLogModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ durationHours: 7.5, quality: 'good', bedTime: '22:30', wakeTime: '06:00', hrvScore: 72 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logSleep({ ...form, date: new Date().toISOString().split('T')[0] });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter mb-6">Log Sleep</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Bed Time</label>
              <input type="time" value={form.bedTime} onChange={e => setForm({...form, bedTime: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Wake Time</label>
              <input type="time" value={form.wakeTime} onChange={e => setForm({...form, wakeTime: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (hours)</label>
              <input type="number" step="0.25" value={form.durationHours} onChange={e => setForm({...form, durationHours: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
            <div>
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Quality</label>
              <select value={form.quality} onChange={e => setForm({...form, quality: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-body text-sm px-3 py-2 outline-none">
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">HRV Score (ms, optional)</label>
              <input type="number" value={form.hrvScore} onChange={e => setForm({...form, hrvScore: +e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-secondary text-on-secondary hover:bg-secondary-dim transition-colors font-headline font-bold uppercase tracking-widest py-3 disabled:opacity-50">
            {saving ? 'Saving...' : 'Log Sleep'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Hydration Modal ───────────────────────────────────────────────────────────
function HydrationModal({ current, target, onClose, onSaved }) {
  const [liters, setLiters] = useState(current);
  const [targetL, setTargetL] = useState(target);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logHydration({ litersConsumed: liters, dailyTargetLiters: targetL, date: new Date().toISOString().split('T')[0] });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter mb-6">Log Hydration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Today's Intake (Liters)</label>
            <input type="number" step="0.1" value={liters} onChange={e => setLiters(+e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 focus:border-secondary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
          </div>
          <div>
            <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Daily Target (Liters)</label>
            <input type="number" step="0.1" value={targetL} onChange={e => setTargetL(+e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 focus:border-secondary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-secondary text-on-secondary hover:bg-secondary-dim transition-colors font-headline font-bold uppercase tracking-widest py-3 disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Hydration'}
          </button>
        </form>
      </div>
    </div>
  );
}
