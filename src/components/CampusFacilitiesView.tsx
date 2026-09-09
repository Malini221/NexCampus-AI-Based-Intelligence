import React, { useEffect, useState } from 'react';
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

const detailTabs = ['Overview', 'Facilities', 'Location', 'Contact'] as const;
type DetailTab = (typeof detailTabs)[number];

export const CampusFacilitiesView: React.FC<CampusFacilitiesViewProps> = ({
  onReportFacilityIssue,
}) => {
  const [facilities] = useState<Facility[]>(initialFacilities);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(initialFacilities[0] || null);
  const [detailTab, setDetailTab] = useState<DetailTab>('Overview');

  const filterTabs = [
    { id: 'all', label: 'All' },
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

  useEffect(() => {
    if (!filteredFacilities.length) {
      setSelectedFacility(null);
      return;
    }

    if (!selectedFacility || !filteredFacilities.some((facility) => facility.id === selectedFacility.id)) {
      setSelectedFacility(filteredFacilities[0]);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    setDetailTab('Overview');
  }, [selectedFacility?.id]);

  const selectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setDetailTab('Overview');
  };

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
    <div className="flex flex-col w-full max-w-[1500px] mx-auto gap-5 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-code text-[10px] uppercase font-bold text-primary tracking-wider">
              Campus Directory
            </span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span className="font-mono-code text-[10px] uppercase tracking-wider text-on-surface-variant">
              {facilities.length} Facilities
            </span>
          </div>
          <h1 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight">
            Campus Facilities
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
            Explore campus spaces, services, operating hours, and access information.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 text-status-resolved-fg border border-emerald-200 px-3 py-2 rounded-full shrink-0 self-start lg:self-auto">
          <span className="w-2 h-2 rounded-full bg-status-resolved-fg animate-pulse" />
          <span className="font-mono-code text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase">
            Facilities Open
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-surface-card rounded-2xl p-2 border border-border-subtle shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search campus facilities"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary border border-transparent focus:border-border-hover transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-body-sm text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {filteredFacilities.length > 0 && selectedFacility && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5 items-start">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFacilities.map((facility, index) => {
                const isSelected = selectedFacility.id === facility.id;

                return (
                  <motion.article
                    layout
                    key={facility.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.2) }}
                    whileHover={{ y: -5, scale: 1.012 }}
                    whileTap={{ scale: 0.992 }}
                    onClick={() => selectFacility(facility)}
                    className={`facility-card bg-surface-card rounded-2xl border overflow-hidden cursor-pointer group flex flex-col min-h-[310px] transition-shadow ${
                      isSelected
                        ? 'border-primary/70 shadow-lg ring-1 ring-primary/15'
                        : 'border-border-subtle shadow-xs hover:shadow-lg hover:border-primary/40'
                    }`}
                  >
                    <div className="relative h-36 overflow-hidden bg-surface-container-low">
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      >
                        <FacilityImage facility={facility} />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-on-surface font-mono-code text-[10px] uppercase font-semibold shadow-sm">
                          {facility.categoryLabel}
                        </span>
                        <span className={`px-2 py-1 rounded-full backdrop-blur-sm font-mono-code text-[10px] uppercase font-bold shadow-sm ${getBadgeStyle(facility.badgeType)}`}>
                          {facility.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          layoutId="facility-selected"
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="p-3.5 flex flex-col flex-1">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(facility.category)}`}>
                          <span className="material-symbols-outlined text-[19px]">{facility.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-headline-sm text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
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
                          <span>{isSelected ? 'Selected' : 'View Details'}</span>
                          <motion.span
                            className="material-symbols-outlined text-[16px]"
                            animate={{ x: isSelected ? 2 : 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            arrow_forward
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <motion.aside
            layout
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="xl:sticky xl:top-20 bg-surface-card rounded-2xl border border-border-subtle shadow-lg overflow-hidden"
          >
            <div className="relative h-52 sm:h-60 overflow-hidden bg-surface-container-low">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedFacility.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <FacilityImage facility={selectedFacility} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute left-4 right-4 bottom-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-on-surface font-mono-code text-[10px] uppercase font-semibold shadow-sm">
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
                  <span className="truncate">{selectedFacility.location}</span>
                </p>
              </div>
            </div>

            <div className="px-3 pt-2 border-b border-border-subtle overflow-x-auto">
              <div className="flex min-w-max">
                {detailTabs.map((tab) => {
                  const isActive = detailTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDetailTab(tab)}
                      className={`relative px-3 py-2.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <motion.span
                          layoutId="facility-detail-tab"
                          className="absolute left-2 right-2 bottom-0 h-0.5 bg-primary rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5 min-h-[360px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedFacility.id}-${detailTab}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  {detailTab === 'Overview' && (
                    <>
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        </span>
                        <div>
                          <p className="text-xs font-bold text-status-resolved-fg">Currently {selectedFacility.badge.toLowerCase()}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{selectedFacility.hoursWeekday}</p>
                        </div>
                      </div>

                      <section className="mt-5">
                        <h3 className="font-headline-sm text-sm font-bold text-on-surface">About {selectedFacility.name}</h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-1.5">
                          {selectedFacility.description}
                        </p>
                      </section>

                      <section className="mt-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-headline-sm text-sm font-bold text-on-surface">Available Services</h3>
                          <span className="text-[10px] text-primary font-semibold">{selectedFacility.services.length} services</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedFacility.services.slice(0, 5).map((service) => (
                            <div key={service} className="flex items-start gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-status-resolved-fg text-[15px] shrink-0">check_circle</span>
                              <span>{service}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  {detailTab === 'Facilities' && (
                    <section>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-3">Services & Amenities</h3>
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedFacility.services.map((service) => (
                          <div key={service} className="flex items-start gap-2.5 rounded-xl bg-surface-container-low border border-border-subtle p-2.5">
                            <span className="material-symbols-outlined text-primary text-[17px] shrink-0">check_circle</span>
                            <span className="text-xs text-on-surface-variant leading-relaxed">{service}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {detailTab === 'Location' && (
                    <section>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-3">Location & Access</h3>
                      <div className="rounded-xl bg-surface-container-low border border-border-subtle p-3.5">
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[19px]">location_on</span>
                          <div>
                            <p className="text-xs font-semibold text-on-surface">{selectedFacility.location}</p>
                            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                              {selectedFacility.access.replace(/#/g, '')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-border-subtle p-3.5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
                          <h4 className="text-xs font-bold text-on-surface">Operating Hours</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-surface-container-low p-2.5">
                            <p className="text-[9px] uppercase text-on-surface-variant font-semibold">Weekdays</p>
                            <p className="text-[11px] font-semibold text-on-surface mt-1">{selectedFacility.hoursWeekday}</p>
                          </div>
                          <div className="rounded-lg bg-surface-container-low p-2.5">
                            <p className="text-[9px] uppercase text-on-surface-variant font-semibold">Weekends</p>
                            <p className="text-[11px] font-semibold text-primary mt-1">{selectedFacility.hoursWeekend}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {detailTab === 'Contact' && (
                    <section>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-3">Contact Information</h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-border-subtle p-3">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-[17px]">call</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase text-on-surface-variant font-semibold">Government Helpline</p>
                            <p className="text-xs font-semibold text-on-surface truncate">{selectedFacility.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-border-subtle p-3">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-[17px]">mail</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase text-on-surface-variant font-semibold">Inquiries</p>
                            <p className="text-xs font-semibold text-on-surface truncate">{selectedFacility.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-border-subtle p-3">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-secondary text-[17px]">router</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase text-on-surface-variant font-semibold">Campus Wi-Fi Mesh</p>
                            <p className="text-xs font-semibold text-on-surface truncate">{selectedFacility.meshNode}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => onReportFacilityIssue(selectedFacility.name, selectedFacility.category)}
                  className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Report an Issue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}

      {filteredFacilities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-10 text-center bg-surface-card rounded-2xl border border-border-subtle"
        >
          <span className="material-symbols-outlined text-[38px] text-on-surface-variant">search_off</span>
          <h3 className="font-headline-sm text-base font-semibold text-on-surface mt-2">No matching facility found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            Try another search term or reset the category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-3 px-3.5 py-2 rounded-lg bg-primary text-white font-medium text-xs shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};
