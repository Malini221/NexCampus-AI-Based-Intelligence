import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { login, signup } from '../lib/api';

type AuthProps = { onAuthenticated: (name: string, details?: Record<string, string>) => void };
const field = 'auth-input';

type FormState = Record<string, string>;

export const AuthView: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const resetMode = (next: 'signin' | 'signup') => { setMode(next); setStep(1); setError(''); setForm({}); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && step < 3) { setStep(step + 1); return; }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await login(form.email || '', form.password || '');
        onAuthenticated(result.profile.full_name, { email: result.profile.email || result.user.email });
      } else {
        const result = await signup({
          email: form.email || '', password: form.password || '', full_name: form.fullName || '',
          student_id: form.studentId || undefined, department: form.department || undefined,
          program: form.program || undefined, year: form.year ? Number(form.year) : undefined,
          section: form.section || undefined, residence_type: form.residenceType || undefined,
          residence: form.residence || form.area || undefined, room: form.room || undefined,
          bus_number: form.busNumber || undefined,
        });
        if (result.requires_email_confirmation) {
          setMode('signin'); setStep(1);
          setError('Account created. Please verify your email, then sign in with your registered email and password.');
        } else {
          const me = await login(form.email || '', form.password || '');
          onAuthenticated(me.profile.full_name, { email: me.profile.email || me.user.email });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page">
    <motion.div className="auth-visual" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .5 }}>
      <div className="auth-brand"><span className="brand-mark">N</span> NexCampus</div>
      <div className="auth-copy"><span className="auth-kicker">CAMPUS SUPPORT, MADE SIMPLE</span><h1>When something needs attention, <em>make it visible.</em></h1><p>Report campus issues, follow every request, and help your college respond where it matters most.</p></div>
      <motion.div className="student-scene" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" /><div className="student-card"><div className="student-head" /><div className="student-body" /><div className="student-laptop"><span>✓</span></div></div>
        <motion.div className="float-card fc-one" animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }}>Report tracked</motion.div>
        <motion.div className="float-card fc-two" animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>Campus connected</motion.div>
      </motion.div>
    </motion.div>
    <div className="auth-panel">
      <div className="auth-mobile-brand"><span className="brand-mark">N</span> NexCampus</div>
      <motion.div className="auth-box" layout>
        <div className="auth-tabs"><button className={mode === 'signin' ? 'active' : ''} onClick={() => resetMode('signin')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => resetMode('signup')}>Create account</button></div>
        <div className="auth-heading"><h2>{mode === 'signin' ? 'Welcome back.' : 'Create your student profile.'}</h2><p>{mode === 'signin' ? 'Use your registered NexCampus account.' : 'A few details help NexCampus route requests to the right place.'}</p></div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <AnimatePresence mode="wait">
            {mode === 'signin' ? <motion.div key="signin" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              <label>College email<input className={field} value={form.email || ''} onChange={e => set('email', e.target.value)} required type="email" autoComplete="email" placeholder="you@college.edu" /></label>
              <label>Password<input className={field} value={form.password || ''} onChange={e => set('password', e.target.value)} required type="password" autoComplete="current-password" placeholder="Enter your password" /></label>
              <div className="auth-row"><label className="check"><input type="checkbox" /> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>
            </motion.div> : <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="step-label">Step {step} of 3</div>
              {step === 1 && <><label>Student name<input className={field} value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} required placeholder="Your full name" /></label><label>Register number<input className={field} value={form.studentId || ''} onChange={e => set('studentId', e.target.value)} required placeholder="e.g. 24CSE001" /></label><label>College email<input className={field} value={form.email || ''} onChange={e => set('email', e.target.value)} type="email" required autoComplete="email" placeholder="you@college.edu" /></label><label>Password<input className={field} value={form.password || ''} onChange={e => set('password', e.target.value)} type="password" required autoComplete="new-password" placeholder="At least 8 characters" minLength={8} /></label></>}
              {step === 2 && <><label>Department<input className={field} value={form.department || ''} onChange={e => set('department', e.target.value)} required placeholder="Computer Science & Engineering" /></label><div className="auth-grid"><label>Year<select className={field} value={form.year || ''} onChange={e => set('year', e.target.value)} required><option value="">Select</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select></label><label>Section<input className={field} value={form.section || ''} onChange={e => set('section', e.target.value)} placeholder="A" /></label></div></>}
              {step === 3 && <><label>Are you a Hosteller or Day Scholar?<select className={field} value={form.residenceType || ''} onChange={e => set('residenceType', e.target.value)} required><option value="">Select one</option><option value="hosteller">Hosteller</option><option value="dayscholar">Day Scholar</option></select></label>{form.residenceType === 'hosteller' && <div className="auth-grid"><label>Hostel / block<input className={field} value={form.residence || ''} onChange={e => set('residence', e.target.value)} required placeholder="e.g. Block C" /></label><label>Room number<input className={field} value={form.room || ''} onChange={e => set('room', e.target.value)} required placeholder="e.g. 312" /></label></div>}{form.residenceType === 'dayscholar' && <div className="auth-grid"><label>Area / locality<input className={field} value={form.area || ''} onChange={e => set('area', e.target.value)} required placeholder="Your area" /></label><label>Bus number<input className={field} value={form.busNumber || ''} onChange={e => set('busNumber', e.target.value)} required placeholder="e.g. Route 12" /></label></div>}</>}
            </motion.div>}
          </AnimatePresence>
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : step < 3 ? 'Continue' : 'Create my account'} <span>{loading ? '' : '→'}</span></button>
        </form>
        {mode === 'signup' && step > 1 && <button className="back-button" onClick={() => { setStep(step - 1); setError(''); }}>← Back</button>}
        <div className="auth-switch">{mode === 'signin' ? 'New to NexCampus?' : 'Already have an account?'} <button onClick={() => resetMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></div>
      </motion.div>
      <p className="auth-foot">NexCampus · Student support platform</p>
    </div>
  </div>;
};
