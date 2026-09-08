import React, { useState } from 'react';
import { masterCategories } from '../data/mockData';
import { CategoryInfo, TicketReport } from '../types';
import { RiskAssessmentCard, assessRisk } from './RiskAssessment';
import { motion } from 'motion/react';

interface DashboardViewProps {
  reports: TicketReport[];
  onOpenReportDetails: (report: TicketReport) => void;
  onNavigateTab: (tab: any) => void;
  onSubmitNewReport: (reportData: Partial<TicketReport>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  onOpenReportDetails,
  onNavigateTab,
  onSubmitNewReport,
}) => {
  // Unified Reporting Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<'issue_selection' | 'details'>('issue_selection');
  const [issueSearchQuery, setIssueSearchQuery] = useState('');
  
  // Reusable Problem Details Form state
  const [reportDescription, setReportDescription] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [reportAttachmentName, setReportAttachmentName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Calendar selected date
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(18);
  const [calendarToastMessage, setCalendarToastMessage] = useState<string | null>(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  const openCategoryModal = (cat: CategoryInfo) => {
    setSelectedCategory(cat);
    setIssueSearchQuery('');
    setReportDescription('');
    setReportLocation('');
    setReportAttachmentName('');
    setFormError(null);

    // If main "Other" category on Dashboard, skip issue-type selection completely and directly open the problem details form
    if (cat.key === 'other' || cat.name.toLowerCase() === 'other') {
      setSelectedIssueType('Other Campus Issue');
      setModalStep('details');
    } else {
      setSelectedIssueType(null);
      setModalStep('issue_selection');
    }
    setIsReportModalOpen(true);
  };

  const handleSelectIssue = (issueName: string) => {
    if (!selectedCategory) return;
    setSelectedIssueType(issueName);
    setFormError(null);
    // After student clicks any issue type, immediately open the problem details form
    setModalStep('details');
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    if (!reportDescription.trim()) {
      setFormError('Please enter a problem description before submitting.');
      return;
    }

    const issueTitle = selectedIssueType || selectedCategory.name;
    const newTicketId = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Partial<TicketReport> = {
      id: newTicketId,
      title: `${selectedCategory.name}: ${issueTitle}`,
      category: selectedCategory.name,
      subCategory: issueTitle,
      location: reportLocation.trim() || 'Campus Location Not Specified',
      description: reportDescription.trim(),
      attachmentName: reportAttachmentName || undefined,
      status: 'In Progress',
      reportedDate: 'Just now',
    };

    onSubmitNewReport(newReport);
    setIsReportModalOpen(false);
    setReportDescription('');
    setReportLocation('');
    setReportAttachmentName('');
    setFormError(null);

    setToastMessage({
      title: 'Report Submitted & Dispatched',
      subtitle: `${selectedCategory.name.toUpperCase()} • ${issueTitle} (${newTicketId})`,
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportAttachmentName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    } else {
      setReportAttachmentName('');
    }
  };

  const handleDateClick = (day: number) => {
    setSelectedCalendarDay(day);
    if (day === 18) {
      setCalendarToastMessage('Oct 18: Block C Wi-Fi Dispatch Target (SLA Guaranteed)');
    } else if (day === 12) {
      setCalendarToastMessage('Oct 12: Canteen Water Filter Routine Audit');
    } else {
      setCalendarToastMessage(`Oct ${day}: Standard campus maintenance shifts active`);
    }
    setTimeout(() => setCalendarToastMessage(null), 3500);
  };

  const filteredIssues = selectedCategory
    ? selectedCategory.issues.filter((i) =>
        i.toLowerCase().includes(issueSearchQuery.toLowerCase())
      )
    : [];

  const recentFourReports = reports.slice(0, 4);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-5 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-white shadow-xl flex items-center gap-3 border border-border-hover animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-primary-fixed">verified</span>
          <div className="flex flex-col">
            <span className="font-title text-sm font-semibold">{toastMessage.title}</span>
            <span className="font-body-sm text-xs opacity-90">{toastMessage.subtitle}</span>
          </div>
        </div>
      )}

      {/* Hero / Triage Prompt Header (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-4 rounded-xl border border-border-subtle shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-resolved-bg text-status-resolved-fg font-label-sm text-[10px] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-status-resolved-fg animate-pulse" />
              Campus Support Active
            </span>
            <span className="text-outline text-xs">|</span>
            <span className="font-mono-code text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-secondary">bolt</span>
              24/7 Rapid Response Dispatch
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight leading-tight">
            How can we help?
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Choose a category to report a campus issue. High-priority dispatch teams route tickets instantly.
          </p>
        </div>

        {/* Live Quick Stat Pill */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-container-low border border-border-subtle self-start sm:self-center shrink-0">
          <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[18px]">timer</span>
          </div>
          <div className="flex flex-col pr-1">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
              Median Dispatch Time
            </span>
            <span className="font-title text-sm text-on-surface font-mono-code font-bold">
              14 mins
            </span>
          </div>
        </div>
      </div>

      {/* Transparent risk intelligence: prototype scoring now, model-ready architecture later */}
      <motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-2xl bg-surface-card border border-border-subtle p-4 shadow-xs">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="risk-eyebrow"><span className="risk-pulse" /> Triage intelligence</div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface mt-1">Risk is assessed as you describe the issue.</h2>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-xl">NexCampus looks for safety, service-impact and urgency signals to suggest a response priority. The scoring layer is model-ready for future training.</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold whitespace-nowrap">Prototype engine</span>
          </div>
          <RiskAssessmentCard text={reportDescription || 'Describe a campus issue to see its suggested response priority.'} />
        </div>
        <div className="lg:col-span-5 rounded-2xl bg-[#10261e] text-white p-5 shadow-sm flex flex-col justify-between min-h-[190px]">
          <div>
            <span className="text-[10px] font-bold tracking-[.16em] uppercase opacity-70">Why it matters</span>
            <h3 className="font-display text-xl font-bold mt-2">Route attention where it is needed most.</h3>
            <p className="text-sm opacity-75 leading-relaxed mt-2">Severity signals help campus teams distinguish routine maintenance from issues that may affect safety or many students.</p>
          </div>
          <div className="flex gap-2 mt-4 text-[11px]"><span className="px-2 py-1 rounded-full bg-white/10">Safety</span><span className="px-2 py-1 rounded-full bg-white/10">Impact</span><span className="px-2 py-1 rounded-full bg-white/10">Urgency</span></div>
        </div>
      </motion.section>

      {/* Category Grid: 11 Master Categories sitting comfortably and symmetrically */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {masterCategories.map((cat) => {
          return (
            <button
              key={cat.key}
              onClick={() => openCategoryModal(cat)}
              type="button"
              className="group text-left p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-hover shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between h-36 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer relative"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                  <span className="material-symbols-outlined text-[19px]">{cat.icon}</span>
                </div>
                {cat.privateBadge ? (
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[9px] uppercase tracking-wider font-semibold">
                    Private
                  </span>
                ) : (
                  <span className="font-mono-code text-[11px] text-outline group-hover:text-primary transition-colors">
                    {cat.number}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 mt-2">
                <span className="font-title text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight">
                  {cat.name}
                </span>
                <p className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1 leading-normal">
                  {cat.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-primary font-label-sm text-[11px] font-semibold">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {cat.key === 'other' ? 'Custom report' : cat.privateBadge ? 'Private intake' : 'Select issue'}
                </span>
                <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-0.5 transition-transform ml-auto">
                  arrow_forward
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Operational Dashboard Tri-Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Recent Reports Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-base font-bold text-on-surface tracking-tight">
                Recent Reports
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-code text-[11px]">
                {reports.length} total
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('my-reports')}
              className="font-label-md text-xs font-semibold text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer"
            >
              View all ({reports.length})
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentFourReports.map((item) => {
              const isResolved = item.status === 'Resolved' || item.status === 'Closed';
              const isInProgress = item.status === 'In Progress';
              const isUnderReview = item.status === 'Under Review';

              let badgeBg = 'bg-status-submitted-bg text-status-submitted-fg';
              let badgeDot = 'bg-status-submitted-fg';
              let icon = 'assignment';

              if (isResolved) {
                badgeBg = 'bg-status-resolved-bg text-status-resolved-fg';
                badgeDot = 'bg-status-resolved-fg';
                icon = item.category === 'Transport' ? 'directions_bus' : 'lightbulb';
              } else if (isInProgress) {
                badgeBg = 'bg-status-progress-bg text-status-progress-fg';
                badgeDot = 'bg-status-progress-fg';
                icon = 'wifi';
              } else if (isUnderReview) {
                badgeBg = 'bg-status-review-bg text-status-review-fg';
                badgeDot = 'bg-status-review-fg';
                icon = 'water_drop';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenReportDetails(item)}
                  className="p-3 rounded-xl bg-surface-card border border-border-subtle hover:border-border-hover shadow-xs transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-title text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-[11px]">
                        <span className="font-medium text-on-surface">{item.category}</span>
                        <span>•</span>
                        <span>{item.reportedDate}</span>
                        <span>•</span>
                        <span className="font-mono-code">{item.id}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider font-semibold ${badgeBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                    {item.statusText || item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active SLA Tracker & Refined Calendar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* OPEN REPORTS & SLA TRACKER */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-base font-bold text-on-surface tracking-tight">
                Open Reports
              </h2>
              <span className="font-mono-code text-[11px] text-primary font-semibold">
                1 Active Ticket
              </span>
            </div>

            <div
              onClick={() => onNavigateTab('report-problem')}
              className="p-3.5 rounded-xl bg-surface-card border border-border-subtle shadow-xs flex flex-col gap-2.5 cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono-code text-[11px] text-on-surface-variant">
                    #TK-9041 • Hostel IT Support
                  </span>
                  <h3 className="font-title text-sm font-semibold text-on-surface mt-0.5">
                    Wi-Fi connectivity drop in Block C - 3rd Floor
                  </h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-status-progress-fg animate-ping" />
              </div>

              <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant leading-none">
                    Expected SLA Resolution
                  </span>
                  <span className="font-title text-xs text-on-surface font-medium mt-0.5">
                    Tomorrow, 4:00 PM{' '}
                    <span className="text-on-surface-variant font-normal">
                      (Campus IT Network Team)
                    </span>
                  </span>
                </div>
              </div>

              {/* Visual Step Pipeline */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                  <span>Progress Milestone</span>
                  <span className="text-primary font-mono-code">Step 3 of 4</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  <div className="h-1.5 rounded-full bg-primary" title="Submitted" />
                  <div className="h-1.5 rounded-full bg-primary" title="Under Review" />
                  <div
                    className="h-1.5 rounded-full bg-status-progress-fg relative"
                    title="Assigned & In Progress"
                  >
                    <div className="absolute -top-0.5 right-0 w-2.5 h-2.5 rounded-full bg-surface-card shadow flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-progress-fg" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container" title="Resolved" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-on-surface-variant font-medium">
                  <span className="text-primary">Submitted</span>
                  <span className="text-primary">Review</span>
                  <span className="text-status-progress-fg font-bold">In Progress</span>
                  <span className="text-outline">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* REFINED SLA CALENDAR WIDGET */}
          <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                <h3 className="font-title text-sm font-semibold text-on-surface">Calendar</h3>
              </div>
              <span className="font-mono-code text-xs text-on-surface-variant font-medium">
                October 2025
              </span>
            </div>

            {/* Calendar Mini-Grid */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-7 text-center font-mono-code text-[10px] text-outline uppercase font-semibold">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>
              <div className="grid grid-cols-7 text-center font-body-sm text-[11px] gap-y-0.5">
                <span className="text-surface-container-highest p-1">29</span>
                <span className="text-surface-container-highest p-1">30</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDateClick(d)}
                    className={`p-1 rounded-md transition-colors hover:bg-surface-container-low cursor-pointer ${
                      selectedCalendarDay === d
                        ? 'bg-primary-container/20 text-primary font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {d}
                  </button>
                ))}

                {/* Target Resolution Highlight Date (18) */}
                <button
                  type="button"
                  onClick={() => handleDateClick(18)}
                  className="p-1 rounded-lg bg-primary text-white font-bold shadow-xs relative group cursor-pointer text-xs"
                >
                  18
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-fixed" />
                </button>

                {[19, 20, 21, 22, 23, 24, 25, 26].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDateClick(d)}
                    className={`p-1 rounded-md transition-colors hover:bg-surface-container-low cursor-pointer ${
                      selectedCalendarDay === d
                        ? 'bg-primary-container/20 text-primary font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlighted Ticket SLA Alert Note */}
            <div className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[15px] text-primary-fixed shrink-0">
                  flag
                </span>
                <span className="font-label-md text-xs font-medium text-white truncate">
                  {calendarToastMessage || 'Oct 18 • Block C Wi-Fi Dispatch Target'}
                </span>
              </div>
              <span className="font-mono-code text-[10px] text-primary-fixed font-bold uppercase shrink-0 pl-1">
                In-Time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UNIFIED REPORTING MODAL: CATEGORY -> ISSUE TYPE -> PROBLEM DETAILS FORM -> SUBMIT REPORT */}
      {isReportModalOpen && selectedCategory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* STEP 2: ISSUE TYPE SELECTION */}
            {modalStep === 'issue_selection' ? (
              <>
                {/* Header & Step Navigation */}
                <div className="p-4 sm:p-6 bg-surface-container-low flex flex-col gap-3 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Back to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* Step Progression Bar */}
                  <div className="flex items-center gap-2 font-mono-code text-xs">
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>{selectedCategory.name}</span>
                    </span>
                    <span className="text-outline">→</span>
                    <span className="text-on-surface font-bold flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-on-surface text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      Select Issue Type
                    </span>
                    <span className="text-outline">→</span>
                    <span className="text-outline flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-surface-container-highest text-outline flex items-center justify-center text-[10px]">
                        3
                      </span>
                      Problem Details
                    </span>
                  </div>

                  {/* Main Dynamic Title */}
                  <div className="flex flex-col gap-1">
                    <h2 className="font-headline-md text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                      {selectedCategory.question}
                    </h2>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Select an exact issue type to direct your report to the designated campus response crew.
                    </p>
                  </div>

                  {/* Search Filter for Types */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={issueSearchQuery}
                      onChange={(e) => setIssueSearchQuery(e.target.value)}
                      placeholder={`Filter ${selectedCategory.name} issue types...`}
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-card text-on-surface placeholder:text-outline font-body-md text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>

                {/* Issue Types List */}
                <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-1 divide-y divide-surface-container max-h-96">
                  {filteredIssues.length === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant font-body-md text-xs">
                      No matching issue types found. Try another search keyword.
                    </div>
                  ) : (
                    filteredIssues.map((issue) => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => handleSelectIssue(issue)}
                        className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-surface-container-low transition-colors duration-150 flex items-center justify-between group focus:outline-none cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${issue.toLowerCase().startsWith('other') ? 'bg-secondary' : 'bg-outline'} group-hover:bg-primary transition-colors`} />
                          <span className={`font-body-md text-xs sm:text-sm font-medium ${issue.toLowerCase().startsWith('other') ? 'text-primary font-semibold' : 'text-on-surface'} group-hover:text-primary transition-colors`}>
                            {issue}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transform group-hover:translate-x-1 transition-all">
                          chevron_right
                        </span>
                      </button>
                    ))
                  )}
                </div>

                {/* Bottom Assistance Bar */}
                <div className="p-4 bg-surface-container-lowest flex items-center justify-between border-t border-border-subtle">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-[18px] text-primary">security</span>
                    <span>Reports are tracked with strict university SLA guarantees.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* STEP 3: REUSABLE PROBLEM DETAILS FORM */
              <>
                {/* Header & Step Navigation */}
                <div className="p-4 sm:p-5 bg-surface-container-low flex flex-col gap-2.5 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    {selectedCategory.key !== 'other' && selectedCategory.name.toLowerCase() !== 'other' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setModalStep('issue_selection');
                          setFormError(null);
                        }}
                        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Issue Types
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(false)}
                        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* Step Progression Bar */}
                  <div className="flex items-center gap-2 font-mono-code text-xs">
                    {selectedCategory.key !== 'other' && selectedCategory.name.toLowerCase() !== 'other' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('issue_selection');
                            setFormError(null);
                          }}
                          className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                            1
                          </span>
                          <span>{selectedCategory.name}</span>
                        </button>
                        <span className="text-outline">→</span>
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('issue_selection');
                            setFormError(null);
                          }}
                          className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                            2
                          </span>
                          <span className="max-w-[140px] truncate">{selectedIssueType}</span>
                        </button>
                        <span className="text-outline">→</span>
                        <span className="text-on-surface font-bold flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-on-surface text-white flex items-center justify-center text-[10px]">
                            3
                          </span>
                          Problem Details
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                            1
                          </span>
                          <span>Other Problem</span>
                        </span>
                        <span className="text-outline">→</span>
                        <span className="text-on-surface font-bold flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-on-surface text-white flex items-center justify-center text-[10px]">
                            2
                          </span>
                          Problem Details
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dynamic Heading & Subtitle */}
                  <div className="flex flex-col">
                    <h2 className="font-headline-md text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                      {selectedCategory.key === 'other' || selectedCategory.name.toLowerCase() === 'other'
                        ? 'Other Campus Problem'
                        : selectedIssueType?.toLowerCase().startsWith('other')
                        ? `Report: ${selectedIssueType}`
                        : `Report: ${selectedIssueType}`}
                    </h2>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      {selectedIssueType?.toLowerCase().startsWith('other') || selectedCategory.key === 'other'
                        ? 'Please explain the issue you are experiencing in detail below.'
                        : 'Provide problem details and location to dispatch the campus engineering crew.'}
                    </p>
                  </div>
                </div>

                {/* Problem Details Form Body */}
                <form onSubmit={handleSubmitReport} className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
                  {/* Selected Category & Selected Issue Type Tags */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-border-subtle text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle">
                      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Selected Category:
                      </span>
                      <span className="font-title text-xs font-semibold text-primary">
                        {selectedCategory.name}
                      </span>
                    </div>

                    {selectedCategory.key !== 'other' && selectedCategory.name.toLowerCase() !== 'other' && selectedIssueType && (
                      <>
                        <span className="text-outline font-bold">→</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-border-subtle">
                          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                            Selected Issue:
                          </span>
                          <span className="font-title text-xs font-semibold text-on-surface">
                            {selectedIssueType}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 1. Problem Description (Required) */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reportDescription"
                      className="font-label-md text-xs font-semibold text-on-surface flex items-center justify-between"
                    >
                      <span>
                        Problem description <span className="text-status-urgent-fg font-bold">*</span>
                      </span>
                      <span className="font-mono-code text-[10px] text-outline">Required</span>
                    </label>
                    <textarea
                      id="reportDescription"
                      required
                      rows={selectedCategory.key === 'other' || (selectedIssueType && selectedIssueType.toLowerCase().startsWith('other')) ? 5 : 4}
                      value={reportDescription}
                      onChange={(e) => {
                        setReportDescription(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder={
                        selectedCategory.key === 'other' || (selectedIssueType && selectedIssueType.toLowerCase().startsWith('other'))
                          ? 'Please explain the problem you are facing in detail (what happened, how often it occurs, urgency, affected areas, etc.)...'
                          : 'Describe the specific problem, symptoms, or malfunction observed...'
                      }
                      className="w-full min-h-[105px] p-3 rounded-xl bg-surface-container-low border border-border-subtle hover:border-outline focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline font-body-md text-xs transition-all resize-y"
                    />
                    {formError && (
                      <span className="font-body-sm text-xs text-status-urgent-fg font-medium">
                        {formError}
                      </span>
                    )}
                  </div>

                  {/* 2. Location Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reportLocation"
                      className="font-label-md text-xs font-semibold text-on-surface flex items-center justify-between"
                    >
                      <span>Location / Room / Relevant Details</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant">
                        e.g. Block C Room 312, Block A 2F
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                        location_on
                      </span>
                      <input
                        id="reportLocation"
                        type="text"
                        value={reportLocation}
                        onChange={(e) => setReportLocation(e.target.value)}
                        placeholder="Where did this problem occur? (Room, floor, building...)"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low border border-border-subtle hover:border-outline focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline font-body-md text-xs transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Photo or Attachment Upload (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-md text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>
                        Photo or Attachment <span className="font-normal text-on-surface-variant text-[11px]">(Optional)</span>
                      </span>
                      <span className="font-mono-code text-[10px] text-outline">JPG, PNG, PDF up to 10MB</span>
                    </span>
                    <label
                      htmlFor="reportAttachment"
                      className="border-2 border-dashed border-border-subtle hover:border-primary/60 rounded-xl p-3.5 bg-surface-container-low hover:bg-surface-card transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 group text-center"
                    >
                      <span className="w-8 h-8 rounded-lg bg-surface-card group-hover:bg-primary-container group-hover:text-white text-primary flex items-center justify-center shadow-xs transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                      </span>
                      <div className="flex flex-col sm:text-left">
                        <span className="font-label-md text-xs font-semibold text-primary group-hover:underline">
                          {reportAttachmentName ? 'Change File' : '[+ Add Photo / File]'}
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          {reportAttachmentName || 'Attach photo of defect or relevant document'}
                        </span>
                      </div>
                      <input
                        id="reportAttachment"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Footer Info & Action Buttons */}
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3 mt-1">
                    {selectedCategory.key !== 'other' && selectedCategory.name.toLowerCase() !== 'other' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setModalStep('issue_selection');
                          setFormError(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <RiskAssessmentCard text={`${selectedCategory?.name || ""} ${selectedIssueType || ""} ${reportDescription}`} />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-white font-title text-xs font-semibold tracking-wide shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Submit Report</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
