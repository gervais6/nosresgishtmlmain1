'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

interface UserAgent {
  _id: string;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  isActif: boolean;
}

interface Visitor {
  _id?: string;
  nom: string;
  prenom: string;
  numeroPiece?: string;
  typePiece?: string;
}

interface Visit {
  _id: string;
  heureEntree: string;
  heureSortie?: string;
  statut: string;
  service?: string;
  visiteurId: Visitor;
  departement?: string;
  createdAt?: string;
}

interface CurrentAdmin {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  departement?: string;
  poste?: string;
  niveauAccreditation?: string;
  dateArrivee?: string;
  twoFactorEnabled?: boolean;
  role: string;
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  val: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Navigation
  const [activeSection, setActiveSection] = useState<'dashboard' | 'agents' | 'documents' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth & Token
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentAdmin | null>(null);

  // Lists Data
  const [visits, setVisits] = useState<Visit[]>([]);
  const [users, setUsers] = useState<UserAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [profileNom, setProfileNom] = useState('');
  const [profilePrenom, setProfilePrenom] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileTelephone, setProfileTelephone] = useState('');
  const [profileDepartement, setProfileDepartement] = useState('');
  const [profilePoste, setProfilePoste] = useState('');
  const [profileAccreditation, setProfileAccreditation] = useState('');
  const [profileDateArrivee, setProfileDateArrivee] = useState('');
  const [profileTwoFactor, setProfileTwoFactor] = useState(false);

  // New User Creation States
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('AGENT');

  // Notification states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const API_BASE = 'https://noregisbackend.onrender.com/api';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        router.push('/login');
      } else {
        setToken(storedToken);
      }
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      loadAllData();
      const interval = setInterval(loadAllData, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      router.push('/login');
      throw new Error('Session expirée');
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur API');
    return data;
  };

  const loadAllData = async () => {
    try {
      // Profile
      const profData = await apiFetch('/auth/profil');
      const user = profData.utilisateur;
      setCurrentUser(user);

      setProfileNom(user.nom || '');
      setProfilePrenom(user.prenom || '');
      setProfileEmail(user.email || '');
      setProfileTelephone(user.telephone || '');
      setProfileDepartement(user.departement || '');
      setProfilePoste(user.poste || '');
      setProfileAccreditation(user.niveauAccreditation || '');
      if (user.dateArrivee) {
        setProfileDateArrivee(new Date(user.dateArrivee).toISOString().slice(0, 10));
      }
      setProfileTwoFactor(!!user.twoFactorEnabled);

      // Visits
      const visitsData = await apiFetch('/visites?limit=500');
      setVisits(visitsData.visites || []);

      // Agents / Users
      const usersData = await apiFetch('/auth/users');
      setUsers(usersData.utilisateurs || []);
    } catch (err: any) {
      console.warn('Erreur chargement données admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper stats methods
  const isOnSite = (v: Visit) => {
    const s = String(v.statut || '').toLowerCase();
    return (s === 'present' || s === 'en-cours' || s === 'en cours' || s === 'on-site')
        || (!v.heureSortie && s !== 'sorti' && s !== 'sortis' && s !== 'exited');
  };

  // Stats computation logic
  const total = visits.length;
  const active = visits.filter(isOnSite).length;

  // Peak Hour calculation
  const getPeakHour = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = visits.filter(v => v.createdAt && new Date(v.createdAt) >= thirtyDaysAgo);
    
    const hoursCount = Array(24).fill(0);
    recent.forEach(v => {
      if (v.createdAt) {
        const h = new Date(v.createdAt).getHours();
        hoursCount[h]++;
      }
    });

    const slots = [8, 10, 12, 14, 16, 18, 20];
    let peakSlot = null;
    let maxSlotVisits = 0;
    slots.forEach(h => {
      const count = (hoursCount[h] || 0) + (hoursCount[h + 1] || 0);
      if (count > maxSlotVisits) {
        maxSlotVisits = count;
        peakSlot = h;
      }
    });

    if (peakSlot === null && recent.length > 0) {
      let peakH = 0;
      let maxH = 0;
      hoursCount.forEach((c, h) => {
        if (c > maxH) {
          maxH = c;
          peakH = h;
        }
      });
      peakSlot = peakH;
    }

    return (peakSlot !== null && maxSlotVisits > 0) ? `${String(peakSlot).padStart(2, '0')}:00 – ${String(peakSlot + 2).padStart(2, '0')}:00` : '—';
  };

  const peakHour = getPeakHour();

  // SVG Chart points computation
  const getChartDataPoints = (): ChartPoint[] => {
    const todayStr = new Date().toDateString();
    const todayVisits = visits.filter(v => v.createdAt && new Date(v.createdAt).toDateString() === todayStr);
    
    const todayHours = Array(24).fill(0);
    todayVisits.forEach(v => {
      if (v.createdAt) {
        const h = new Date(v.createdAt).getHours();
        todayHours[h]++;
      }
    });

    const chartSlots = [8, 10, 12, 14, 16, 18, 20];
    const dataPoints = chartSlots.map(h => ({
      label: `${h}h`,
      val: (todayHours[h] || 0) + (todayHours[h + 1] || 0)
    }));

    const width = 600, height = 220;
    const padding = { left: 40, right: 20, top: 20, bottom: 30 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const maxVal = Math.max(...dataPoints.map(d => d.val), 3);

    return dataPoints.map((d, i) => {
      const x = padding.left + (i / (dataPoints.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - (d.val / maxVal) * graphHeight;
      return { x, y, label: d.label, val: d.val };
    });
  };

  const chartPoints = getChartDataPoints();

  // Create SVGs paths
  const getSvgPaths = () => {
    if (chartPoints.length === 0) return { linePath: '', areaPath: '' };
    
    let linePath = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      linePath += ` L ${chartPoints[i].x} ${chartPoints[i].y}`;
    }

    const paddingBottom = 220 - 30; // height - padding.bottom
    const areaPath = linePath + ` L ${chartPoints[chartPoints.length - 1].x} ${paddingBottom} L ${chartPoints[0].x} ${paddingBottom} Z`;
    
    return { linePath, areaPath };
  };

  const { linePath, areaPath } = getSvgPaths();

  // Top departments
  const getTopDepartments = () => {
    const depts: Record<string, number> = {};
    visits.forEach(v => {
      const d = v.departement || 'Visiteur';
      depts[d] = (depts[d] || 0) + 1;
    });

    return Object.entries(depts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topDepartments = getTopDepartments();
  const maxDeptCount = topDepartments.length > 0 ? topDepartments[0].count : 1;

  // CRUD User actions
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/auth/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setSuccessMsg('Rôle de l\'agent mis à jour');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleUserActif = async (userId: string, currentActif: boolean) => {
    try {
      await apiFetch(`/auth/users/${userId}/toggle`, { method: 'PUT' });
      setSuccessMsg(`Agent ${currentActif ? 'désactivé' : 'activé'} avec succès`);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur définitivement ?')) {
      try {
        await apiFetch(`/auth/users/${userId}`, { method: 'DELETE' });
        setSuccessMsg('Agent supprimé de la base');
        loadAllData();
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    }
  };

  const handleCreateAgentSubmit = async () => {
    if (!newNom || !newEmail || !newPassword) {
      setErrorMsg('Veuillez remplir le nom, l\'email et le mot de passe.');
      return;
    }

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nom: newNom,
          prenom: newPrenom,
          email: newEmail,
          motDePasse: newPassword,
          role: newRole
        })
      });
      
      setSuccessMsg('Nouvel agent créé avec succès');
      setShowCreateUserModal(false);
      setNewNom('');
      setNewPrenom('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('AGENT');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        nom: profileNom,
        prenom: profilePrenom,
        telephone: profileTelephone,
        departement: profileDepartement,
        poste: profilePoste,
        niveauAccreditation: profileAccreditation,
        dateArrivee: profileDateArrivee || null,
        twoFactorEnabled: profileTwoFactor
      };
      await apiFetch('/auth/profil', { method: 'PUT', body: JSON.stringify(payload) });
      setSuccessMsg('Profil administratif mis à jour');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-surface dark:bg-surface text-on-surface">
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
            <span>Supervision</span>
          </button>
          <button 
            onClick={() => { setActiveSection('agents'); setSidebarOpen(false); }} 
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'agents' ? 'nav-active text-primary bg-primary/10 border-l-3 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined mr-3 text-xl">group</span> 
            <span>Agents</span>
          </button>
          <button 
            onClick={() => { setActiveSection('documents'); setSidebarOpen(false); }} 
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'documents' ? 'nav-active text-primary bg-primary/10 border-l-3 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined mr-3 text-xl">description</span> 
            <span>Historique</span>
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
            onClick={() => { localStorage.clear(); router.push('/login'); }} 
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all text-left"
          >
            <span className="material-symbols-outlined mr-3 text-xl">logout</span> 
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main body wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 rounded-full hover:bg-white/5 md:hidden"
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <span className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {activeSection === 'dashboard' ? 'Supervision' : activeSection === 'agents' ? 'Agents' : activeSection === 'documents' ? 'Historique' : 'Paramètres'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5">
              <span className="material-symbols-outlined text-on-surface-variant">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Admin'}
                </p>
                <p className="text-xs text-on-surface-variant uppercase">{currentUser?.role || 'ADMIN'}</p>
              </div>
              <img 
                className="w-9 h-9 rounded-full border border-primary/30" 
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS1Xw_lSZEYTQYot3088IFIZaXLvRiiAl78S4OruwuTWtrJpSTz8tP6xbskjrQXEZGz8djlHSXnNIh8vvQyljjMwLsj2bZUcNuXJnC48vuHrwdhXdSxIjyWcXmLLounhz_s-PtmovI2U5V0YAAIQiRMZTw-VK88vHAG2KImkHkXs37SBxrgPQvQucp6maj2dtLGVtBAQs8BQec0nwQRS99m38lCdlr9625KtJLlPEuv1HaF1kYfLBFNG6jZ--0hjYFFzEaBYnwsIW-"
              />
            </div>
          </div>
        </header>

        <main className="flex-grow p-3 md:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* 1. SUPERVISION TAB */}
            {activeSection === 'dashboard' && (
              <section className="space-y-5 md:space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Supervision &amp; Statistiques</h2>
                  <p className="text-on-surface-variant text-xs md:text-sm">Consultez les indicateurs d'accès en temps réel (rafraîchissement automatique toutes les 15s)</p>
                </div>

                {/* Supervision stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="stat-card rounded-xl p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">how_to_reg</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-on-surface-variant">Depuis lancement</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Total visites</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{total}</h3>
                  </div>
                  <div className="stat-card rounded-xl p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">people</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-primary font-medium">Actuellement</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Sur site</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{active}</h3>
                  </div>
                  <div className="stat-card rounded-xl p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-on-surface-variant">30 derniers jours</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Heure de pointe</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{peakHour}</h3>
                  </div>
                </div>

                {/* SVG Chart & Departments side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* SVG Chart */}
                  <div className="glass-card rounded-xl lg:col-span-2 p-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Courbe d'affluence (aujourd'hui)</h3>
                      <p className="text-xs text-on-surface-variant">Volume des entrées cumulées par tranches de 2 heures</p>
                    </div>
                    <div id="chartContainer" className="relative w-full h-64 mt-4">
                      {chartPoints.length > 0 ? (
                        <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00fa6c" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#00fa6c" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => {
                            const y = 20 + (i / 4) * 170; // top: 20, height: 170
                            return (
                              <line 
                                key={i}
                                x1={40} 
                                y1={y} 
                                x2={580} 
                                y2={y} 
                                stroke="#2a2e2a" 
                                strokeDasharray="3 3"
                              />
                            );
                          })}

                          {/* Chart areas */}
                          <path d={areaPath} fill="url(#chartGrad)" stroke="none" />
                          <path d={linePath} fill="none" stroke="#00fa6c" strokeWidth={2.5} strokeLinecap="round" />

                          {/* Points */}
                          {chartPoints.map((p, i) => (
                            <circle 
                              key={i}
                              cx={p.x} 
                              cy={p.y} 
                              r="4" 
                              fill="#00fa6c" 
                              stroke="#111410" 
                              strokeWidth={2}
                            />
                          ))}

                          {/* Labels */}
                          {chartPoints.map((p, i) => (
                            <text 
                              key={i}
                              x={p.x} 
                              y={205} // padding.top + graphHeight + 15
                              textAnchor="middle" 
                              fill="#a1a3a8" 
                              fontSize="9"
                            >
                              {p.label}
                            </text>
                          ))}
                        </svg>
                      ) : (
                        <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                          Aucune visite aujourd'hui pour tracer le graphe.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Popular Departments */}
                  <div className="glass-card rounded-xl p-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Départements populaires</h3>
                      <p className="text-xs text-on-surface-variant">Top 5 des destinations fréquentées</p>
                    </div>
                    <div id="departmentsList" className="space-y-3 mt-4">
                      {topDepartments.length === 0 ? (
                        <div className="text-center py-4 text-on-surface-variant text-sm">Aucune donnée</div>
                      ) : (
                        topDepartments.map((d, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-on-surface-variant">
                              <span className="font-medium truncate max-w-[150px]">{d.name}</span>
                              <span>{d.count} visite(s)</span>
                            </div>
                            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${Math.round((d.count / maxDeptCount) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. AGENTS LIST TAB */}
            {activeSection === 'agents' && (
              <section className="space-y-5 md:space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Gestion des agents</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm">Liste des utilisateurs, gestion des rôles et statuts actifs</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateUserModal(true)}
                    className="bg-primary text-black font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span> Nouvel agent
                  </button>
                </div>

                <div className="glass-card rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="bg-surface-container/50 dark:bg-surface-container/50 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nom</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rôle</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-on-surface-variant">Chargement...</td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-on-surface-variant">Aucun agent trouvé</td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const isSelf = u._id === currentUser?._id;
                          return (
                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                {u.prenom || ''} {u.nom}
                              </td>
                              <td className="px-4 py-3 text-sm text-on-surface-variant">{u.email}</td>
                              <td className="px-4 py-3">
                                <select 
                                  value={u.role}
                                  onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                  disabled={isSelf}
                                  className="bg-surface-container border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white disabled:opacity-50"
                                >
                                  <option value="AGENT">Agent</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={() => !isSelf && handleToggleUserActif(u._id, u.isActif)}
                                  disabled={isSelf}
                                  className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${u.isActif ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'} disabled:opacity-50`}
                                >
                                  {u.isActif ? 'Actif' : 'Inactif'}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={isSelf}
                                  className="text-red-400 hover:scale-105 transition-transform disabled:opacity-30"
                                >
                                  <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 3. HISTORY LOGS TAB */}
            {activeSection === 'documents' && (
              <section className="space-y-5 md:space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Historique des visites</h2>
                  <p className="text-on-surface-variant text-xs md:text-sm">Toutes les entrées et sorties</p>
                </div>
                <div className="glass-card rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead className="bg-surface-container/50 dark:bg-surface-container/50 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Visiteur</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pièce</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Entrée</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sortie</th>
                        <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-on-surface-variant">Chargement...</td>
                        </tr>
                      ) : visits.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-on-surface-variant">Aucune visite enregistrée</td>
                        </tr>
                      ) : (
                        visits.map((v) => {
                          const vis = v.visiteurId || { prenom: '', nom: '', numeroPiece: '' };
                          const isPresent = v.statut === 'EN_COURS' || (!v.heureSortie && v.statut !== 'SORTI');
                          return (
                            <tr key={v._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                {vis.prenom || ''} {vis.nom || ''}
                              </td>
                              <td className="px-4 py-3 font-mono text-on-surface-variant text-sm">{vis.numeroPiece || '-'}</td>
                              <td className="px-4 py-3 text-sm">{new Date(v.heureEntree).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">{v.heureSortie ? new Date(v.heureSortie).toLocaleString() : '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPresent ? 'bg-primary/10 text-primary' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {isPresent ? 'En cours' : 'Sorti'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 4. PARAMETERS TAB */}
            {activeSection === 'settings' && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h2>
                  <p className="text-on-surface-variant text-sm">Gérez votre profil administratif et la sécurité</p>
                </div>
                <div className="max-w-3xl glass-card rounded-xl">
                  {/* Photo profiling */}
                  <div className="p-5 md:p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Photo de profil</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <img 
                        className="w-14 h-14 rounded-xl border border-white/10" 
                        alt="Avatar"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS1Xw_lSZEYTQYot3088IFIZaXLvRiiAl78S4OruwuTWtrJpSTz8tP6xbskjrQXEZGz8djlHSXnNIh8vvQyljjMwLsj2bZUcNuXJnC48vuHrwdhXdSxIjyWcXmLLounhz_s-PtmovI2U5V0YAAIQiRMZTw-VK88vHAG2KImkHkXs37SBxrgPQvQucp6maj2dtLGVtBAQs8BQec0nwQRS99m38lCdlr9625KtJLlPEuv1HaF1kYfLBFNG6jZ--0hjYFFzEaBYnwsIW-"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setErrorMsg("Fonctionnalité à venir")} 
                          className="bg-primary text-black text-sm font-bold px-4 py-2 rounded-lg"
                        >
                          Changer photo
                        </button>
                        <button 
                          onClick={() => setErrorMsg("Fonctionnalité à venir")} 
                          className="text-red-400 text-sm font-bold hover:bg-white/5 px-3 py-2 rounded-lg"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form information updates */}
                  <div className="p-5 md:p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Nom</label>
                        <input 
                          type="text" 
                          value={profileNom} 
                          onChange={(e) => setProfileNom(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Prénom</label>
                        <input 
                          type="text" 
                          value={profilePrenom} 
                          onChange={(e) => setProfilePrenom(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Email</label>
                        <input 
                          type="email" 
                          value={profileEmail} 
                          disabled 
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container/50 border-white/5 text-on-surface-variant opacity-60 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Téléphone</label>
                        <input 
                          type="tel" 
                          value={profileTelephone} 
                          onChange={(e) => setProfileTelephone(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Département</label>
                        <input 
                          type="text" 
                          value={profileDepartement} 
                          onChange={(e) => setProfileDepartement(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Poste</label>
                        <input 
                          type="text" 
                          value={profilePoste} 
                          onChange={(e) => setProfilePoste(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Niveau d'accréditation</label>
                        <select 
                          value={profileAccreditation}
                          onChange={(e) => setProfileAccreditation(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Niveau 1">Niveau 1</option>
                          <option value="Niveau 2">Niveau 2</option>
                          <option value="Niveau 3 - Admin">Niveau 3 - Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Date d'arrivée</label>
                        <input 
                          type="date" 
                          value={profileDateArrivee} 
                          onChange={(e) => setProfileDateArrivee(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security panel */}
                  <div className="p-5 md:p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sécurité</h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-between items-center p-3 bg-surface-container/50 dark:bg-surface-container/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">Authentification à deux facteurs (2FA)</p>
                          <p className="text-xs text-on-surface-variant">Renforce la sécurité de votre compte</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={profileTwoFactor}
                            onChange={() => setProfileTwoFactor(!profileTwoFactor)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex flex-wrap justify-between items-center p-3 bg-surface-container/50 dark:bg-surface-container/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">SSO (Okta / Google)</p>
                          <p className="text-xs text-on-surface-variant">Connectez-vous avec votre compte d'entreprise</p>
                        </div>
                        <button 
                          onClick={() => setErrorMsg("Configuration SSO bientôt disponible.")}
                          className="text-primary text-sm border-b border-primary"
                        >
                          Configurer
                        </button>
                      </div>

                      <div className="flex flex-wrap justify-between items-center p-3 bg-surface-container/50 dark:bg-surface-container/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">Sessions actives</p>
                          <p className="text-xs text-on-surface-variant">Gérez vos appareils connectés</p>
                        </div>
                        <button 
                          onClick={() => setErrorMsg("Fonctionnalité à venir.")}
                          className="text-primary text-sm border-b border-primary"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Action */}
                  <div className="p-5 bg-surface-container/30 dark:bg-surface-container/30 text-right">
                    <button 
                      onClick={handleSaveProfile}
                      className="bg-primary text-black font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Create Agent Account Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay active" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-white">Créer un agent</h3>
              <button onClick={() => setShowCreateUserModal(false)}>
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>
            <div className="modal-body text-left space-y-3">
              <input 
                type="text" 
                value={newNom}
                onChange={(e) => setNewNom(e.target.value)}
                placeholder="Nom" 
                className="w-full border border-white/10 rounded-lg p-2 bg-surface-container text-white focus:outline-none focus:border-primary text-sm"
              />
              <input 
                type="text" 
                value={newPrenom}
                onChange={(e) => setNewPrenom(e.target.value)}
                placeholder="Prénom" 
                className="w-full border border-white/10 rounded-lg p-2 bg-surface-container text-white focus:outline-none focus:border-primary text-sm"
              />
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email" 
                className="w-full border border-white/10 rounded-lg p-2 bg-surface-container text-white focus:outline-none focus:border-primary text-sm"
              />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mot de passe" 
                className="w-full border border-white/10 rounded-lg p-2 bg-surface-container text-white focus:outline-none focus:border-primary text-sm"
              />
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-white/10 rounded-lg p-2 bg-surface-container text-white focus:outline-none focus:border-primary text-sm"
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="modal-footer justify-end gap-2">
              <button 
                onClick={() => setShowCreateUserModal(false)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleCreateAgentSubmit}
                className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {successMsg && (
        <div className="modal-overlay active" onClick={() => setSuccessMsg(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-7xl">check_circle</span>
              <h3 className="text-xl font-bold mt-4 text-white">Succès</h3>
              <p className="text-on-surface-variant mt-2 text-sm">{successMsg}</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setSuccessMsg(null)}
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Modal */}
      {errorMsg && (
        <div className="modal-overlay active" onClick={() => setErrorMsg(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-red-400 text-7xl">error</span>
              <h3 className="text-xl font-bold mt-4 text-white">Erreur</h3>
              <p className="text-on-surface-variant mt-2 text-sm">{errorMsg}</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setErrorMsg(null)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
