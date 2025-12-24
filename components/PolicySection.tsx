import React from 'react';
import { VACATION_POLICY } from '../constants';

export const PolicySection: React.FC = () => {
  const policies = [
    {
      title: 'Annual Leaves',
      description: VACATION_POLICY.entitlement,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Public Holidays',
      description: VACATION_POLICY.publicHolidays,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V14a2 2 0 01-2 2h-1c-1.104 0-2 .896-2 2v2M8 3.935A9 9 0 1120.065 11h-2.035" />
        </svg>
      ),
    },
    {
      title: 'Work From Home',
      description: VACATION_POLICY.wfh,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Company Policy & Guidelines</h2>
        <p className="text-sm text-slate-500 mt-1">Key information about your time off entitlement and booking rules at Amadeus Egypt.</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((item, index) => (
            <div key={index} className="flex space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last updated: January 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};