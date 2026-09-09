import React, { useCallback, useEffect, useState } from 'react';
import { getComplaint, getMyComplaints, updateComplaintStatus } from '../lib/api';

const stages = ['Pending Verification', 'Verified', 'AI Analysis', 'Incident Routing', 'In Progress', 'Resolved', 'Closed'];
const statusIndex: Record<string, number> = { Submitted: 0, 'Under Review': 2, 'In Progress': 4, Resolved: 5, 'Awaiting Verification': 5, Closed: 6, Dismissed: -1, Cancelled: -1 };
const prettyStatus: Record<string, string> = { Submitted: 'Pending Verification', 'Under Review': 'AI Analysis', 'In Progress': 'In Progress', Resolved: 'Resolved — awaiting your confirmation', Closed: 'Closed', Dismissed: 'Not Verified', Cancelled: 'Cancelled' };

function formatDate(value?: string) { return value ? new Date(value).toLocaleString() : '—'; }
function mapComplaint(c: any) { return { ...c, id: `#NC-${c.ticket_number}`, category: c.categories?.name || 'Campus', subCategory: c.subcategories?.name || '', location: c.location_text || 'Location not provided', reportedDate: formatDate(c.submitted_at) }; }

interface Props { reports: any[]; onReportsChange: (reports: any[]) => void; }
export const DynamicReportsView: React.FC<Props> = ({ reports, onReportsChange }) => {
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => { try { const data = await getMyComplaints(); onReportsChange(data.map(mapComplaint)); } catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to load reports.'); } }, [onReportsChange]);
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 10000); return () => window.clearInterval(timer); }, [refresh]);
  useEffect(() => { if (!selected) return; setLoading(true); getComplaint(selected.rawId).then(setDetail).catch(e => setMessage(e.message)).finally(() => setLoading(false)); }, [selected]);

  const choose = (r: any) => setSelected({ ...r, rawId: r.rawId || r.id?.replace('#NC-', '') });
  const confirmResolution = async (reopen: boolean) => {
    if (!selected) return; setActionLoading(true); setMessage('');
    try { await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/complaints/${selected.rawId}/confirm-resolution`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('nexcampus_access_token')}` }, body: JSON.stringify({ status: reopen ? 'In Progress' : 'Closed', note: reopen ? 'Student reported that the issue still exists.' : 'Student confirmed the resolution.' }) }); await refresh(); const d = await getComplaint(selected.rawId); setDetail(d); } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update resolution.'); } finally { setActionLoading(false); }
  };

  return <div className="max-w-7xl mx-auto w-full pb-10 space-y-5">
    <div><span className="text-[11px] uppercase tracking-[.16em] font-bold text-primary">Live complaint ledger</span><h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">My Reports</h1><p className="text-sm text-neutral-600 mt-2">Every status below comes from your real complaint record. The list refreshes automatically.</p></div>
    {message && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
    {!reports.length && <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center"><span className="material-symbols-outlined text-4xl text-neutral-300">inbox</span><p className="font-semibold text-neutral-800 mt-3">No complaints yet</p><p className="text-sm text-neutral-500 mt-1">Submitted complaints will appear here with their live processing stage.</p></div>}
    <div className="grid gap-4">
      {reports.map(r => { const status = r.status || 'Submitted'; const current = prettyStatus[status] || status; return <button key={r.rawId || r.id} onClick={() => choose(r)} className="text-left bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-primary">{r.id}</span><span className="text-neutral-300">•</span><span className="text-xs text-neutral-500">{r.category}</span></div><h2 className="font-bold text-neutral-900 mt-2">{r.title}</h2><p className="text-xs text-neutral-500 mt-1">{r.subCategory} {r.location !== 'Location not provided' ? `· ${r.location}` : ''}</p></div><span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold whitespace-nowrap">{current}</span></div>
        <div className="mt-5 grid grid-cols-7 gap-1">{stages.map((s, i) => { const idx = statusIndex[status] ?? 0; const done = idx > i || (idx === i && status !== 'Submitted'); const active = idx === i; return <div key={s} className="min-w-0"><div className={`h-1.5 rounded-full ${done || active ? 'bg-primary' : 'bg-neutral-200'}`} /><span className={`block text-[9px] mt-1 leading-tight ${active ? 'text-primary font-bold' : 'text-neutral-400'}`}>{s}</span></div>; })}</div>
      </button>; })}
    </div>

    {selected && <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex justify-end" onClick={() => setSelected(null)}><aside onClick={e => e.stopPropagation()} className="h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><span className="font-mono text-xs font-bold text-primary">{selected.id}</span><h2 className="text-2xl font-bold text-neutral-900 mt-1">{selected.title}</h2></div><button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600">×</button></div>
      {loading || !detail ? <div className="py-16 text-center text-sm text-neutral-500">Loading live complaint state…</div> : <>
        <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-5"><p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Current stage</p><p className="text-lg font-bold text-primary mt-1">{prettyStatus[detail.complaint.status] || detail.complaint.status}</p><p className="text-xs text-neutral-500 mt-1">Last submitted: {formatDate(detail.complaint.submitted_at)}</p></div>
        <div className="mt-6"><h3 className="font-bold text-neutral-900">Complaint journey</h3><div className="mt-4 space-y-0">{detail.history?.map((h: any, i: number) => <div key={h.id} className="flex gap-3"><div className="flex flex-col items-center"><span className="w-3 h-3 rounded-full bg-primary mt-1" />{i < detail.history.length - 1 && <span className="w-px flex-1 bg-primary/20" />}</div><div className="pb-5"><p className="text-sm font-semibold text-neutral-900">{h.to_status === 'Submitted' ? 'Pending Verification' : prettyStatus[h.to_status] || h.to_status}</p><p className="text-xs text-neutral-500 mt-1">{formatDate(h.created_at)}{h.note ? ` · ${h.note}` : ''}</p></div></div>)}</div></div>
        {detail.analysis && <div className="mt-3 rounded-2xl border border-neutral-200 p-5"><h3 className="font-bold text-neutral-900">AI analysis</h3><div className="grid grid-cols-3 gap-3 mt-4"><div><p className="text-[10px] text-neutral-500 uppercase">Severity</p><p className="font-bold text-sm mt-1">{detail.analysis.severity || '—'}</p></div><div><p className="text-[10px] text-neutral-500 uppercase">Priority</p><p className="font-bold text-sm mt-1">{detail.analysis.priority || '—'}</p></div><div><p className="text-[10px] text-neutral-500 uppercase">Risk</p><p className="font-bold text-sm mt-1">{detail.analysis.risk_score ?? '—'}</p></div></div><p className="text-sm text-neutral-600 mt-4">{detail.analysis.summary || 'Analysis completed.'}</p></div>}
        {detail.incident?.incidents && <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-5"><h3 className="font-bold text-neutral-900">Incident routing</h3><p className="text-sm text-neutral-700 mt-2">Incident #{detail.incident.incidents.incident_number}: {detail.incident.incidents.title}</p><p className="text-xs text-neutral-500 mt-1">{detail.incident.incidents.occurrence_count || 0} occurrence(s) · {detail.incident.incidents.affected_student_count || 0} affected student(s)</p></div>}
        {detail.complaint.status === 'Resolved' && <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5"><h3 className="font-bold text-neutral-900">Is the issue actually resolved?</h3><p className="text-sm text-neutral-600 mt-1">Confirm the resolution to close this complaint, or reopen it if the problem remains.</p><div className="flex gap-2 mt-4"><button disabled={actionLoading} onClick={() => confirmResolution(false)} className="flex-1 rounded-xl bg-primary text-white py-3 text-sm font-semibold">Yes, close it</button><button disabled={actionLoading} onClick={() => confirmResolution(true)} className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold">Still exists</button></div></div>}
      </>}
    </aside></div>}
  </div>;
};
