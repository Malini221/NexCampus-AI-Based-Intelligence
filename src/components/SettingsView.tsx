import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone || '+91 98765 43210');
  const [residence, setResidence] = useState(userProfile.residence || userProfile.campusResidence || 'Block A, Room 101, SRM Campus, Kattankulathur, Chennai');

  // Preference switches
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [autoGeo, setAutoGeo] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      phone,
      residence,
    });
    setToastMessage('Profile settings and notification preferences saved.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-white shadow-xl flex items-center gap-3 border border-border-hover animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-primary-fixed">check_circle</span>
          <span className="font-title text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono-code text-[10px] uppercase font-bold text-primary tracking-wider">
            STUDENT PORTAL
          </span>
          <span className="text-[10px] text-outline">•</span>
          <span className="font-mono-code text-[10px] uppercase tracking-wider text-on-surface-variant">
            PREFERENCES &amp; SECURITY
          </span>
        </div>
        <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
          Account &amp; Settings
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Manage your verified campus credentials, contact notifications, and incident dispatch permissions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Profile Card */}
        <div className="bg-surface-card rounded-xl p-5 border border-border-subtle shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-title text-base font-bold shadow-xs">
              MS
            </div>
            <div>
              <h2 className="font-title text-base font-bold text-on-surface">
                {userProfile.name}
              </h2>
              <p className="font-mono-code text-xs text-on-surface-variant">
                ID #{userProfile.studentId} • {userProfile.department || userProfile.program}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="studentName" className="text-xs font-semibold text-on-surface">
                Full Name
              </label>
              <input
                id="studentName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="studentEmail" className="text-xs font-semibold text-on-surface">
                Campus Email
              </label>
              <input
                id="studentEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="studentPhone" className="text-xs font-semibold text-on-surface">
                Primary Mobile Phone
              </label>
              <input
                id="studentPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="studentRes" className="text-xs font-semibold text-on-surface">
                Campus Residence &amp; Room
              </label>
              <input
                id="studentRes"
                type="text"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-surface-card rounded-xl p-5 border border-border-subtle shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
            <span className="material-symbols-outlined text-primary text-[20px]">
              notifications_active
            </span>
            <h2 className="font-title text-base font-bold text-on-surface">
              Notification Preferences
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-border-subtle/70">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">
                  SMS Incident Dispatch Alerts
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Receive SMS when a technician is dispatched to your dorm room.
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-primary rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">
                  Email Progress Reports
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Detailed timeline logs sent to campus email for every stage transition.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={(e) => setEmailUpdates(e.target.checked)}
                className="w-4 h-4 text-primary rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">
                  SLA Target &amp; Verification Alerts
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Alert when an issue is solved and awaiting your student verification signature.
                </span>
              </div>
              <input
                type="checkbox"
                checked={slaAlerts}
                onChange={(e) => setSlaAlerts(e.target.checked)}
                className="w-4 h-4 text-primary rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">
                  Auto-Detect Quad Coordinates
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Pre-fill exact building and nearest Wi-Fi access point during issue filing.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoGeo}
                onChange={(e) => setAutoGeo(e.target.checked)}
                className="w-4 h-4 text-primary rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
