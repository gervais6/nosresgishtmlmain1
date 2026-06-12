import React from 'react';

interface StatsRowProps {
  totalEntries: number;
  currentlyInside: number;
  totalExits: number;
}

export default function StatsRow({
  totalEntries,
  currentlyInside,
  totalExits,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
      <div className="stat-card rounded-xl p-4 md:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary">how_to_reg</span>
          </div>
          <span className="text-[10px] md:text-xs text-on-surface-variant font-medium">Total global</span>
        </div>
        <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Total Entrées</p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalEntries}</h3>
      </div>
      <div className="stat-card rounded-xl p-4 md:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary">people</span>
          </div>
          <span className="text-[10px] md:text-xs text-primary font-medium">Actuellement</span>
        </div>
        <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Présents</p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{currentlyInside}</h3>
      </div>
      <div className="stat-card rounded-xl p-4 md:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary">exit_to_app</span>
          </div>
          <span className="text-[10px] md:text-xs text-on-surface-variant font-medium">Total global</span>
        </div>
        <p className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider mb-1">Sorties</p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalExits}</h3>
      </div>
    </div>
  );
}
