'use client';

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="antialiased min-h-screen flex flex-col bg-surface dark:bg-surface text-on-surface">
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center px-5 md:px-margin-desktop py-4 max-w-container-max mx-auto w-full">
          <Link href="/">
            <img alt="Registre+" className="h-3 w-auto logo-theme dark:invert-0 light:invert" src="/images/noregis.svg" />
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 md:p-10 text-center">
            <h1 className="text-3xl font-extrabold text-black dark:text-white mb-4">Créer un compte</h1>
            <p className="text-on-surface-variant text-sm mb-6">
              La création de compte en libre-service est désactivée pour des raisons de sécurité.
            </p>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-left mb-6 leading-relaxed">
              <span className="font-bold text-primary">Note : </span>
              Seul un administrateur peut enregistrer un nouvel agent. Si vous êtes un administrateur ou un agent, veuillez contacter votre équipe IT pour obtenir vos identifiants.
            </div>
            <Link href="/login" className="inline-block w-full bg-primary text-black font-bold text-base py-3.5 rounded-xl hover:brightness-110 transition-all">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-container-max mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img alt="Registre+" className="h-3 w-auto logo-theme" src="/images/noregis.svg" />
            <p className="text-on-surface-variant text-xs">© 2024 Registre+, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
