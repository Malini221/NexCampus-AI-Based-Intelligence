import React, { useState } from 'react';
import { TicketReport } from '../types';

interface MyReportsViewProps {
  reports: TicketReport[];
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({ reports }) => {
  const [activeTab, setActiveTab] = useState<'completed' | 'dismissed'>('completed');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Slide-over Inspector Drawer state
  const [selectedReport, setSelectedReport] = useState<TicketReport | null>(null);

  // Filter completed and dismissed
  const completedReports = reports.filter(
    (r) => r.status === 'Closed' || r.status === 'Resolved'
  );
  const dismissedReports = reports.filter(
    (r) => r.status === 'Dismissed' || r.status === 'Cancelled'
  );

  const currentDataset = activeTab === 'completed' ? completedReports : dismissedReports;

  const filteredReports = currentDataset.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'all' ||
      r.category.toLowerCase() === categoryFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === 'oct') {
      matchesDate =
        r.reportedDate.toLowerCase().includes('oct') ||
        (r.closedDate && r.closedDate.toLowerCase().includes('oct'));
    } else if (dateFilter === 'sep') {
      matchesDate =
        r.reportedDate.toLowerCase().includes('sep') ||
        (r.closedDate && r.closedDate.toLowerCase().includes('sep'));
    }

    return matchesQuery && matchesCategory && matchesDate;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-4 pb-8">
      {/* Header Section with Metadata & Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary font-label-sm text-xs uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Archive &amp; Resolution History
            </span>
            <span className="font-mono-code text-xs text-on-surface-variant">
              Portal Ref • NK-8842-ARCH
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            My Reports
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant max-w-2xl">
            A comprehensive verified record of your past campus incident reports, engineering resolutions, and formally closed tickets.
          </p>
        </div>

        {/* Quick Resolution Metric Strip */}
        <div className="flex items-stretch gap-2 bg-surface-card p-2 rounded-xl shadow-xs border border-border-subtle self-start lg:self-auto">
          <div className="px-3 py-1 flex flex-col border-r border-border-subtle pr-3">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider">
              Total Filed
            </span>
            <span className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
              5
            </span>
          </div>
          <div className="px-3 py-1 flex flex-col border-r border-border-subtle pr-3">
            <span className="font-label-sm text-[10px] uppercase text-status-resolved-fg tracking-wider">
              Avg Resolution
            </span>
            <span className="font-headline-sm text-base font-bold text-status-resolved-fg mt-0.5">
              28.4 hrs
            </span>
          </div>
          <div className="px-3 py-1 flex flex-col">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider">
              Satisfaction
            </span>
            <span className="font-headline-sm text-base font-bold text-primary mt-0.5">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar & Interactive Tab Pills */}
      <div className="flex flex-col gap-3">
        {/* Search and Filter Controls */}
        <div className="w-full bg-surface-card rounded-xl p-2.5 shadow-xs border border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID (e.g. #TK-8620) or keyword..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-xs focus:outline-none focus:bg-surface-card transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Selector */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs cursor-pointer hover:bg-surface-container-high transition-colors focus:outline-none border border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Transport">Transport</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Hostel">Hostel</option>
                <option value="Food / Canteen">Food / Canteen</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-on-surface-variant pointer-events-none text-[16px]">
                expand_more
              </span>
            </div>

            {/* Term / Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs cursor-pointer hover:bg-surface-container-high transition-colors focus:outline-none border border-transparent"
              >
                <option value="all">All Quarters (Autumn 2025)</option>
                <option value="oct">October 2025</option>
                <option value="sep">September 2025</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-on-surface-variant pointer-events-none text-[16px]">
                calendar_month
              </span>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              title="Reset filters"
              className="h-9 px-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <div className="flex items-center gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
                activeTab === 'completed'
                  ? 'text-primary bg-surface-card shadow-xs border border-border-subtle'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-card/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span className="font-title">Completed</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-status-resolved-bg text-status-resolved-fg font-label-sm text-[10px]">
                {completedReports.length} Resolved
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dismissed'}
              onClick={() => setActiveTab('dismissed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
                activeTab === 'dismissed'
                  ? 'text-primary bg-surface-card shadow-xs border border-border-subtle'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-card/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">cancel_presentation</span>
              <span className="font-title">Cancelled / Dismissed</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[10px]">
                {dismissedReports.length} Closed
              </span>
            </button>
          </div>

          <span className="text-on-surface-variant font-label-sm text-xs hidden sm:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-outline">verified</span>
            Verified Campus Ledger
          </span>
        </div>
      </div>

      {/* Report Cards Feed */}
      <div className="flex flex-col gap-3">
        {filteredReports.map((item) => {
          const isCompleted = item.status === 'Closed' || item.status === 'Resolved';
          const isDismissed = item.status === 'Dismissed';

          let statusBadgeClass = 'bg-status-resolved-bg text-status-resolved-fg';
          let statusLabel = 'Completed';
          let statusIcon = 'check_circle';

          if (isDismissed) {
            statusBadgeClass = 'bg-status-review-bg text-status-review-fg';
            statusLabel = 'Dismissed';
            statusIcon = 'merge_type';
          } else if (!isCompleted) {
            statusBadgeClass = 'bg-status-submitted-bg text-status-submitted-fg';
            statusLabel = 'Cancelled';
            statusIcon = 'do_not_disturb_on';
          }

          return (
            <article
              key={item.id}
              className="report-card bg-surface-card rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col gap-3 border border-border-subtle"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border-subtle">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider inline-flex items-center gap-1 font-semibold ${statusBadgeClass}`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{statusIcon}</span>
                    {statusLabel}
                  </span>
                  <span className="font-mono-code text-xs font-bold text-primary">
                    {item.id}
                  </span>
                  <span className="text-outline">•</span>
                  <span className="inline-flex items-center gap-1 font-label-md text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px]">
                      {item.category === 'Transport'
                        ? 'directions_bus'
                        : item.category === 'Hostel'
                        ? 'apartment'
                        : item.category === 'Food / Canteen'
                        ? 'restaurant'
                        : 'engineering'}
                    </span>
                    {item.category}
                  </span>
                  {item.subCategory && (
                    <>
                      <span className="text-outline">•</span>
                      <span className="font-label-md text-xs text-on-surface-variant">
                        {item.subCategory}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-on-surface-variant font-mono-code text-[11px] shrink-0">
                  <span className="material-symbols-outlined text-[15px]">event_available</span>
                  <span>{item.closedDate || item.reportedDate}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 flex flex-col gap-1.5">
                  <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-3 font-body-sm text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      Reported: {item.reportedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>
                      {item.location}
                    </span>
                  </div>

                  {/* Resolution highlight note box */}
                  {item.resolutionAction && (
                    <div className="mt-1 p-3 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                          isDismissed ? 'text-status-review-fg' : 'text-status-resolved-fg'
                        }`}
                      >
                        {isDismissed ? 'info' : 'verified_user'}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`font-label-sm text-[10.5px] uppercase font-semibold ${
                            isDismissed ? 'text-status-review-fg' : 'text-primary'
                          }`}
                        >
                          {isDismissed ? 'Administrative Closure Reason' : 'Resolution Action Confirmed'}
                        </span>
                        <p className="font-body-sm text-xs text-on-surface mt-0.5 leading-relaxed">
                          {item.resolutionAction}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right controls */}
                <div className="lg:col-span-4 flex flex-col items-stretch sm:items-end justify-between gap-3 h-full">
                  <div className="flex items-center gap-2">
                    {item.squad && (
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-[11px]">
                        Squad: {item.squad}
                      </span>
                    )}
                    {item.satisfactionRating && (
                      <span
                        className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary"
                        title={`Student Satisfaction: ${item.satisfactionRating}/5`}
                      >
                        <span className="material-symbols-outlined text-[14px]">star</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReport(item)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-title text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
                  >
                    <span>View Details</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {/* Empty state */}
        {filteredReports.length === 0 && (
          <div className="w-full bg-surface-card rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 border border-border-subtle">
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
              No reports found
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant max-w-sm">
              No campus issues match your current query or category filters.
            </p>
          </div>
        )}
      </div>

      {/* Slide-over Inspector Drawer */}
      {selectedReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-end p-0"
        >
          <div className="w-full max-w-xl h-full bg-surface-card shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-4">
              {/* Modal Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10.5px] uppercase tracking-wider font-semibold ${
                      selectedReport.status === 'Closed' || selectedReport.status === 'Resolved'
                        ? 'bg-status-resolved-bg text-status-resolved-fg'
                        : 'bg-status-review-bg text-status-review-fg'
                    }`}
                  >
                    {selectedReport.statusText || selectedReport.status}
                  </span>
                  <span className="font-mono-code text-xs font-bold text-primary">
                    {selectedReport.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  aria-label="Close panel"
                  className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Main Info */}
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  {selectedReport.category}
                </span>
                <h2 className="font-headline-md text-lg font-bold text-on-surface leading-tight">
                  {selectedReport.title}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {selectedReport.description}
                </p>
              </div>

              {/* Timeline Dates Card */}
              <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase text-on-surface-variant">
                    Logged On
                  </span>
                  <span className="font-body-md text-xs font-semibold text-on-surface mt-0.5">
                    {selectedReport.reportedDate}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase text-on-surface-variant">
                    Closed Date
                  </span>
                  <span className="font-body-md text-xs font-semibold text-on-surface mt-0.5">
                    {selectedReport.closedDate || 'Oct 14, 2025'}
                  </span>
                </div>
              </div>

              {/* Official Outcome Note */}
              {selectedReport.resolutionAction && (
                <div className="flex flex-col gap-1">
                  <h3 className="font-title text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      verified
                    </span>
                    Official Resolution Record
                  </h3>
                  <p className="font-body-md text-xs text-on-surface bg-surface-canvas p-3 rounded-xl border border-border-subtle leading-relaxed">
                    {selectedReport.resolutionAction}
                  </p>
                </div>
              )}

              {/* Student Meta Stamp */}
              <div className="p-3 rounded-xl border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-semibold text-on-surface">
                      Reporter Signature
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {selectedReport.reporterName} (ID {selectedReport.reporterId})
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container font-mono-code text-[10.5px] text-on-surface-variant">
                  AUTH: CAMPUS-SSO
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-3 mt-4">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-title text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white font-title text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
