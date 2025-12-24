import React, { useState, useMemo } from 'react';
import { VacationRequest, Employee, PublicHoliday, LeaveType, Team } from '../types';
import { PublicHolidaysManager } from './PublicHolidaysManager';
import { TeamAvailabilityHeatmap } from './TeamAvailabilityHeatmap';

interface ManagerDashboardProps {
  mode: 'manager' | 'admin';
  currentUser: Employee;
  requests: VacationRequest[];
  team: Employee[];
  teams: Team[];
  publicHolidays: PublicHoliday[];
  leaveTypes: LeaveType[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', note?: string) => void;
  onAddHoliday: (holiday: Omit<PublicHoliday, 'id'>) => void;
  onUpdateHoliday: (holiday: PublicHoliday) => void;
  onRemoveHoliday: (id: string) => void;
  onSyncHolidays: (holidays: PublicHoliday[], year: number) => void;
  onAddLeaveType: (type: Omit<LeaveType, 'id'>) => void;
  onRemoveLeaveType: (id: string) => void;
  onUpdateLeaveType: (type: LeaveType) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onAddEmployee: (emp: Omit<Employee, 'id' | 'usedDays' | 'pendingDays'>) => void;
  onRemoveEmployee: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onEditRequest: (req: VacationRequest) => void;
  onAddTeam: (name: string) => void;
  onUpdateTeam: (team: Team) => void;
  onRemoveTeam: (id: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onInitCloud: () => void;
  onPushCloud: () => void;
  cloudVaultId: string | null;
  isCloudSyncing: boolean;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  mode,
  currentUser,
  requests,
  team,
  teams,
  publicHolidays,
  leaveTypes,
  onUpdateStatus,
  onAddHoliday,
  onUpdateHoliday,
  onRemoveHoliday,
  onSyncHolidays,
  onAddLeaveType,
  onRemoveLeaveType,
  onUpdateLeaveType,
  onUpdateEmployee,
  onAddEmployee,
  onRemoveEmployee,
  onDeleteRequest,
  onEditRequest,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
  onInitCloud,
  onPushCloud,
  cloudVaultId,
  isCloudSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'personnel' | 'governance'>('review');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState({
    name: '', username: '', password: '', role: '', email: '', phone: '',
    totalAllowance: 30, managerId: '', teamId: '', isAdmin: false, isTeamLead: false
  });

  const myReports = useMemo(() => {
    if (mode === 'admin') return team;
    return team.filter(emp => emp.managerId === currentUser.id);
  }, [mode, team, currentUser.id]);

  const visibleRequests = useMemo(() => {
    if (mode === 'admin') return requests;
    const reportNames = new Set(myReports.map(e => e.name));
    return requests.filter(r => reportNames.has(r.employeeName));
  }, [mode, requests, myReports]);

  const managerPending = useMemo(() => 
    visibleRequests.filter(r => r.status === 'pending' || r.status === 'hr_pending')
  , [visibleRequests]);

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const calculateRemainingDays = (emp: Employee) => {
    const approved = requests.filter(r => r.employeeName === emp.name && r.status === 'approved' && leaveTypes.find(l => l.id === r.typeId)?.isDeductible)
      .reduce((sum, r) => sum + r.days, 0);
    return emp.totalAllowance - approved;
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEmpForm({
      name: emp.name, username: emp.username, password: emp.password || 'amadeus2024',
      role: emp.role, email: emp.email, phone: emp.phone || '',
      totalAllowance: emp.totalAllowance, managerId: emp.managerId || '',
      teamId: emp.teamId || '', isAdmin: !!emp.isAdmin, isTeamLead: !!emp.isTeamLead
    });
    setIsEmployeeModalOpen(true);
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...empForm, managerId: empForm.managerId || undefined, teamId: empForm.teamId || undefined };
    if (editingEmployeeId) onUpdateEmployee({ ...data, id: editingEmployeeId, usedDays: 0, pendingDays: 0 });
    else onAddEmployee(data as any);
    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${mode === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {mode === 'admin' ? 'Master Admin' : 'Reporting Manager'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight text-blue-950">
              {mode === 'admin' ? 'Corporate Governance Center' : `Team Hub: ${currentUser.name}`}
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-xs">Internal Management Portal</p>
        </div>
        
        {mode === 'admin' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setActiveTab('review')} 
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'review' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
            >
              Review
            </button>
            <button 
              onClick={() => setActiveTab('personnel')} 
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'personnel' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
            >
              Personnel
            </button>
            <button 
              onClick={() => setActiveTab('governance')} 
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'governance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
            >
              Governance
            </button>
          </div>
        )}
      </header>

      {activeTab === 'review' && (
        <section className="animate-in slide-in-from-bottom-2 duration-300 space-y-6">
           <TeamAvailabilityHeatmap requests={visibleRequests} team={myReports} publicHolidays={publicHolidays} leaveTypes={leaveTypes} />
           
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-lg font-black text-slate-900 tracking-tight text-blue-950">Active Approval Queue</h2>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{managerPending.length} Actions Required</span>
             </div>
             <div className="divide-y divide-slate-50">
               {managerPending.length > 0 ? managerPending.map(req => (
                 <div key={req.id} id={`request-${req.id}`} className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">{req.employeeName[0]}</div><div><p className="font-bold text-slate-900">{req.employeeName}</p><p className="text-xs text-slate-500">{req.days} days — {req.startDate} to {req.endDate}</p></div></div>
                    <div className="flex gap-3"><button onClick={() => onUpdateStatus(req.id, 'approved')} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100">Approve</button><button onClick={() => onUpdateStatus(req.id, 'rejected')} className="bg-white border-2 border-rose-100 text-rose-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Reject</button></div>
                 </div>
               )) : <div className="p-24 text-center text-slate-400 font-medium italic">All pending tasks are currently resolved.</div>}
             </div>
           </div>
        </section>
      )}

      {activeTab === 'personnel' && mode === 'admin' && (
        <section className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <input type="text" placeholder="Search team members..." value={personnelSearch} onChange={e => setPersonnelSearch(e.target.value)} className="w-full md:w-96 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-100" />
             <button onClick={() => { setEditingEmployeeId(null); setEmpForm({ name: '', username: '', password: 'amadeus2024', role: '', email: '', phone: '', totalAllowance: 30, managerId: '', teamId: '', isAdmin: false, isTeamLead: false }); setIsEmployeeModalOpen(true); }} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Add Employee</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.filter(e => e.name.toLowerCase().includes(personnelSearch.toLowerCase())).map(emp => {
              const dept = teams.find(t => t.id === emp.teamId);
              const reportsTo = team.find(e => e.id === emp.managerId);
              return (
                <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">{emp.name[0]}</div>
                    <div className="flex gap-1">
                      {emp.isAdmin && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase">Admin</span>}
                      {emp.isTeamLead && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase">Lead</span>}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight">{emp.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-4">{emp.role}</p>
                  <div className="space-y-1 mb-6 text-[10px] font-medium text-slate-500">
                    {dept && <p className="text-blue-600 font-bold uppercase tracking-tighter">Dept: {dept.name}</p>}
                    {reportsTo && <p className="text-emerald-600 font-bold uppercase tracking-tighter">Reports to: {reportsTo.name}</p>}
                    {emp.phone && <p>Mobile: {emp.phone}</p>}
                    <p>Email: {emp.email}</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Days Remaining</p>
                       <p className="text-xl font-black text-blue-600">{calculateRemainingDays(emp)} <span className="text-[10px] text-slate-400">/ {emp.totalAllowance}d</span></p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEditEmployee(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
                       <button onClick={() => onRemoveEmployee(emp.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><TrashIcon /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {mode === 'admin' && activeTab === 'governance' && (
        <section className="space-y-8 animate-in slide-in-from-bottom-2">
          <PublicHolidaysManager holidays={publicHolidays} onAddHoliday={onAddHoliday} onUpdateHoliday={onUpdateHoliday} onRemoveHoliday={onRemoveHoliday} onSyncHolidays={onSyncHolidays} />
          
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
             <h2 className="text-lg font-black text-slate-900 mb-6">Business Units (Teams)</h2>
             <form onSubmit={(e) => { e.preventDefault(); if(newTeamName) { onAddTeam(newTeamName); setNewTeamName(''); } }} className="flex gap-4 mb-8">
                <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="New Department Name..." />
                <button type="submit" className="bg-blue-600 text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Create Unit</button>
             </form>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               {teams.map(t => (
                 <div key={t.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-700">{t.name}</span>
                    <button onClick={() => onRemoveTeam(t.id)} className="text-rose-300 hover:text-rose-600 transition-colors"><TrashIcon /></button>
                 </div>
               ))}
             </div>
          </div>
        </section>
      )}

      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">{editingEmployeeId ? 'Edit Profile' : 'New Employee Entry'}</h2>
                <button onClick={() => setIsEmployeeModalOpen(false)} className="text-slate-400 hover:text-rose-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
             </div>
             <form onSubmit={handleEmpSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input required value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label><input required value={empForm.username} onChange={e => setEmpForm({...empForm, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Password</label><input required type="text" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-xl px-4 py-3 text-sm font-black text-blue-700 outline-none shadow-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label><input required type="email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" /></div>
                
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Direct Manager (Reporting To)</label>
                   <select 
                      value={empForm.managerId} 
                      onChange={e => setEmpForm({...empForm, managerId: e.target.value})} 
                      className="w-full bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-black text-blue-700 outline-none shadow-sm"
                   >
                      <option value="">None (Top Level)</option>
                      {team.filter(e => e.id !== editingEmployeeId).map(e => (
                        <option key={e.id} value={e.id}>{e.name} • {e.role}</option>
                      ))}
                   </select>
                   <p className="text-[8px] text-slate-400 uppercase font-bold mt-1 px-1">Links to Organization Chart hierarchy</p>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Annual Allowance (Days)</label>
                   <input 
                      required 
                      type="number" 
                      value={empForm.totalAllowance} 
                      onChange={e => setEmpForm({...empForm, totalAllowance: parseInt(e.target.value) || 0})} 
                      className="w-full bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-black text-blue-700 outline-none shadow-sm" 
                   />
                </div>

                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label><select value={empForm.teamId} onChange={e => setEmpForm({...empForm, teamId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label><input value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" /></div>
                
                <div className="md:col-span-2 pt-6"><button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all">Save Profile Updates</button></div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};