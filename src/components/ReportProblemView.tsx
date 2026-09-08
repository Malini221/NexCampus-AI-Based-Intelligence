import React, { useState, useRef } from 'react';
import { TicketReport } from '../types';

interface ReportProblemViewProps {
  reports: TicketReport[];
  onSubmitNewReport: (reportData: Partial<TicketReport>) => void;
  preselectedDomain?: string;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  reports,
  onSubmitNewReport,
  preselectedDomain,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [activeDomain, setActiveDomain] = useState<string>(preselectedDomain || 'hostel');

  // Interactive Verification State for Ticket #TK-9041
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'reopen_form' | 'reopened' | 'confirmed'>('pending');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenAttachmentName, setReopenAttachmentName] = useState('');

  // New report form states
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIssueChip, setFormIssueChip] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formToast, setFormToast] = useState<{ title: string; desc: string } | null>(null);

  const domainList = [
    { id: 'hostel', name: 'Hostel & Dorms', icon: 'apartment' },
    { id: 'campus', name: 'Campus Facilities', icon: 'domain' },
    { id: 'academic', name: 'Academic Labs', icon: 'school' },
    { id: 'food', name: 'Dining & Mess', icon: 'restaurant' },
    { id: 'transport', name: 'Transport Transit', icon: 'directions_bus' },
    { id: 'safety', name: 'Campus Security', icon: 'shield' },
    { id: 'welfare', name: 'Student Welfare', icon: 'favorite' },
    { id: 'cleanliness', name: 'Sanitation', icon: 'cleaning_services' },
    { id: 'infrastructure', name: 'Civil & Infra', icon: 'build' },
    { id: 'substance', name: 'Confidential', icon: 'health_and_safety' },
    { id: 'other', name: 'Other Desk', icon: 'help_outline' },
  ];

  const domainTaxonomy: Record<string, { chips: string[]; locPlaceholder: string; descPlaceholder: string }> = {
    hostel: {
      chips: ['Wi-Fi / Internet', 'Room Maintenance', 'Water Supply', 'Bathroom / Toilet', 'Laundry', 'Noise Disturbance'],
      locPlaceholder: 'Block C, Room 312 / Floor 3',
      descPlaceholder: 'Please describe the fault, timing, recurrence, or affected room fixtures...'
    },
    campus: {
      chips: ['Projector / AV Failure', 'HVAC Malfunction', 'Elevator Down', 'Door Lock Fault', 'Lighting Issue'],
      locPlaceholder: 'Admin Block A, Senate Hall, or Campus Garden',
      descPlaceholder: 'Describe broken seating, AV equipment, or entrance doors...'
    },
    academic: {
      chips: ['Lab Workstation', 'Hardware Testing Equipment', '3D Printer Fault', 'Cleanroom Supply', 'Chemical Fume Hood'],
      locPlaceholder: 'Turing Lab 304 or Lecture Hall C-1',
      descPlaceholder: 'Describe malfunctioning projector, lab workstation, or smart board...'
    },
    food: {
      chips: ['Water Dispenser', 'Food Temperature', 'Hygiene / Cleanliness', 'Billing Discrepancy', 'Dietary Request'],
      locPlaceholder: 'Central Dining Hall or Faculty Bistro',
      descPlaceholder: 'Detail meal session (Breakfast/Lunch/Dinner), food item, or hygiene concern...'
    },
    transport: {
      chips: ['Shuttle Delay', 'Route Overcrowding', 'EV Charger Broken', 'Bicycle Stand Fault', 'Driver Conduct'],
      locPlaceholder: 'North Terminal, Shuttle Route B Stop, or West Lot P3',
      descPlaceholder: 'Mention shuttle vehicle ID, timing of delay, or specific charging bay issue...'
    },
    safety: {
      chips: ['Pathway Lighting', 'CCTV Blindspot', 'Broken Perimeter Gate', 'Lost Property', 'Security Patrol Request'],
      locPlaceholder: 'Perimeter Pathway, Gate 3, or Library Alley',
      descPlaceholder: 'Describe dark unlit walkways, broken card readers, or security personnel absence...'
    },
    welfare: {
      chips: ['Counseling Appointment', 'Medical First Aid', 'Disability Support', 'Emergency Grant', 'Grievance'],
      locPlaceholder: 'Campus Center, Student Lounge, or Online Appointment',
      descPlaceholder: 'Provide context as comfortable. All notes are protected by the campus privacy charter.'
    },
    cleanliness: {
      chips: ['Overflowing Bin', 'Restroom Deep Clean', 'Spill Hazard', 'Mosquito Hazard', 'Sanitary Dispenser'],
      locPlaceholder: 'Building D Restrooms or South Walkway Recycle Bins',
      descPlaceholder: 'Indicate overflow, spillage, or missing sanitation supplies...'
    },
    infrastructure: {
      chips: ['Power Outage', 'Plumbing Leak', 'Ceiling Seepage', 'Structural Crack', 'Window Glass Hazard'],
      locPlaceholder: 'Science Tower Elevator B or East Footbridge',
      descPlaceholder: 'Specify civil defect, crack, lift malfunction, or structural hazard...'
    },
    substance: {
      chips: ['Discreet Triage', 'Safe Wellbeing Request', 'De-addiction Guidance', 'Hostel Zone Violation'],
      locPlaceholder: 'Optional: Quad or vicinity',
      descPlaceholder: 'Share what support is needed. Anonymous support is respected.'
    },
    other: {
      chips: ['Unclassified Problem', 'Special Permit', 'Campus Signage', 'Storage Lockers'],
      locPlaceholder: 'Exact Campus Location or Department Name',
      descPlaceholder: 'Detail your issue thoroughly so central dispatch can route it to the appropriate campus team...'
    }
  };

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  const handleConfirmResolution = () => {
    setVerificationStatus('confirmed');
  };

  const handleStillExists = () => {
    setVerificationStatus('reopen_form');
  };

  const handleSubmitReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setVerificationStatus('reopened');
  };

  const handleAutoGeo = () => {
    setFormLocation('Hostel Block A, Room 312 (Detected via Wi-Fi AP-04)');
  };

  const handleNewReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    const currentTax = domainTaxonomy[activeDomain] || domainTaxonomy.hostel;
    const chosenDomainObj = domainList.find((d) => d.id === activeDomain);
    const domainName = chosenDomainObj ? chosenDomainObj.name : 'Campus Desk';

    const newTicketId = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Partial<TicketReport> = {
      id: newTicketId,
      title: formIssueChip ? `${domainName}: ${formIssueChip}` : `${domainName} Issue`,
      category: domainName,
      subCategory: formIssueChip || 'Maintenance Dispatch',
      location: formLocation || 'Campus Area',
      description: formDescription,
      attachmentName: formAttachmentName || undefined,
      status: 'In Progress',
      reportedDate: 'Just now',
    };

    onSubmitNewReport(newReport);

    setFormToast({
      title: `Report Submitted (${newTicketId})`,
      desc: `Dispatched to assigned maintenance squad. SLA tracking active.`,
    });

    setFormDescription('');
    setFormLocation('');
    setFormIssueChip('');
    setFormAttachmentName('');

    setTimeout(() => {
      setFormToast(null);
    }, 4500);
  };

  const currentTax = domainTaxonomy[activeDomain] || domainTaxonomy.hostel;

  return (
    <div className="flex flex-col w-full gap-4 pb-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {formToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-white shadow-xl flex items-center gap-3 border border-border-hover animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-primary-fixed">verified</span>
          <div className="flex flex-col">
            <span className="font-title text-sm font-semibold">{formToast.title}</span>
            <span className="font-body-sm text-xs opacity-90">{formToast.desc}</span>
          </div>
        </div>
      )}

      {/* Page Header & Operational Summary */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono-code text-[11px] font-bold tracking-wide leading-none">
              CAMPUS DESK #TK-OP-24
            </span>
            <span className="w-2 h-2 rounded-full bg-status-resolved-fg" />
            <span className="font-label-sm text-[11px] text-status-resolved-fg font-bold uppercase tracking-wider leading-none">
              Operational Avg Resolution: 4.8h
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-neutral-900 tracking-tight leading-tight mt-0.5">
            Report &amp; Track Issues
          </h1>
          <p className="font-body-sm text-xs text-neutral-600 font-medium max-w-2xl leading-relaxed">
            Submit campus facility faults directly to assigned maintenance squads, review triage telemetry, or verify ongoing work.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-surface-card border border-neutral-200 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px] font-semibold">
                assignment_turned_in
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-neutral-700 uppercase font-mono-code font-bold leading-none">
                Your Active Tickets
              </span>
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight mt-1">
                {verificationStatus === 'confirmed' ? '0 Pending Action' : '1 Pending Action'}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex bg-surface-card border border-neutral-200 rounded-xl px-3 py-1.5 shadow-xs items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px] font-semibold">
                verified_user
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-neutral-700 uppercase font-mono-code font-bold leading-none">
                Campus SLA
              </span>
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight mt-1">
                99.4% Solved
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. TOP: CATEGORY SELECTOR / TABS */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-xs font-semibold text-on-surface">
              Choose Issue Domain
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              • 11 standard departments
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-container shadow-xs flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll categories right"
              className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-container shadow-xs flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
        >
          {domainList.map((dom) => {
            const isActive = activeDomain === dom.id;
            return (
              <button
                key={dom.id}
                type="button"
                onClick={() => setActiveDomain(dom.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 transition-all font-medium text-xs cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-surface-card hover:bg-surface-container-low text-neutral-800 border border-neutral-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-container-low text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{dom.icon}</span>
                </div>
                <span>{dom.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. COMPACT HORIZONTAL REPORT PROGRESS & STUDENT VERIFICATION JOURNEY (TICKET #TK-9041) */}
      <section className="bg-surface-card rounded-xl shadow-xs p-4 flex flex-col gap-4 border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {verificationStatus === 'confirmed' ? (
                <span className="px-3 py-1 rounded-full bg-status-resolved-bg text-status-resolved-fg font-label-sm text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-emerald-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-status-resolved-fg" />
                  Closed & Verified
                </span>
              ) : verificationStatus === 'reopened' ? (
                <span className="px-3 py-1 rounded-full bg-red-100 text-status-urgent-fg font-label-sm text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-red-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-status-urgent-fg animate-pulse" />
                  Reopened (NOC Dispatched)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-label-sm text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-amber-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-800 animate-pulse" />
                  Awaiting Your Verification
                </span>
              )}
              <span className="font-mono-code text-neutral-900 font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                #TK-9041
              </span>
            </div>
            <span className="text-neutral-400 text-[14px] font-bold">•</span>
            <span className="font-headline-sm text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
              Wi-Fi connectivity drop in Block C - 3rd Floor
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-800 font-body-sm text-xs font-medium">
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <strong className="font-semibold text-neutral-900">
                Hostel Block A • Floor 3 Corridor
              </strong>
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-mono-code font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300 text-[11px] shadow-xs">
              IT-NOC Squad #4
            </span>
          </div>
        </div>

        {/* 8-Step Pipeline */}
        <div className="w-full bg-neutral-100/70 rounded-xl px-4 sm:px-6 py-5 border border-neutral-200 overflow-x-auto">
          <div className="relative flex items-center justify-between w-full min-w-[620px]">
            {/* Background track line */}
            <div className="absolute left-6 right-6 h-1.5 bg-neutral-300 top-[16px] -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active filled line */}
            <div
              className="absolute left-6 h-1.5 bg-primary top-[16px] -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
              style={{
                width: verificationStatus === 'confirmed' ? '92%' : verificationStatus === 'reopened' ? '65%' : '80%',
              }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                Submitted
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                09:15 AM
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                Analysed
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                09:40 AM
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                Assigned
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                10:05 AM
              </span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                Acknowledged
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                10:30 AM
              </span>
            </div>

            {/* Step 5 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                In Progress
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                11:15 AM
              </span>
            </div>

            {/* Step 6 */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-2 font-label-sm text-[11px] text-neutral-900 font-bold whitespace-nowrap leading-none">
                Resolved
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-semibold mt-1 leading-none">
                02:15 PM
              </span>
            </div>

            {/* Step 7 (Verification) */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              {verificationStatus === 'confirmed' ? (
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
              ) : verificationStatus === 'reopened' ? (
                <div className="w-8 h-8 rounded-full bg-status-urgent-bg text-status-urgent-fg flex items-center justify-center shadow-xs ring-4 ring-red-200">
                  <span className="material-symbols-outlined text-[15px] font-bold">refresh</span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center ring-4 ring-amber-300 shadow-md border border-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-800 animate-pulse" />
                </div>
              )}
              <span className="mt-2 font-label-sm text-[11px] text-amber-900 font-bold whitespace-nowrap leading-none">
                Verification
              </span>
              <span className="font-mono-code text-[10px] text-amber-900 font-bold px-1.5 py-0.5 rounded bg-amber-200 mt-1 leading-none border border-amber-300">
                {verificationStatus === 'confirmed' ? 'Verified' : verificationStatus === 'reopened' ? 'Reopened' : 'Action Req.'}
              </span>
            </div>

            {/* Step 8 (Closed) */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              {verificationStatus === 'confirmed' ? (
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center shadow-xs ring-4 ring-neutral-100">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                </div>
              )}
              <span className="mt-2 font-label-sm text-[11px] text-neutral-700 font-semibold whitespace-nowrap leading-none">
                Closed
              </span>
              <span className="font-mono-code text-[10px] text-neutral-600 font-medium mt-1 leading-none">
                {verificationStatus === 'confirmed' ? 'Archived' : 'Upcoming'}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Action Card */}
        <div className="bg-surface-canvas border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-status-resolved-bg text-status-resolved-fg flex items-center justify-center shrink-0 border border-emerald-300">
                <span className="material-symbols-outlined text-[19px] font-bold">task_alt</span>
              </div>
              <div>
                <span className="font-label-md text-xs font-bold text-neutral-900">
                  Resolved today at 2:15 PM by Tech Aris Thorne (NOC Team B):
                </span>
                <p className="font-body-sm text-xs text-neutral-700 font-medium mt-0.5">
                  “Replaced faulty access point AP-04 in Corridor C and verified throughput (120 Mbps steady).”
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
              <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono-code font-bold text-[10.5px] text-neutral-900">
                AP-C-04
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-mono-code font-bold text-[10.5px] text-emerald-900">
                5GHz OK
              </span>
            </div>
          </div>

          {/* Action Choice Box or Status Result */}
          {verificationStatus === 'pending' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface-card border-2 border-neutral-300/80 rounded-xl shadow-xs">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">help</span>
                  <span className="font-headline-sm text-sm font-bold text-neutral-900">
                    Is the problem actually resolved?
                  </span>
                </div>
                <span className="font-body-sm text-xs text-neutral-700 font-medium">
                  Please confirm Wi-Fi connectivity and speed in your room before closing this ticket.
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleStillExists}
                  className="px-3.5 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-status-urgent-fg border-2 border-red-300 font-label-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Still Exists</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResolution}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Confirm Resolution</span>
                </button>
              </div>
            </div>
          )}

          {/* Reopen Form */}
          {verificationStatus === 'reopen_form' && (
            <form onSubmit={handleSubmitReopen} className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-status-urgent-fg text-[18px]">warning</span>
                  <span className="font-title text-xs text-neutral-900 font-bold">
                    Tell us what is still wrong
                  </span>
                </div>
                <span className="font-mono-code text-[11px] text-status-urgent-fg font-bold">
                  Escalates to Supervisor
                </span>
              </div>

              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                required
                rows={2}
                placeholder="E.g., Signal still disconnects every 5 minutes in Room 314..."
                className="w-full p-2.5 rounded-lg bg-surface-card text-neutral-900 border border-neutral-300 font-body-md text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card border border-neutral-200 text-neutral-800 font-label-sm text-[11px] font-bold cursor-pointer hover:bg-surface-container">
                  <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                  <span>{reopenAttachmentName || 'Attach Screenshot'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setReopenAttachmentName(f.name);
                    }}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('pending')}
                    className="px-3 py-1 rounded-lg bg-surface-card border border-neutral-200 text-neutral-800 font-label-sm text-[11px] font-semibold hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-status-urgent-fg text-white font-label-sm text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>Submit &amp; Reopen</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reopened Notification */}
          {verificationStatus === 'reopened' && (
            <div className="p-3 bg-red-100 text-status-urgent-fg rounded-lg flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span className="font-title text-xs font-semibold">
                Feedback submitted &amp; ticket reopened. Squad notified for urgent re-inspection.
              </span>
            </div>
          )}

          {/* Confirmed Celebration Alert */}
          {verificationStatus === 'confirmed' && (
            <div className="flex items-center justify-between p-3 bg-status-resolved-bg text-status-resolved-fg rounded-lg shadow-xs border border-emerald-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-status-resolved-fg text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-xs sm:text-sm font-bold">
                    Resolution Confirmed • Ticket TK-9041 Closed
                  </span>
                  <span className="font-body-sm text-[11px] opacity-95 font-medium">
                    Feedback recorded and squad awarded SLA points.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-status-resolved-fg text-white font-mono-code text-[10px] font-bold">
                ARCHIVED
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. NEW ISSUE SUBMISSION FORM FOR SELECTED DOMAIN */}
      <section className="bg-surface-card rounded-xl shadow-xs p-4 flex flex-col gap-3 border border-border-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-neutral-900">
              New Issue Report — {domainList.find((d) => d.id === activeDomain)?.name || 'Hostel & Dorms'}
            </h2>
          </div>
          <span className="font-mono-code text-[10.5px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
            Fast Track Dispatch
          </span>
        </div>

        {/* Issue Type Chips */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-neutral-700">
            Select common issue taxonomy:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentTax.chips.map((chip) => {
              const isSelected = formIssueChip === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFormIssueChip(isSelected ? '' : chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary-container text-white border-primary shadow-xs font-semibold'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-border-subtle'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Description Form */}
        <form onSubmit={handleNewReportSubmit} className="flex flex-col gap-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 flex flex-col gap-1">
              <label htmlFor="formLoc" className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                <span>Location</span>
                <button
                  type="button"
                  onClick={handleAutoGeo}
                  className="text-primary hover:underline font-mono-code text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">my_location</span>
                  <span>Detect Location</span>
                </button>
              </label>
              <input
                id="formLoc"
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder={currentTax.locPlaceholder}
                className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-neutral-800">
                Attachment (Optional)
              </span>
              <label className="h-9 px-3 rounded-lg bg-surface-container-low border border-dashed border-border-subtle flex items-center justify-between cursor-pointer hover:bg-surface-container text-xs text-on-surface-variant">
                <span className="truncate">
                  {formAttachmentName || 'Add photo / pdf'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                  attach_file
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFormAttachmentName(f.name);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="formDesc" className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
              <span>
                Problem Description <span className="text-status-urgent-fg font-bold">*</span>
              </span>
              <span className="font-mono-code text-[10px] text-outline">Detailed report for crew</span>
            </label>
            <textarea
              id="formDesc"
              required
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={currentTax.descPlaceholder}
              className="w-full p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Directly dispatches assigned department squad
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              <span>Submit &amp; Dispatch</span>
            </button>
          </div>
        </form>
      </section>

      {/* 4. ACTIVE CAMPUS TICKET FEED */}
      <section className="bg-surface-card rounded-xl shadow-xs p-4 flex flex-col gap-3 border border-border-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-neutral-900">
              Active Campus Ticket Feed
            </h2>
          </div>
          <span className="font-mono-code text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
            3 Monitored Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1 */}
          <div className="bg-surface-card border-2 border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                  #TK-8912
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-status-resolved-fg font-label-sm text-[10px] font-bold uppercase border border-emerald-300">
                  Resolved
                </span>
              </div>
              <span className="font-title text-sm font-bold text-neutral-900 leading-snug">
                Hot Water Pump Failure
              </span>
              <p className="font-body-sm text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed">
                Block B geyser thermostat replaced and verified by facility plumbers.
              </p>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px] text-neutral-700 font-semibold pt-2 border-t border-neutral-200">
              <span className="text-neutral-900 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-neutral-600">location_on</span>
                Block B • West Zone
              </span>
              <span className="text-neutral-600 font-mono-code">Verified 2d ago</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-card border-2 border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                  #TK-8890
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-status-progress-fg font-label-sm text-[10px] font-bold uppercase border border-sky-300">
                  In Progress
                </span>
              </div>
              <span className="font-title text-sm font-bold text-neutral-900 leading-snug">
                Main Library AC Zone 4 Chiller
              </span>
              <p className="font-body-sm text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed">
                HVAC contractors replacing primary compression valve in mechanical room.
              </p>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px] text-neutral-700 font-semibold pt-2 border-t border-neutral-200">
              <span className="text-neutral-900 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-neutral-600">location_on</span>
                Library 3F East
              </span>
              <span className="text-status-progress-fg font-bold font-mono-code">ETA ~2 hours</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-card border-2 border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                  #TK-8744
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-status-submitted-fg font-label-sm text-[10px] font-bold uppercase border border-slate-300">
                  Analysed
                </span>
              </div>
              <span className="font-title text-sm font-bold text-neutral-900 leading-snug">
                Cafeteria Water Dispenser Filter
              </span>
              <p className="font-body-sm text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed">
                Scheduled carbon filter cartridge swap approved and assigned to catering support.
              </p>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px] text-neutral-700 font-semibold pt-2 border-t border-neutral-200">
              <span className="text-neutral-900 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-neutral-600">location_on</span>
                Central Dining
              </span>
              <span className="text-neutral-700 font-bold font-mono-code">Queue #2</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
