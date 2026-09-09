/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NavigationTab, TicketReport, UserProfile } from './types';
import { initialUserProfile } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CampusFacilitiesView } from './components/CampusFacilitiesView';
import { ReportProblemView } from './components/ReportProblemView';
import { MyReportsView } from './components/MyReportsView';
import { FeedbackView } from './components/FeedbackView';
import { SettingsView } from './components/SettingsView';
import { GlobalModals } from './components/GlobalModals';
import { AuthView } from './components/AuthView';
import { clearSession, getCurrentUser, hasSession, logout } from './lib/api';
import './premium-overrides.css';

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
  const [preselectedDomain, setPreselectedDomain] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      if (!hasSession()) { if (active) setAuthChecking(false); return; }
      try {
        const result = await getCurrentUser();
        if (!active) return;
        const p = result.profile;
        setUserProfile(prev => ({ ...prev, name: p.full_name, studentId: p.student_id || prev.studentId, email: p.email || result.user.email, department: p.department || undefined, program: p.program || prev.program, year: p.year ? `${p.year}${p.year === 1 ? 'st' : p.year === 2 ? 'nd' : p.year === 3 ? 'rd' : 'th'} Year` : prev.year, residence: p.residence || undefined, campusResidence: p.residence || prev.campusResidence, roomKey: p.room || prev.roomKey, mentor: p.mentor || prev.mentor }));
        setIsAuthenticated(true);
      } catch { clearSession(); setIsAuthenticated(false); }
      finally { if (active) setAuthChecking(false); }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifCount = notifications.filter(n => n.unread || !n.isRead).length;
  const activeTicketCount = reports.filter(r => r.status === 'In Progress' || r.status === 'Under Review' || r.status === 'Submitted').length;

  const handleNavigateTab = (tab: NavigationTab, extraData?: any) => {
    setActiveTab(tab); setMobileMenuOpen(false);
    if (extraData?.domain) setPreselectedDomain(extraData.domain);
  };

  const handleReportFacilityIssue = (_facilityName: string, category: string) => {
    const domainMap: Record<string, string> = { academic: 'academic', living: 'food', wellness: 'welfare', operations: 'infrastructure' };
    setPreselectedDomain(domainMap[category] || 'campus'); setActiveTab('report-problem');
  };

  const handleSubmitNewReport = (newTicketData: Partial<TicketReport>) => {
    const fullTicket: TicketReport = { id: newTicketData.id || '', title: newTicketData.title || 'Campus Maintenance Request', category: newTicketData.category || 'General', subCategory: newTicketData.subCategory, location: newTicketData.location || 'Campus Area', description: newTicketData.description || 'Report filed via portal.', status: newTicketData.status || 'Submitted', reportedDate: newTicketData.reportedDate || new Date().toLocaleString(), reporterName: userProfile.name, reporterId: userProfile.studentId, squad: newTicketData.squad, attachmentName: newTicketData.attachmentName };
    setReports(prev => [fullTicket, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false, isRead: true } : n));
  const handleClearAllNotifications = () => setNotifications([]);
  const handleUpdateProfile = (updated: Partial<UserProfile>) => setUserProfile(prev => ({ ...prev, ...updated }));

  const handleAuthenticated = async () => {
    const result = await getCurrentUser();
    const p = result.profile;
    setUserProfile(prev => ({ ...prev, name: p.full_name, studentId: p.student_id || prev.studentId, email: p.email || result.user.email, department: p.department || undefined, program: p.program || prev.program, residence: p.residence || undefined, campusResidence: p.residence || prev.campusResidence, roomKey: p.room || prev.roomKey }));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => { await logout(); setIsAuthenticated(false); setReports([]); setNotifications([]); setActiveTab('dashboard'); };

  if (authChecking) return <div className="min-h-screen bg-surface-canvas flex items-center justify-center text-on-surface"><div className="text-sm font-semibold">Checking your NexCampus session…</div></div>;
  if (!isAuthenticated) return <AuthView onAuthenticated={handleAuthenticated} />;

  return (
    <motion.div className="min-h-screen bg-surface-canvas text-on-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} activeTicketsCount={activeTicketCount} unreadNotificationsCount={unreadNotifCount} onOpenSosModal={() => setIsSosOpen(true)} userProfile={userProfile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Header userProfile={userProfile} unreadCount={unreadNotifCount} onOpenNotifications={() => setIsNotificationsOpen(true)} onOpenSearch={() => setIsSearchOpen(true)} onOpenSettings={() => setActiveTab('settings')} onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="lg:pl-64 pt-16 min-h-screen flex flex-col"><div className="flex-1 p-4 sm:p-6 lg:p-7">
        {activeTab === 'dashboard' && <DashboardView reports={reports} onOpenReportDetails={setSelectedReportForDetail} onNavigateTab={handleNavigateTab} onSubmitNewReport={handleSubmitNewReport} />}
        {activeTab === 'report-problem' && <ReportProblemView reports={reports} onSubmitNewReport={handleSubmitNewReport} preselectedDomain={preselectedDomain} />}
        {activeTab === 'facilities' && <CampusFacilitiesView onReportFacilityIssue={handleReportFacilityIssue} />}
        {activeTab === 'my-reports' && <MyReportsView reports={reports} />}
        {activeTab === 'feedback' && <FeedbackView />}
        {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
      </div></main>
      <GlobalModals isSosOpen={isSosOpen} onCloseSos={() => setIsSosOpen(false)} isNotificationsOpen={isNotificationsOpen} onCloseNotifications={() => setIsNotificationsOpen(false)} notifications={notifications} onMarkNotificationRead={handleMarkNotificationRead} onClearAllNotifications={handleClearAllNotifications} isSearchOpen={isSearchOpen} onCloseSearch={() => setIsSearchOpen(false)} onNavigateTab={handleNavigateTab} selectedReportForDetail={selectedReportForDetail} onCloseReportDetail={() => setSelectedReportForDetail(null)} />
    </motion.div>
  );
}
