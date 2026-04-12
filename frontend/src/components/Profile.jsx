import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toggles, setToggles] = useState({ pushNotifs: true, twoFactor: true, exportHealth: true, earlyBeta: false });

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res.data);
      setForm(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProfile(); }, []);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        age: form.age ? +form.age : undefined,
        gender: form.gender,
        height: form.height ? +form.height : undefined,
        weight: form.weight ? +form.weight : undefined,
        fitnessGoal: form.fitnessGoal,
        activityLevel: form.activityLevel,
      });
      await fetchProfile();
      setEditing(false);
      showToast('Profile updated!');
    } catch { showToast('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const Toggle = ({ id }) => (
    <button onClick={() => toggle(id)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${toggles[id] ? 'bg-primary' : 'bg-surface-variant'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all bg-background ${toggles[id] ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'}`}></span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 pb-24">
      {toast && <div className="fixed top-4 right-4 z-[200] bg-primary text-on-primary px-5 py-3 font-label text-xs uppercase tracking-widest shadow-lg">{toast}</div>}

      {/* Profile Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-high border border-outline-variant/10 p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-sm bg-surface-variant overflow-hidden border border-outline-variant/30 flex-shrink-0">
              <img alt="user profile" className="w-full h-full object-cover grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvkYivdea-PryCeN5zlBPfKGAYe084EjcLiMGi9RC2QpFrNoPxYf-SUjUCkJEq6grKlpR-0Q8JpWyIFJUK7Y1m7_sw-JbNrnoUjbbkFKzkfe52CQx3MfUs-CiGBubvzC8CpkHzUwVR_TesNmBcynd783htYKQ1Mshh7jzDIaGpkRrSSAcsGj3PhD2h5wUNyvZ4PFhaurp-9DPpdegtAV_a2jTqut2Gn_O7rwAW9VVSmAN6vlUEsjahkpzbKbZbX7oYlPlhSE307rw"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-primary/20 border border-primary/30 text-primary font-label text-[8px] uppercase tracking-widest px-2 py-0.5 font-bold">AI-Optimized</span>
              </div>
              <h1 className="font-headline text-4xl font-black italic uppercase tracking-tighter">{profile?.username || '--'}</h1>
              <p className="font-label text-[9px] text-on-surface-variant mt-1">
                {profile?.fitnessGoal ? `Goal: ${profile.fitnessGoal}` : 'Set your fitness goal below'}
                {profile?.activityLevel ? ` · Level: ${profile.activityLevel}` : ''}
              </p>
            </div>
            <button onClick={() => setEditing(true)}
              className="border border-primary/30 bg-primary/10 text-primary font-label text-[9px] uppercase tracking-widest px-4 py-2 hover:bg-primary/20 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-6 border-t border-outline-variant/10 pt-4">
            {[
              { label: 'Age', value: profile?.age ? `${profile.age} yr` : '--' },
              { label: 'Weight', value: profile?.weight ? `${profile.weight} kg` : '--' },
              { label: 'Height', value: profile?.height ? `${profile.height} cm` : '--' },
              { label: 'BMI', value: profile?.weight && profile?.height ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : '--' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-container p-3 text-center">
                <span className="block font-label text-[7px] uppercase tracking-widest text-on-surface-variant">{label}</span>
                <span className="font-headline font-bold text-lg text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary p-6 flex flex-col justify-between">
          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-primary-fixed-variant font-bold">System Status</span>
          <div>
            <h2 className="font-headline text-7xl font-black tracking-tighter text-on-primary-fixed-variant italic">
              {profile?.activityLevel === 'very_active' ? '95' : profile?.activityLevel === 'active' ? '88' : profile?.activityLevel === 'moderate' ? '78' : '65'}
              <span className="text-3xl">.0</span>
            </h2>
            <span className="font-label text-[9px] font-bold text-on-primary-fixed-variant/60 uppercase tracking-widest">Protocol Level</span>
          </div>
          <div className="h-1.5 w-full bg-on-primary-fixed-variant/20">
            <div className="h-full bg-on-primary-fixed-variant" style={{ width: profile?.activityLevel === 'very_active' ? '95%' : profile?.activityLevel === 'active' ? '88%' : '75%' }}></div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high border border-outline-variant/30 w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditing(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-headline text-2xl font-black uppercase italic tracking-tighter mb-6">Update Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Age</label>
                  <input type="number" value={form.age || ''} onChange={e => setForm({...form, age: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
                </div>
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Gender</label>
                  <select value={form.gender || ''} onChange={e => setForm({...form, gender: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-body text-sm px-3 py-2 outline-none">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight || ''} onChange={e => setForm({...form, weight: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
                </div>
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Height (cm)</label>
                  <input type="number" value={form.height || ''} onChange={e => setForm({...form, height: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-on-surface font-body text-sm px-3 py-2 outline-none"/>
                </div>
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Fitness Goal</label>
                  <select value={form.fitnessGoal || ''} onChange={e => setForm({...form, fitnessGoal: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-body text-sm px-3 py-2 outline-none">
                    <option value="">Select...</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Activity Level</label>
                  <select value={form.activityLevel || ''} onChange={e => setForm({...form, activityLevel: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-body text-sm px-3 py-2 outline-none">
                    <option value="">Select...</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-on-primary hover:bg-primary-dim transition-colors font-headline font-bold uppercase tracking-widest py-3 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight mb-5">Achievements</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'bolt', label: '14-Day Streak', cond: true },
              { icon: 'fitness_center', label: '1RM PR', cond: true },
              { icon: 'dark_mode', label: 'Sleep Master', cond: (profile?.age) != null },
              { icon: 'lock', label: 'Challenge X', cond: false },
            ].map((a, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 p-3 border ${a.cond ? 'border-primary/30 bg-primary/10' : 'border-outline-variant/20 bg-surface-container opacity-40'}`}>
                <span className={`material-symbols-outlined text-[20px] ${a.cond ? 'text-primary' : 'text-on-surface-variant'}`}>{a.icon}</span>
                <span className="font-label text-[7px] uppercase tracking-wider text-center text-on-surface-variant">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-high border border-outline-variant/10 p-6">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight mb-5">Biometric Sync</h3>
          <div className="space-y-4">
            {[
              { label: 'Whoop Integration', status: 'Not Connected', active: false },
              { label: 'Apple Health', status: 'Manual Entry', active: true },
              { label: 'Garmin Connect', status: 'Not Connected', active: false },
            ].map((device, i) => (
              <div key={i} className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <div>
                  <span className="block font-label text-[9px] uppercase tracking-wider text-on-surface">{device.label}</span>
                  <span className={`font-label text-[8px] ${device.active ? 'text-primary' : 'text-on-surface-variant'}`}>{device.status}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${device.active ? 'bg-primary animate-pulse' : 'bg-surface-variant'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Protocol */}
      <div className="bg-surface-container-high border border-outline-variant/10 p-6">
        <h3 className="font-headline text-lg font-bold uppercase tracking-tight mb-5">Security & Protocol</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h4 className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-bold">Notifications</h4>
            <div className="space-y-4">
              {[
                { key:'pushNotifs', label:'Push Notifications' },
                { key:'twoFactor', label:'Two-Factor Auth' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  <Toggle id={item.key} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-bold">Data</h4>
            <div className="space-y-4">
              {[
                { key:'exportHealth', label:'Export Health Data' },
                { key:'earlyBeta', label:'Early Beta Access' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  <Toggle id={item.key} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-bold">Session</h4>
            <button onClick={handleLogout}
              className="w-full border border-error text-error hover:bg-error/10 py-3 font-headline font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
