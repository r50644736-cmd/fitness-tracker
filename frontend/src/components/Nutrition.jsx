import { useState, useEffect } from 'react';
import api from '../api';

export default function Nutrition() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.getDashboard();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDiet(id);
      fetchData();
      showToast('Meal record deleted');
    } catch (e) {
      showToast('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const target = data?.targetCalories || 2500;
  const consumed = data?.totalCaloriesConsumed || 0;
  const progress = Math.min(100, (consumed / target) * 100);

  // Simple macro targets based on goal (rough estimation)
  // Protein: 30%, Carbs: 45%, Fats: 25%
  const proteinTarget = Math.round((target * 0.3) / 4);
  const carbsTarget = Math.round((target * 0.45) / 4);
  const fatsTarget = Math.round((target * 0.25) / 9);

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg">{toast}</div>}
      
      {showLogModal && (
        <LogMealModal 
          onClose={() => setShowLogModal(false)} 
          onSaved={() => { fetchData(); showToast('Meal logged!'); }} 
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Metabolic Tracking</span>
          <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mt-1">Nutrition</h1>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="bg-primary text-background font-headline font-black text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-primary-dim transition-colors"
        >
          LOG MEAL
        </button>
      </div>

      {/* Calorie Progress */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Daily Calorie Balance</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-headline text-6xl font-black text-on-surface">{consumed}</span>
                  <span className="font-headline text-2xl text-on-surface-variant">/ {target} kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Remaining</span>
                <span className={`font-headline text-2xl font-black ${consumed > target ? 'text-error' : 'text-primary'}`}>
                  {Math.max(0, target - consumed)}
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-4 w-full bg-surface-variant/30 rounded-full overflow-hidden border border-outline-variant/20">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${consumed > target ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {consumed > target && (
              <p className="font-label text-[9px] text-error uppercase tracking-widest mt-2 font-bold animate-pulse">
                ! CALORIE CEILING EXCEEDED
              </p>
            )}
          </div>
          
          <div className="bg-surface-container p-6 flex flex-col justify-center border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">AI Recommendation</span>
            </div>
            <p className="font-label text-xs text-on-surface leading-relaxed">
              Based on your goal of <span className="text-primary font-bold">{(data?.fitnessGoal || 'maintenance').replace('_', ' ')}</span>, 
              focus on hitting your protein target of <span className="text-secondary font-bold">{proteinTarget}g</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Protein', current: data?.totalProtein || 0, target: proteinTarget, color: 'text-primary', bar: 'bg-primary' },
          { label: 'Carbohydrates', current: data?.totalCarbs || 0, target: carbsTarget, color: 'text-secondary', bar: 'bg-secondary' },
          { label: 'Fats', current: data?.totalFats || 0, target: fatsTarget, color: 'text-tertiary', bar: 'bg-tertiary' }
        ].map((macro) => (
          <div key={macro.label} className="bg-surface-container-high border border-outline-variant/10 p-6">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{macro.label}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`font-headline text-3xl font-black ${macro.color}`}>{macro.current}g</span>
              <span className="font-label text-[10px] text-on-surface-variant">/ {macro.target}g</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-surface-variant/30 rounded-full overflow-hidden">
              <div 
                className={`h-full ${macro.bar} transition-all duration-700`}
                style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Meal History (Today) */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-6">
        <h3 className="font-headline text-lg font-bold uppercase tracking-tight mb-5">Today's Intake Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Meal</th>
                <th className="text-right py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Calories</th>
                <th className="text-right py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">P</th>
                <th className="text-right py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">C</th>
                <th className="text-right py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">F</th>
                <th className="text-right py-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.diets && data.diets.length > 0 ? data.diets.map((meal) => (
                <tr key={meal.id} className="border-b border-outline-variant/10 group hover:bg-surface-variant/10 transition-colors">
                  <td className="py-4">
                    <span className="font-headline font-bold text-sm text-on-surface uppercase tracking-tight">{meal.mealName}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-headline font-bold text-sm text-primary">{meal.calories} kcal</span>
                  </td>
                  <td className="py-4 text-right font-label text-[10px] text-on-surface-variant">{meal.proteinGrams}g</td>
                  <td className="py-4 text-right font-label text-[10px] text-on-surface-variant">{meal.carbsGrams}g</td>
                  <td className="py-4 text-right font-label text-[10px] text-on-surface-variant">{meal.fatsGrams}g</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => handleDelete(meal.id)}
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                    No intake logged for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Log Meal Modal ────────────────────────────────────────────────────────────
function LogMealModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ 
    mealName: '', 
    calories: 500, 
    proteinGrams: 30, 
    carbsGrams: 50, 
    fatsGrams: 15 
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logDiet({ ...form, date: new Date().toISOString().split('T')[0] });
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none transition-colors";
  const labelClass = "block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter mb-6 border-l-4 border-primary pl-4">Log Intake</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Meal / Item Name</label>
            <input 
              type="text" 
              value={form.mealName} 
              onChange={e => setForm({...form, mealName: e.target.value})} 
              required
              placeholder="e.g. Grilled Chicken Salad"
              className={inputClass}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Total Calories (kcal)</label>
              <input 
                type="number" 
                value={form.calories} 
                onChange={e => setForm({...form, calories: +e.target.value})} 
                required
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Protein (g)</label>
              <input 
                type="number" 
                value={form.proteinGrams} 
                onChange={e => setForm({...form, proteinGrams: +e.target.value})} 
                required
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Carbohydrates (g)</label>
              <input 
                type="number" 
                value={form.carbsGrams} 
                onChange={e => setForm({...form, carbsGrams: +e.target.value})} 
                required
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Fats (g)</label>
              <input 
                type="number" 
                value={form.fatsGrams} 
                onChange={e => setForm({...form, fatsGrams: +e.target.value})} 
                required
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-primary text-background font-headline font-black uppercase tracking-widest py-4 hover:bg-primary-dim transition-colors disabled:opacity-50"
            >
              {saving ? 'UPLOADING...' : 'INITIALIZE LOG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
