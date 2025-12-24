import React, { useMemo } from 'react';
import { BalanceChange, VacationRequest, LeaveType } from '../types';

interface BalanceHistoryProps {
  history: BalanceChange[];
  requests: VacationRequest[];
  leaveTypes: LeaveType[];
}

export const BalanceHistory: React.FC<BalanceHistoryProps> = ({ history, requests, leaveTypes }) => {
  // Unify history and requests into a single ledger for the current year
  const ledger = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    const adjustmentItems = history.map(item => ({
      id: item.id,
      date: item.date,
      description: item.description,
      type: item.type as 'accrual' | 'deduction' | 'adjustment' | 'request',
      amount: item.amount,
      status: 'completed' as const,
      isDeductible: true
    }));

    const requestItems = requests.map(req => {
      const type = leaveTypes.find(t => t.id === req.typeId);
      return {
        id: req.id,
        date: req.submittedAt || req.startDate,
        description: `${type?.name || 'Leave'}: ${req.startDate} to ${req.endDate}`,
        type: 'request' as const,
        amount: -req.days,
        status: req.status,
        isDeductible: type?.isDeductible ?? true,
        days: req.days,
        categoryIcon: type?.icon || '📅'
      };
    });

    const combined = [...adjustmentItems, ...requestItems];
    
    // Sort by date descending
    return combined
      .filter(item => new Date(item.date).getFullYear() === currentYear)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, requests, leaveTypes]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">Posted</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">Approved</span>;
      case 'pending':
      case 'hr_pending':
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200 shadow-sm animate-pulse">Pending</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-200 shadow-sm">Rejected</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string, categoryIcon?: string) => {
    if (type === 'request') return <span className="text-xl">{categoryIcon || '📅'}</span>;
    if (type === 'accrual') return <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg></div>;
    return <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg></div>;
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Balance Transaction Ledger</h2>
        </div>
        <div className="flex gap-2">
           <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Year Events</p>
              <p className="text-lg font-black text-blue-600 leading-none">{ledger.length}</p>
           </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Date</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ledger.map((item) => (
              <tr key={item.id} className={`hover:bg-slate-50/80 transition-all ${item.status === 'rejected' ? 'opacity-60' : ''}`}>
                <td className="px-10 py-8 whitespace-nowrap">
                  <p className="text-sm font-bold text-slate-900">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Registered UTC</p>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    {(item as any).categoryIcon ? (
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                        {(item as any).categoryIcon}
                      </div>
                    ) : (
                      getTypeIcon(item.type)
                    )}
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">
                        {item.description}
                        {item.type === 'request' && !item.isDeductible && (
                           <span className="ml-2 text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase">Non-Deductible</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Category: {item.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className={`px-10 py-8 whitespace-nowrap text-right`}>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-black ${
                      item.status === 'rejected' ? 'text-slate-300 line-through' :
                      item.amount > 0 ? 'text-emerald-600' : 
                      item.status === 'pending' || item.status === 'hr_pending' ? 'text-amber-500' : 'text-slate-900'
                    }`}>
                      {item.amount > 0 ? `+${item.amount}` : item.amount} Days
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Balance Delta</span>
                  </div>
                </td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={4} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-3xl">🗄️</div>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Fiscal Ledger Empty</p>
                    <p className="text-slate-400 text-[10px] font-medium italic">No transactions recorded for the current year cycle.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-10 bg-slate-50/50 border-t border-slate-100">
         <div className="flex flex-wrap items-center justify-center gap-10">
            <div className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Positive Adjustment</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Liability</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm"></span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmed Deduction</span>
            </div>
         </div>
      </div>
    </div>
  );
};