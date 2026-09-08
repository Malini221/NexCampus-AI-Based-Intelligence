import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type AuthProps = { onAuthenticated: (name: string, details?: Record<string,string>) => void };

const field = "auth-input";
export const AuthView: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [residence, setResidence] = useState('');
  const [form, setForm] = useState<Record<string,string>>({});
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && step < 3) { setStep(step+1); return; }
    onAuthenticated(name || 'Student', { ...form, residence });
  };

  const resetMode = (m:'signin'|'signup') => { setMode(m); setStep(1); };

  return <div className="auth-page">
    <motion.div className="auth-visual" initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{duration:.5}}>
      <div className="auth-brand"><span className="brand-mark">N</span> NexCampus</div>
      <div className="auth-copy">
        <span className="auth-kicker">CAMPUS SUPPORT, MADE SIMPLE</span>
        <h1>When something needs attention, <em>make it visible.</em></h1>
        <p>Report campus issues, follow every request, and help your college respond where it matters most.</p>
      </div>
      <motion.div className="student-scene" animate={{ y:[0,-5,0] }} transition={{duration:4, repeat:Infinity, ease:'easeInOut'}}>
        <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
        <div className="student-card"><div className="student-head" /><div className="student-body" /><div className="student-laptop"><span>✓</span></div></div>
        <motion.div className="float-card fc-one" animate={{ y:[0,-7,0] }} transition={{duration:3,repeat:Infinity}}>Report tracked</motion.div>
        <motion.div className="float-card fc-two" animate={{ y:[0,6,0] }} transition={{duration:3.5,repeat:Infinity}}>Campus connected</motion.div>
      </motion.div>
    </motion.div>
    <div className="auth-panel">
      <div className="auth-mobile-brand"><span className="brand-mark">N</span> NexCampus</div>
      <motion.div className="auth-box" layout>
        <div className="auth-tabs"><button className={mode==='signin'?'active':''} onClick={()=>resetMode('signin')}>Sign in</button><button className={mode==='signup'?'active':''} onClick={()=>resetMode('signup')}>Create account</button></div>
        <div className="auth-heading"><h2>{mode==='signin'?'Welcome back.':'Create your student profile.'}</h2><p>{mode==='signin'?'Pick up where you left off.':'A few details help NexCampus route requests to the right place.'}</p></div>
        <form onSubmit={submit}>
          <AnimatePresence mode="wait">
            {mode==='signin' ? <motion.div key="signin" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}>
              <label>College email or student ID<input className={field} required placeholder="you@college.edu" /></label>
              <label>Password<input className={field} required type="password" placeholder="Enter your password" /></label>
              <div className="auth-row"><label className="check"><input type="checkbox"/> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>
            </motion.div> : <motion.div key={step} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="step-label">Step {step} of 3</div>
              {step===1 && <><label>Student name<input className={field} value={name} onChange={e=>setName(e.target.value)} required placeholder="Your full name" /></label><label>Register number<input className={field} required placeholder="e.g. 24CSE001" /></label><label>College email<input className={field} type="email" required placeholder="you@college.edu" /></label><label>Password<input className={field} type="password" required placeholder="Create a password" /></label></>}
              {step===2 && <><label>Department<input className={field} required placeholder="Computer Science & Engineering" /></label><div className="auth-grid"><label>Year<select className={field} required><option value="">Select</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label><label>Section<input className={field} placeholder="A" /></label></div></>}
              {step===3 && <><label>Are you a Hosteller or Day Scholar?<select className={field} value={residence} onChange={e=>setResidence(e.target.value)} required><option value="">Select one</option><option value="hosteller">Hosteller</option><option value="dayscholar">Day Scholar</option></select></label>
              {residence==='hosteller' && <div className="auth-grid"><label>Hostel / block<input className={field} required placeholder="e.g. Block C" onChange={e=>set('hostelBlock', e.target.value)} /></label><label>Room number<input className={field} required placeholder="e.g. 312" onChange={e=>set('roomNo', e.target.value)} /></label></div>}
              {residence==='dayscholar' && <div className="auth-grid"><label>Area / locality<input className={field} required placeholder="Your area" onChange={e=>set('area', e.target.value)} /></label><label>Bus number<input className={field} required placeholder="e.g. Route 12" onChange={e=>set('busNo', e.target.value)} /></label></div>}
              </>}
            </motion.div>}
          </AnimatePresence>
          <button className="auth-submit" type="submit">{mode==='signin'?'Sign in':step<3?'Continue':'Create my account'} <span>→</span></button>
        </form>
        {mode==='signup' && step>1 && <button className="back-button" onClick={()=>setStep(step-1)}>← Back</button>}
        <div className="auth-switch">{mode==='signin'?'New to NexCampus?':'Already have an account?'} <button onClick={()=>resetMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Create an account':'Sign in'}</button></div>
      </motion.div>
      <p className="auth-foot">NexCampus · Student support platform</p>
    </div>
  </div>;
};
