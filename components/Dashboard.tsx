import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserStats } from '../types';

interface DashboardProps {
  stats: UserStats;
  onOpenRequest?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onOpenRequest }) => {
  const currentYear = new Date().getFullYear();
  const data = [
    { name: 'Used', value: stats.used, color: '#2563eb' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Remaining', value: Math.max(0, stats.total - stats.used - stats.pending), color: '#e2e8f0' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Allowance</h1>
            <p className="text-slate-500 font-medium">Fiscal Year {currentYear} • Egypt Hub</p>
         </div>
         {onOpenRequest && (
            <button 
              onClick={onOpenRequest}
              className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              Request
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="region" aria-label="Statistics Summary">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Annual Entitlement</h3>
          <p className="text-3xl font-black text-slate-900" aria-label={`${stats.total} days total allowance`}>{stats.total} Days</p>
          <div className="mt-4 flex items-center text-[10px] text-blue-600 font-black uppercase tracking-widest" aria-hidden="true">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Egypt Hub Accrual Policy
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">Available Balance</h3>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-tighter">Real-time</span>
          </div>
          <p className="text-3xl font-black text-blue-600" aria-label={`${stats.total - stats.used} days remaining`}>{stats.total - stats.used} Days</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2" aria-hidden="true">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, ((stats.total - stats.used) / stats.total) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">Utilization</h3>
          </div>
          <div className="h-28 min-h-[112px] w-full" role="img" aria-label={`Pie chart showing usage statistics`}>
            <ResponsiveContainer width="100%" height="100%" minHeight={112}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};