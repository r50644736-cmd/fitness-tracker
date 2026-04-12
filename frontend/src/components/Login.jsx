import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Signup extra fields
    const [form, setForm] = useState({
        username: '', password: '',
        age: '', gender: 'male',
        height: '', weight: '',
        fitnessGoal: 'muscle_gain',
        activityLevel: 'moderate',
    });

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isSignup) {
                await axios.post('http://localhost:8080/api/auth/signup', {
                    username: form.username,
                    password: form.password,
                    age: form.age ? +form.age : null,
                    gender: form.gender,
                    height: form.height ? +form.height : null,
                    weight: form.weight ? +form.weight : null,
                    fitnessGoal: form.fitnessGoal,
                    activityLevel: form.activityLevel,
                });
                setIsSignup(false);
                setError(null);
                setForm(prev => ({ ...prev, password: '' }));
            } else {
                const res = await axios.post('http://localhost:8080/api/auth/signin', {
                    username: form.username,
                    password: form.password,
                });
                setToken(res.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-surface-container-highest border-b border-outline-variant/40 focus:border-primary text-on-surface font-body text-sm px-4 py-3 outline-none transition-colors placeholder-on-surface-variant/50";
    const labelClass = "block font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1";

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 selection:bg-primary selection:text-on-primary">
            <div className="max-w-md w-full">
                {/* Brand Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-headline font-black tracking-tighter text-5xl text-primary italic uppercase">KINETIC</h1>
                    <p className="font-label text-on-surface-variant uppercase tracking-[0.2em] mt-2 text-[10px]">
                        Cybernetics AI Fitness System
                    </p>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/20 p-8">
                    <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest mb-6 font-bold border-l-2 border-primary pl-3">
                        {isSignup ? 'Create Your Profile' : 'System Authorization'}
                    </p>

                    {error && (
                        <div className="bg-error/10 border border-error/30 text-error p-3 mb-5 font-label text-[10px] uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Always shown */}
                        <div>
                            <label className={labelClass}>Username</label>
                            <input
                                type="text" required
                                value={form.username} onChange={set('username')}
                                placeholder="Enter username"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Password</label>
                            <input
                                type="password" required
                                value={form.password} onChange={set('password')}
                                placeholder="Enter password"
                                className={inputClass}
                            />
                        </div>

                        {/* Signup-only fields */}
                        {isSignup && (
                            <>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className={labelClass}>Age</label>
                                        <input type="number" value={form.age} onChange={set('age')}
                                            placeholder="e.g. 28" className={inputClass}/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select value={form.gender} onChange={set('gender')} className={inputClass}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Height (cm)</label>
                                        <input type="number" value={form.height} onChange={set('height')}
                                            placeholder="e.g. 178" className={inputClass}/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Weight (kg)</label>
                                        <input type="number" step="0.1" value={form.weight} onChange={set('weight')}
                                            placeholder="e.g. 80" className={inputClass}/>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Fitness Goal</label>
                                    <select value={form.fitnessGoal} onChange={set('fitnessGoal')} className={inputClass}>
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="muscle_gain">Muscle Gain</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="endurance">Endurance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Activity Level</label>
                                    <select value={form.activityLevel} onChange={set('activityLevel')} className={inputClass}>
                                        <option value="sedentary">Sedentary</option>
                                        <option value="light">Light</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="active">Active</option>
                                        <option value="very_active">Very Active</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-on-primary font-headline font-bold text-base py-4 tracking-widest uppercase hover:bg-primary-dim active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Connecting...' : isSignup ? 'Initialize Connection' : 'Authenticate'}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsSignup(!isSignup); setError(null); }}
                                className="text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] uppercase tracking-wider"
                            >
                                {isSignup ? '← Back to Login' : 'Create New Profile →'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center font-label text-[8px] text-on-surface-variant/40 uppercase tracking-widest mt-6">
                    Secured with JWT · Kinetic Cybernetics © 2026
                </p>
            </div>
        </div>
    );
}
