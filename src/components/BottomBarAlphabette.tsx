import React from 'react';
import { ArrowLeft, FolderHeart, Volume2, VolumeX, Mic } from 'lucide-react';

interface BottomBarAlphabetteProps {
  canGoBack: boolean;
  onGoBack: () => void;
  onOpenGallery: () => void;
  savedCount: number;
  isGalleryActive: boolean;
  isSpeaking: boolean;
  onToggleSpeakScreen: () => void;
  isListening: boolean;
  onToggleDictate: () => void;
  isHiddenOnScroll?: boolean;
}

export const BottomBarAlphabette: React.FC<BottomBarAlphabetteProps> = ({
  canGoBack,
  onGoBack,
  onOpenGallery,
  savedCount,
  isGalleryActive,
  isSpeaking,
  onToggleSpeakScreen,
  isListening,
  onToggleDictate,
  isHiddenOnScroll = false,
}) => {
  return (
    <nav
      className={`no-print fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t-4 border-slate-900 dark:border-amber-300 shadow-lg transition-transform duration-200 ${
        isHiddenOnScroll ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      aria-label="Barre d'actions permanente Alphabette"
    >
      <div className="max-w-6xl mx-auto px-2.5 py-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* 1. Bouton Retour */}
        <button
          type="button"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="min-h-[54px] md:min-h-[62px] px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-45 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer overflow-hidden"
          aria-label="Retour à l'écran précédent"
        >
          <ArrowLeft className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span className="text-base sm:text-lg md:text-xl truncate">Retour</span>
        </button>

        {/* 2. Bouton Mes Créations */}
        <button
          type="button"
          onClick={onOpenGallery}
          className={`min-h-[54px] md:min-h-[62px] px-2.5 py-1.5 rounded-2xl font-bold border-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer overflow-hidden ${
            isGalleryActive
              ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950 dark:border-white'
              : 'bg-amber-50 hover:bg-amber-100 text-slate-950 border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-amber-300'
          }`}
          aria-label={`Mes Créations sauvegardées (${savedCount})`}
        >
          <FolderHeart className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden="true" />
          <span className="text-base sm:text-lg md:text-xl whitespace-nowrap">
            Album ({savedCount})
          </span>
        </button>

        {/* 3. Bouton Lire à voix haute */}
        <button
          type="button"
          onClick={onToggleSpeakScreen}
          className={`min-h-[54px] md:min-h-[62px] px-2.5 py-1.5 rounded-2xl font-bold border-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer overflow-hidden ${
            isSpeaking
              ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-200 dark:border-emerald-400'
          }`}
          aria-label={isSpeaking ? 'Arrêter la lecture à voix haute' : 'Lire à voix haute'}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-6 h-6 shrink-0" aria-hidden="true" />
              <span className="text-base sm:text-lg md:text-xl truncate">Arrêter</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
              <span className="text-base sm:text-lg md:text-xl truncate">Écouter</span>
            </>
          )}
        </button>

        {/* 4. Bouton Dicter */}
        <button
          type="button"
          onClick={onToggleDictate}
          className={`min-h-[54px] md:min-h-[62px] px-2.5 py-1.5 rounded-2xl font-bold border-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer overflow-hidden ${
            isListening
              ? 'bg-rose-800 text-white border-slate-950 dark:bg-rose-400 dark:text-slate-950'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-200 dark:border-rose-400'
          }`}
          aria-label={isListening ? 'Arrêter la dictée vocale' : 'Dicter à voix haute'}
        >
          <Mic className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span className="text-base sm:text-lg md:text-xl truncate">
            {isListening ? 'Écoute...' : 'Dicter'}
          </span>
        </button>
      </div>
    </nav>
  );
};
