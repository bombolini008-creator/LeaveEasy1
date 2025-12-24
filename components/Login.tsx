import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, pass: string, rememberMe: boolean) => boolean;
  onResetPassword: (username: string, newPass: string) => boolean;
  onConnectVault?: (key: string) => Promise<boolean>;
  isCloudSyncing?: boolean;
  error?: string;
  employees: { username: string; email: string; name: string }[];
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, onConnectVault, isCloudSyncing, error: externalError 
}) => {
  const [mode, setMode] = useState<'login' | 'cloud' | 'forgot'>('login');
  const [username, setUsername] = useState(() => localStorage.getItem('vacation_remembered_user') || '');
  const [password, setPassword] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('vacation_remember_preference') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username.trim(), password.trim(), rememberMe);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('vacation_remembered_user', username.trim());
        localStorage.setItem('vacation_remember_preference', 'true');
      } else {
        localStorage.removeItem('vacation_remembered_user');
        localStorage.removeItem('vacation_remember_preference');
      }
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  const handleCloudConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onConnectVault && await onConnectVault(vaultKey.trim())) {
      setSuccessMsg('Corporate Vault Linked Successfully!');
      setMode('login');
    } else {
      setError('Invalid Vault Access Key.');
    }
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Recovery request sent to HR. Please check your inbox or contact IT Helpdesk.');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-slate-50">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
          <div className="p-12 md:p-20 text-center">
            <div className="inline-block p-5 bg-blue-600 rounded-[2rem] mb-10 shadow-2xl shadow-blue-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#000031] mb-2 leading-none">Amadeus Egypt</h1>
            <p className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-14">Vacation Leave Hub</p>

            {successMsg && <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-sm font-bold animate-in slide-in-from-top-2">{successMsg}</div>}
            {(error || externalError) && <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-sm font-bold animate-in shake duration-500">{error || externalError}</div>}

            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-left ml-4">Corporate Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" 
                    placeholder="e.g. m_ghattas" 
                    required 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-4 mr-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot Access?</button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm pr-20" 
                      placeholder="••••••••" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase hover:text-blue-600 p-2"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none">Remember Login Credentials</label>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-7 rounded-[2rem] font-black uppercase text-base shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-lg">
                  Sign In
                </button>
                <div className="pt-8">
                  <button type="button" onClick={() => setMode('cloud')} className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">
                    Establish Cloud Vault Link
                  </button>
                </div>
              </form>
            )}

            {mode === 'cloud' && (
              <form onSubmit={handleCloudConnect} className="space-y-10 animate-in slide-in-from-right-4">
                <div className="text-left space-y-3 px-4">
                   <h2 className="text-2xl font-black text-slate-900">Vault Linkage</h2>
                   <p className="text-sm text-slate-500 font-medium">Synchronize local cache with the Corporate Master Vault.</p>
                </div>
                <input 
                  type="text" 
                  value={vaultKey} 
                  onChange={e => setVaultKey(e.target.value.toUpperCase())} 
                  className="w-full bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] px-8 py-8 text-center text-2xl font-black text-blue-600 outline-none tracking-widest" 
                  placeholder="AMADEUS-XXXX" 
                  required 
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setMode('login')} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black uppercase text-xs">Cancel</button>
                  <button type="submit" disabled={isCloudSyncing} className="flex-[2] bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs shadow-xl">
                    {isCloudSyncing ? 'Linking...' : 'Restore State'}
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotRequest} className="space-y-10 animate-in slide-in-from-right-4 text-left px-4">
                <div className="space-y-3">
                   <h2 className="text-2xl font-black text-slate-900">Credential Recovery</h2>
                   <p className="text-sm text-slate-500 font-medium">Reset requests are routed to the IT Security team for manual verification.</p>
                </div>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-lg font-bold text-slate-900 outline-none focus:border-blue-600" 
                  placeholder="name@eg.amadeus.com" 
                  required 
                />
                <div className="flex gap-4">
                   <button type="button" onClick={() => setMode('login')} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black uppercase text-xs">Back</button>
                   <button type="submit" className="flex-[2] bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs shadow-xl">Initiate Reset</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};