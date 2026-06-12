'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const fullText = "Simplifiez l'accueil.";

  // Session Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        const userData = localStorage.getItem('user');
        let dashboardUrl = '/dashboard';
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const role = user.role;
            if (role === 'ADMIN') dashboardUrl = '/admin';
            else if (role === 'AGENT') dashboardUrl = '/dashboard';
          } catch (e) {
            // Fallback
          }
        }
        router.replace(dashboardUrl);
      }
    }
  }, [router]);

  // Typewriter Animation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-surface dark:bg-surface text-on-surface">
      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div 
          onClick={toggleMenu} 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 nav-blur border-b border-white/5 transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <img alt="Registre+" className="h-3 w-auto logo-theme dark:invert-0 light:invert" src="/images/noregis.svg" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Solutions</a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Fonctionnalités</a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Sécurité</a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Ressources</a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Tarifs</a>
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Démo</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <button onClick={toggleMenu} className="lg:hidden p-2 rounded-full hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="bg-primary text-black font-bold text-sm px-5 py-2 rounded hover:scale-105 transition-all">
                Se connecter
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`fixed top-16 left-0 w-64 h-full bg-surface-dim/95 dark:bg-surface-dim/95 backdrop-blur-lg border-r border-white/10 z-50 flex flex-col p-6 gap-4 transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Solutions</a>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Fonctionnalités</a>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Sécurité</a>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Ressources</a>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Tarifs</a>
          <a className="text-md font-medium text-on-surface-variant hover:text-primary transition-colors" href="#">Démo</a>
          <hr className="border-white/10 my-2" />
          <Link href="/login" className="w-full bg-primary text-black font-bold text-md py-2 rounded text-center hover:scale-105 transition-all">
            Se connecter
          </Link>
        </div>
      </nav>

      <main className="flex-grow">
        {/* HERO Section */}
        <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 hero-gradient overflow-hidden min-h-screen flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 md:px-margin-desktop text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight text-gray-900 dark:text-white">
              Enregistrement numérique des visiteurs — <span className="text-primary glow-text">sans papier</span>, en quelques secondes
            </h1>
            <p className="text-base md:text-xl text-on-surface-variant mb-8 md:mb-10 max-w-2xl mx-auto">
              Scannez les pièces d’identité, générez des badges, et gérez vos flux d’accès en toute conformité RGPD.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link href="/login" className="w-full sm:w-auto bg-primary text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded hover:shadow-[0_0_20px_rgba(0,250,108,0.3)] transition-all text-sm md:text-base text-center">
                Se connecter
              </Link>
              <button className="w-full sm:w-auto border border-white/20 text-gray-900 dark:text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded hover:bg-white/5 transition-all text-sm md:text-base">
                Voir une vidéo
              </button>
            </div>
          </div>
          {/* Animated illustration elements */}
          <div className="mt-12 md:mt-20 relative w-full max-w-5xl mx-auto px-4 flex justify-center items-center">
            <div className="relative w-full flex flex-col md:flex-row justify-around items-center gap-4">
              <div className="w-2/3 md:w-1/3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="h-2 w-1/2 bg-white/20 mb-2"></div>
                <div className="h-2 w-full bg-white/10 mb-2"></div>
                <div className="h-2 w-3/4 bg-white/10 mb-4"></div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="h-6 bg-white/5"></div>
                  <div className="h-6 bg-white/5"></div>
                  <div className="h-6 bg-white/5"></div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 md:-inset-8 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <img alt="Registre+" className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-xl relative z-10 bg-primary/20 p-2 logo-theme" src="/images/noregis.svg" />
              </div>
              <div className="w-2/3 md:w-1/4 flex flex-col gap-1 md:gap-2">
                <div className="h-0.5 bg-primary/30 w-full"></div>
                <div className="h-0.5 bg-primary/50 w-2/3"></div>
                <div className="h-0.5 bg-primary/20 w-3/4"></div>
                <div className="h-0.5 bg-primary/40 w-1/2"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Logos */}
        <section className="py-12 md:py-20 bg-surface-dim dark:bg-surface-dim border-y border-white/5">
          <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop text-center">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-8 md:mb-10">Reconnu par des organisations leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-50 grayscale">
              <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">ACCOR</span>
              <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">ORANGE</span>
              <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">SOCIETE GENERALE</span>
              <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">AIRBUS</span>
              <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">LVMH</span>
            </div>
            <div className="mt-10 md:mt-16 flex justify-center gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="flex text-primary mb-1 text-xs md:text-base">★★★★★</div>
                <span className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase">Note G2 4,9/5</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex text-primary mb-1 text-xs md:text-base">★★★★★</div>
                <span className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase">99% de satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi Section */}
        <section className="py-16 md:py-32 bg-surface dark:bg-surface text-center">
          <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-12 md:mb-20 inline-flex items-center justify-center gap-3 flex-wrap">
              Pourquoi
              <img src="/images/noregis.svg" alt="Registre+" className="why-logo logo-theme h-6 md:h-8" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="why-card flex flex-col items-center">
                <img src="/images/speedometer.png" alt="Speedometer" className="why-icon-img w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6" />
                <h3 className="text-lg md:text-xl font-bold mb-2">Prêt en 1 jour</h3>
                <p className="text-sm">Configuration rapide, compatible avec vos outils.</p>
              </div>
              <div className="why-card flex flex-col items-center">
                <img src="/images/time-tracking.png" alt="Time tracking" className="why-icon-img w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6" />
                <h3 className="text-lg md:text-xl font-bold mb-2">Ultra-rapide</h3>
                <p className="text-sm">Enregistrement en moins de 20 secondes.</p>
              </div>
              <div className="why-card flex flex-col items-center">
                <img src="/images/cyber-security.png" alt="Cyber security" className="why-icon-img w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6" />
                <h3 className="text-lg md:text-xl font-bold mb-2">Hébergement sécurisé</h3>
                <p className="text-sm">Données hébergées en France, conformité RGPD.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trois Piliers Section */}
        <section className="py-16 md:py-32 bg-surface-dim dark:bg-surface-dim">
          <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-6">Accueil numérique nouvelle génération</h2>
              <p className="text-base md:text-lg text-on-surface-variant max-w-3xl mx-auto">Remplacez vos registres papier par une solution 100% digitale, rapide et sécurisée.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="card-gradient border border-white/5 p-6 md:p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-6"><span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">Scanner</span></div>
                <p className="text-sm text-on-surface-variant mb-6">Lisez automatiquement les pièces d’identité, passeports et cartes de séjour.</p>
                <ul className="space-y-3 text-sm font-medium text-gray-900 dark:text-white">
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Scan CNI / Passeport</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Reconnaissance automatique des champs</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Prise de photo signée</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> API d’OCR intégrée</li>
                </ul>
              </div>
              <div className="card-gradient border border-white/5 p-6 md:p-8 rounded-xl ring-2 ring-primary/20">
                <div className="flex items-center gap-3 mb-6"><span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">Badger</span></div>
                <p className="text-sm text-on-surface-variant mb-6">Générez des badges d’accès personnalisés avec QR code et photo.</p>
                <ul className="space-y-3 text-sm font-medium text-gray-900 dark:text-white">
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Impression WiFi / Bluetooth</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> QR code de sortie</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Badge temporaire ou permanent</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Logo entreprise personnalisé</li>
                </ul>
              </div>
              <div className="card-gradient border border-white/5 p-6 md:p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-6"><span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">Analyser</span></div>
                <p className="text-sm text-on-surface-variant mb-6">Tableaux de bord et rapports détaillés pour le suivi des entrées/sorties.</p>
                <ul className="space-y-3 text-sm font-medium text-gray-900 dark:text-white">
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Registre numérique inviolable</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Export PDF / Excel</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Alertes en temps réel</li>
                  <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> Dashboard complet</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Secteurs Section */}
        <section className="py-16 md:py-32 bg-surface dark:bg-surface">
          <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-2 text-gray-900 dark:text-white">Transformez votre secteur</h2>
            <div className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-16 text-black bg-primary inline-block px-2">
              <span>{typewriterText}</span>
              <span className="typewriter-cursor"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="sector-card p-4 md:p-8 rounded-xl group transition-all cursor-pointer">
                <div className="w-full h-40 md:h-48 bg-white/10 rounded-lg mb-4 md:mb-6 flex items-center justify-center overflow-hidden">
                  <img src="/images/illustation1.png" alt="Illustration secteur" className="sector-img" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Entreprises &amp; bureaux</h3>
                <p className="text-xs md:text-sm mb-4 md:mb-6 leading-relaxed opacity-90">Gérez les entrées de vos collaborateurs, visiteurs et prestataires. Plus de registre papier, tout est dématérialisé et sécurisé.</p>
                <a className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all text-sm" href="#">En savoir plus <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></a>
              </div>
              <div className="sector-card p-4 md:p-8 rounded-xl group transition-all cursor-pointer">
                <div className="w-full h-40 md:h-48 bg-white/10 rounded-lg mb-4 md:mb-6 flex items-center justify-center overflow-hidden">
                  <img src="/images/l.jpg" alt="Illustration résidence" className="sector-img" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Résidences &amp; immeubles</h3>
                <p className="text-xs md:text-sm mb-4 md:mb-6 leading-relaxed opacity-90">Contrôle d’accès pour copropriétés, livreurs et prestataires. Historique consultable par le syndic.</p>
                <a className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all text-sm" href="#">En savoir plus <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></a>
              </div>
              <div className="sector-card p-4 md:p-8 rounded-xl group transition-all cursor-pointer">
                <div className="w-full h-40 md:h-48 bg-white/10 rounded-lg mb-4 md:mb-6 flex items-center justify-center overflow-hidden">
                  <img src="/images/g.png" alt="Illustration santé" className="sector-img" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Santé &amp; cliniques</h3>
                <p className="text-xs md:text-sm mb-4 md:mb-6 leading-relaxed opacity-90">Enregistrement des patients visiteurs, traçabilité des entrées, conformité avec les obligations sanitaires.</p>
                <a className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all text-sm" href="#">En savoir plus <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final Section */}
        <section className="py-16 md:py-32 bg-primary">
          <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop text-center">
            <h2 className="text-2xl md:text-6xl font-black text-black mb-6 md:mb-8">Prêt à passer au 100% numérique ?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link href="/login" className="bg-black text-white font-bold px-6 md:px-10 py-3 md:py-5 rounded-lg hover:scale-105 transition-transform text-sm md:text-base text-center">
                Se connecter
              </Link>
              <button className="bg-white/20 text-black font-bold px-6 md:px-10 py-3 md:py-5 rounded-lg hover:bg-white/30 transition-all border border-black/10 text-sm md:text-base">
                Voir une vidéo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim dark:bg-surface-dim pt-12 md:pt-20 pb-8 md:pb-10 border-t border-white/5">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-gutter mb-12 md:mb-20">
            <div className="col-span-2">
              <Link className="inline-block mb-4 md:mb-6" href="/">
                <img alt="Registre+" className="h-3 w-auto logo-theme dark:invert-0 light:invert" src="/images/noregis.svg" />
              </Link>
              <p className="text-on-surface-variant text-xs md:text-sm max-w-xs">Solution d’accueil numérique pour remplacer le registre papier, conforme RGPD et hautement sécurisée.</p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Solutions</h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm text-on-surface-variant">
                <li><a className="hover:text-primary" href="#">Scan CNI</a></li>
                <li><a className="hover:text-primary" href="#">Badges</a></li>
                <li><a className="hover:text-primary" href="#">Registre électronique</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Développeurs</h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm text-on-surface-variant">
                <li><a className="hover:text-primary" href="#">API Docs</a></li>
                <li><a className="hover:text-primary" href="#">SDKs</a></li>
                <li><a className="hover:text-primary" href="#">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Ressources</h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm text-on-surface-variant">
                <li><a className="hover:text-primary" href="#">Blog</a></li>
                <li><a className="hover:text-primary" href="#">Livres blancs</a></li>
                <li><a className="hover:text-primary" href="#">Webinaires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-4 md:mb-6 text-sm md:text-base">Entreprise</h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm text-on-surface-variant">
                <li><a className="hover:text-primary" href="#">À propos</a></li>
                <li><a className="hover:text-primary" href="#">Sécurité</a></li>
                <li><a className="hover:text-primary" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant text-xs text-center md:text-left">© 2024 Registre+, Inc. Tous droits réservés. Accueil numérique sans papier.</p>
            <div className="flex gap-4 md:gap-6 text-xs text-on-surface-variant">
              <a className="hover:text-primary" href="#">Confidentialité</a>
              <a className="hover:text-primary" href="#">Conditions</a>
              <a className="hover:text-primary" href="#">Paramètres des cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}