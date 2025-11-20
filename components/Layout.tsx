import React from 'react';
import { AppMode } from '../types';
import { Home, MessageCircle, Mic, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode }) => {
  
  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode, icon: any, label: string }) => {
    const isActive = currentMode === mode;
    return (
      <button
        onClick={() => setMode(mode)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
          isActive ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-gray-50 shadow-2xl relative overflow-hidden sm:rounded-[40px] sm:my-8 sm:h-[850px] sm:border-[8px] sm:border-gray-800">
      {/* Top Status Bar Simulation */}
      <div className="h-12 w-full bg-white/80 backdrop-blur-md flex items-end justify-between px-6 pb-2 z-20 border-b border-gray-200/50 fixed sm:absolute top-0">
        <span className="text-xs font-bold text-gray-900">9:41</span>
        <div className="flex space-x-2 items-center">
           <div className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[8px]">G</div>
           <div className="w-6 h-3 border border-gray-300 rounded-sm relative">
             <div className="absolute top-0 left-0 bg-black h-full w-2/3"></div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pt-12 pb-20 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 absolute bottom-0 z-50 flex justify-around items-center px-4 pb-4">
        <NavItem mode={AppMode.Dashboard} icon={Home} label="Learn" />
        <NavItem mode={AppMode.Chat} icon={MessageCircle} label="Chat" />
        <div className="relative -top-5">
           <button 
             onClick={() => setMode(AppMode.Live)}
             className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white transform transition-transform active:scale-95"
           >
             <Mic size={32} />
           </button>
        </div>
        <NavItem mode={AppMode.Live} icon={User} label="Live" /> {/* Re-using Profile slot for visual symmetry, can be stats */}
        <NavItem mode={AppMode.Profile} icon={User} label="Profile" />
      </nav>
    </div>
  );
};