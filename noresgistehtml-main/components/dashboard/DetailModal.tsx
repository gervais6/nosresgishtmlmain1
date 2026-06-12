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

interface DetailModalProps {
  show: boolean;
  selectedVisit: Visit | null;
  onClose: () => void;
  onDeleteVisitor: (visitorId: string) => void;
}

export default function DetailModal({
  show,
  selectedVisit,
  onClose,
  onDeleteVisitor,
}: DetailModalProps) {
  if (!show || !selectedVisit) return null;

  const vis = selectedVisit.visiteurId || { prenom: '', nom: '', numeroPiece: '', _id: '' };
  const isPresent = selectedVisit.statut === 'EN_COURS' || (!selectedVisit.heureSortie && selectedVisit.statut !== 'SORTI');

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold text-white">Détails de la visite</h3>
          <button onClick={onClose} className="cursor-pointer">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
        <div className="modal-body text-left">
          <div className="detail-row">
            <div className="detail-label">Visiteur :</div>
            <div className="detail-value text-gray-900 dark:text-white">
              {(vis.prenom || '') + ' ' + (vis.nom || '')}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">NIN :</div>
            <div className="detail-value font-mono text-gray-900 dark:text-white">{vis.numeroPiece || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Service :</div>
            <div className="detail-value text-gray-900 dark:text-white">{selectedVisit.service || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Entrée :</div>
            <div className="detail-value text-gray-900 dark:text-white">{new Date(selectedVisit.heureEntree).toLocaleString()}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Sortie :</div>
            <div className="detail-value text-gray-900 dark:text-white">
              {selectedVisit.heureSortie ? new Date(selectedVisit.heureSortie).toLocaleString() : 'Présent sur site'}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Statut :</div>
            <div className="detail-value">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPresent ? 'bg-primary/10 text-primary' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {isPresent ? 'En cours' : 'Sorti'}
              </span>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">ID Visiteur :</div>
            <div className="detail-value font-mono text-xs text-on-surface-variant break-all">{vis._id || '-'}</div>
          </div>
        </div>
        <div className="modal-footer justify-between flex-wrap">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-semibold cursor-pointer"
          >
            Fermer
          </button>
          {vis._id && (
            <button 
              onClick={() => onDeleteVisitor(vis._id!)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2 font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">delete_forever</span>
              <span>Supprimer le visiteur</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
