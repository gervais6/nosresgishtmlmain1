import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface CurrentAgent {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface HeaderProps {
  activeSection: 'dashboard' | 'documents' | 'settings';
  setSidebarOpen: (open: boolean) => void;
  currentUser: CurrentAgent | null;
}

export default function Header({
  activeSection,
  setSidebarOpen,
  currentUser,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-full hover:bg-white/5 md:hidden cursor-pointer"
        >
          <span className="material-symbols-outlined text-on-surface-variant">menu</span>
        </button>
        <span className="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {activeSection === 'dashboard' ? 'Tableau de bord' : activeSection === 'documents' ? 'Historiques' : 'Paramètres'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant">
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="text-right hidden xs:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Agent'}
            </p>
            <p className="text-xs text-on-surface-variant uppercase">{currentUser?.role || 'AGENT'}</p>
          </div>
          <img 
            className="w-9 h-9 rounded-full border border-primary/30" 
            alt="Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS1Xw_lSZEYTQYot3088IFIZaXLvRiiAl78S4OruwuTWtrJpSTz8tP6xbskjrQXEZGz8djlHSXnNIh8vvQyljjMwLsj2bZUcNuXJnC48vuHrwdhXdSxIjyWcXmLLounhz_s-PtmovI2U5V0YAAIQiRMZTw-VK88vHAG2KImkHkXs37SBxrgPQvQucp6maj2dtLGVtBAQs8BQec0nwQRS99m38lCdlr9625KtJLlPEuv1HaF1kYfLBFNG6jZ--0hjYFFzEaBYnwsIW-"
          />
        </div>
      </div>
    </header>
  );
}
