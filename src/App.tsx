/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NavigationTab, TicketReport, UserProfile } from './types';
import { initialUserProfile, initialTicketReports, initialNotifications } from './data/mockData';
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
import './premium-overrides.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [reports, setReports] = useState<TicketReport[]>(initialTicketReports);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<TicketReport | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedDomain, setPreselectedDomain] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const activeTicketCount = reports.filter(
    (r) => r.status === 'In Progress' || r.status === 'Under Review' || r.status === 'Submitted'
  ).length;

  const handleNavigateTab = (tab: NavigationTab, extraData?: any) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (extraData?.domain) setPreselectedDomain(extraData.domain);
  };

  const handleReportFacilityIssue = (_facilityName: string, category: string) => {
    const domainMap: Record<string, string> = {
      academic: 'academic', living: 'food', wellness: 'welfare', operations: 'infrastructure',
    };
    setPreselectedDomain(domainMap[category] || 'campus');
    setActiveTab('report-problem');
  };

  const handleSubmitNewReport = (newTicketData: Partial<TicketReport>) => {
    const fullTicket: TicketReport = {
      id: newTicketData.id || `#TK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTicketData.title || 'Campus Maintenance Request',
      category: newTicketData.category || 'General',
      subCategory: newTicketData.subCategory,
      location: newTicketData.location || 'Campus Area',
      description: newTicketData.description || 'Report filed via portal.',
      status: newTicketData.status || 'In Progress',
      reportedDate: newTicketData.reportedDate || 'Just now',
      reporterName: userProfile.name,
      reporterId: userProfile.studentId,
      squad: 'CAMPUS-RAPID-01',
      attachmentName: newTicketData.attachmentName,
    };
    setReports([fullTicket, ...reports]);
    setNotifications((prev) => [{
      id: `notif-${Date.now()}`,
      title: `Ticket ${fullTicket.id} Dispatched`,
      message: `Your report "${fullTicket.title}" has been assigned to squad ${fullTicket.squad}.`,
      timestamp: 'Just now', unread: true, type: 'alert',
    }, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };
  const handleClearAllNotifications = () => setNotifications([]);
  const handleUpdateProfile = (updated: Partial<UserProfile>) => setUserProfile((prev) => ({ ...prev, ...updated }));

  if (!isAuthenticated) {
    return <AuthView onAuthenticated={(name) => {
      setUserProfile((prev) => ({ ...prev, name }));
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <motion.div
      className="min-h-screen bg-surface-canvas text-on-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} activeTicketsCount={activeTicketCount}
        unreadNotificationsCount={unreadNotifCount} onOpenSosModal={() => setIsSosOpen(true)} userProfile={userProfile}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Header userProfile={userProfile} unreadCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)} onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setActiveTab('settings')} onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="lg:pl-64 pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-7">
          {activeTab === 'dashboard' && <DashboardView reports={reports} onOpenReportDetails={setSelectedReportForDetail}
            onNavigateTab={handleNavigateTab} onSubmitNewReport={handleSubmitNewReport} />}
          {activeTab === 'report-problem' && <ReportProblemView reports={reports} onSubmitNewReport={handleSubmitNewReport} preselectedDomain={preselectedDomain} />}
          {activeTab === 'facilities' && <CampusFacilitiesView onReportFacilityIssue={handleReportFacilityIssue} />}
          {activeTab === 'my-reports' && <MyReportsView reports={reports} />}
          {activeTab === 'feedback' && <FeedbackView />}
          {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
        </div>
      </main>
      <GlobalModals isSosOpen={isSosOpen} onCloseSos={() => setIsSosOpen(false)}
        isNotificationsOpen={isNotificationsOpen} onCloseNotifications={() => setIsNotificationsOpen(false)}
        notifications={notifications} onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications} isSearchOpen={isSearchOpen}
        onCloseSearch={() => setIsSearchOpen(false)} onNavigateTab={handleNavigateTab}
        selectedReportForDetail={selectedReportForDetail} onCloseReportDetail={() => setSelectedReportForDetail(null)} />
    </motion.div>
  );
}
