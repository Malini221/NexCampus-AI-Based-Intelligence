import React, { useState } from 'react';
import { initialFacilities } from '../data/mockData';
import { Facility } from '../types';

interface CampusFacilitiesViewProps {
  onReportFacilityIssue: (facilityName: string, category: string) => void;
}

export const CampusFacilitiesView: React.FC<CampusFacilitiesViewProps> = ({
  onReportFacilityIssue,
}) => {
  const [facilities] = useState<Facility[]>(initialFacilities);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const filterTabs = [
    { id: 'all', label: `All Facilities (${facilities.length})` },
    { id: 'academic', label: 'Academic' },
    { id: 'living', label: 'Living & Dining' },
    { id: 'wellness', label: 'Wellness & Health' },
    { id: 'operations', label: 'Campus Operations' },
  ];

  const filteredFacilities = facilities.filter((f) => {
    const matchesFilter = activeFilter === 'all' || f.category === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.services.some((s) => s.toLowerCase().includes(q));

    return matchesFilter && matchesQuery;
  });

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'resolved':
        return 'bg-status-resolved-bg text-status-resolved-fg';
      case 'progress':
        return 'bg-status-progress-bg text-status-progress-fg';
      case 'review':
        return 'bg-status-review-bg text-status-review-fg';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-emerald-100 text-primary';
      case 'living':
        return 'bg-amber-100 text-status-review-fg';
      case 'wellness':
        return 'bg-teal-100 text-secondary';
      case 'operations':
        return 'bg-emerald-100 text-primary';
      default:
        return 'bg-surface-container text-primary';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-4 pb-8">
      {/* Directory Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono-code text-[10px] uppercase font-bold text-primary tracking-wider">
              CAMPUS DIRECTORY
            </span>
            <span className="text-[10px] text-outline">•</span>
            <span className="font-mono-code text-[10px] uppercase tracking-wider text-on-surface-variant">
              12 MONITORED FACILITIES
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight leading-tight">
            Campus Facilities
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">
            Discover campus facilities, explore operating hours, access building services, and view emergency contacts.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 text-status-resolved-fg border border-emerald-200 px-3 py-1 rounded-full shrink-0 shadow-xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-status-resolved-fg animate-pulse" />
          <span className="font-mono-code text-[11px] font-semibold tracking-wide uppercase">
            LIVE STATUS: ALL FACILITIES OPEN
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-card rounded-xl p-2.5 border border-border-subtle shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities, amenities, building numbers (e.g. Library, NOC, Clinic)..."
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary border border-transparent focus:border-border-hover transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full font-mono-code text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Grid: 4 columns on large desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredFacilities.map((facility) => {
          return (
            <article
              key={facility.id}
              onClick={() => setSelectedFacility(facility)}
              className="facility-card bg-surface-card rounded-xl p-3.5 border border-border-subtle shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-150 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(
                      facility.category
                    )}`}
                  >
                    <span className="material-symbols-outlined text-[19px]">{facility.icon}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-[10px] uppercase font-medium">
                      {facility.categoryLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold ${getBadgeStyle(
                        facility.badgeType
                      )}`}
                    >
                      {facility.badge}
                    </span>
                  </div>
                </div>

                <h2 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  {facility.name}
                </h2>
                <p className="text-[11px] font-semibold text-primary/90 mt-0.5 leading-tight">
                  {facility.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  {facility.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border-subtle/70">
                <div className="flex flex-col gap-1 mb-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-code text-[10.5px]">
                    <span className="material-symbols-outlined text-[13px] text-primary">
                      location_on
                    </span>
                    {facility.location}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-code text-[10.5px]">
                    <span className="material-symbols-outlined text-[13px] text-secondary">
                      schedule
                    </span>
                    {facility.hoursWeekday}
                  </span>
                </div>

                <div className="flex items-center justify-between text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-card rounded-xl border border-border-subtle">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant">
            search_off
          </span>
          <h3 className="font-headline-sm text-base font-semibold text-on-surface mt-2">
            No matching campus facility found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            Check your keywords or reset category filters to view all 12 facilities.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-white font-medium text-xs shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Interactive Detail View Modal */}
      {selectedFacility && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface-card w-full max-w-xl rounded-xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-surface-container-low border-b border-border-subtle flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getIconColor(
                    selectedFacility.category
                  )}`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {selectedFacility.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-[10px] uppercase font-bold">
                      {selectedFacility.categoryLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold ${getBadgeStyle(
                        selectedFacility.badgeType
                      )}`}
                    >
                      {selectedFacility.badge}
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                    {selectedFacility.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      location_on
                    </span>
                    <span>{selectedFacility.location}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                aria-label="Close details"
                className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-container border border-border-subtle flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-xs max-h-[70vh] overflow-y-auto">
              {/* Operating Hours Schedule */}
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <div className="flex items-center gap-1.5 font-semibold text-on-surface mb-2">
                  <span className="material-symbols-outlined text-primary text-[17px]">
                    schedule
                  </span>
                  <span>Operating Hours Schedule</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-surface-card p-2 rounded border border-border-subtle/80">
                    <span className="text-on-surface-variant font-mono-code text-[10px] uppercase">
                      Monday – Friday
                    </span>
                    <p className="font-mono-code font-semibold text-on-surface mt-0.5">
                      {selectedFacility.hoursWeekday}
                    </p>
                  </div>
                  <div className="bg-surface-card p-2 rounded border border-border-subtle/80">
                    <span className="text-on-surface-variant font-mono-code text-[10px] uppercase">
                      Weekends & Finals
                    </span>
                    <p className="font-mono-code font-semibold text-primary mt-0.5">
                      {selectedFacility.hoursWeekend}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Services & Amenities */}
              <div>
                <h3 className="font-semibold text-on-surface mb-2">Available Services & Amenities</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-on-surface-variant">
                  {selectedFacility.services.map((srv, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-status-resolved-fg text-[16px] shrink-0">
                        check_circle
                      </span>
                      <span>{srv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Location & Access Protocol */}
              <div className="bg-surface-canvas p-2.5 rounded-lg border border-border-subtle">
                <h3 className="font-semibold text-on-surface mb-1">Location & Access Protocol</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {selectedFacility.access}
                </p>
              </div>

              {/* Contact & Telemetry Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-lg border border-border-subtle font-mono-code text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                    call
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase text-on-surface-variant font-medium">
                      Desk Help
                    </span>
                    <span className="font-semibold text-on-surface truncate">
                      {selectedFacility.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                    mail
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase text-on-surface-variant font-medium">
                      Inquiries
                    </span>
                    <span className="font-semibold text-on-surface truncate">
                      {selectedFacility.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                    router
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase text-on-surface-variant font-medium">
                      Campus Wi-Fi Mesh
                    </span>
                    <span className="font-semibold text-on-surface truncate">
                      {selectedFacility.meshNode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-surface-container-low border-t border-border-subtle flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const facName = selectedFacility.name;
                  const cat = selectedFacility.category;
                  setSelectedFacility(null);
                  onReportFacilityIssue(facName, cat);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Report an Issue with this Facility</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
