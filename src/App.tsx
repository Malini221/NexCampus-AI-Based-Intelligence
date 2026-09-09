/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NavigationTab, TicketReport, UserProfile } from './types';
import { initialUserProfile } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CampusFacilitiesView } from './components/CampusFacilitiesView';
import { LiveReportProblemView } from './components/LiveReportProblemView';
import { DynamicReportsView } from './components/DynamicReportsView';
import { FeedbackView } from './components/FeedbackView';
import { SettingsView } from './components/SettingsView';
import { GlobalModals } from './components/GlobalModals';
import { AuthView } from './components/AuthView';
import { clearSession, getCurrentUser, getMyComplaints, getNotifications, hasSession, logout, markNotificationRead } from './lib/api';
import './premium-overrides.css';

function mapComplaint(c: any): TicketReport {
  return { rawId: c.id, id: `#NC-${c.ticket_number}`, title: c.title, category: c.categories?.name || 'Campus', subCategory: c.subcategories?.name, location: c.location_text || 'Location not provided', description: c.description, status: c.status, reportedDate: c.submitted_at ? new Date(c.submitted_at).toLocaleString() : '—', reporterName: '', reporterId: c.student_id } as TicketReport;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [reports, setReports] = useState<TicketReport[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<TicketReport | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedDomain, setPreselectedDomain] = useState<string | undefined>();

  const loadLiveData = useCallback(async () => {
    const [complaints, notifs] = await Promise.all([getMyComplaints(), getNotifications()]);
    setReports(complaints.map(mapComplaint));
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      if (!hasSession()) { if (active) setAuthChecking(false); return; }
      try {
        const result = await getCurrentUser();
        if (!active) return;
        const p = result.profile;
        setUserProfile(prev => ({ ...prev, name: p.full_name, studentId: p.student_id || prev.studentId, email: p.email || result.user.email, department: p.department || undefined, program: p.program || prev.program, year: p.year ? `${p.year}${p.year === 1 ? 'st' : p.year === 2 ? 'nd' : p.year === 3 ? 'rd' : 'th'} Year` : prev.year, residence: p.residence || undefined, campusResidence: p.residence || prev.campusResidence, roomKey: p.room || prev.roomKey }));
        setIsAuthenticated(true);
        await loadLiveData();
      } catch { clearSession(); setIsAuthenticated(false); }
      finally { if (active) setAuthChecking(false); }
    };
    restoreSession();
    return () => { active = false; };
  }, [loadLiveData]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(v => !v); } };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setInterval(() => { loadLiveData().catch(() => undefined); }, 10000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, loadLiveData]);

  const unreadNotifCount = notifications.filter(n => !n.is_read && !n.isRead && n.unread !== false).length;
  const activeTicketCount = reports.filter(r => !['Closed', 'Dismissed', 'Cancelled'].includes(r.status)).length;
  const handleNavigateTab = (tab: NavigationTab, extraData?: any) => { setActiveTab(tab); setMobileMenuOpen(false); if (extraData?.domain) setPreselectedDomain(extraData.domain); };
  const handleReportFacilityIssue = (_facilityName: string, category: string) => { const map: Record<string, string> = { academic: 'academic', living: 'food', wellness: 'welfare', operations: 'infrastructure' }; setPreselectedDomain(map[category] || 'campus'); setActiveTab('report-problem'); };
  const handleCreated = async () => { await loadLiveData(); setActiveTab('my-reports'); };
  const handleMarkNotificationRead = async (id: string) => { try { await markNotificationRead(id); await loadLiveData(); } catch { /* keep UI responsive */ } };
  const handleClearAllNotifications = () => setNotifications([]);
  const handleUpdateProfile = (updated: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...updated }));
  const handleAuthenticated = async () => { const result = await getCurrentUser(); const p = result.profile; setUserProfile(prev => ({ ...prev, name: p.full_name, studentId: p.student_id || prev.studentId, email: p.email || result.user.email, department: p.department || undefined, program: p.program || prev.program, residence: p.residence || prev.campusResidence, roomKey: p.room || prev.roomKey })); setIsAuthenticated(true); await loadLiveData(); };
  const handleLogout = async () => { await logout(); setIsAuthenticated(false); setReports([]); setNotifications([]); setActiveTab('dashboard'); };

  if (authChecking) return <div className="min-h-screen bg-surface-canvas flex items-center justify-center text-on-surface"><div className="text-sm font-semibold">Checking your NexCampus session…</div></div>;
  if (!isAuthenticated) return <AuthView onAuthenticated={handleAuthenticated} />;

  return <motion.div className="min-h-screen bg-surface-canvas text-on-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .35, ease: 'easeOut' }}>
    <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} activeTicketsCount={activeTicketCount} unreadNotificationsCount={unreadNotifCount} onOpenSosModal={() => setIsSosOpen(true)} userProfile={userProfile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
    <Header userProfile={userProfile} unreadCount={unreadNotifCount} onOpenNotifications={() => setIsNotificationsOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} onOpenSettings={() => setActiveTab('settings')} onToggleMobileMenu={() => setMobileMenuOpen(v => !v)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <main className="lg:pl-64 pt-16 min-h-screen flex flex-col"><div className="flex-1 p-4 sm:p-6 lg:p-7">
      {activeTab === 'dashboard' && <DashboardView reports={reports} onOpenReportDetails={setSelectedReportForDetail} onNavigateTab={handleNavigateTab} onSubmitNewReport={() => setActiveTab('report-problem')} />}
      {activeTab === 'report-problem' && <LiveReportProblemView preselectedDomain={preselectedDomain} onCreated={handleCreated} />}
      {activeTab === 'facilities' && <CampusFacilitiesView onReportFacilityIssue={handleReportFacilityIssue} />}
      {activeTab === 'my-reports' && <DynamicReportsView reports={reports} onReportsChange={setReports} />}
      {activeTab === 'feedback' && <FeedbackView />}
      {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
    </div></main>
    <GlobalModals isSosOpen={isSosOpen} onCloseSos={() => setIsSosOpen(false)} isNotificationsOpen={isNotificationsOpen} onCloseNotifications={() => setIsNotificationsOpen(false)} notifications={notifications.map(n => ({ ...n, unread: !n.is_read, isRead: n.is_read, description: n.message }))} onMarkNotificationRead={handleMarkNotificationRead} onClearAllNotifications={handleClearAllNotifications} isSearchOpen={isSearchOpen} onCloseSearch={() => setIsSearchOpen(false)} onNavigateTab={handleNavigateTab} selectedReportForDetail={selectedReportForDetail} onCloseReportDetail={() => setSelectedReportForDetail(null)} />
  </motion.div>;
}
