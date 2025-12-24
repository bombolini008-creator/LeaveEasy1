
import React from 'react';
import { VacationRequest, PublicHoliday, BalanceChange, Employee, LeaveType, NotificationSettings, Team } from './types';

export const INITIAL_STATS = {
  total: 30,
  used: 0,
  pending: 0
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  reminders: true,
  statusUpdates: true,
  policyUpdates: true
};

export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: 'lt1', name: 'Annual Leaves', icon: '🏖️', isDeductible: true, allowance: 30 },
  { id: 'lt2', name: 'Sick Leave', icon: '🤒', isDeductible: false },
  { id: 'lt5', name: 'Work From Home', icon: '🏠', isDeductible: false },
];

export const MOCK_TEAMS: Team[] = [
  { id: 't_gen', name: 'General Management' },
  { id: 't_com', name: 'Commercial' },
  { id: 't_it', name: 'IT & Tech Support' },
  { id: 't_prod', name: 'Product & Solutions' },
  { id: 't_fin', name: 'Finance & Admin' },
];

export const MOCK_TEAM: Employee[] = [
  // Top Level
  { id: 'e_mervat', username: 'mervat', password: 'amadeus2024', name: 'Mervat Alfy', role: 'General Manager', email: 'mervat.alfy@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_gen', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },

  // Commercial Dept
  { id: 'e_tarek', username: 'tarek', password: 'amadeus2024', name: 'Tarek Hefny', role: 'Commercial Director', email: 'tarek.hefny@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_mervat', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_mostafa', username: 'mostafa', password: 'amadeus2024', name: 'Mostafa Allam', role: 'Key Account Manager', email: 'mostafa.allam@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_m_ali', username: 'm_ali', password: 'amadeus2024', name: 'Mohamed Ali', role: 'Key Account Manager', email: 'mohamed.ali@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_nagy', username: 'nagy', password: 'amadeus2024', name: 'Nagy Maccari', role: 'Key Account Manager', email: 'nagy.maccari@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_wassim', username: 'wassim', password: 'amadeus2024', name: 'Wassim Kolta', role: 'Key Account Manager', email: 'wassim.kolta@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_loay', username: 'loay', password: 'amadeus2024', name: 'Loay Abdullah', role: 'Account Manager', email: 'loay.abdullah@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_passant', username: 'passant', password: 'amadeus2024', name: 'Passant E Shemerly', role: 'Snr Sales Analyst', email: 'passant.shemerly@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_abdelrahman', username: 'abdelrahman', password: 'amadeus2024', name: 'Abdelrahman Elsabagh', role: 'Marketing Executive', email: 'abdelrahman.elsabagh@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_com', managerId: 'e_tarek', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },

  // IT Dept (The Admin)
  { id: 'e_maged', username: 'maged', password: 'amadeus2024', name: 'Maged Ghattas', role: 'IT & Techn. Support Manager', email: 'maged.ghattas@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, isAdmin: true, teamId: 't_it', managerId: 'e_mervat', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_ola', username: 'ola', password: 'amadeus2024', name: 'Ola Abdel Salam', role: 'Snr HD & Training Specialist', email: 'ola.abdelsalam@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_david', username: 'david', password: 'amadeus2024', name: 'David Magdi', role: 'HD & Training Specialist', email: 'david.magdi@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_sarah', username: 'sarah', password: 'amadeus2024', name: 'Sarah Abdelazim', role: 'HD & Training Specialist', email: 'sarah.abdelazim@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_avram', username: 'avram', password: 'amadeus2024', name: 'Avram Theodore', role: 'HD & Training Specialist', email: 'avram.theodore@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_specialist', username: 'tbd_specialist', password: 'amadeus2024', name: 'TBD Specialist', role: 'HD & Training Specialist', email: 'hd.specialist@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_ramy', username: 'ramy', password: 'amadeus2024', name: 'Ramy Nasr', role: 'Snr System & Network Administrator', email: 'ramy.nasr@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_m_hefny', username: 'm_hefny', password: 'amadeus2024', name: 'Mohamed El-Hefny', role: 'Snr System & Network Administrator', email: 'mohamed.elhefny@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_it', managerId: 'e_maged', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },

  // Product Dept
  { id: 'e_mai', username: 'mai', password: 'amadeus2024', name: 'Mai Selwanes', role: 'Product & Solutions Manager', email: 'mai.selwanes@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_prod', managerId: 'e_mervat', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_habiba', username: 'habiba', password: 'amadeus2024', name: 'Habiba ElDesouky', role: 'Products & Solutions Specialist', email: 'habiba.eldesouky@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_prod', managerId: 'e_mai', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_peter', username: 'peter', password: 'amadeus2024', name: 'Peter George', role: 'Products & Solutions Specialist', email: 'peter.george@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_prod', managerId: 'e_mai', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },

  // Finance Dept
  { id: 'e_osama', username: 'osama', password: 'amadeus2024', name: 'Osama Zaki', role: 'Financial Manager', email: 'osama.zaki@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_fin', managerId: 'e_mervat', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_karim', username: 'karim', password: 'amadeus2024', name: 'Karim Hamdy', role: 'Financial Accounting Snr Specialist', email: 'karim.hamdy@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_fin', managerId: 'e_osama', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_m_soliman', username: 'm_soliman', password: 'amadeus2024', name: 'Mohamed Soliman', role: 'Financial Accounting Specialist', email: 'mohamed.soliman@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_fin', managerId: 'e_osama', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
  { id: 'e_viviane', username: 'viviane', password: 'amadeus2024', name: 'Viviane Youssef', role: 'Office Manager', email: 'viviane.youssef@eg.amadeus.com', totalAllowance: 30, usedDays: 0, pendingDays: 0, teamId: 't_fin', managerId: 'e_osama', notificationSettings: DEFAULT_NOTIFICATION_SETTINGS },
];

export const MOCK_REQUESTS: VacationRequest[] = [];

export const MOCK_BALANCE_HISTORY: BalanceChange[] = [
  { id: 'b_2024', date: '2024-01-01', description: '2024 Annual Accrual', type: 'accrual', amount: 30 }
];

export const MOCK_HOLIDAYS: PublicHoliday[] = [
  { id: 'h1', date: '2024-01-07', name: 'Coptic Christmas' },
  { id: 'h2', date: '2024-01-25', name: 'Revolution Day' },
  { id: 'h3', date: '2024-04-25', name: 'Sinai Liberation Day' },
  { id: 'h4', date: '2024-05-01', name: 'Labour Day' },
  { id: 'h5', date: '2024-05-06', name: 'Sham El-Nessim' },
  { id: 'h6', date: '2024-06-30', name: '30 June Revolution' },
  { id: 'h7', date: '2024-07-23', name: 'Revolution Day' },
  { id: 'h8', date: '2024-10-06', name: 'Armed Forces Day' },
];

export const VACATION_POLICY = {
  entitlement: "30 days of annual leaves per year. Balances reset every Jan 1st.",
  publicHolidays: "Public holidays and weekends (Friday & Saturday) are automatically excluded.",
  wfh: "WFH requests are separate and do not deduct from your balance."
};

export const VACATION_POLICY_STRING = `
- Annual leaves: 30 days.
- Reset: Automatic reset on Jan 1st. No carry-over.
- Public holidays: Not counted towards balance.
- Weekends: Friday and Saturday excluded.
- Work From Home: Non-deductible.
`;

export const TEAM_AVAILABILITY_GUIDELINES = `
- Weekends in Egypt: Friday and Saturday.
`;
