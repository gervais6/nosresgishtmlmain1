import React, { useState, useEffect, useRef } from 'react';

interface ScanModalProps {
  show: boolean;
  onClose: () => void;
  token: string | null;
  onScanComplete: (data: any) => void;
  onError: (msg: string) => void;
  isPOSDevice?: boolean;
}

export default function ScanModal({
  show,
  onClose,
  token,
  onScanComplete,
  onError,
  isPOSDevice = false,
}: ScanModalProps) {
  const [currentSide, setCurrentSide] = useState<'recto' | 'verso'>('recto');
  const [rectoData, setRectoData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ active: boolean; success: boolean } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const API_BASE = 'https://noregisbackend.onrender.com/api';

  useEffect(() => {
    if (show) {
      setRectoData(null);
      setCurrentSide('recto');
      setIsProcessing(false);
      
      // Delay camera initialization slightly to make sure DOM refs are fully bound
      const timer = setTimeout(() => {
        initCamera();
      }, 150);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [show]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const initCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      onError("Caméra indisponible ou autorisation refusée.");
      onClose();
    }
  };

  const showFeedback = (success: boolean) => {
    return new Promise<void>((resolve) => {
      setFeedback({ active: true, success });
      setTimeout(() => {
        setFeedback(null);
        resolve();
      }, 1500);
    });
  };

  const extraireNINDepuisTexte = (texteRaw: string) => {
    if (!texteRaw) return null;
    let match = texteRaw.match(/NIN\s+([\d\s]+)/i);
    if (match) return match[1].replace(/\s/g, '');
    match = texteRaw.match(/N[.\s]*I[.\s]*N[.\s]*([\d\s]+)/i);
    if (match) return match[1].replace(/\s/g, '');
    match = texteRaw.match(/\b(\d{13,15})\b/);
    if (match) return match[1];
    return null;
  };

  const handleCapture = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    );

    if (!blob) {
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      const response = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const infos = data.infosExtraites || {};
      const texteRaw = data.texteRaw || '';

      if (currentSide === 'recto') {
        if (!infos.nom && !infos.prenom) throw new Error("Aucun nom/prénom détecté sur le recto");
        setRectoData(infos);
        await showFeedback(true);
        setCurrentSide('verso');
      } else {
        let nin = extraireNINDepuisTexte(texteRaw);
        if (!nin && infos.numeroPiece) nin = infos.numeroPiece.replace(/\s/g, '');
        if (!nin) throw new Error("Aucun NIN détecté sur le verso");

        const completeData = { ...rectoData, numeroPiece: nin };
        await showFeedback(true);
        onScanComplete(completeData);
      }
    } catch (err: any) {
      console.error(err);
      await showFeedback(false);
      onError(`Scan ${currentSide} échoué : ${err.message}`);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 1100 }}>
      <div className="modal-content flex flex-col bg-black max-w-md w-[92%] h-[550px] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
        <div className="modal-header bg-black/70 backdrop-blur-sm z-10 border-none absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Scanner une pièce d'identité</h3>
          <button onClick={onClose} className="cursor-pointer flex items-center justify-center">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
        
        <div className="modal-body flex-1 flex flex-col p-0 overflow-hidden relative">
          {/* Step indicator */}
          <div className="step-indicator absolute top-16 left-0 right-0 flex justify-center gap-4 bg-black/60 p-2 z-15">
            <div className={`step px-3 py-1 rounded-full text-[10px] font-bold ${currentSide === 'recto' ? 'active bg-primary text-black' : 'text-white/60'}`}>
              📄 1. Recto
            </div>
            <div className={`step px-3 py-1 rounded-full text-[10px] font-bold ${currentSide === 'verso' ? 'active bg-primary text-black' : 'text-white/60'}`}>
              🔄 2. Verso (NIN)
            </div>
          </div>

          {/* Video elements */}
          <video 
            ref={videoRef} 
            className="flex-1 w-full h-full object-cover rounded-none"
            autoPlay 
            playsInline 
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Take snapshot actions */}
          <div className="action-buttons absolute bottom-10 left-0 right-0 bg-transparent flex flex-col items-center gap-3 z-20">
            <div className="flex gap-4">
              <button 
                onClick={handleCapture}
                disabled={isProcessing}
                className="bg-primary text-black border-none font-bold px-8 py-3.5 rounded-full text-lg shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'PROCESS...' : 'Scanner'}
              </button>
              {isPOSDevice ? (
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).WizarPOSBridge) {
                      (window as any).WizarPOSBridge.startNFCScan();
                      onClose();
                    }
                  }}
                  className="bg-yellow-500 text-black border-none font-bold px-8 py-3.5 rounded-full text-lg shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  📟 Lire NFC (POS)
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).onNFCResult) {
                      const mockData = JSON.stringify({
                        nom: "SY",
                        prenom: "Sam",
                        numeroPiece: "B12345678",
                        typePiece: "CNI",
                        sexe: "M",
                        taille: "180",
                        dateNaissance: "1995-05-15",
                        lieuNaissance: "Ouagadougou",
                        adresseDomicile: "Avenue de l'Indépendance"
                      });
                      (window as any).onNFCResult(mockData);
                      onClose();
                    }
                  }}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-bold px-8 py-3.5 rounded-full text-lg shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  📟 Simuler NFC (Dev)
                </button>
              )}
            </div>
          </div>

          {/* Scan Feedback Overlay */}
          {feedback?.active && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 opacity-100 transition-opacity">
              <div className="text-center">
                <span className={`material-symbols-outlined text-9xl ${feedback.success ? 'text-primary' : 'text-red-500'}`}>
                  {feedback.success ? 'check_circle' : 'cancel'}
                </span>
                <p className="text-white mt-2 font-bold">{feedback.success ? 'Scan réussi !' : 'Échec du scan'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
