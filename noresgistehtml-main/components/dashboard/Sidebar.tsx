import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  activeSection: 'dashboard' | 'documents' | 'settings';
  setActiveSection: (section: 'dashboard' | 'documents' | 'settings') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-surface-dim/80 dark:bg-surface-dim/80 backdrop-blur-md border-r border-white/5 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-8 flex justify-between items-center">
          <Link href="/">
            <img alt="Registre+" className="h-3 w-auto logo-theme dark:invert-0 light:invert" src="/images/noregis.svg" />
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-on-surface-variant hover:text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <button 
            onClick={() => { setActiveSection('dashboard'); setSidebarOpen(false); }} 
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'dashboard' ? 'nav-active text-primary bg-primary/10 border-l-3 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined mr-3 text-xl">dashboard</span> 
            <span>Tableau de bord</span>
          </button>
          <button 
            onClick={() => { setActiveSection('documents'); setSidebarOpen(false); }} 
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'documents' ? 'nav-active text-primary bg-primary/10 border-l-3 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined mr-3 text-xl">description</span> 
            <span>Historiques</span>
          </button>
          <button 
            onClick={() => { setActiveSection('settings'); setSidebarOpen(false); }} 
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'settings' ? 'nav-active text-primary bg-primary/10 border-l-3 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined mr-3 text-xl">settings</span> 
            <span>Paramètres</span>
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all text-left"
          >
            <span className="material-symbols-outlined mr-3 text-xl">logout</span> 
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
