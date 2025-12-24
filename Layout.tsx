
import React, { useState, useRef, useEffect } from 'react';
import { ViewType, AppNotification, Employee } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewType;
  setView: (view: ViewType) => void;
  currentUser: Employee;
  team: Employee[];
  onSwitchUser: (user: Employee) => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearNotifications: () => void;
  lastSaved?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  view, 
  setView,
  currentUser,
  team,
  onSwitchUser,
  onLogout,
  notifications,
  onMarkNotificationAsRead,
  onClearNotifications,
  lastSaved
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (lastSaved) {
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const isCurrentUserAManager = team.some(emp => emp.managerId === currentUser.id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center select-none">
                <span className="text-xl font-black uppercase tracking-tighter text-blue-950">Amadeus Egypt vacation leave</span>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setView('employee')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    view === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  Personal
                </button>
                {isCurrentUserAManager && (
                  <button
                    onClick={() => setView('manager')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      view === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    Team
                  </button>
                )}
                {currentUser.isAdmin && (
                  <button
                    onClick={() => setView('admin')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      view === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => setView('org-chart')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    view === 'org-chart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  Org
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationCenter 
                notifications={notifications} 
                onMarkAsRead={onMarkNotificationAsRead}
                onClearAll={onClearNotifications}
              />
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
              
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                      {currentUser.role} {currentUser.isAdmin ? '• Admin' : ''} {isCurrentUserAManager ? '• Manager' : ''}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold overflow-hidden ${currentUser.isAdmin ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {currentUser.isAdmin && (
                      <div className="p-2 border-t border-slate-100 max-h-[250px] overflow-y-auto">
                        <p className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Impersonation</p>
                        {team.map(emp => {
                          const isEmpManager = team.some(e => e.managerId === emp.id);
                          return (
                            <button
                              key={emp.id}
                              onClick={() => {
                                onSwitchUser(emp);
                                setIsProfileOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${currentUser.id === emp.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                 <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-100 border border-slate-200 text-[8px] font-bold">
                                   {emp.name[0]}
                                 </div>
                                 <span className="truncate">{emp.name}</span>
                              </div>
                              <div className="flex gap-1">
                                {emp.isAdmin && <span className="text-[7px] font-black bg-blue-100 text-blue-600 px-1 rounded uppercase">Adm</span>}
                                {isEmpManager && <span className="text-[7px] font-black bg-emerald-100 text-emerald-600 px-1 rounded uppercase">Mgr</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">&copy; {new Date().getFullYear()} AMADEUS Egypt. Internal Leave Tracking System.</p>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center transition-opacity duration-500 ${showSavedToast ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${showSavedToast ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All changes saved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
