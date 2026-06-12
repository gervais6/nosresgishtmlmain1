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

interface HistoryTableProps {
  loadingVisits: boolean;
  allVisits: Visit[];
}

export default function HistoryTable({
  loadingVisits,
  allVisits,
}: HistoryTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead className="bg-surface-container/50 dark:bg-surface-container/50 border-b border-white/5">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Visiteur</th>
            <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">NIN</th>
            <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Entrée</th>
            <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sortie</th>
            <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody>
          {loadingVisits ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-on-surface-variant">Chargement...</td>
            </tr>
          ) : allVisits.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-on-surface-variant">Aucun historique de visite</td>
            </tr>
          ) : (
            allVisits.map((v) => {
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
  );
}
