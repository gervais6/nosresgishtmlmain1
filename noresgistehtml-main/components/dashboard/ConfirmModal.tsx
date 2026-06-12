import React from 'react';

interface ConfirmModalProps {
  show: boolean;
  pendingData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  show,
  pendingData,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!show || !pendingData) return null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-bold text-white">Vérification des données</h3>
          <button onClick={onCancel} className="cursor-pointer">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
        <div className="modal-body text-left">
          <div className="detail-row">
            <div className="detail-label">Nom :</div>
            <div className="detail-value text-white">{pendingData.nom || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Prénom :</div>
            <div className="detail-value text-white">{pendingData.prenom || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">NIN :</div>
            <div className="detail-value font-mono text-white">{pendingData.numeroPiece || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Date naiss. :</div>
            <div className="detail-value text-white">
              {pendingData.dateNaissance ? 
                (pendingData.dateNaissance.includes('-') ? 
                  pendingData.dateNaissance.split('-').reverse().join('/') : 
                  pendingData.dateNaissance) : 
                '-'
              }
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Sexe :</div>
            <div className="detail-value text-white">{pendingData.sexe || '-'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Taille :</div>
            <div className="detail-value text-white">{pendingData.taille ? `${pendingData.taille} cm` : '-'}</div>
          </div>
        </div>
        <div className="modal-footer justify-between">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold cursor-pointer"
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-black rounded-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Confirmer l'enregistrement
          </button>
        </div>
      </div>
    </div>
  );
}
