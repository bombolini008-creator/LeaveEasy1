import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { GeminiChat } from './components/GeminiChat';
import { PolicySection } from './components/PolicySection';
import { BalanceHistory } from './components/BalanceHistory';
import { ManagerDashboard } from './components/ManagerDashboard';
import { OrgChart } from './components/OrgChart';
import { Login } from './components/Login';
import { VacationRequest, UserStats, ViewType, AppNotification, PublicHoliday, BalanceChange, Employee, LeaveType, Team } from './types';
import { INITIAL_STATS, MOCK_REQUESTS, MOCK_HOLIDAYS, MOCK_BALANCE_HISTORY, MOCK_TEAM, DEFAULT_LEAVE_TYPES, DEFAULT_NOTIFICATION_SETTINGS, MOCK_TEAMS } from './constants';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vacation_auth') === 'true' || 
           sessionStorage.getItem('vacation_auth') === 'true';
  });
  
  const [view, setView] = useState<ViewType>(() => {
    const saved = localStorage.getItem('vacation_current_view');
    return (saved as ViewType) || 'employee';
  });
  
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudVaultId, setCloudVaultId] = useState<string | null>(() => localStorage.getItem('vacation_cloud_vault_id'));

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    const saved = localStorage.getItem('vacation_leave_types');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed : DEFAULT_LEAVE_TYPES;
    } catch {
      return DEFAULT_LEAVE_TYPES;
    }
  });

  const [requests, setRequests] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('vacation_requests');
    return saved ? JSON.parse(saved) : MOCK_REQUESTS;
  });
  
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(MOCK_HOLIDAYS);
  const [balanceHistory, setBalanceHistory] = useState<BalanceChange[]>(MOCK_BALANCE_HISTORY);
  const [team, setTeam] = useState<Employee[]>(MOCK_TEAM);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('vacation_current_user_id') || 
           sessionStorage.getItem('vacation_current_user_id');
  });

  const pushToCloud = useCallback(async (data: any) => {
    if (!cloudVaultId) return;
    setIsCloudSyncing(true);
    await new Promise(r => setTimeout(r, 800)); 
    localStorage.setItem(`cloud_vault_${cloudVaultId}`, JSON.stringify(data));
    setIsCloudSyncing(false);
    setLastSaved(Date.now());
  }, [cloudVaultId]);

  const fetchFromCloud = useCallback(async (vaultId: string) => {
    setIsCloudSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    const cloudData = localStorage.getItem(`cloud_vault_${vaultId}`);
    if (cloudData) {
      const data = JSON.parse(cloudData);
      setTeam(data.team || MOCK_TEAM);
      setTeams(data.teams || MOCK_TEAMS);
      setRequests(data.requests || []);
      setPublicHolidays(data.publicHolidays || MOCK_HOLIDAYS);
      setLeaveTypes(data.leaveTypes || DEFAULT_LEAVE_TYPES);
      setBalanceHistory(data.balanceHistory || MOCK_BALANCE_HISTORY);
      setIsCloudSyncing(false);
      return true;
    }
    setIsCloudSyncing(false);
    return false;
  }, []);

  useEffect(() => {
    if (cloudVaultId) fetchFromCloud(cloudVaultId);
  }, [cloudVaultId, fetchFromCloud]);

  useEffect(() => {
    const data = { team, teams, requests, publicHolidays, leaveTypes, balanceHistory, notifications };
    localStorage.setItem('vacation_team', JSON.stringify(team));
    localStorage.setItem('vacation_teams_list', JSON.stringify(teams));
    localStorage.setItem('vacation_requests', JSON.stringify(requests));
    localStorage.setItem('vacation_holidays', JSON.stringify(publicHolidays));
    localStorage.setItem('vacation_leave_types', JSON.stringify(leaveTypes));
    localStorage.setItem('vacation_balance_history', JSON.stringify(balanceHistory));
    localStorage.setItem('vacation_notifications', JSON.stringify(notifications));
    localStorage.setItem('vacation_current_view', view);
    
    if (cloudVaultId) {
      const timer = setTimeout(() => pushToCloud(data), 2000);
      return () => clearTimeout(timer);
    }
  }, [team, teams, requests, publicHolidays, leaveTypes, balanceHistory, notifications, view, cloudVaultId, pushToCloud]);

  const currentUser = team.find(u => u.id === currentUserId) || null;
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  useEffect(() => {
    if (currentUser) {
      const normalizedCurrentName = currentUser.name.toLowerCase().trim();
      const used = requests.filter(r => {
        const type = leaveTypes.find(lt => lt.id === r.typeId);
        return r.status === 'approved' && 
               r.employeeName.toLowerCase().trim() === normalizedCurrentName && 
               type?.isDeductible;
      }).reduce((sum, r) => sum + r.days, 0);
      
      const pending = requests.filter(r => {
        const type = leaveTypes.find(lt => lt.id === r.typeId);
        return (r.status === 'pending' || r.status === 'hr_pending') && 
               r.employeeName.toLowerCase().trim() === normalizedCurrentName && 
               type?.isDeductible;
      }).reduce((sum, r) => sum + r.days, 0);
      setStats({ total: currentUser.totalAllowance, used, pending });
    }
  }, [requests, leaveTypes, currentUser]);

  const handleCreateRequest = (newRequest: Omit<VacationRequest, 'id' | 'status' | 'submittedAt' | 'employeeName'>) => {
    if (!currentUser) return;
    const leaveTypeName = leaveTypes.find(t => t.id === newRequest.typeId)?.name || 'Time Off';
    const requestId = `req-${Date.now()}`;
    const request: VacationRequest = {
      ...newRequest,
      id: requestId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      employeeName: currentUser.name,
    };
    setRequests(prev => [request, ...prev]);
    setIsRequestModalOpen(false);
    
    // In-app Notification for Employee (with simulated email)
    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      title: 'Request Dispatched',
      message: `Your ${leaveTypeName} request has been submitted and an email confirmation was sent to ${currentUser.email}.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      targetUserId: currentUser.id,
      relatedRequestId: requestId,
      isEmail: true
    }, ...prev]);

    // Notification for Manager (with simulated email)
    if (currentUser.managerId) {
      const mgr = team.find(e => e.id === currentUser.managerId);
      setNotifications(prev => [{
        id: `m-${Date.now()}`,
        title: 'Pending Approval Required',
        message: `${currentUser.name} requested ${newRequest.days} days off. An email notification was sent to your inbox (${mgr?.email}).`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        targetUserId: currentUser.managerId,
        relatedRequestId: requestId,
        isEmail: true
      }, ...prev]);
    }
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

    const employee = team.find(e => e.name.toLowerCase().trim() === request.employeeName.toLowerCase().trim());
    if (employee) {
      setNotifications(prev => [{
        id: `s-${Date.now()}`,
        title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Manager decision finalized. Your request for ${request.days} days has been ${status}. An email update was sent to ${employee.email}.`,
        type: status === 'approved' ? 'success' : 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        targetUserId: employee.id,
        relatedRequestId: id,
        isEmail: true
      }, ...prev]);
    }
  };

  const handleConnectVault = async (id: string) => {
    const success = await fetchFromCloud(id);
    if (success) {
      setCloudVaultId(id);
      localStorage.setItem('vacation_cloud_vault_id', id);
    }
    return success;
  };

  const handleInitCloud = async () => {
    const newId = `AMADEUS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setCloudVaultId(newId);
    localStorage.setItem('vacation_cloud_vault_id', newId);
    await pushToCloud({ team, teams, requests, publicHolidays, leaveTypes, balanceHistory, notifications });
  };

  const handleLogin = (username: string, pass: string, rememberMe: boolean): boolean => {
    const user = team.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass.trim());
    if (user) {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      setView('employee');
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('vacation_auth', 'true');
      storage.setItem('vacation_current_user_id', user.id);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
    localStorage.removeItem('vacation_auth');
    localStorage.removeItem('vacation_current_user_id');
    sessionStorage.removeItem('vacation_auth');
    sessionStorage.removeItem('vacation_current_user_id');
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.relatedRequestId) return;

    const request = requests.find(r => r.id === n.relatedRequestId);
    if (!request) {
      // Fallback if request was deleted
      setView('employee');
      return;
    }

    const isCurrentUserManagerOfRequester = team.some(e => 
      e.name.toLowerCase().trim() === request.employeeName.toLowerCase().trim() && 
      e.managerId === currentUser?.id
    );

    if (isCurrentUserManagerOfRequester || currentUser?.isAdmin) {
      // If it's a manager/admin viewing a request notification, go to Team/Admin view
      if (currentUser?.isAdmin) {
        setView('admin');
      } else {
        setView('manager');
      }
      
      // Small delay to ensure the dashboard tab logic renders before we scroll
      setTimeout(() => {
        const el = document.getElementById(`request-${n.relatedRequestId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else {
      // If it's a personal notification (status update), go to Personal History
      setView('employee');
      setTimeout(() => {
        const el = document.getElementById(`request-${n.relatedRequestId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        onResetPassword={(u, p) => {
          const user = team.find(e => e.username.toLowerCase() === u.toLowerCase());
          if (user) { setTeam(prev => prev.map(e => e.id === user.id ? { ...e, password: p } : e)); return true; }
          return false;
        }} 
        onConnectVault={handleConnectVault}
        isCloudSyncing={isCloudSyncing}
        employees={team}
      />
    );
  }

  const userRequests = requests.filter(r => r.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim());

  return (
    <Layout 
      view={view} 
      setView={setView} 
      currentUser={currentUser}
      team={team}
      onSwitchUser={u => setCurrentUserId(u.id)}
      onLogout={handleLogout}
      notifications={notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser.id)}
      onMarkNotificationAsRead={id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
      onClearNotifications={() => setNotifications(prev => prev.filter(n => n.targetUserId && n.targetUserId !== currentUser.id))}
      onNotificationClick={handleNotificationClick}
      lastSaved={lastSaved}
    >
      {view === 'employee' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <Dashboard stats={stats} onOpenRequest={() => setIsRequestModalOpen(true)} />
          
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-900 tracking-tight text-blue-950">Personal History</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {userRequests.length > 0 ? (
                userRequests.map(req => {
                  const type = leaveTypes.find(t => t.id === req.typeId);
                  return (
                    <div key={req.id} id={`request-${req.id}`} className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-3xl shadow-sm">
                          {type?.icon || '📅'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight">{type?.name || 'Absence'}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                             <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>
                             {req.startDate} — {req.endDate}
                          </p>
                          <p className="text-[10px] text-blue-600 font-black uppercase mt-1.5">{req.days} Business Days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                          req.status === 'approved' ? 'bg-emerald-600 text-white' :
                          req.status === 'rejected' ? 'bg-rose-600 text-white' :
                          'bg-amber-500 text-white'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        {req.status === 'pending' && (
                          <button 
                            onClick={() => { if(confirm('Cancel this request?')) setRequests(prev => prev.filter(r => r.id !== req.id)) }}
                            className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-24 text-center">
                   <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Archive Empty</p>
                   <p className="text-slate-400 text-[10px] mt-2 italic font-medium">Click "Request" to initiate your first request.</p>
                </div>
              )}
            </div>
          </section>

          <PolicySection />
          
          <BalanceHistory 
            history={balanceHistory.filter(h => h.description.toLowerCase().includes(currentUser.name.toLowerCase()) || h.id === 'b_2024')} 
            requests={userRequests}
            leaveTypes={leaveTypes}
          />
        </div>
      )}

      {(view === 'manager' || view === 'admin') && (
        <ManagerDashboard 
          mode={view as 'manager' | 'admin'}
          currentUser={currentUser}
          requests={requests}
          team={team}
          teams={teams}
          publicHolidays={publicHolidays}
          leaveTypes={leaveTypes}
          onUpdateStatus={handleUpdateStatus}
          onAddHoliday={h => setPublicHolidays(p => [...p, { ...h, id: `h-${Date.now()}` }])}
          onUpdateHoliday={h => setPublicHolidays(p => p.map(o => o.id === h.id ? h : o))}
          onRemoveHoliday={id => setPublicHolidays(p => p.filter(o => o.id !== id))}
          onSyncHolidays={(h, y) => setPublicHolidays(p => [...p.filter(o => !o.date.startsWith(y.toString())), ...h])}
          onAddLeaveType={t => setLeaveTypes(p => [...p, { ...t, id: `lt-${Date.now()}` }])}
          onRemoveLeaveType={id => setLeaveTypes(p => p.filter(o => o.id !== id))}
          onUpdateLeaveType={t => setLeaveTypes(p => p.map(o => o.id === t.id ? t : o))}
          onUpdateEmployee={u => setTeam(p => p.map(e => e.id === u.id ? u : e))}
          onAddEmployee={e => setTeam(p => [...p, { ...e, id: `e-${Date.now()}`, usedDays: 0, pendingDays: 0, notificationSettings: DEFAULT_NOTIFICATION_SETTINGS }])}
          onRemoveEmployee={id => setTeam(p => p.filter(e => e.id !== id))}
          onDeleteRequest={id => setRequests(p => p.filter(r => r.id !== id))}
          onEditRequest={r => setRequests(p => p.map(o => o.id === r.id ? r : o))}
          onAddTeam={n => setTeams(p => [...p, { id: `t-${Date.now()}`, name: n }])}
          onUpdateTeam={t => setTeams(p => p.map(o => o.id === t.id ? t : o))}
          onRemoveTeam={id => setTeams(p => p.filter(t => t.id !== id))}
          onExportData={() => {}} 
          onImportData={() => {}}
          onInitCloud={handleInitCloud}
          onPushCloud={() => pushToCloud({ team, teams, requests, publicHolidays, leaveTypes, balanceHistory, notifications })}
          cloudVaultId={cloudVaultId}
          isCloudSyncing={isCloudSyncing}
        />
      )}

      {view === 'org-chart' && <OrgChart employees={team} teams={teams} requests={requests} leaveTypes={leaveTypes} />}

      {isRequestModalOpen && (
        <RequestModal 
          leaveTypes={leaveTypes}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleCreateRequest}
          publicHolidays={publicHolidays}
        />
      )}

      <GeminiChat stats={stats} requests={requests} leaveTypes={leaveTypes} />
    </Layout>
  );
}

interface RequestModalProps {
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (data: Omit<VacationRequest, 'id' | 'status' | 'submittedAt' | 'employeeName'>) => void;
  publicHolidays: PublicHoliday[];
}

const RequestModal: React.FC<RequestModalProps> = ({ leaveTypes, onClose, onSubmit, publicHolidays }) => {
  const categories = (leaveTypes && leaveTypes.length > 0) ? leaveTypes : DEFAULT_LEAVE_TYPES;
  const [typeId, setTypeId] = useState(categories[0]?.id || '');
  const todayStr = new Date().toISOString().split('T')[0];
  const [start, setStart] = useState(todayStr);
  const [end, setEnd] = useState(todayStr);
  const [reason, setReason] = useState('');

  const calculateDays = () => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (d2 < d1) return 0;
    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const day = cur.getDay();
      const isWeekend = day === 5 || day === 6;
      const dateString = cur.toISOString().split('T')[0];
      const isHoliday = publicHolidays.some(h => h.date === dateString);
      if (!isWeekend && !isHoliday) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const handleStartChange = (val: string) => {
    setStart(val);
    if (end && new Date(val) > new Date(end)) setEnd(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays();
    if (days <= 0 && start && end) {
      alert("Invalid Selection: Please choose a range containing at least one working business day.");
      return;
    }
    onSubmit({ typeId, startDate: start, endDate: end, reason, days });
  };

  const triggerPicker = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input');
    if (input && 'showPicker' in input) {
      try {
        (input as any).showPicker();
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
          <div className="text-left">
            <h2 className="text-3xl font-black tracking-tighter uppercase">Request Portal</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">Absence Governance • Egypt Hub</p>
          </div>
          <button onClick={onClose} className="p-3 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 text-left">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-2">1. Select Request Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeId(t.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${typeId === t.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-50' : 'border-slate-100 hover:border-blue-100 bg-slate-50/50'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${typeId === t.id ? 'text-blue-600' : 'text-slate-400'}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">2. Start Date</label>
              <div className="relative group cursor-pointer" onClick={triggerPicker}>
                <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-6 text-lg font-bold text-slate-900 transition-all shadow-inner flex items-center group-hover:border-blue-200 pointer-events-none">
                  <span className="flex-1">{start || 'Select Date'}</span>
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5"/></svg>
                </div>
                <input type="date" required value={start} onChange={e => handleStartChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">3. End Date</label>
              <div className="relative group cursor-pointer" onClick={triggerPicker}>
                <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-6 text-lg font-bold text-slate-900 transition-all shadow-inner flex items-center group-hover:border-blue-200 pointer-events-none">
                  <span className="flex-1">{end || 'Select Date'}</span>
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5"/></svg>
                </div>
                <input type="date" required value={end} min={start} onChange={e => setEnd(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">4. Remarks / Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-6 text-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all h-24 resize-none shadow-inner" placeholder="Optional details..."></textarea>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
             <div className="text-left relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">Impact to Allowance</p>
               <p className="text-4xl font-black">{calculateDays()} Days</p>
               <p className="text-[9px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Excl. Fri/Sat & Egyptian Public Holidays</p>
             </div>
             <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-lg relative z-10">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
             </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-base tracking-[0.4em] shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-blue-200">
            Send Approval Request
          </button>
        </form>
      </div>
    </div>
  );
};