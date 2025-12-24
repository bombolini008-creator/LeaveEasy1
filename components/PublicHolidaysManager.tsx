
import React, { useState, useMemo } from 'react';
import { PublicHoliday } from '../types';
import { syncEgyptianHolidays } from '../services/holidayService';

interface PublicHolidaysManagerProps {
  holidays: PublicHoliday[];
  onAddHoliday: (holiday: Omit<PublicHoliday, 'id'>) => void;
  onUpdateHoliday: (holiday: PublicHoliday) => void;
  onRemoveHoliday: (id: string) => void;
  onSyncHolidays: (holidays: PublicHoliday[], year: number) => void;
}

export const PublicHolidaysManager: React.FC<PublicHolidaysManagerProps> = ({ 
  holidays, 
  onAddHoliday, 
  onUpdateHoliday,
  onRemoveHoliday,
  onSyncHolidays
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isDeductible, setIsDeductible] = useState(false);
  const [syncYear, setSyncYear] = useState<number>(new Date().getFullYear());
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && date) {
      if (editingHolidayId) {
        onUpdateHoliday({ id: editingHolidayId, name, date, isDeductible });
        setEditingHolidayId(null);
      } else {
        onAddHoliday({ name, date, isDeductible });
      }
      setName('');
      setDate('');
      setIsDeductible(false);
    }
  };

  const handleEditClick = (holiday: PublicHoliday) => {
    setEditingHolidayId(holiday.id);
    setName(holiday.name);
    setDate(holiday.date);
    setIsDeductible(!!holiday.isDeductible);
    setViewMode('list');
    const formElement = document.getElementById('holiday-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
    setEditingHolidayId(null);
    setName('');
    setDate('');
    setIsDeductible(false);
  };

  const handleSync = async () => {
    if (!syncYear || syncYear < 2000 || syncYear > 2100) {
      alert("Please enter a valid year between 2000 and 2100");
      return;
    }
    
    setIsSyncing(true);
    try {
      const synced = await syncEgyptianHolidays(syncYear) as PublicHoliday[];
      const toProcess: PublicHoliday[] = [];
      
      for (const h of synced) {
        const existing = holidays.find(eh => eh.name === h.name && eh.date === h.date);
        if (existing) {
          if (window.confirm(`Holiday "${h.name}" on ${h.date} already exists. Do you want to update/re-sync it? (Cancel to skip)`)) {
            toProcess.push({ ...h, id: existing.id });
          }
        } else {
          toProcess.push(h);
        }
      }
      
      if (toProcess.length > 0) {
        onSyncHolidays(toProcess, syncYear);
      } else {
        alert("No new holidays to add or update.");
      }
    } catch (err) {
      alert("Error syncing holidays: " + (err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const sortedHolidays = [...holidays].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderYearlyCalendar = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const holidayMap = new Map<string, PublicHoliday>(holidays.map(h => [h.date, h]));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 animate-in fade-in slide-in-from-bottom-2">
        {months.map(m => {
          const firstDay = new Date(syncYear, m, 1).getDay();
          const daysCount = new Date(syncYear, m + 1, 0).getDate();
          const monthName = new Date(syncYear, m, 1).toLocaleString('default', { month: 'long' });

          return (
            <div key={m} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-3 border-b border-slate-200 pb-1 uppercase tracking-widest">{monthName}</h3>
              <div className="grid grid-cols-7 gap-1 text-[9px] font-bold text-slate-400 mb-2 text-center uppercase tracking-tighter">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span className="text-blue-600">F</span><span className="text-blue-600">S</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`p-${i}`} />)}
                {Array.from({ length: daysCount }).map((_, i) => {
                  const day = i + 1;
                  const dObj = new Date(syncYear, m, day);
                  const dStr = dObj.toISOString().split('T')[0];
                  const h = holidayMap.get(dStr);
                  const isWeekend = dObj.getDay() === 5 || dObj.getDay() === 6;

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (h) {
                          handleEditClick(h);
                        } else {
                          setName('');
                          setDate(dStr);
                          setViewMode('list');
                        }
                      }}
                      title={h ? `${h.name} (${h.isDeductible ? 'Deductible' : 'Standard'})` : dStr}
                      className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all relative group
                        ${h 
                          ? h.isDeductible 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm shadow-amber-50' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm shadow-blue-50' 
                          : isWeekend 
                            ? 'text-slate-300 hover:bg-slate-100' 
                            : 'text-slate-600 hover:bg-white hover:shadow-sm hover:border-slate-200 border border-transparent'
                        }
                      `}
                    >
                      {day}
                      {h && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white border border-current" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            Egyptian Holiday Governance
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">{syncYear}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Define non-working days and decide if they impact personal balances.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <nav className="bg-white p-1 rounded-xl flex border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
                title="Yearly View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
           </nav>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <input 
              type="number" 
              value={syncYear}
              onChange={(e) => setSyncYear(parseInt(e.target.value) || 0)}
              className="bg-slate-50 rounded-lg px-2 py-1.5 text-xs font-black text-blue-600 w-16 outline-none text-center"
              min="2000"
              max="2100"
            />
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSyncing ? 'Syncing...' : 'Auto-Sync'}
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'calendar' ? (
        renderYearlyCalendar()
      ) : (
        <div className="p-6" id="holiday-form">
          {editingHolidayId && (
            <div className="mb-4 flex items-center bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl animate-in slide-in-from-top-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mr-2">Editing</span>
              <span className="text-xs font-bold text-slate-700 flex-1">"{holidays.find(h => h.id === editingHolidayId)?.name}"</span>
              <button onClick={handleCancelEdit} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-tighter">Discard</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-[2] space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Revolution Day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occurrence Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex items-center space-x-3 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => setIsDeductible(!isDeductible)}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isDeductible ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isDeductible && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter leading-none">Deduct from balance?</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{isDeductible ? 'Counts as Used' : 'Standard Holiday'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-[0.98] ${editingHolidayId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white'}`}
              >
                {editingHolidayId ? 'Commit Change' : 'Register Holiday'}
              </button>
              {editingHolidayId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 bg-slate-200 text-slate-600 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-300 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedHolidays.length > 0 ? (
              sortedHolidays.map((holiday) => (
                <div key={holiday.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-all group ${editingHolidayId === holiday.id ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-50' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md shadow-sm'}`}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-110 ${holiday.isDeductible ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-black text-slate-900 leading-tight">{holiday.name}</p>
                         {holiday.isDeductible && <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase border border-amber-200">Deductible</span>}
                      </div>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{new Date(holiday.date).toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(holiday)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Edit holiday"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button
                      onClick={() => onRemoveHoliday(holiday.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Remove holiday"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/20">
                <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5"/></svg>
                <p className="text-sm italic font-medium">Repository empty. No holidays registered.</p>
                <button onClick={handleSync} className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">Bulk Initialize via API</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
