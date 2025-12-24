
import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '../services/geminiService';
import { UserStats, VacationRequest, Message, LeaveType } from '../types';

interface GeminiChatProps {
  stats: UserStats;
  requests: VacationRequest[];
  leaveTypes: LeaveType[];
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ stats, requests, leaveTypes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Vacationly Assistant. I can help you plan your next trip or check your balance. Would you like some suggestions on the best times to take a break?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await askGemini(userMsg, stats, requests, leaveTypes);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const quickActions = [
    { label: "📅 Suggest best dates", prompt: "Based on my balance and team availability, suggest 3 optimal periods for a vacation." },
    { label: "🏖️ Wellness week?", prompt: "I'm feeling a bit burnt out. Suggest a good week for a wellness break soon." },
    { label: "✈️ Maximize holidays", prompt: "How can I maximize my leave by using upcoming public holidays for long weekends?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <section 
          aria-label="AI Vacation Planner Chat"
          className="bg-white w-80 md:w-96 h-[550px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4"
        >
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold block leading-tight">AI Planner</span>
                <span className="text-[10px] text-blue-100 uppercase tracking-widest font-bold">Proactive Mode</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                }`}
                >
                  <span className="sr-only">{msg.role === 'user' ? 'You said:' : 'Assistant said:'}</span>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" aria-live="assertive">
                <div className="bg-white px-4 py-3 rounded-2xl text-sm border border-slate-200 rounded-tl-none flex items-center space-x-2">
                  <div className="flex space-x-1" aria-hidden="true">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-slate-400 italic">Analyzing schedule...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            {messages.length < 5 && !isLoading && (
              <nav className="flex flex-wrap gap-2 mb-4" aria-label="Quick chat actions">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {action.label}
                  </button>
                ))}
              </nav>
            )}
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for vacation suggestions..."
                aria-label="Chat message input"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-100 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center italic" aria-hidden="true">AI recommendations take team constraints into account.</p>
          </div>
        </section>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-expanded="false"
          aria-haspopup="dialog"
          className="bg-blue-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse" aria-hidden="true">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="absolute right-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none font-bold uppercase tracking-wider">Plan your time off</span>
          <span className="sr-only">Open AI Vacation Planner</span>
        </button>
      )}
    </div>
  );
};
