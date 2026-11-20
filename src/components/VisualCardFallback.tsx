import React from 'react';
import { VisualCardStyle } from '../data/workshops';

interface VisualCardFallbackProps {
  title: string;
  subtitle: string;
  selections: { step1: string; step2: string; step3: string };
  visualStyle?: VisualCardStyle;
  imageUrl?: string;
}

export const VisualCardFallback: React.FC<VisualCardFallbackProps> = ({
  title,
  subtitle,
  selections,
  visualStyle = 'painting',
  imageUrl,
}) => {
  if (imageUrl) {
    return (
      <div className="mb-8 overflow-hidden rounded-2xl border-4 border-slate-900 dark:border-slate-200 bg-slate-100 dark:bg-slate-900 shadow-md">
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full max-h-[440px] object-cover"
        />
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-900 dark:border-slate-200 text-center font-medium">
          Illustration créée pour : {title}
        </div>
      </div>
    );
  }

  // Stylized high-contrast SVG & layout cards tailored to each visual workshop
  if (visualStyle === 'coloring-page') {
    return (
      <div
        className="mb-8 p-6 md:p-8 rounded-2xl border-4 border-black bg-white text-black shadow-sm"
        aria-label={`Planche de coloriage à imprimer : ${title}`}
      >
        <div className="text-center border-b-2 border-dashed border-black pb-4 mb-6">
          <p className="text-sm font-bold tracking-wider uppercase">CAHIER DE COLORIAGE ALPHABETTE — PRÊT À IMPRIMER</p>
          <h3 className="text-2xl font-bold mt-1">{selections.step1}</h3>
        </div>
        <div className="flex justify-center items-center py-4">
          <svg
            viewBox="0 0 500 320"
            className="w-full max-w-lg h-auto"
            fill="none"
            stroke="#000000"
            strokeWidth={selections.step2.toLowerCase().includes('épais') ? '5' : '3.5'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sun & clouds */}
            <circle cx="90" cy="70" r="34" />
            <line x1="90" y1="20" x2="90" y2="8" />
            <line x1="90" y1="132" x2="90" y2="120" />
            <line x1="40" y1="70" x2="28" y2="70" />
            <line x1="152" y1="70" x2="140" y2="70" />
            <line x1="54" y1="34" x2="44" y2="24" />
            <line x1="136" y1="116" x2="126" y2="106" />
            <line x1="126" y1="34" x2="136" y2="24" />
            <line x1="44" y1="116" x2="54" y2="106" />

            {/* Decorative botanical mandala / garden centerpiece */}
            <circle cx="250" cy="175" r="32" />
            <circle cx="250" cy="175" r="14" />
            {/* Petals */}
            <ellipse cx="250" cy="110" rx="22" ry="35" />
            <ellipse cx="250" cy="240" rx="22" ry="35" />
            <ellipse cx="185" cy="175" rx="35" ry="22" />
            <ellipse cx="315" cy="175" rx="35" ry="22" />
            <ellipse cx="204" cy="129" rx="22" ry="32" transform="rotate(-45 204 129)" />
            <ellipse cx="296" cy="221" rx="22" ry="32" transform="rotate(-45 296 221)" />
            <ellipse cx="296" cy="129" rx="22" ry="32" transform="rotate(45 296 129)" />
            <ellipse cx="204" cy="221" rx="22" ry="32" transform="rotate(45 204 221)" />

            {/* Friendly butterfly & bird outlines */}
            <path d="M390 85 C415 55, 445 65, 425 95 C445 115, 415 130, 390 105 Z" />
            <path d="M390 85 C365 55, 335 65, 355 95 C335 115, 365 130, 390 105 Z" />
            <line x1="390" y1="75" x2="390" y2="115" />

            {/* Garden hills & leaves */}
            <path d="M20 295 Q 140 260, 250 295 T 480 295" />
            <path d="M70 285 C 70 235, 115 235, 115 285 Z" />
            <path d="M380 285 C 380 235, 425 235, 425 285 Z" />
          </svg>
        </div>
        <p className="text-center text-base font-semibold mt-2">
          Traits noirs haute visibilité · Cliquez sur « Imprimer / PDF » ci-dessous pour colorier sur papier
        </p>
      </div>
    );
  }

  if (visualStyle === 'newspaper') {
    return (
      <div className="mb-8 p-6 md:p-8 rounded-2xl border-4 border-amber-950 dark:border-amber-300 bg-amber-50/90 dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-sm">
        <div className="border-b-4 border-double border-amber-950 dark:border-amber-300 pb-4 mb-4 text-center">
          <p className="text-sm font-bold tracking-widest uppercase">JOURNAL FAMILIAL OFFICIEL · ÉDITION SPÉCIALE</p>
          <h3 className="text-3xl md:text-4xl font-serif-title font-bold mt-1">LA GAZETTE DE LA FAMILLE</h3>
          <p className="text-base font-medium mt-1">{selections.step3} · Numéro Collector</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-400">
            <p className="text-sm font-bold uppercase text-amber-900 dark:text-amber-300">À LA UNE</p>
            <p className="text-xl font-bold mt-1">{selections.step1}</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-400">
            <p className="text-sm font-bold uppercase text-amber-900 dark:text-amber-300">RUBRIQUE DU JOUR</p>
            <p className="text-xl font-bold mt-1">{selections.step2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (visualStyle === 'event-poster') {
    return (
      <div className="mb-8 p-6 md:p-8 rounded-2xl border-4 border-emerald-900 dark:border-emerald-300 bg-emerald-50 dark:bg-slate-900 text-slate-950 dark:text-white text-center shadow-sm">
        <p className="text-base font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
          ★ AFFICHE D’INVITATION ★
        </p>
        <h3 className="text-3xl md:text-4xl font-serif-title font-bold mt-3 mb-3">{selections.step1}</h3>
        <div className="inline-block px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-900 dark:border-emerald-300 font-bold text-xl my-2">
          📅 {selections.step2}
        </div>
        <p className="text-lg font-medium mt-3">{selections.step3}</p>
      </div>
    );
  }

  if (visualStyle === 'knitting-pattern') {
    return (
      <div className="mb-8 p-6 md:p-8 rounded-2xl border-4 border-rose-900 dark:border-rose-300 bg-rose-50/70 dark:bg-slate-900 text-slate-950 dark:text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
              PLANCHE D’INSPIRATION TEXTILE & TRICOT
            </p>
            <h3 className="text-2xl font-bold mt-1">{selections.step3}</h3>
            <p className="text-lg mt-1">{selections.step1} · {selections.step2}</p>
          </div>
          <div className="flex items-center gap-3" aria-label="Échantillon de couleurs">
            <div className="w-14 h-14 rounded-full bg-rose-300 border-2 border-slate-900 dark:border-white shadow-inner" />
            <div className="w-14 h-14 rounded-full bg-amber-200 border-2 border-slate-900 dark:border-white shadow-inner" />
            <div className="w-14 h-14 rounded-full bg-sky-200 border-2 border-slate-900 dark:border-white shadow-inner" />
            <div className="w-14 h-14 rounded-full bg-emerald-200 border-2 border-slate-900 dark:border-white shadow-inner" />
          </div>
        </div>
      </div>
    );
  }

  // Default artistic framed illustration card (Painting, Storybook, Greeting Card, Garden, Thought Card, Recipe)
  return (
    <div className="mb-8 p-6 md:p-8 rounded-2xl border-4 border-blue-900 dark:border-amber-300 bg-gradient-to-br from-amber-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-950 dark:text-white shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-amber-300 flex items-center justify-center shrink-0 shadow-sm">
          <svg
            viewBox="0 0 120 120"
            className="w-24 h-24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="8" y="8" width="104" height="104" rx="16" fill="#FEF3C7" stroke="#1E3A8A" strokeWidth="4" />
            <circle cx="40" cy="40" r="14" fill="#F59E0B" />
            <path d="M16 92 L48 60 L72 82 L90 66 L104 92 Z" fill="#10B981" stroke="#065F46" strokeWidth="3" />
          </svg>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-950 dark:text-amber-300">
            CRÉATION ILLUSTRÉE ALPHABETTE
          </p>
          <h3 className="text-2xl md:text-3xl font-serif-title font-bold mt-1">{title}</h3>
          <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-1">{subtitle}</p>
          <p className="text-base text-slate-700 dark:text-slate-300 mt-2">
            Choix réunis : {selections.step1} · {selections.step2} · {selections.step3}
          </p>
        </div>
      </div>
    </div>
  );
};
