import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead,
  onClearAll,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const getIcon = (n: AppNotification) => {
    // If it's a simulated email, use an envelope icon
    if (n.isEmail) return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>;
    
    switch (n.type) {
      case 'success': return <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" aria-hidden="true"></div>;
      case 'warning': return <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" aria-hidden="true"></div>;
      case 'reminder': return <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" aria-hidden="true"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" aria-hidden="true"></div>;
    }
  };

  const handleItemClick = (n: AppNotification) => {
    onMarkAsRead(n.id);
    if (onNotificationClick) {
      onNotificationClick(n);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          role="menu"
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
        >
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Notifications Center</h3>
            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold focus-visible:underline focus-visible:outline-none"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar" role="list">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <button 
                    key={n.id} 
                    role="listitem"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors relative focus-visible:bg-slate-50 focus-visible:outline-none ${!n.read ? 'bg-blue-50/30' : ''} ${n.isEmail ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">{getIcon(n)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                             <p className={`text-sm truncate font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                               {n.title}
                             </p>
                             {n.isEmail && (
                               <span className="text-[7px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shrink-0 shadow-sm shadow-blue-100">Email Dispatched</span>
                             )}
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed break-words">
                          {n.message}
                        </p>
                        {n.relatedRequestId && (
                          <div className="mt-2 text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeWidth="2.5"/></svg>
                             Click to view request details
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Inbox is empty</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 focus-visible:underline focus-visible:outline-none">Organization Communication Log</button>
          </div>
        </div>
      )}
    </div>
  );
};