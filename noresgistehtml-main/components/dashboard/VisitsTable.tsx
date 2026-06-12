import React from 'react';

interface Visitor {
  _id?: string;
  nom: string;
  prenom: string;
  numeroPiece?: string;
}

interface Visit {
  _id: string;
  heureEntree: string;
  heureSortie?: string;
  statut: string;
  service?: string;
  visiteurId: Visitor;
}

interface VisitsTableProps {
  loadingVisits: boolean;
  paginatedVisits: Visit[];
  typeFilter: 'all' | 'person' | 'vehicule';
  setTypeFilter: (filter: 'all' | 'person' | 'vehicule') => void;
  statusFilter: 'all' | 'present' | 'sorti';
  setStatusFilter: (filter: 'all' | 'present' | 'sorti') => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  filteredVisitsCount: number;
  rowsPerPage: number;
  onViewDetails: (visit: Visit) => void;
  onRegisterExit: (visitId: string) => void;
  onDeleteVisit: (visitId: string) => void;
}

export default function VisitsTable({
  loadingVisits,
  paginatedVisits,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredVisitsCount,
  rowsPerPage,
  onViewDetails,
  onRegisterExit,
  onDeleteVisit,
}: VisitsTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 md:px-6 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
          <button 
            onClick={() => { setTypeFilter('all'); }}
            className={`text-sm font-semibold pb-1 whitespace-nowrap cursor-pointer ${typeFilter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Tous
          </button>
          <button 
            onClick={() => { setTypeFilter('person'); }}
            className={`text-sm font-semibold pb-1 whitespace-nowrap cursor-pointer ${typeFilter === 'person' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Personnes
          </button>
          <button 
            onClick={() => { setTypeFilter('vehicule'); }}
            className={`text-sm font-semibold pb-1 whitespace-nowrap cursor-pointer ${typeFilter === 'vehicule' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Véhicules
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={statusFilter}
            onChange={(e: any) => { setStatusFilter(e.target.value); }}
            className="bg-surface-container border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="present">Présents</option>
            <option value="sorti">Sortis</option>
          </select>
          <div className="text-xs text-on-surface-variant">
            <span>{filteredVisitsCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredVisitsCount)}</span> sur <span>{filteredVisitsCount}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] md:min-w-full text-left">
          <thead className="bg-surface-container/50 dark:bg-surface-container/50 border-b border-white/5">
            <tr>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Heure entrée</th>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Visiteur</th>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">NIN (Pièce)</th>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Service</th>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Statut</th>
              <th className="px-4 md:px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingVisits ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-on-surface-variant">Chargement...</td>
              </tr>
            ) : paginatedVisits.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-on-surface-variant">Aucune visite trouvée</td>
              </tr>
            ) : (
              paginatedVisits.map((v) => {
                const vis = v.visiteurId || { prenom: '', nom: '', numeroPiece: '' };
                const isPresent = v.statut === 'EN_COURS' || (!v.heureSortie && v.statut !== 'SORTI');
                return (
                  <tr key={v._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 md:px-6 py-3 text-sm">{new Date(v.heureEntree).toLocaleTimeString('fr-FR')}</td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                          {(vis.prenom?.[0] || '') + (vis.nom?.[0] || '')}
                        </div>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {vis.prenom || ''} {vis.nom || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-on-surface-variant text-sm hidden sm:table-cell font-mono">{vis.numeroPiece || '-'}</td>
                    <td className="px-4 md:px-6 py-3 text-sm">{v.service || '-'}</td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPresent ? 'bg-primary/10 text-primary' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {isPresent ? 'En cours' : 'Sorti'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={() => onViewDetails(v)}
                          className="text-primary hover:scale-110 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        {isPresent && (
                          <button 
                            onClick={() => onRegisterExit(v._id)}
                            className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xl">exit_to_app</span>
                          </button>
                        )}
                        <button 
                          onClick={() => onDeleteVisit(v._id)}
                          className="text-red-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control */}
      <div className="px-4 md:px-6 py-3 border-t border-white/5 flex justify-between items-center">
        <button 
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-sm text-on-surface-variant disabled:opacity-50 hover:text-primary flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span> Précédent
        </button>
        <div className="text-xs text-on-surface-variant">Page {currentPage} / {totalPages || 1}</div>
        <button 
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-sm text-on-surface-variant disabled:opacity-50 hover:text-primary flex items-center gap-1 cursor-pointer"
        >
          Suivant <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
