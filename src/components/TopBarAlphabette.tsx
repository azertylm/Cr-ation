import React from 'react';
import { Home, Sun, Moon, ZoomIn, ZoomOut } from 'lucide-react';

interface TopBarAlphabetteProps {
  onGoHome: () => void;
  fontScaleIndex: number;
  maxFontScaleIndex: number;
  onChangeFontScale: (direction: 'up' | 'down') => void;
  highContrastDark: boolean;
  onToggleContrast: () => void;
  isHiddenOnScroll?: boolean;
}

export const TopBarAlphabette: React.FC<TopBarAlphabetteProps> = ({
  onGoHome,
  fontScaleIndex,
  maxFontScaleIndex,
  onChangeFontScale,
  highContrastDark,
  onToggleContrast,
  isHiddenOnScroll = false,
}) => {
  return (
    <header
      className={`no-print sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b-4 border-slate-900 dark:border-amber-300 shadow-sm transition-transform duration-200 ${
        isHiddenOnScroll ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Zone 1: Brand & Accueil */}
        <button
          type="button"
          onClick={onGoHome}
          className="min-h-[50px] sm:min-h-[58px] px-2.5 sm:px-4 py-1.5 rounded-2xl bg-blue-900 hover:bg-blue-800 active:scale-[0.99] text-white dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200 font-bold flex items-center gap-1.5 sm:gap-2 border-2 border-slate-950 dark:border-white transition-transform cursor-pointer shrink-0"
          aria-label="Accueil L'Atelier Alphabette"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden="true" />
          <span className="text-base sm:text-xl tracking-tight whitespace-nowrap">
            Accueil
          </span>
        </button>

        {/* Zone 2 & 3: Accessibility Controls (A- / A+ and Contraste) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className="flex items-center gap-1 sm:gap-1.5"
            role="group"
            aria-label="Réglage de la taille du texte"
          >
            <button
              type="button"
              onClick={() => onChangeFontScale('down')}
              disabled={fontScaleIndex === 0}
              className="min-h-[50px] sm:min-h-[58px] px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
              aria-label="A moins : Réduire la taille du texte"
            >
              <ZoomOut className="w-5 h-5 hidden md:inline shrink-0" aria-hidden="true" />
              <span className="text-base sm:text-lg whitespace-nowrap">A-</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeFontScale('up')}
              disabled={fontScaleIndex === maxFontScaleIndex}
              className="min-h-[50px] sm:min-h-[58px] px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
              aria-label="A plus : Agrandir la taille du texte"
            >
              <ZoomIn className="w-5 h-5 hidden md:inline shrink-0" aria-hidden="true" />
              <span className="text-base sm:text-xl whitespace-nowrap">A+</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleContrast}
            className="min-h-[50px] sm:min-h-[58px] px-2.5 sm:px-4 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold border-2 border-slate-950 dark:border-amber-300 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            aria-label={
              highContrastDark
                ? 'Contraste : Passer en mode clair fond blanc'
                : 'Contraste : Passer en mode sombre très contrasté'
            }
          >
            {highContrastDark ? (
              <>
                <Sun className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
                <span className="text-sm sm:text-lg whitespace-nowrap">Clair</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 shrink-0 text-amber-300" aria-hidden="true" />
                <span className="text-sm sm:text-lg whitespace-nowrap">Nuit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
