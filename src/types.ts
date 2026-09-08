export type NavigationTab = 
  | 'dashboard' 
  | 'report-problem' 
  | 'my-reports' 
  | 'notifications' 
  | 'campus-resources' 
  | 'facilities'
  | 'feedback'
  | 'settings';

export type TicketStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Awaiting Verification' 
  | 'Closed' 
  | 'Dismissed' 
  | 'Cancelled';

export interface TicketReport {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  location: string;
  reportedDate: string;
  closedDate?: string;
  status: TicketStatus;
  statusText?: string;
  description: string;
  squad?: string;
  resolutionAction?: string;
  satisfactionRating?: number;
  reporterName: string;
  reporterId: string;
  attachmentName?: string;
  historySteps?: {
    label: string;
    time?: string;
    completed: boolean;
    active?: boolean;
  }[];
}

export interface Facility {
  id: string;
  name: string;
  title: string;
  category: 'academic' | 'living' | 'wellness' | 'operations';
  categoryLabel: string;
  badge: string;
  badgeType: 'resolved' | 'progress' | 'review' | 'default';
  description: string;
  location: string;
  hoursWeekday: string;
  hoursWeekend: string;
  access: string;
  phone: string;
  email: string;
  meshNode: string;
  icon: string;
  services: string[];
}

export interface NotificationItem {
  id: string;
  type: 'reports' | 'alerts';
  title: string;
  description?: string;
  message?: string;
  subCategory?: string;
  timeAgo?: string;
  timestamp?: string;
  isRead?: boolean;
  unread?: boolean;
  ticketId?: string;
  badgeText?: string;
  badgeClass?: string;
  icon?: string;
  iconClass?: string;
  actionRequired?: boolean;
  actionType?: 'verification' | 'clarification' | 'transit' | 'info';
  clarificationResolved?: boolean;
}

export interface UserProfile {
  name: string;
  studentId: string;
  email: string;
  phone?: string;
  department?: string;
  residence?: string;
  program: string;
  year: string;
  campusResidence: string;
  roomKey: string;
  term: string;
  enrolledCredits: string;
  mentor: string;
  mentorDept: string;
}

export interface CategoryInfo {
  key: string;
  name: string;
  number: string;
  icon: string;
  subtitle: string;
  question: string;
  issues: string[];
  privateBadge?: boolean;
}
