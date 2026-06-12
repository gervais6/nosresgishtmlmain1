import React, { useState, useEffect } from 'react';

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

interface SettingsTabProps {
  currentUser: CurrentAgent | null;
  onSave: (payload: any) => Promise<void>;
  onErrorMsg: (msg: string) => void;
}

export default function SettingsTab({
  currentUser,
  onSave,
  onErrorMsg,
}: SettingsTabProps) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [departement, setDepartement] = useState('');
  const [poste, setPoste] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [dateArrivee, setDateArrivee] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNom(currentUser.nom || '');
      setPrenom(currentUser.prenom || '');
      setEmail(currentUser.email || '');
      setTelephone(currentUser.telephone || '');
      setDepartement(currentUser.departement || '');
      setPoste(currentUser.poste || '');
      setAccreditation(currentUser.niveauAccreditation || '');
      if (currentUser.dateArrivee) {
        setDateArrivee(new Date(currentUser.dateArrivee).toISOString().slice(0, 10));
      }
      setTwoFactor(!!currentUser.twoFactorEnabled);
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    const payload = {
      nom,
      prenom,
      telephone,
      departement,
      poste,
      niveauAccreditation: accreditation,
      dateArrivee: dateArrivee || null,
      twoFactorEnabled: twoFactor,
    };
    await onSave(payload);
  };

  return (
    <div className="max-w-3xl glass-card rounded-xl text-left">
      {/* Photo Section */}
      <div className="p-5 md:p-6 border-b border-white/5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Photo de profil</h3>
        <div className="flex flex-wrap items-center gap-4">
          <img 
            className="w-14 h-14 rounded-xl border border-white/10" 
            alt="Profil"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS1Xw_lSZEYTQYot3088IFIZaXLvRiiAl78S4OruwuTWtrJpSTz8tP6xbskjrQXEZGz8djlHSXnNIh8vvQyljjMwLsj2bZUcNuXJnC48vuHrwdhXdSxIjyWcXmLLounhz_s-PtmovI2U5V0YAAIQiRMZTw-VK88vHAG2KImkHkXs37SBxrgPQvQucp6maj2dtLGVtBAQs8BQec0nwQRS99m38lCdlr9625KtJLlPEuv1HaF1kYfLBFNG6jZ--0hjYFFzEaBYnwsIW-"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => onErrorMsg("Fonctionnalité de téléchargement de photo à venir.")} 
              className="bg-primary text-black text-sm font-bold px-4 py-2 rounded-lg cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            >
              Changer photo
            </button>
            <button 
              onClick={() => onErrorMsg("Fonctionnalité à venir.")}
              className="text-red-400 text-sm font-bold hover:bg-white/5 px-3 py-2 rounded-lg cursor-pointer"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* General Infos Form */}
      <div className="p-5 md:p-6 border-b border-white/5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Nom</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
              placeholder="Nom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Prénom</label>
            <input 
              type="text" 
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
              placeholder="Prénom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Email (Non modifiable)</label>
            <input 
              type="email" 
              value={email} 
              disabled
              className="w-full border rounded-lg p-3 text-sm bg-surface-container/50 border-white/5 text-on-surface-variant opacity-60 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Téléphone</label>
            <input 
              type="tel" 
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
              placeholder="+226 XX XX XX XX"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Département</label>
            <input 
              type="text" 
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
              placeholder="Ex: RH, IT, Logistique"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Poste</label>
            <input 
              type="text" 
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
              placeholder="Ex: Agent de sécurité"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Niveau d'accréditation</label>
            <select 
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
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
              value={dateArrivee}
              onChange={(e) => setDateArrivee(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm bg-surface-container border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary" 
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
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
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
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
              onClick={() => onErrorMsg("Configuration SSO réservée aux administrateurs.")}
              className="text-primary text-sm border-b border-primary cursor-pointer"
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
              onClick={() => onErrorMsg("Fonctionnalité à venir.")}
              className="text-primary text-sm border-b border-primary cursor-pointer"
            >
              Voir
            </button>
          </div>
        </div>
      </div>

      {/* Form Action */}
      <div className="p-5 bg-surface-container/30 dark:bg-surface-container/30 text-right">
        <button 
          onClick={handleSubmit}
          className="bg-primary text-black font-bold px-6 py-2.5 rounded-lg cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
