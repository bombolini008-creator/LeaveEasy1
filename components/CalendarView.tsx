
import React, { useState } from 'react';
import { VacationRequest, LeaveType } from '../types';

interface CalendarViewProps {
  requests: VacationRequest[];
  leaveTypes: LeaveType[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ requests, leaveTypes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const startingDay = firstDayOfMonth(year, month);

  const getDayRequests = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);

    return requests.filter(req => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  const getReqColor = (req: VacationRequest) => {
    const type = leaveTypes.find(t => t.id === req.typeId);
    const isWFH = type?.id === 'lt5' || type?.name.toLowerCase().includes('home');
    
    if (req.status === 'rejected') return 'bg-red-400 text-white';
    if (req.status === 'pending' || req.status === 'hr_pending') return 'bg-amber-400 text-white';
    
    // Approved
    if (isWFH) return 'bg-blue-500 text-white'; // Distinct color for WFH
    return 'bg-emerald-500 text-white'; // Standard vacation
  };

  const calendarDays = [];
  // Padding for start of month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-slate-50/50 border-r border-b border-slate-100"></div>);
  }

  // Actual days
  for (let day = 1; day <= daysCount; day++) {
    const dayReqs = getDayRequests(day);
    const dateObj = new Date(year, month, day);
    const isToday = new Date().toDateString() === dateObj.toDateString();
    // Egyptian Weekend: Friday (5) and Saturday (6)
    const isWeekend = dateObj.getDay() === 5 || dateObj.getDay() === 6;

    calendarDays.push(
      <div 
        key={day} 
        className={`h-24 md:h-32 p-2 border-r border-b border-slate-100 flex flex-col group relative transition-colors ${
          isToday ? 'bg-blue-50/40' : 
          isWeekend ? 'bg-slate-50/50' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className={`text-sm font-semibold mb-1 ${
            isToday ? 'text-blue-600 bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full' : 
            isWeekend ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {day}
          </div>
          {isWeekend && (
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Weekend</span>
          )}
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-hide mt-1">
          {dayReqs.map(req => (
            <div 
              key={req.id} 
              className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-md truncate font-medium shadow-sm transition-transform hover:scale-[1.02] cursor-default
                ${getReqColor(req)}`}
              title={`${req.employeeName}: ${req.reason}`}
            >
              {req.status === 'pending' ? '⏳' : ''} {req.reason.substring(0, 15)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-slate-900 min-w-[150px]">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={goToToday} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-white rounded-lg transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-medium text-slate-500">
          <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div> Approved</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> WFH</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div> Pending</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div> Rejected</div>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div 
            key={d} 
            className={`py-2 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest ${
              d === 'Fri' || d === 'Sat' ? 'text-blue-600/60' : 'text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-slate-100 border-l border-t border-slate-100">
        {calendarDays}
      </div>
    </div>
  );
};
