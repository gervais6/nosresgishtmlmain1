'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

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
          <div className="glass-card rounded-2xl p-8 md:p-10">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">Mot de passe oublié</h1>
                  <p className="text-on-surface-variant text-sm">Saisissez votre e-mail pour réinitialiser votre mot de passe</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="email">Email professionnel</label>
                    <input 
                      type="email"
                      id="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full custom-input rounded-xl py-3.5 px-5 bg-transparent border border-white/10 focus:border-primary text-gray-900 dark:text-white placeholder:text-on-surface-variant/50 focus:outline-none" 
                      placeholder="vous@entreprise.com" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-primary text-black font-bold text-base py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                  >
                    Envoyer le lien de réinitialisation
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-7xl mb-4">check_circle</span>
                <h1 className="text-2xl font-extrabold text-black dark:text-white mb-2">Email envoyé</h1>
                <p className="text-on-surface-variant text-sm mb-6">
                  Si un compte existe pour <span className="text-gray-900 dark:text-white font-semibold">{email}</span>, vous recevrez un e-mail contenant des instructions de réinitialisation.
                </p>
              </div>
            )}
            <div className="text-center mt-6">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
