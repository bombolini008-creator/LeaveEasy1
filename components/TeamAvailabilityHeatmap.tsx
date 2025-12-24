import React, { useState, useMemo } from 'react';
import { VacationRequest, Employee, PublicHoliday, LeaveType } from '../types';

interface TeamAvailabilityHeatmapProps {
  requests: VacationRequest[];
  team: Employee[];
  publicHolidays: PublicHoliday[];
  leaveTypes: LeaveType[];
}

export const TeamAvailabilityHeatmap: React.FC<TeamAvailabilityHeatmapProps> = ({
  requests,
  team,
  publicHolidays,
  leaveTypes
}) => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  });
  
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.getFullYear() + '-' + 
           String(d.getMonth() + 1).padStart(2, '0') + '-' + 
           String(d.getDate()).padStart(2, '0');
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  });
  
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const limit = Math.min(diffDays, 120); 
    const current = new Date(start);
    for (let i = 0; i <= limit; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;
    const holiday = publicHolidays.find(h => h.date === dateStr);
    
    const offDetails = requests.filter(r => {
      if (r.status !== 'approved') return false;
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      return targetDate >= start && targetDate <= end;
    }).map(r => {
      const type = leaveTypes.find(t => t.id === r.typeId);
      let label = 'Absent';
      const typeName = type?.name.toLowerCase() || '';
      if (typeName.includes('home') || type?.id === 'lt5') label = 'WFH';
      else if (typeName.includes('sick') || type?.id === 'lt2') label = 'Sick';
      return {
        name: r.employeeName,
        status: label,
        icon: type?.icon || '🏖️',
        reason: r.reason
      };
    });

    return {
      date,
      dateStr,
      isWeekend,
      holiday,
      offDetails,
      count: offDetails.length
    };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Day', 'Holiday', ...team.map(emp => emp.name)];
    const rows = dateRange.map(date => {
      const data = getDayData(date);
      const empStatuses = team.map(emp => {
        const leave = data.offDetails.find(d => d.name === emp.name);
        if (data.isWeekend) return 'Weekend';
        if (data.holiday) return `Holiday (${data.holiday.name})`;
        return leave ? leave.status : 'Working';
      });
      return [data.dateStr, date.toLocaleDateString('en-US', { weekday: 'short' }), data.holiday ? data.holiday.name : '', ...empStatuses];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Amadeus_Capacity_Report_${startDate}_${endDate}.csv`;
    link.click();
  };

  const getStatusColor = (count: number, isWeekend: boolean, isHoliday: boolean, isSelected: boolean) => {
    if (isSelected) return 'bg-blue-600 border-blue-700 text-white shadow-lg ring-2 ring-blue-100 scale-105 z-10';
    if (isHoliday || isWeekend) return 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
    const teamSize = team.length || 1;
    const offPercentage = (count / teamSize) * 100;
    if (count === 0) return 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100';
    if (offPercentage <= 30) return 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100';
    return 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100';
  };

  const currentInsightDate = hoveredDate || selectedDate || startDate;
  const insightData = getDayData(new Date(currentInsightDate));

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-0.5 text-left">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Capacity Planner</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Attendance Status • Egypt Hub</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <div onClick={triggerPicker} className="px-4 py-1.5 min-w-[140px] flex flex-col justify-center cursor-pointer hover:bg-white rounded-lg transition-all group relative">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 text-left">Start</span>
              <span className="text-xs font-black text-slate-800">{formatDateLabel(startDate)}</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none" />
            </div>
            <div className="w-px h-6 bg-slate-300/50 mx-1 self-center"></div>
            <div onClick={triggerPicker} className="px-4 py-1.5 min-w-[140px] flex flex-col justify-center cursor-pointer hover:bg-white rounded-lg transition-all group relative">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 text-left">End</span>
              <span className="text-xs font-black text-slate-800">{formatDateLabel(endDate)}</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none" />
            </div>
          </div>
          
          <button onClick={exportToCSV} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase tracking-widest">Daily Capacity Heatmap</h3>
            <div className="flex gap-2 text-[8px] font-black uppercase tracking-tighter text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Optimal</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Warning</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Critical</span>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <div className="flex space-x-2 min-w-max px-1">
              {dateRange.map((date, i) => {
                const dStr = date.toISOString().split('T')[0];
                const data = getDayData(date);
                const isSelected = selectedDate === dStr;
                const isHovered = hoveredDate === dStr;
                return (
                  <button 
                    key={i}
                    onMouseEnter={() => setHoveredDate(dStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => setSelectedDate(dStr)}
                    className={`w-12 h-16 rounded-xl border flex flex-col items-center justify-center transition-all relative shrink-0 ${getStatusColor(data.count, data.isWeekend, !!data.holiday, isSelected || isHovered)}`}
                  >
                    <span className={`text-[7px] font-black uppercase mb-0.5 ${isSelected || isHovered ? 'text-blue-50' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-base font-black leading-none">{date.getDate()}</span>
                    {!isSelected && !isHovered && (
                      <div className="mt-1 flex flex-col items-center gap-0.5">
                        {data.holiday && <span className="text-[8px]">🏛️</span>}
                        {data.count > 0 && !data.isWeekend && <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>}
                        {data.isWeekend && <span className="text-[5px] opacity-40 uppercase font-black">Off</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:w-[260px] w-full flex-shrink-0 self-stretch">
          <div className="bg-slate-900 rounded-[2rem] p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col border border-white/10">
             <header className="mb-3 text-left">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Brief</p>
                <div className="flex items-start justify-between">
                   <div className="min-w-0">
                      <h3 className="text-base font-black tracking-tighter text-white truncate">
                         {new Date(currentInsightDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">{insightData.isWeekend ? 'Rest Day' : 'Working'}</p>
                   </div>
                   <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base shadow-inner border border-white/5 backdrop-blur-md shrink-0">
                      {insightData.holiday ? '🏛️' : insightData.isWeekend ? '🌙' : '👨‍💻'}
                   </div>
                </div>
             </header>
             <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
               {insightData.isWeekend ? (
                 <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                    <p className="text-[9px] text-slate-400 italic font-medium">Operations suspended for weekend rest period.</p>
                 </div>
               ) : (
                 <div className="space-y-1.5">
                   {insightData.holiday && (
                     <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/10 flex items-center gap-2">
                        <div className="text-base">🏛️</div>
                        <p className="text-[9px] font-black text-white truncate">{insightData.holiday.name}</p>
                     </div>
                   )}
                   {insightData.offDetails.length > 0 ? insightData.offDetails.map((staff, idx) => (
                     <div key={idx} className="bg-white/5 border border-white/10 p-2 rounded-xl flex justify-between items-center text-left">
                        <div className="flex items-center gap-2 min-w-0">
                           <div className="w-6 h-6 rounded bg-slate-800 border border-white/5 flex items-center justify-center text-xs">{staff.icon}</div>
                           <div className="min-w-0">
                              <p className="font-bold text-white text-[10px] truncate leading-none mb-0.5">{staff.name}</p>
                              <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">{staff.status}</p>
                           </div>
                        </div>
                     </div>
                   )) : (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                        <p className="text-[9px] font-black text-emerald-400 uppercase">Full Capacity</p>
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};