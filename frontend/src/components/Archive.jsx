import { useState, useEffect } from 'react';
import api from '../api';

export default function Archive() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.getArchive();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async (id) => {
    try {
      await api.deleteWorkout(id);
      showToast('Session deleted.');
      fetchData();
    } catch { showToast('Failed to delete.'); }
    setDeleteId(null);
  };

  const heatmapData = data?.heatmap || Array(70).fill({ intensity: 0 });
  const heatColor = (val) => {
    if (val === 0) return 'bg-surface-variant/30';
    if (val === 1) return 'bg-primary/20';
    if (val === 2) return 'bg-primary/50';
    return 'bg-primary';
  };

  const sessions = (data?.sessions || []).filter(s => {
    const matchSearch = !search || (s.name?.toLowerCase().includes(search.toLowerCase()) || s.type?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'ALL' || s.type?.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const typeColors = {
    strength: 'text-primary', cardio: 'text-secondary', hiit: 'text-tertiary',
    mobility: 'text-on-surface-variant', push: 'text-primary', pull: 'text-secondary', legs: 'text-tertiary'
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg">{toast}</div>}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high border border-error/30 p-8 w-full max-w-sm">
            <h3 className="font-headline text-xl font-black uppercase mb-2">Delete Session?</h3>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-6">This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-error text-white font-headline font-bold uppercase py-2 tracking-widest text-sm">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-outline-variant/30 font-headline font-bold uppercase py-2 tracking-widest text-sm text-on-surface-variant">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-headline text-4xl font-black italic uppercase tracking-tighter">Workout Archive</h1>
        <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">{data?.totalSessions ?? 0} Total Sessions</span>
      </div>

      {/* Heatmap */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-5">
        <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-3">Consistency Engine — Last 10 Weeks</p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(7, 1fr)' }}>
          {Array.from({ length: 70 }, (_, i) => {
            const row = i % 7;
            const col = Math.floor(i / 7);
            const idx = col * 7 + row;
            const val = heatmapData[idx]?.intensity ?? 0;
            return <div key={i} className={`aspect-square rounded-sm ${heatColor(val)} hover:opacity-70 cursor-pointer transition-opacity`} title={heatmapData[idx]?.date ?? ''}/>;
          })}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-surface-container-high border border-outline-variant/20 flex items-center gap-3 px-4 py-3">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent font-label text-[10px] text-on-surface placeholder-on-surface-variant uppercase tracking-widest outline-none flex-1"
            placeholder="Search sessions..."/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL','strength','cardio','hiit','mobility'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-3 font-label text-[8px] uppercase tracking-widest border transition-colors ${filter === f ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/20 text-on-surface-variant hover:border-primary'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="bg-surface-container-high border border-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">fitness_center</span>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            {data?.totalSessions === 0 ? 'No sessions logged yet. Start your first session from the Dashboard!' : 'No sessions match your filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="bg-surface-container-high border border-outline-variant/10 p-5 group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{s.date}</span>
                  <h3 className={`font-headline font-bold text-base uppercase tracking-tight mt-1 ${typeColors[s.type?.toLowerCase()] || 'text-on-surface'}`}>
                    {s.name || s.type?.toUpperCase() || 'Workout'}
                  </h3>
                </div>
                <button onClick={() => setDeleteId(s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  ['Duration', s.durationMinutes ? `${s.durationMinutes}m` : '--'],
                  ['Intensity', s.intensity?.toUpperCase() || '--'],
                  ['Calories', s.caloriesBurned ? `${s.caloriesBurned} kcal` : '--'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface-container p-2">
                    <span className="block font-label text-[7px] text-on-surface-variant uppercase tracking-widest">{k}</span>
                    <span className="font-headline font-bold text-sm">{v}</span>
                  </div>
                ))}
              </div>
              {s.notes && <p className="font-label text-[9px] text-on-surface-variant italic">{s.notes}</p>}
              <span className={`inline-block mt-2 px-2 py-0.5 border font-label text-[7px] uppercase tracking-widest ${typeColors[s.type?.toLowerCase()] || 'text-on-surface-variant'} border-current/30 bg-current/5`}>
                {s.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
