import React from 'react';

interface NotificationModalsProps {
  successMsg: string | null;
  setSuccessMsg: (msg: string | null) => void;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
}

export default function NotificationModals({
  successMsg,
  setSuccessMsg,
  errorMsg,
  setErrorMsg,
}: NotificationModalsProps) {
  return (
    <>
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
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-semibold cursor-pointer"
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
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
