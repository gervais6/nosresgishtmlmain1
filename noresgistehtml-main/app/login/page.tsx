'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Error States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const API_BASE_URL = 'https://noregisbackend.onrender.com';
  const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
  const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google/redirect`;

  const validateEmail = (value: string) => {
    if (!value) return "L'email est requis.";
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(value)) return "Format d'email invalide.";
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Le mot de passe est requis.";
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const redirectBasedOnRole = (role: string) => {
    let dashboardUrl = '/dashboard';
    if (role === 'ADMIN') dashboardUrl = '/admin';
    else if (role === 'AGENT') dashboardUrl = '/dashboard';
    router.push(dashboardUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);

    if (emailErr || pwdErr) {
      setEmailError(emailErr);
      setPasswordError(pwdErr);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        motDePasse: password
      };

      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        if (result.token) localStorage.setItem('auth_token', result.token);
        if (result.utilisateur) {
          localStorage.setItem('user', JSON.stringify(result.utilisateur));
          const role = result.utilisateur.role;
          redirectBasedOnRole(role);
        } else {
          redirectBasedOnRole('default');
        }
      } else {
        if (result.errors) {
          if (result.errors.email) {
            setEmailError(result.errors.email[0]);
          }
          if (result.errors.motDePasse) {
            setPasswordError(result.errors.motDePasse[0]);
          }
          setGlobalError(result.message || "Identifiants incorrects.");
        } else {
          setGlobalError(result.message || "Échec de la connexion.");
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setGlobalError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-surface dark:bg-surface text-on-surface">
      {/* Navigation */}
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

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-2">Connexion</h1>
              <p className="text-on-surface-variant text-sm">Accédez à votre espace d’accueil numérique</p>
            </div>

            {globalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-on-surface-variant" htmlFor="email">Email professionnel</label>
                <input 
                  type="email"
                  id="email" 
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full custom-input rounded-xl py-3.5 px-5 bg-transparent border ${emailError ? 'border-red-500' : 'border-white/10'} focus:border-primary text-gray-900 dark:text-white placeholder:text-on-surface-variant/50 focus:outline-none`} 
                  placeholder="vous@entreprise.com" 
                />
                {emailError && (
                  <div className="error-message text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span> {emailError}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full custom-input rounded-xl py-3.5 px-5 bg-transparent border ${passwordError ? 'border-red-500' : 'border-white/10'} focus:border-primary text-gray-900 dark:text-white placeholder:text-on-surface-variant/50 focus:outline-none`} 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordError && (
                  <div className="error-message text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span> {passwordError}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-black font-bold text-base py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-xl">login</span>
                )}
                <span>{loading ? 'CONNEXION...' : 'SE CONNECTER'}</span>
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-transparent px-2 text-on-surface-variant bg-surface-container dark:bg-surface-container/60">OU</span></div>
            </div>

            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-3 border border-white/10 hover:border-primary/50 text-black dark:text-white font-medium text-sm py-3.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Se connecter avec Google</span>
            </button>

            <div className="text-center mt-8">
              <p className="text-sm text-on-surface-variant">
                Vous n'avez pas de compte ? 
                <Link href="/register" className="text-primary font-semibold hover:underline ml-1">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-on-surface-variant/50 mt-6">Conforme RGPD – Données hébergées en France</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-container-max mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img alt="Registre+" className="h-3 w-auto logo-theme dark:invert-0 light:invert" src="/images/noregis.svg" />
            <p className="text-on-surface-variant text-xs">© 2024 Registre+, Inc.</p>
          </div>
          <div className="flex gap-6 text-xs text-on-surface-variant">
            <a className="hover:text-primary" href="#">Confidentialité</a>
            <a className="hover:text-primary" href="#">Conditions</a>
            <a className="hover:text-primary" href="#">Sécurité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
