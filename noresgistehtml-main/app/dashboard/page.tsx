'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Reusable Components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import StatsRow from '@/components/dashboard/StatsRow';
import VisitsTable from '@/components/dashboard/VisitsTable';
import HistoryTable from '@/components/dashboard/HistoryTable';
import SettingsTab from '@/components/dashboard/SettingsTab';
import ScanModal from '@/components/dashboard/ScanModal';
import ConfirmModal from '@/components/dashboard/ConfirmModal';
import DetailModal from '@/components/dashboard/DetailModal';
import NotificationModals from '@/components/dashboard/NotificationModals';

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
  vehicule?: string;
  type?: string;
}

interface CurrentAgent {
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

export default function AgentDashboardPage() {
  const router = useRouter();

  // Navigation & Layout
  const [activeSection, setActiveSection] = useState<'dashboard' | 'documents' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States for Visites data
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentAgent | null>(null);
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [isPOSDevice, setIsPOSDevice] = useState(false);

  // Filters & Pagination
  const [typeFilter, setTypeFilter] = useState<'all' | 'person' | 'vehicule'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'sorti'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals Visibility
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingVisitorData, setPendingVisitorData] = useState<any>(null);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API_BASE = 'https://noregisbackend.onrender.com/api';

  // Session token loading
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
    if (typeof window !== 'undefined') {
      setIsPOSDevice(!!(window as any).WizarPOSBridge);
    }
  }, []);

  // Listen for WizarPOS NFC scan events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onNFCResult = (dataStr: string) => {
        try {
          const parsedData = JSON.parse(dataStr);
          handleScanComplete(parsedData);
          setSuccessMsg("Données de la pièce lues avec succès depuis le terminal POS");
        } catch (e) {
          console.error("Failed to parse NFC data:", e);
          setErrorMsg("Erreur de décodage des données NFC");
        }
      };

      (window as any).onNFCError = (errorMsg: string) => {
        setErrorMsg(`Erreur du lecteur NFC : ${errorMsg}`);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).onNFCResult;
        delete (window as any).onNFCError;
      }
    };
  }, []);

  // Load logic polling
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
      // Fetch profile
      const profData = await apiFetch('/auth/profil');
      setCurrentUser(profData.utilisateur);

      // Fetch visits
      const visitsData = await apiFetch('/visites?limit=500');
      setAllVisits(visitsData.visites || []);
    } catch (err: any) {
      console.warn('Erreur chargement données dashboard:', err.message);
    } finally {
      setLoadingVisits(false);
    }
  };

  // Stats Computations
  const totalEntries = allVisits.length;
  const currentlyInside = allVisits.filter(v => {
    const s = String(v.statut || '').toLowerCase();
    return (s === 'present' || s === 'en-cours' || s === 'en cours' || s === 'on-site') || (!v.heureSortie && s !== 'sorti' && s !== 'sortis');
  }).length;
  const totalExits = allVisits.filter(v => {
    const s = String(v.statut || '').toLowerCase();
    return s === 'sorti' || s === 'sortis' || s === 'exited' || s === 'terminé' || v.heureSortie;
  }).length;

  // Filter lists
  const getFilteredVisits = () => {
    let filtered = [...allVisits];
    if (typeFilter === 'person') {
      filtered = filtered.filter(v => !v.vehicule && v.type !== 'vehicule');
    } else if (typeFilter === 'vehicule') {
      filtered = filtered.filter(v => v.vehicule || v.type === 'vehicule');
    }

    if (statusFilter === 'present') {
      filtered = filtered.filter(v => {
        const s = String(v.statut || '').toLowerCase();
        return (s === 'present' || s === 'en-cours' || s === 'en cours' || s === 'on-site') || (!v.heureSortie && s !== 'sorti' && s !== 'sortis');
      });
    } else if (statusFilter === 'sorti') {
      filtered = filtered.filter(v => {
        const s = String(v.statut || '').toLowerCase();
        return s === 'sorti' || s === 'sortis' || s === 'exited' || s === 'terminé' || v.heureSortie;
      });
    }
    return filtered;
  };

  const filteredVisits = getFilteredVisits();
  const totalPages = Math.ceil(filteredVisits.length / rowsPerPage);
  const paginatedVisits = filteredVisits.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Action handlings
  const handleEnregistrerSortie = async (visiteId: string) => {
    try {
      await apiFetch(`/visites/sortie/${visiteId}`, { method: 'POST' });
      setSuccessMsg('Sortie enregistrée avec succès');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteVisite = async (visiteId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette visite ?')) {
      try {
        await apiFetch(`/visites/${visiteId}`, { method: 'DELETE' });
        setSuccessMsg('Visite supprimée');
        loadAllData();
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    }
  };

  const handleDeleteVisitor = async (visitorId: string) => {
    try {
      await apiFetch(`/visiteurs/${visitorId}`, { method: 'DELETE' });
      setSuccessMsg('Visiteur supprimé');
      setShowDetailModal(false);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSaveProfile = async (payload: any) => {
    try {
      await apiFetch('/auth/profil', { method: 'PUT', body: JSON.stringify(payload) });
      setSuccessMsg('Profil mis à jour avec succès');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleExportCsv = () => {
    let csv = "Visiteur,NIN,Entrée,Sortie,Statut\n";
    allVisits.forEach(v => {
      const vis = v.visiteurId || { prenom: '', nom: '', numeroPiece: '' };
      csv += `"${vis.prenom || ''} ${vis.nom || ''}",${vis.numeroPiece || ''},${new Date(v.heureEntree).toLocaleString()},${v.heureSortie ? new Date(v.heureSortie).toLocaleString() : ''},${v.statut}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "visites.csv";
    a.click();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleScanComplete = (data: any) => {
    setPendingVisitorData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmEnregistrement = async () => {
    if (!pendingVisitorData) return;
    setShowConfirmModal(false);
    
    let nom = (pendingVisitorData.nom || '').trim();
    let prenom = (pendingVisitorData.prenom || '').trim();
    let numeroPiece = pendingVisitorData.numeroPiece || `TEMP_${Date.now()}`;
    let sexe = (pendingVisitorData.sexe || 'M').toUpperCase();
    if (sexe !== 'M' && sexe !== 'F') sexe = 'M';
    
    let taille = pendingVisitorData.taille ? parseInt(pendingVisitorData.taille, 10) : null;
    if (taille !== null && (taille < 50 || taille > 300)) taille = null;
    
    let dateNaissance = pendingVisitorData.dateNaissance || null;
    if (dateNaissance && typeof dateNaissance === 'string' && dateNaissance.includes('/')) {
      const parts = dateNaissance.split('/');
      if (parts.length === 3) dateNaissance = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const visitorPayload = {
      nom: nom || "Visiteur",
      prenom: prenom || "Inconnu",
      numeroPiece: numeroPiece,
      typePiece: pendingVisitorData.typePiece || 'CNI',
      dateNaissance,
      lieuNaissance: pendingVisitorData.lieuNaissance || '',
      sexe,
      taille,
      dateDelivrance: pendingVisitorData.dateDelivrance || null,
      dateExpiration: pendingVisitorData.dateExpiration || null,
      centreEnregistrement: pendingVisitorData.centreEnregistrement || '',
      adresseDomicile: pendingVisitorData.adresseDomicile || ''
    };

    try {
      const resVisiteur = await fetch(`${API_BASE}/visiteurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(visitorPayload)
      });
      const visiteurData = await resVisiteur.json();
      if (!visiteurData.success) throw new Error(visiteurData.message);
      
      const visiteurId = visiteurData.id || visiteurData.visiteur?._id;
      
      const visitRes = await apiFetch('/visites/entree', {
        method: 'POST',
        body: JSON.stringify({
          visiteurId,
          personneVisitee: currentUser?.nom || "Agent",
          service: "Accueil",
          motif: "Enregistrement POS"
        })
      });

      // print receipt badge automatically on POS devices
      if (typeof window !== 'undefined' && (window as any).WizarPOSBridge) {
        const formattedDate = new Date().toLocaleString('fr-FR');
        const visitorName = `${prenom} ${nom}`;
        const qrCodeValue = visitRes.visite?._id || visiteurId || numeroPiece;
        (window as any).WizarPOSBridge.printVisitorBadge(visitorName, formattedDate, qrCodeValue);
      }

      setSuccessMsg(`Visiteur ${visitorPayload.prenom} ${visitorPayload.nom} enregistré avec succès (NIN: ${numeroPiece})`);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erreur enregistrement: ${err.message}`);
    } finally {
      setPendingVisitorData(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingVisitorData(null);
    setErrorMsg("Enregistrement annulé.");
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-surface dark:bg-surface text-on-surface">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Header 
          activeSection={activeSection}
          setSidebarOpen={setSidebarOpen}
          currentUser={currentUser}
        />

        <main className="flex-grow p-3 md:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* 1. DASHBOARD VIEW */}
            {activeSection === 'dashboard' && (
              <section className="space-y-5 md:space-y-6">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Réception des visiteurs</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm">Badgez les entrées / sorties</p>
                  </div>
                  <button 
                    onClick={handleExportCsv}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs md:text-sm font-medium hover:bg-white/5 text-gray-900 dark:text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base md:text-lg">download</span>
                    <span className="hidden sm:inline">Exporter CSV</span>
                  </button>
                </div>

                <StatsRow 
                  totalEntries={totalEntries}
                  currentlyInside={currentlyInside}
                  totalExits={totalExits}
                />

                <VisitsTable 
                  loadingVisits={loadingVisits}
                  paginatedVisits={paginatedVisits}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  filteredVisitsCount={filteredVisits.length}
                  rowsPerPage={rowsPerPage}
                  onViewDetails={(v) => { setSelectedVisit(v); setShowDetailModal(true); }}
                  onRegisterExit={handleEnregistrerSortie}
                  onDeleteVisit={handleDeleteVisite}
                />
              </section>
            )}

            {/* 2. HISTORY VIEW */}
            {activeSection === 'documents' && (
              <section className="space-y-5 md:space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Historique des visites</h2>
                  <p className="text-on-surface-variant text-xs md:text-sm">Toutes les entrées et sorties</p>
                </div>
                <HistoryTable 
                  loadingVisits={loadingVisits}
                  allVisits={allVisits}
                />
              </section>
            )}

            {/* 3. SETTINGS VIEW */}
            {activeSection === 'settings' && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h2>
                  <p className="text-on-surface-variant text-sm">Gérez votre profil et la sécurité</p>
                </div>
                <SettingsTab 
                  currentUser={currentUser}
                  onSave={handleSaveProfile}
                  onErrorMsg={setErrorMsg}
                />
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Scan Button */}
      {activeSection === 'dashboard' && (
        <button 
          onClick={() => setShowScanModal(true)}
          className="fixed bottom-5 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-black rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl">badge</span>
        </button>
      )}

      {/* Modals orchestration */}
      <ScanModal 
        show={showScanModal}
        onClose={() => setShowScanModal(false)}
        token={token}
        onScanComplete={handleScanComplete}
        onError={setErrorMsg}
        isPOSDevice={isPOSDevice}
      />

      <ConfirmModal 
        show={showConfirmModal}
        pendingData={pendingVisitorData}
        onConfirm={handleConfirmEnregistrement}
        onCancel={handleCancelConfirm}
      />

      <DetailModal 
        show={showDetailModal}
        selectedVisit={selectedVisit}
        onClose={() => setShowDetailModal(false)}
        onDeleteVisitor={handleDeleteVisitor}
      />

      <NotificationModals 
        successMsg={successMsg}
        setSuccessMsg={setSuccessMsg}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    </div>
  );
}
