import React, { useEffect, useMemo, useState } from 'react';
import { createComplaint, getCategories, getSubcategories } from '../lib/api';

const domainNames: Record<string, string> = {
  hostel: 'Hostel & Dorms', campus: 'Campus Facilities', academic: 'Academic Labs', food: 'Dining & Mess',
  transport: 'Transport Transit', safety: 'Campus Security', welfare: 'Student Welfare', cleanliness: 'Sanitation',
  infrastructure: 'Civil & Infra', substance: 'Confidential', other: 'Other Desk',
};
const icons: Record<string, string> = { hostel: 'apartment', campus: 'domain', academic: 'school', food: 'restaurant', transport: 'directions_bus', safety: 'shield', welfare: 'favorite', cleanliness: 'cleaning_services', infrastructure: 'build', substance: 'health_and_safety', other: 'help_outline' };

interface Props { preselectedDomain?: string; onCreated: (complaint: any) => void; }

export const LiveReportProblemView: React.FC<Props> = ({ preselectedDomain, onCreated }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => { getCategories().then(data => { setCategories(data); const preferred = data.find(c => c.key === preselectedDomain) || data[0]; if (preferred) setCategoryId(preferred.id); }).catch(e => setError(e.message)).finally(() => setLoadingCategories(false)); }, [preselectedDomain]);
  useEffect(() => { if (!categoryId) return; setSubcategoryId(''); getSubcategories(categoryId).then(setSubcategories).catch(e => setError(e.message)); }, [categoryId]);

  const selected = useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!categoryId || !description.trim()) { setError('Select an issue category and describe the problem.'); return; }
    setLoading(true);
    try {
      const sub = subcategories.find(s => s.id === subcategoryId);
      const complaint = await createComplaint({
        category_id: categoryId, subcategory_id: subcategoryId || undefined,
        title: sub?.name ? `${selected?.name}: ${sub.name}` : `${selected?.name || 'Campus'} issue`,
        description: description.trim(), location_text: location.trim() || undefined, is_anonymous: anonymous,
      });
      setSuccess(complaint); onCreated(complaint);
      setDescription(''); setLocation(''); setSubcategoryId('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not submit complaint.'); }
    finally { setLoading(false); }
  };

  return <div className="max-w-5xl mx-auto w-full pb-10 space-y-5">
    <div><span className="text-[11px] uppercase tracking-[.16em] font-bold text-primary">Campus Desk</span><h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">Report a problem</h1><p className="text-sm text-neutral-600 mt-2">Your complaint enters verification first. Every later stage is driven by the real complaint status.</p></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {success && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-start gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><div><p className="font-bold text-neutral-900">Complaint submitted</p><p className="text-sm text-neutral-600 mt-1">Ticket <b>#{success.ticket_number}</b> is now <b>Pending Verification</b>.</p><p className="text-xs text-neutral-500 mt-2">You can follow its complete lifecycle from My Reports.</p></div></div></div>}
    <form onSubmit={submit} className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
      <section><label className="block text-sm font-semibold text-neutral-900 mb-3">Issue domain</label><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">{categories.map(c => <button type="button" key={c.id} onClick={() => setCategoryId(c.id)} className={`p-3 rounded-xl border text-left transition ${categoryId === c.id ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 hover:border-primary/40 text-neutral-700'}`}><span className="material-symbols-outlined text-[19px]">{icons[c.key] || c.icon || 'category'}</span><span className="block text-xs font-semibold mt-1">{domainNames[c.key] || c.name}</span></button>)}</div></section>
      <section><label className="block text-sm font-semibold text-neutral-900 mb-2">Specific issue</label>{loadingCategories ? <div className="text-sm text-neutral-500">Loading issue types…</div> : <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm bg-white" required><option value="">Select the specific problem</option>{subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}</section>
      <div className="grid md:grid-cols-2 gap-5"><label className="block"><span className="block text-sm font-semibold text-neutral-900 mb-2">Location</span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Building, block, floor or room" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" /></label><div><span className="block text-sm font-semibold text-neutral-900 mb-2">Selected category</span><div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-700">{selected?.name || 'Select a category'}</div></div></div>
      <label className="block"><span className="block text-sm font-semibold text-neutral-900 mb-2">What happened?</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} required minLength={3} placeholder="Describe the problem clearly. Include when it started, what is affected, and anything important for verification." className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm resize-y outline-none focus:border-primary" /></label>
      {selected?.private_reporting && <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="accent-primary" /><span><b className="text-sm text-neutral-900">Submit confidentially</b><span className="block text-xs text-neutral-600 mt-0.5">Your identity is restricted according to the complaint privacy rules.</span></span></label>}
      <button disabled={loading || !categoryId} className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold text-sm disabled:opacity-50">{loading ? 'Submitting complaint…' : 'Submit complaint'}</button>
    </form>
  </div>;
};
