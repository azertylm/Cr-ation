import React, { useState } from 'react';
import { SavedCreation } from '../data/workshops';
import {
  BookOpen,
  Volume2,
  Printer,
  Trash2,
  PlusCircle,
  Check,
  X,
} from 'lucide-react';

interface SavedGalleryViewProps {
  creations: SavedCreation[];
  onOpenCreation: (creation: SavedCreation) => void;
  onSpeakCreation: (creation: SavedCreation) => void;
  onDeleteCreation: (id: string) => void;
  onGoHome: () => void;
}

export const SavedGalleryView: React.FC<SavedGalleryViewProps> = ({
  creations,
  onOpenCreation,
  onSpeakCreation,
  onDeleteCreation,
  onGoHome,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-12">
      <div className="p-6 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-amber-50/80 dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white">
            📁 Mes Créations Sauvegardées
          </h1>
          <p className="text-xl text-slate-800 dark:text-slate-200 mt-1">
            Retrouvez ici tous vos souvenirs, contes, poèmes, tableaux et recettes conservés sur votre appareil.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoHome}
          className="min-h-[64px] px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-xl border-2 border-slate-950 dark:border-white flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-7 h-7 shrink-0" aria-hidden="true" />
          <span>Nouvelle création</span>
        </button>
      </div>

      {creations.length === 0 ? (
        <div className="p-10 rounded-3xl border-4 border-dashed border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-6">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            Votre album est prêt à accueillir vos premières créations !
          </p>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
            Choisissez un atelier sur l’écran d’accueil pour créer un conte, un souvenir, un tableau ou une chanson en 3 clics.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[68px] px-8 py-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-xl border-2 border-slate-950 dark:border-white inline-flex items-center gap-3 cursor-pointer"
          >
            <PlusCircle className="w-7 h-7 shrink-0" aria-hidden="true" />
            <span>Découvrir les 20 Ateliers</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {creations.map((item) => {
            const isConfirmingDelete = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className="p-6 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-slate-300 bg-white dark:bg-slate-900 shadow-sm space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {item.workshopEmoji}
                    </span>
                    <div>
                      <p className="text-base font-bold text-blue-900 dark:text-amber-300">
                        {item.workshopTitle} · Créé le {item.createdAt}
                      </p>
                      <h2 className="text-2xl md:text-3xl font-serif-title font-bold text-slate-950 dark:text-white">
                        {item.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="text-xl text-slate-800 dark:text-slate-200 line-clamp-3 whitespace-pre-line">
                  {item.content}
                </p>

                {/* Action buttons on saved card */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenCreation(item)}
                    className="min-h-[64px] px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-lg border-2 border-slate-950 dark:border-white flex items-center gap-2.5 cursor-pointer"
                  >
                    <BookOpen className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Relire en grand</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSpeakCreation(item)}
                    className="min-h-[64px] px-5 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 dark:bg-slate-800 dark:text-emerald-200 font-bold text-lg border-2 border-emerald-900 dark:border-emerald-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Écouter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreation(item);
                      setTimeout(() => window.print(), 250);
                    }}
                    className="min-h-[64px] px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-slate-800 dark:text-amber-200 font-bold text-lg border-2 border-amber-900 dark:border-amber-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Printer className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Imprimer</span>
                  </button>

                  {!isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="min-h-[64px] px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-950 dark:bg-slate-800 dark:text-rose-200 font-bold text-lg border-2 border-rose-900 dark:border-rose-300 flex items-center gap-2.5 ml-auto cursor-pointer"
                      aria-label={`Supprimer ${item.title}`}
                    >
                      <Trash2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                      <span>Supprimer</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 ml-auto p-2 rounded-2xl bg-rose-100 dark:bg-rose-950 border-2 border-rose-900 dark:border-rose-300">
                      <span className="font-bold text-rose-950 dark:text-rose-100 px-2">
                        Confirmer la suppression ?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCreation(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="min-h-[56px] px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-5 h-5" aria-hidden="true" />
                        <span>Oui, supprimer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[56px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold border border-slate-900 flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
