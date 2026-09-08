import React, { useState } from 'react';
import { NotificationItem, TicketReport, Facility, CategoryInfo } from '../types';
import { masterCategories, initialFacilities } from '../data/mockData';

interface GlobalModalsProps {
  isSosOpen: boolean;
  onCloseSos: () => void;

  isNotificationsOpen: boolean;
  onCloseNotifications: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;

  isSearchOpen: boolean;
  onCloseSearch: () => void;
  onNavigateTab: (tab: any, extraData?: any) => void;

  selectedReportForDetail: TicketReport | null;
  onCloseReportDetail: () => void;
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
  isSosOpen,
  onCloseSos,
  isNotificationsOpen,
  onCloseNotifications,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  isSearchOpen,
  onCloseSearch,
  onNavigateTab,
  selectedReportForDetail,
  onCloseReportDetail,
}) => {
  // Search query in command palette
  const [paletteQuery, setPaletteQuery] = useState('');
  // SOS Alert triggered state
  const [sosSent, setSosSent] = useState(false);

  const handleSosTrigger = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      onCloseSos();
    }, 4000);
  };

  const filteredCategories = masterCategories.filter((c) =>
    c.name.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  const filteredFacilities = initialFacilities.filter((f) =>
    f.name.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    f.title.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <>
      {/* 1. EMERGENCY SOS DISPATCH MODAL */}
      {isSosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl border-2 border-status-urgent-fg/40 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-status-urgent-fg text-white flex items-center justify-center shadow-md animate-pulse">
                  <span className="material-symbols-outlined text-[22px]">e911_emergency</span>
                </div>
                <div>
                  <span className="font-mono-code text-[10.5px] uppercase font-bold text-status-urgent-fg tracking-wider">
                    PRIORITY RAPID RESPONSE
                  </span>
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                    Emergency Campus Hotlines
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseSos}
                className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
              {sosSent ? (
                <div className="p-4 rounded-xl bg-status-urgent-fg text-white text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[36px]">verified</span>
                  <span className="font-headline-sm text-base font-bold">
                    Emergency Alert Dispatched
                  </span>
                  <p className="text-xs opacity-90 max-w-sm">
                    Campus Security &amp; Medical First Responders have been notified with your GPS coordinates (Campus Zone). Stay calm. Help is on the way.
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    For life-threatening emergencies, immediate physical safety hazards, or urgent medical needs, dial below or press Panic Dispatch:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href="tel:5550199111"
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle flex items-center gap-3 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-100 text-status-urgent-fg flex items-center justify-center group-hover:bg-status-urgent-fg group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">local_police</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-on-surface-variant">
                          Campus Police
                        </span>
                        <span className="font-mono-code font-bold text-xs text-on-surface">
                          (555) 019-9111
                        </span>
                      </div>
                    </a>

                    <a
                      href="tel:5550199222"
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle flex items-center gap-3 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-100 text-status-urgent-fg flex items-center justify-center group-hover:bg-status-urgent-fg group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">medical_services</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-on-surface-variant">
                          Health &amp; Ambulance
                        </span>
                        <span className="font-mono-code font-bold text-xs text-on-surface">
                          (555) 019-9222
                        </span>
                      </div>
                    </a>

                    <a
                      href="tel:5550199333"
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle flex items-center gap-3 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-teal-100 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-on-surface-variant">
                          Counseling &amp; Crisis
                        </span>
                        <span className="font-mono-code font-bold text-xs text-on-surface">
                          (555) 019-9333
                        </span>
                      </div>
                    </a>

                    <a
                      href="tel:5550199444"
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle flex items-center gap-3 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">nightlight_round</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-on-surface-variant">
                          Safe Night Escort
                        </span>
                        <span className="font-mono-code font-bold text-xs text-on-surface">
                          (555) 019-9444
                        </span>
                      </div>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleSosTrigger}
                    className="w-full py-3 rounded-xl bg-status-urgent-fg hover:bg-red-700 text-white font-title text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">emergency</span>
                    <span>1-Click Panic Dispatch (Send GPS Location)</span>
                  </button>
                </>
              )}
            </div>

            <div className="p-3 bg-surface-container-lowest border-t border-border-subtle text-center text-[11px] text-on-surface-variant font-mono-code">
              Campus Security Operations Center • 24/7 Monitored
            </div>
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS DRAWER */}
      {isNotificationsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-end p-0"
        >
          <div className="w-full max-w-md h-full bg-surface-card shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    notifications
                  </span>
                  <h2 className="font-headline-sm text-base font-bold text-on-surface">
                    Campus Notifications
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClearAllNotifications}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={onCloseNotifications}
                    className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant text-xs font-body-sm">
                    No new notifications. You're all caught up!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        notif.unread
                          ? 'bg-surface-container-low border-primary/40 shadow-xs'
                          : 'bg-surface-card border-border-subtle opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              notif.unread ? 'bg-primary' : 'bg-outline'
                            }`}
                          />
                          <span className="font-title text-xs font-bold text-on-surface">
                            {notif.title}
                          </span>
                        </div>
                        <span className="font-mono-code text-[10px] text-on-surface-variant">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseNotifications}
              className="w-full mt-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-title text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}

      {/* 3. SEARCH & COMMAND PALETTE (⌘K) */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4"
        >
          <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Input bar */}
            <div className="p-3.5 bg-surface-container-low border-b border-border-subtle flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">search</span>
              <input
                autoFocus
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type a category, facility, ticket ID, or issue..."
                className="w-full bg-transparent text-sm font-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />
              <button
                type="button"
                onClick={onCloseSearch}
                className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-[11px] cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="p-4 max-h-96 overflow-y-auto flex flex-col gap-4">
              {/* Category Matches */}
              <div>
                <span className="text-[10px] font-mono-code uppercase text-on-surface-variant font-bold tracking-wider block mb-1.5">
                  Report Categories ({filteredCategories.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredCategories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        onCloseSearch();
                        onNavigateTab('dashboard');
                      }}
                      className="p-2 rounded-lg bg-surface-card hover:bg-surface-container-low border border-border-subtle text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px] text-primary">
                        {cat.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-on-surface truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10.5px] text-on-surface-variant truncate">
                          {cat.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facility Matches */}
              <div>
                <span className="text-[10px] font-mono-code uppercase text-on-surface-variant font-bold tracking-wider block mb-1.5">
                  Campus Facilities ({filteredFacilities.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredFacilities.slice(0, 6).map((fac) => (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => {
                        onCloseSearch();
                        onNavigateTab('facilities');
                      }}
                      className="p-2 rounded-lg bg-surface-card hover:bg-surface-container-low border border-border-subtle text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">
                        {fac.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-on-surface truncate">
                          {fac.name}
                        </span>
                        <span className="text-[10.5px] text-on-surface-variant truncate">
                          {fac.location}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between text-[11px] text-on-surface-variant px-4">
              <span>Navigate with click or tap</span>
              <span className="font-mono-code">NexCampus Portal Search</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. REPORT DETAIL POPUP INSPECTOR */}
      {selectedReportForDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container-low border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-xs font-bold text-primary">
                  {selectedReportForDetail.id}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-status-progress-bg text-status-progress-fg font-label-sm text-[10.5px] font-bold uppercase">
                  {selectedReportForDetail.status}
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseReportDetail}
                className="w-7 h-7 rounded-lg bg-surface-card flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                {selectedReportForDetail.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span>{selectedReportForDetail.category}</span>
                <span>•</span>
                <span>{selectedReportForDetail.location}</span>
                <span>•</span>
                <span>{selectedReportForDetail.reportedDate}</span>
              </div>
              <p className="text-xs text-on-surface leading-relaxed bg-surface-container-low p-3 rounded-xl border border-border-subtle">
                {selectedReportForDetail.description}
              </p>
              {selectedReportForDetail.resolutionAction && (
                <div className="p-3 rounded-xl bg-status-resolved-bg text-status-resolved-fg text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{selectedReportForDetail.resolutionAction}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-container-low border-t border-border-subtle flex items-center justify-end">
              <button
                type="button"
                onClick={onCloseReportDetail}
                className="px-4 py-1.5 rounded-lg bg-primary text-white font-title text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
