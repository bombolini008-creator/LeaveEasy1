
import React from 'react';
import { Employee, Team, VacationRequest, LeaveType } from '../types';

interface OrgChartProps {
  employees: Employee[];
  teams: Team[];
  requests: VacationRequest[];
  leaveTypes: LeaveType[];
}

export const OrgChart: React.FC<OrgChartProps> = ({ employees, teams, requests, leaveTypes }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEmployeeCurrentStatus = (emp: Employee) => {
    const activeRequest = requests.find(r => {
      if (r.status !== 'approved') return false;
      if (r.employeeName.toLowerCase().trim() !== emp.name.toLowerCase().trim()) return false;
      
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      return today >= start && today <= end;
    });

    if (!activeRequest) return { label: 'In Office', color: 'bg-emerald-500', icon: '🏢' };

    const type = leaveTypes.find(t => t.id === activeRequest.typeId);
    const typeName = type?.name.toLowerCase() || '';

    if (typeName.includes('home') || type?.id === 'lt5') {
      return { label: 'WFH', color: 'bg-blue-500', icon: '🏠' };
    }
    if (typeName.includes('sick') || type?.id === 'lt2') {
      return { label: 'Sick', color: 'bg-amber-500', icon: '🤒' };
    }
    
    return { label: 'Absent', color: 'bg-rose-500', icon: '🏖️' };
  };

  const topLevelManagers = employees.filter(emp => 
    !emp.managerId || !employees.find(e => e.id === emp.managerId)
  );

  const renderVerticalNode = (emp: Employee, depth: number = 0) => {
    const directReports = employees.filter(e => e.managerId === emp.id);
    const team = teams.find(t => t.id === emp.teamId);
    const isManager = directReports.length > 0;
    const status = getEmployeeCurrentStatus(emp);
    
    // Clean phone number for WhatsApp wa.me link
    const waNumber = emp.phone ? emp.phone.replace(/\D/g, '') : '';
    
    return (
      <div key={emp.id} className="flex flex-col ml-4 md:ml-10 relative">
        {/* Connection Linkages */}
        {depth > 0 && (
          <div className="absolute -left-6 md:-left-8 top-0 bottom-0 w-px bg-slate-200">
             <div className="absolute top-6 left-0 w-4 md:w-8 h-px bg-slate-200"></div>
          </div>
        )}

        <div className="flex items-start gap-3 py-2.5 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border flex-shrink-0 transition-all ${emp.isAdmin ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-slate-50 text-blue-600 border-slate-200 group-hover:bg-blue-50'}`}>
            {emp.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
               <p className="font-black text-slate-900 text-xs tracking-tight truncate">{emp.name}</p>
               {emp.isTeamLead && <span className="bg-amber-50 text-amber-600 text-[7px] px-1.5 py-0.5 rounded font-black uppercase border border-amber-100">Lead</span>}
               
               {/* Attendance Status Badge */}
               <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black text-white uppercase tracking-tighter shadow-sm animate-in fade-in slide-in-from-left-2 ${status.color}`}>
                  {status.icon} {status.label}
               </span>
            </div>
            
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{emp.role}</p>
            {team && <p className="text-[8px] text-blue-500 font-black uppercase mt-1 tracking-tighter">Dept: {team.name}</p>}
            
            {/* Communication Actions - Only show if phone number exists */}
            {emp.phone && (
              <div className="flex items-center gap-2 mt-2">
                <a 
                  href={`tel:${emp.phone}`}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[8px] font-black text-slate-600 uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all"
                  title={`Call ${emp.name}`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Call
                </a>
                <a 
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[8px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                  title={`WhatsApp ${emp.name}`}
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {isManager && (
          <div className="flex flex-col">
            {directReports.map(report => renderVerticalNode(report, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 px-4">
      <header className="mb-10 border-b border-slate-100 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Organization Chart</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enterprise Hierarchical Tree • Real-time Status</p>
        </div>
        <div className="flex gap-4">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
             Vertical Optimized
          </div>
        </div>
      </header>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Office
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> WFH
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sick
         </div>
      </div>
      
      <div className="space-y-4">
        {topLevelManagers.map(manager => (
           <div key={manager.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 mb-6">
              {renderVerticalNode(manager)}
           </div>
        ))}
      </div>
    </div>
  );
};
