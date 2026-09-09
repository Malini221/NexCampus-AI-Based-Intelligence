import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialFacilities } from '../data/mockData';
import { Facility } from '../types';

interface CampusFacilitiesViewProps {
  onReportFacilityIssue: (facilityName: string, category: string) => void;
}

const facilityImages: Record<string, string> = {
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85',
  laboratories: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85',
  classrooms: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85',
  canteen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
  hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d4?auto=format&fit=crop&w=1200&q=85',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85',
  medical: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85',
  transport: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85',
  security: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85',
  'student-services': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
  technology: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85',
  'common-facilities': 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=85',
};

const fallbackFacilityImage = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85';

interface FacilityImageProps {
  facility: Facility;
  className?: string;
}

const FacilityImage: React.FC<FacilityImageProps> = ({ facility, className = '' }) => (
  <img
    src={facilityImages[facility.id] || fallbackFacilityImage}
    alt={`${facility.name} facility`}
    loading="lazy"
    className={`w-full h-full object-cover object-center ${className}`}
  />
);

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono-code text-[10px] uppercase font-bold text-primary tracking-wider">
              CAMPUS DIRECTORY
            </span>
            <span className="text-[10px] text-outline">•</span>
            <span className="font-mono-code text-[10px] uppercase tracking-wider text-on-surface-variant">
              {facilities.length} MONITORED FACILITIES
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight leading-tight">
            Campus Facilities
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">
            Discover campus facilities, explore operating hours, access building services, and view emergency contacts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-status-resolved-fg border border-emerald-200 px-3 py-1 rounded-full shrink-0 shadow-xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-status-resolved-fg animate-pulse" />
          <span className="font-mono-code text-[11px] font-semibold tracking-wide uppercase">
            LIVE STATUS: ALL FACILITIES OPEN
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-surface-card rounded-xl p-2.5 border border-border-subtle shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities, amenities, building numbers..."
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary border border-transparent focus:border-border-hover transition-all"
          />
        </div>

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
      </motion.div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredFacilities.map((facility, index) => (
            <motion.article
              layout
              key={facility.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.2) }}
              whileHover={{ y: -5, scale: 1.012 }}
              whileTap={{ scale: 0.992 }}
              onClick={() => setSelectedFacility(facility)}
              className="facility-card bg-surface-card rounded-2xl border border-border-subtle shadow-xs hover:shadow-lg hover:border-primary/40 overflow-hidden cursor-pointer group flex flex-col min-h-[330px]"
            >
              <div className="relative h-40 overflow-hidden bg-surface-container-low">
                <motion.div
                  className="w-full h-full"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <FacilityImage facility={facility} />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-on-surface font-mono-code text-[10px] uppercase font-semibold shadow-sm">
                    {facility.categoryLabel}
                  </span>
                  <span className={`px-2 py-1 rounded-full backdrop-blur-sm font-mono-code text-[10px] uppercase font-bold shadow-sm ${getBadgeStyle(facility.badgeType)}`}>
                    {facility.badge}
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(facility.category)}`}>
                    <span className="material-symbols-outlined text-[19px]">{facility.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {facility.name}
                    </h2>
                    <p className="text-[11px] font-semibold text-primary/90 mt-0.5 leading-tight">
                      {facility.title}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                  {facility.description}
                </p>

                <div className="mt-auto pt-3">
                  <div className="flex flex-col gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-mono-code text-[10.5px]">
                      <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                      <span className="truncate">{facility.location}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-mono-code text-[10.5px]">
                      <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
                      <span className="truncate">{facility.hoursWeekday}</span>
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-border-subtle/70 flex items-center justify-between text-primary font-semibold text-xs">
                    <span>View Details</span>
                    <motion.span
                      className="material-symbols-outlined text-[16px]"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      arrow_forward
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredFacilities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-8 text-center bg-surface-card rounded-xl border border-border-subtle"
        >
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant">search_off</span>
          <h3 className="font-headline-sm text-base font-semibold text-on-surface mt-2">
            No matching campus facility found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            Check your keywords or reset category filters to view all facilities.
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
        </motion.div>
      )}

      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedFacility(null)}
            className="fixed inset-0 bg-neutral-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden bg-surface-container-low shrink-0">
                <FacilityImage facility={selectedFacility} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  aria-label="Close details"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 flex items-center justify-center text-on-surface shadow-sm hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">close</span>
                </button>
                <div className="absolute left-5 right-5 bottom-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-on-surface font-mono-code text-[10px] uppercase font-semibold">
                      {selectedFacility.categoryLabel}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-mono-code text-[10px] uppercase font-bold ${getBadgeStyle(selectedFacility.badgeType)}`}>
                      {selectedFacility.badge}
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                    {selectedFacility.title}
                  </h2>
                  <p className="text-xs text-white/90 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{selectedFacility.location}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4 text-xs overflow-y-auto">
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">About this facility</h3>
                  <p className="text-on-surface-variant leading-relaxed mt-1">{selectedFacility.description}</p>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl border border-border-subtle">
                  <div className="flex items-center gap-1.5 font-semibold text-on-surface mb-2">
                    <span className="material-symbols-outlined text-primary text-[17px]">schedule</span>
                    <span>Operating Hours</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-surface-card p-2.5 rounded-lg border border-border-subtle/80">
                      <span className="text-on-surface-variant font-mono-code text-[10px] uppercase">Monday – Friday</span>
                      <p className="font-mono-code font-semibold text-on-surface mt-0.5">{selectedFacility.hoursWeekday}</p>
                    </div>
                    <div className="bg-surface-card p-2.5 rounded-lg border border-border-subtle/80">
                      <span className="text-on-surface-variant font-mono-code text-[10px] uppercase">Weekends</span>
                      <p className="font-mono-code font-semibold text-primary mt-0.5">{selectedFacility.hoursWeekend}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-on-surface text-sm mb-2">Available Services & Amenities</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface-variant">
                    {selectedFacility.services.map((srv, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-status-resolved-fg text-[16px] shrink-0">check_circle</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface-canvas p-3 rounded-xl border border-border-subtle">
                  <h3 className="font-semibold text-on-surface text-sm mb-1">Location & Access</h3>
                  <p className="text-on-surface-variant leading-relaxed">{selectedFacility.access.replace(/#/g, '')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container-low p-3 rounded-xl border border-border-subtle font-mono-code text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">call</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase text-on-surface-variant font-medium">Desk Help</span>
                      <span className="font-semibold text-on-surface truncate">{selectedFacility.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">mail</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase text-on-surface-variant font-medium">Inquiries</span>
                      <span className="font-semibold text-on-surface truncate">{selectedFacility.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">router</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase text-on-surface-variant font-medium">Campus Wi-Fi Mesh</span>
                      <span className="font-semibold text-on-surface truncate">{selectedFacility.meshNode}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-surface-container-low border-t border-border-subtle flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Report an Issue with this Facility</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
