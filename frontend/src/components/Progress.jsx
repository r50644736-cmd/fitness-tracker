import { useState, useEffect } from 'react';
import api from '../api';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPerformanceStats()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heatmapData = data?.heatmap || Array(70).fill({ intensity: 0 });
  const weeklyPerf = data?.weeklyPerformance || Array(12).fill({ sessions: 0, calories: 0 });
  const maxSessions = Math.max(...weeklyPerf.map(w => w.sessions || 0), 1);
  const muscleLoad = data?.muscleLoad || {};

  const heatColor = (val) => {
    if (val === 0) return 'bg-surface-variant/30';
    if (val === 1) return 'bg-primary/20';
    if (val === 2) return 'bg-primary/50';
    return 'bg-primary';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">

      {/* Performance Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-high border border-outline-variant/10 p-6">
          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Performance Index</span>
          <div className="flex items-end gap-4 mt-2">
            <h1 className="font-headline text-8xl font-black italic tracking-tighter">
              {data?.performanceIndex ?? '--'}<span className="text-4xl text-on-surface-variant">%</span>
            </h1>
          </div>
          <div className="flex items-end gap-2 h-24 mt-6">
            {weeklyPerf.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-sm transition-all ${i === weeklyPerf.length - 1 ? 'bg-primary shadow-[0_0_8px_rgba(243,255,202,0.4)]' : 'bg-surface-variant hover:bg-surface-bright'}`}
                  style={{ height: `${Math.max(5, (w.sessions / maxSessions) * 100)}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-surface-container-high border border-outline-variant/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Total Steps (Est.)</span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">bolt</span>
            </div>
            <h3 className="font-headline text-4xl font-black text-on-surface">{data?.totalStepsEstimate?.toLocaleString() ?? '--'}</h3>
            <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Estimated</span>
          </div>
          <div className="flex-1 bg-surface-container-high border border-outline-variant/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Active Days</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">flash_on</span>
            </div>
            <h3 className="font-headline text-4xl font-black text-on-surface">{data?.activeDaysThisMonth ?? '--'}</h3>
            <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">This Month</span>
          </div>
          <div className="flex-1 bg-surface-container-high border border-outline-variant/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Total Sessions</span>
              <span className="material-symbols-outlined text-primary text-[18px]">emoji_events</span>
            </div>
            <h3 className="font-headline text-4xl font-black text-on-surface">{data?.totalWorkouts ?? '--'}</h3>
            <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">All Time</span>
          </div>
        </div>
      </div>

      {/* Strength Trajectory + Muscle Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Weekly Volume</h3>
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">Sessions per week — last 12 weeks</p>
            </div>
          </div>
          <div className="w-full h-40 relative">
            {weeklyPerf.length > 1 && (
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f3ffca" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#f3ffca" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={`M ${weeklyPerf.map((w,i) => `${(i/(weeklyPerf.length-1))*300},${100 - (w.sessions/maxSessions)*85}`).join(' L ')}`}
                  fill="none" stroke="#f3ffca" strokeWidth="1.5"/>
                <path d={`M ${weeklyPerf.map((w,i) => `${(i/(weeklyPerf.length-1))*300},${100-(w.sessions/maxSessions)*85}`).join(' L ')} L 300,100 L 0,100 Z`}
                  fill="url(#lineGrad)"/>
                {weeklyPerf.map((w,i) => (
                  <circle key={i} cx={(i/(weeklyPerf.length-1))*300} cy={100-(w.sessions/maxSessions)*85} r="2.5" fill="#f3ffca"/>
                ))}
              </svg>
            )}
            {weeklyPerf.every(w=>w.sessions===0) && (
              <p className="text-center font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-8">Log workouts to see trajectory</p>
            )}
          </div>
        </div>

        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Muscle Load</h3>
            <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">From Workout Types</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Chest / Triceps (Push)', key: 'chest' },
              { label: 'Back / Biceps (Pull)', key: 'back' },
              { label: 'Legs / Hamstring', key: 'legs' },
              { label: 'Shoulders', key: 'shoulders' },
            ].map((m) => {
              const val = muscleLoad[m.key] || 0;
              return (
                <div key={m.key}>
                  <div className="flex justify-between mb-1">
                    <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                    <span className="font-label text-[10px] font-bold text-on-surface">{val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-variant">
                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${val}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border border-secondary/30 bg-secondary/10 p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
            <span className="font-label text-[10px] text-secondary uppercase tracking-widest font-bold">
              {Object.values(muscleLoad).some(v => v > 80) ? 'High Load Detected — Consider Recovery' : 'Optimal Recovery State'}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Training Consistency</h3>
          <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Last 10 Weeks</span>
        </div>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(7, 1fr)' }}>
          {Array.from({ length: 70 }, (_, i) => {
            const row = i % 7;
            const col = Math.floor(i / 7);
            const idx = col * 7 + row;
            const val = heatmapData[idx]?.intensity ?? 0;
            return (
              <div key={i} className={`aspect-square rounded-sm ${heatColor(val)} hover:opacity-70 cursor-pointer transition-opacity`}
                title={`${heatmapData[idx]?.date ?? ''}: ${val} session${val !== 1 ? 's' : ''}`}/>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Less</span>
          {[0,1,2,3].map(v => <div key={v} className={`w-4 h-4 rounded-sm ${heatColor(v)}`}/>)}
          <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">More</span>
        </div>
      </div>
    </div>
  );
}
