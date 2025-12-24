
export type RequestStatus = 'pending' | 'hr_pending' | 'approved' | 'rejected';

export interface LeaveType {
  id: string;
  name: string;
  icon: string;
  isDeductible: boolean;
  allowance?: number;
}

export interface VacationRequest {
  id: string;
  typeId: string; // References LeaveType.id
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  days: number;
  submittedAt: string;
  employeeName: string;
  hrRequired?: boolean;
  decisionNote?: string;
  attachment?: string; // Base64 encoded file string
}

export interface UserStats {
  total: number;
  used: number;
  pending: number;
}

export interface NotificationSettings {
  reminders: boolean; // Upcoming leave reminders
  statusUpdates: boolean; // Approval/Rejection notifications
  policyUpdates: boolean; // System-wide policy changes
}

export interface Team {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  username: string; // Login ID
  password?: string; // Login Credential
  name: string;
  role: string;
  email: string;
  phone?: string; // Contact number
  status?: string; // Personal status message or bio
  totalAllowance: number;
  usedDays: number;
  pendingDays: number;
  isAdmin?: boolean;
  isTeamLead?: boolean; // Marks if employee is the head of their team
  notificationSettings?: NotificationSettings;
  managerId?: string; // ID of another Employee
  teamId?: string;    // ID of a Team
}

export type ViewType = 'employee' | 'manager' | 'admin' | 'settings' | 'org-chart';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  timestamp: string;
  read: boolean;
  relatedRequestId?: string;
  targetUserId?: string; // Optional: send to specific user
  isEmail?: boolean;     // Simulation flag
}

export interface PublicHoliday {
  id: string;
  date: string;
  name: string;
  isDeductible?: boolean; // Whether this holiday still counts as a vacation day if taken
}

export type BalanceChangeType = 'accrual' | 'deduction' | 'adjustment';

export interface BalanceChange {
  id: string;
  date: string;
  description: string;
  type: BalanceChangeType;
  amount: number;
}
