import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Star,
  Crown,
  Heart,
  BarChart2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ArrowLeft,
  X,
  ExternalLink,
  User,
  Sparkles,
  Smartphone,
  MessageSquare,
  Printer,
  Globe,
  Check,
  Loader2,
} from 'lucide-react';

interface AlphabetteAppItem {
  id: string;
  name: string;
  domain: string;
  description: string;
  emoji: string;
  isNew?: boolean;
}

const ALPHABETTE_SUITE_APPS: AlphabetteAppItem[] = [
  {
    id: 'atelier-alphabette',
    name: "L'Atelier Alphabette",
    domain: 'atelier.alphabette.fr',
    description: '20 ateliers créatifs guidés pour seniors : contes, souvenirs, peinture, quiz et cuisine.',
    emoji: '🎨',
    isNew: true,
  },
  {
    id: 'infos-perso',
    name: 'Infos Perso',
    domain: 'infoperso.fr',
    description: 'Coffre-fort personnel et mémo quotidien pour organiser ses documents et contacts importants.',
    emoji: '🗂️',
    isNew: true,
  },
  {
    id: 'wikicom',
    name: 'Wikicom',
    domain: 'wikicom.fr',
    description: 'Encyclopédie citoyenne et entraide locale expliquée simplement sans jargon.',
    emoji: '📚',
    isNew: true,
  },
  {
    id: 'iadebat',
    name: 'Iadébat',
    domain: 'iadebat.fr',
    description: 'Espace de réflexion et de débats apaisés pour comparer les idées avec clarté.',
    emoji: '💬',
    isNew: true,
  },
  {
    id: 'service-france',
    name: 'Service France',
    domain: 'servicefrance.fr',
    description: 'Guide pas-à-pas pour toutes vos démarches administratives et courriers officiels.',
    emoji: '🇫🇷',
  },
  {
    id: 'memo-sante',
    name: 'Mémo Santé & Bien-être',
    domain: 'sante.alphabette.fr',
    description: 'Suivi doux des rendez-vous, ordonnances et conseils de vitalité au quotidien.',
    emoji: '🌿',
  },
  {
    id: 'gazette-famille',
    name: 'La Gazette Familiale',
    domain: 'gazette.alphabette.fr',
    description: 'Le journal partagé avec les enfants et petits-enfants à imprimer chaque mois.',
    emoji: '🗞️',
  },
  {
    id: 'club-lecture',
    name: 'Le Salon de Lecture',
    domain: 'lecture.alphabette.fr',
    description: 'Belles histoires, poèmes classiques et livres audio à écouter en un clic.',
    emoji: '📖',
  },
];

const FAVORITES_STORAGE_KEY = 'alphabette_suite_favorites_v1';
const PINNED_APP_STORAGE_KEY = 'alphabette_pinned_atelier_v1';

interface TopBarAlphabetteProps {
  onGoHome: () => void;
  fontScaleIndex: number;
  maxFontScaleIndex: number;
  onChangeFontScale: (direction: 'up' | 'down') => void;
  onToggleBigMode: () => void;
  isBigModeActive: boolean;
  highContrastDark: boolean;
  onToggleContrast: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  isSpeaking: boolean;
  isAudioLoading?: boolean;
  onToggleSpeakScreen: () => void;
  isListening: boolean;
  onToggleDictate: () => void;
}

export const TopBarAlphabette: React.FC<TopBarAlphabetteProps> = ({
  onGoHome,
  onToggleBigMode,
  isBigModeActive,
  highContrastDark,
  onToggleContrast,
  canGoBack,
  onGoBack,
  isSpeaking,
  isAudioLoading = false,
  onToggleSpeakScreen,
}) => {
  const [activeModal, setActiveModal] = useState<
    null | 'all-apps' | 'new-apps' | 'subscription' | 'don' | 'feedback' | 'install' | 'language'
  >(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [simpleModeBanner, setSimpleModeBanner] = useState<string | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState('Français (France)');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['atelier-alphabette', 'infos-perso'];
    } catch {
      return ['atelier-alphabette', 'infos-perso'];
    }
  });

  const [isAppPinned, setIsAppPinned] = useState<boolean>(() => {
    return localStorage.getItem(PINNED_APP_STORAGE_KEY) === 'true';
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  const toggleFavorite = (appId: string) => {
    setFavorites((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleTogglePinThisApp = () => {
    const next = !isAppPinned;
    setIsAppPinned(next);
    localStorage.setItem(PINNED_APP_STORAGE_KEY, String(next));
    setMoreMenuOpen(false);
    setSimpleModeBanner(
      next
        ? "⭐ L'Atelier Alphabette a été épinglé dans vos favoris !"
        : "L'Atelier Alphabette a été retiré de vos applications épinglées."
    );
    setTimeout(() => setSimpleModeBanner(null), 4000);
  };

  const handleToggleSimpleMode = () => {
    const next = !isSimpleMode;
    setIsSimpleMode(next);
    if (next && !isBigModeActive) {
      onToggleBigMode();
    }
    setMoreMenuOpen(false);
    setSimpleModeBanner(
      next
        ? '🧘 Mode simple activé : affichage agrandi et lecture apaisée.'
        : '🧘 Mode standard rétabli.'
    );
    setTimeout(() => setSimpleModeBanner(null), 4000);
  };

  const newAppsList = ALPHABETTE_SUITE_APPS.filter((app) => app.isNew);

  return (
    <>
      <header
        className="no-print sticky top-0 z-40 w-full shadow-sm"
        role="banner"
        style={{ fontSize: '15px' }}
      >
        {/* ====================================================================
            1. BARRE SUPÉRIEURE (Top Bar Écosystème — fond bleu nuit #182334)
           ==================================================================== */}
        <div className="bg-[#182334] dark:bg-[#0b1220] text-white">
          <div className="max-w-6xl mx-auto px-[10px] sm:px-[16px] h-[46px] sm:h-[50px] flex items-center justify-between gap-[6px]">
            {/* BLOC DE GAUCHE : Logo "a" + alphabette + .eu + Toutes les applis + NEW */}
            <div className="flex items-center gap-[6px] sm:gap-[10px] min-w-0">
              {/* Logo « a » + « alphabette » vers https://alphabette.fr */}
              <a
                href="https://alphabette.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="h-[36px] px-[2px] rounded-full hover:bg-white/10 flex items-center gap-[7px] transition-colors shrink-0"
                aria-label="Portail principal alphabette.fr"
              >
                <span className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-full bg-[#3355d1] text-white font-bold text-[15px] leading-none flex items-center justify-center shrink-0 shadow-xs">
                  a
                </span>
                <span className="font-bold text-[15px] sm:text-[17px] tracking-tight text-white leading-none">
                  alphabette
                </span>
              </a>

              {/* Bouton laboratoire « .eu » vers https://alphabette.eu */}
              <a
                href="https://alphabette.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-semibold flex items-center justify-center transition-colors shrink-0"
                title="Laboratoire communautaire alphabette.eu"
                aria-label="Laboratoire alphabette.eu"
              >
                .eu
              </a>

              {/* Bouton « Toutes les applis » (icône grille 9 carrés) */}
              <button
                type="button"
                onClick={() => setActiveModal('all-apps')}
                className="h-[34px] sm:h-[36px] w-[34px] sm:w-auto sm:px-[10px] rounded-full bg-white/10 hover:bg-white/20 text-white text-[12.5px] font-semibold flex items-center justify-center gap-[6px] cursor-pointer transition-colors shrink-0"
                aria-label="Toutes les applis de la suite Alphabette"
                title="Toutes les applis"
              >
                <LayoutGrid className="w-[17px] h-[17px] text-white/95 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline whitespace-nowrap">Toutes les applis</span>
              </button>

              {/* Bouton « NEW » (badge carré bleu glacier dans pastille sombre) */}
              <button
                type="button"
                onClick={() => setActiveModal('new-apps')}
                className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label="NEW : Voir les nouveautés Alphabette"
                title="Nouveautés Alphabette"
              >
                <span className="px-[4px] py-[2px] rounded-[4px] bg-gradient-to-b from-sky-200 to-sky-400 text-slate-900 font-black text-[9px] leading-none tracking-tight uppercase shadow-xs">
                  NEW
                </span>
              </button>
            </div>

            {/* BLOC DE DROITE : Bouton Abonnement (pilule bordure dorée 1.5px solid #f59e0b) */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveModal('subscription')}
                className="h-[34px] sm:h-[36px] px-[10px] sm:px-[14px] rounded-full bg-white/10 hover:bg-white/15 border-[1.5px] border-[#f59e0b] text-[#fbbf24] font-bold text-[12.5px] sm:text-[13.5px] flex items-center gap-[5px] cursor-pointer transition-colors whitespace-nowrap"
                aria-label="Abonnement Alphabette"
              >
                <Crown className="w-[14px] h-[14px] text-[#f59e0b] shrink-0" aria-hidden="true" />
                <span>Abonnement</span>
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================
            2. BARRE INFÉRIEURE (Barre d'Application & Accessibilité — fond blanc)
           ==================================================================== */}
        <div className="bg-white dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-[10px] sm:px-[16px] h-[54px] sm:h-[58px] flex items-center justify-between gap-[6px]">
            {/* BLOC DE GAUCHE : Retour discret (si sous-écran) + Titre + Sous-titre majuscules */}
            <div className="flex items-center gap-[6px] sm:gap-[10px] min-w-0 flex-1">
              {canGoBack && (
                <button
                  type="button"
                  onClick={onGoBack}
                  className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-[#f1f5f9] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Retour à l'écran précédent"
                  title="Retour"
                >
                  <ArrowLeft className="w-[17px] h-[17px]" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={onGoHome}
                className="text-left group cursor-pointer focus:outline-none min-w-0"
                aria-label="Retour à l'accueil de L'Atelier Alphabette"
              >
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14.5px] sm:text-[20px] font-bold tracking-tight text-[#3f51b5] dark:text-white group-hover:text-[#283593] dark:group-hover:text-amber-300 transition-colors truncate leading-tight">
                    L’Atelier Alphabette
                  </span>
                  {isAppPinned && (
                    <Star
                      className="w-[13px] h-[13px] text-amber-500 fill-amber-400 shrink-0"
                      aria-label="Application épinglée"
                    />
                  )}
                </div>
                <p className="text-[9px] sm:text-[10.5px] font-medium uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400 truncate leading-tight">
                  CRÉATIONS &amp; SOUVENIRS
                </p>
              </button>
            </div>

            {/* BLOC DE DROITE : Exactement les 5 boutons d'action alignés (Don, BIG, Nuit/Jour, Voix, ...) */}
            <div className="flex items-center gap-[4px] sm:gap-[7px] shrink-0">
              {/* 1. Bouton Don : carré arrondi rose/magenta vif avec cœur blanc */}
              <button
                type="button"
                onClick={() => setActiveModal('don')}
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] sm:rounded-[11px] bg-[#db2777] hover:bg-[#be185d] text-white flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95 shrink-0"
                aria-label="Don : Soutenir Alphabette"
                title="Faire un don"
              >
                <Heart className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] fill-current" aria-hidden="true" />
              </button>

              {/* 2. Bouton BIG : pilule bleu/indigo avec texte BIG + barres progressives */}
              <button
                type="button"
                onClick={onToggleBigMode}
                className={`h-[34px] sm:h-[38px] px-[8px] sm:px-[11px] rounded-[10px] sm:rounded-[11px] font-extrabold text-[12px] sm:text-[14px] flex items-center justify-center gap-[3px] sm:gap-[4px] cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 ${
                  isBigModeActive
                    ? 'bg-[#312e81] text-amber-300 ring-2 ring-amber-400'
                    : 'bg-[#4338ca] hover:bg-[#3730a3] text-white'
                }`}
                aria-label="BIG : Agrandir la taille du texte"
                aria-pressed={isBigModeActive}
                title="Mode grand texte (BIG)"
              >
                <span>BIG</span>
                <BarChart2 className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] shrink-0" aria-hidden="true" />
              </button>

              {/* 3. Bouton Mode Nuit / Jour */}
              <button
                type="button"
                onClick={onToggleContrast}
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0"
                aria-label={
                  highContrastDark
                    ? 'Mode Jour : Passer au thème clair'
                    : 'Mode Nuit : Passer au thème sombre'
                }
                title={highContrastDark ? 'Mode Jour' : 'Mode Nuit'}
              >
                {highContrastDark ? (
                  <Sun className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] text-slate-700" aria-hidden="true" />
                )}
              </button>

              {/* 4. Bouton Lecture à haute voix (Voix Google unifiée Alphabette) */}
              <button
                type="button"
                onClick={onToggleSpeakScreen}
                className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full border flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0 ${
                  isSpeaking
                    ? 'bg-emerald-700 text-white border-emerald-800 dark:bg-emerald-400 dark:text-slate-950'
                    : isAudioLoading
                      ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-slate-700 dark:text-amber-300'
                      : 'bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-600'
                }`}
                aria-label={
                  isAudioLoading
                    ? 'Préparation de la voix, toucher pour annuler'
                    : isSpeaking
                      ? 'Arrêter la lecture à haute voix'
                      : 'Lecture à haute voix'
                }
                title={
                  isAudioLoading
                    ? 'Préparation de la voix...'
                    : isSpeaking
                      ? 'Arrêter l’écoute'
                      : 'Lecture à haute voix'
                }
              >
                {isAudioLoading ? (
                  <Loader2 className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] animate-spin" aria-hidden="true" />
                ) : isSpeaking ? (
                  <VolumeX className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                )}
              </button>

              {/* 5. Bouton Plus d'options (...) + menu déroulant exactement 7 entrées */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  aria-label="Plus d'options"
                  aria-expanded={moreMenuOpen}
                  title="Plus d'options"
                >
                  <MoreHorizontal className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                </button>

                {moreMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Menu Plus d'options"
                    className="absolute right-0 mt-2 w-[260px] rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-amber-300 shadow-2xl py-1.5 z-50 text-slate-950 dark:text-white"
                  >
                    {/* 1. ⭐ Épingler cette appli */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleTogglePinThisApp}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span>⭐ Épingler cette appli</span>
                      {isAppPinned && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                    </button>

                    {/* 2. 👤 Mon inscription */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveModal('subscription');
                      }}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <span>👤 Mon inscription</span>
                    </button>

                    {/* 3. 🧘 Mode simple */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleToggleSimpleMode}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span>🧘 Mode simple</span>
                      {isSimpleMode && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                    </button>

                    {/* 4. 📱 Installer sur mon téléphone */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveModal('install');
                      }}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <span>📱 Installer sur mon téléphone</span>
                    </button>

                    {/* 5. 💬 Donner mon avis */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setFeedbackSent(false);
                        setActiveModal('feedback');
                      }}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <span>💬 Donner mon avis</span>
                    </button>

                    {/* 6. 🖨️ Imprimer */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        window.print();
                      }}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <span>🖨️ Imprimer</span>
                    </button>

                    {/* 7. 🌐 Langue */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveModal('language');
                      }}
                      className="w-full px-4 py-2.5 text-left text-[15px] font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span>🌐 Langue</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        FR
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification douce pour Épingler / Mode simple */}
      {simpleModeBanner && (
        <div
          role="status"
          aria-live="polite"
          className="no-print max-w-5xl mx-auto mt-3 px-4 w-full"
        >
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-900 dark:border-emerald-300 text-slate-950 dark:text-emerald-100 font-bold text-base flex items-center justify-between gap-3">
            <span>{simpleModeBanner}</span>
            <button
              type="button"
              onClick={() => setSimpleModeBanner(null)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-900 dark:border-emerald-300 text-sm cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 1 : « Toutes les applis » (Suite Alphabette avec étoile favori)
         ==================================================================== */}
      {activeModal === 'all-apps' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-all-apps-title"
        >
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-7 h-7 text-blue-900 dark:text-amber-300 shrink-0" />
                <h2 id="modal-all-apps-title" className="text-2xl md:text-3xl font-serif-title font-bold">
                  Toutes les applis Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Fermer</span>
              </button>
            </div>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
              Découvrez les applications de l’écosystème <strong>alphabette.fr</strong>. Touchez l’étoile à droite pour mettre vos applications préférées en favori :
            </p>

            <div className="space-y-3">
              {ALPHABETTE_SUITE_APPS.map((app) => {
                const isFav = favorites.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border-2 border-slate-900 dark:border-slate-300 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="text-3xl shrink-0" aria-hidden="true">
                        {app.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                            {app.name}
                          </h3>
                          <span className="text-xs font-bold text-blue-900 dark:text-amber-300">
                            · {app.domain}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mt-0.5">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(app.id)}
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isFav
                          ? 'bg-amber-100 border-amber-700 text-amber-600 dark:bg-amber-950 dark:border-amber-300 dark:text-amber-300'
                          : 'bg-white border-slate-400 text-slate-400 hover:text-amber-600 dark:bg-slate-900'
                      }`}
                      aria-label={
                        isFav
                          ? `Retirer ${app.name} des favoris`
                          : `Mettre ${app.name} en favori`
                      }
                    >
                      <Star className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[54px] px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-300 dark:text-slate-950 font-extrabold text-lg border-2 border-slate-950 dark:border-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 2 : « NEW / Nouveautés »
         ==================================================================== */}
      {activeModal === 'new-apps' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-apps-title"
        >
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-300 shrink-0" />
                <h2 id="modal-new-apps-title" className="text-2xl md:text-3xl font-serif-title font-bold">
                  Nouveautés Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Fermer</span>
              </button>
            </div>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
              Voici les dernières applications sorties dans la suite <strong>Alphabette</strong> :
            </p>

            <div className="space-y-3">
              {newAppsList.map((app) => {
                const isFav = favorites.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border-2 border-amber-700 dark:border-amber-300 bg-amber-50/70 dark:bg-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-3xl shrink-0" aria-hidden="true">
                        {app.emoji}
                      </span>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                          {app.name}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mt-0.5">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(app.id)}
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 cursor-pointer ${
                        isFav
                          ? 'bg-amber-200 border-amber-800 text-amber-700 dark:bg-amber-950 dark:border-amber-300 dark:text-amber-300'
                          : 'bg-white border-slate-400 text-slate-400 dark:bg-slate-900'
                      }`}
                      aria-label={
                        isFav
                          ? `Retirer ${app.name} des favoris`
                          : `Mettre ${app.name} en favori`
                      }
                    >
                      <Star className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[54px] px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white dark:bg-amber-300 dark:text-slate-950 font-extrabold text-lg border-2 border-slate-950 dark:border-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 3 : « Abonnement / Compte » (Lancement le 7 mai : 15 € / 40 €)
         ==================================================================== */}
      {activeModal === 'subscription' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sub-title"
        >
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-8 rounded-3xl border-4 border-amber-500 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-500 shrink-0" />
                <h2 id="modal-sub-title" className="text-2xl md:text-3xl font-serif-title font-bold">
                  Abonnement & Compte Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Fermer</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-700 dark:border-amber-300 space-y-2">
              <p className="text-lg font-extrabold text-amber-950 dark:text-amber-200">
                📅 Lancement de l’abonnement annuel le 7 mai
              </p>
              <p className="text-base text-slate-800 dark:text-slate-200">
                Un compte unique (Single Sign-On) pour retrouver vos créations et vos favoris sur tous vos appareils, sans aucune publicité.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border-3 border-slate-900 dark:border-slate-300 bg-slate-50 dark:bg-slate-800/90 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase text-blue-900 dark:text-amber-300">
                    Formule 1 Appli
                  </p>
                  <p className="text-3xl font-extrabold mt-1">15 € / an</p>
                  <p className="text-base text-slate-700 dark:text-slate-300 mt-2">
                    Accès complet et illimité à <strong>une application</strong> Alphabette de votre choix pendant 1 an.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-4 border-amber-500 bg-amber-50/70 dark:bg-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold uppercase text-amber-900 dark:text-amber-300">
                    ★ Formule Complète
                  </p>
                  <p className="text-3xl font-extrabold mt-1">40 € / an</p>
                  <p className="text-base text-slate-800 dark:text-slate-200 mt-2">
                    Accès illimité à <strong>toutes les applis</strong> de l’écosystème Alphabette (Infos Perso, Wikicom, Iadébat, Service France, Atelier...).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <a
                href="https://alphabette.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[54px] w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-lg border-2 border-slate-950 flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                <span>Pré-inscrire mon compte sur alphabette.fr</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[54px] w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-lg border-2 border-slate-900 dark:border-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 4 : « Don »
         ==================================================================== */}
      {activeModal === 'don' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="don-modal-title"
        >
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <Heart className="w-7 h-7 text-pink-600 dark:text-pink-400 fill-current shrink-0" />
                <h2 id="don-modal-title" className="text-xl md:text-3xl font-serif-title font-bold">
                  Soutenir Alphabette
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold border-2 border-slate-900 dark:border-slate-300 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
                <span>Fermer</span>
              </button>
            </div>

            <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200">
              <strong>L’écosystème Alphabette</strong> est conçu avec bienveillance pour rester sans publicité et ultra-accessible à tous.
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300">
              Votre don soutient directement l’hébergement indépendant et la création de nouveaux outils citoyens sur <strong>alphabette.fr</strong> et <strong>alphabette.eu</strong>.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {['5 €', '10 €', '20 €'].map((amount) => (
                <a
                  key={amount}
                  href="https://alphabette.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[54px] rounded-2xl bg-pink-50 hover:bg-pink-100 dark:bg-slate-800 border-2 border-pink-700 dark:border-pink-300 text-pink-950 dark:text-pink-200 font-extrabold text-lg flex items-center justify-center"
                >
                  Don {amount}
                </a>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://alphabette.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[56px] flex-1 px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-lg border-2 border-slate-950 dark:border-white flex items-center justify-center gap-2"
              >
                <span>Faire un don</span>
                <ExternalLink className="w-5 h-5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[56px] px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-lg border-2 border-slate-900 dark:border-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALES DU MENU « PLUS D'OPTIONS (...) » : Installer, Avis, Langue
         ==================================================================== */}
      {activeModal === 'install' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
        >
          <div className="max-w-lg w-full p-6 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-7 h-7 text-blue-900 dark:text-amber-300" />
                <h2 id="install-modal-title" className="text-2xl font-serif-title font-bold">
                  Installer sur mon téléphone
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold border-2 border-slate-900 dark:border-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <ol className="space-y-2.5 text-lg list-decimal list-inside">
              <li>Ouvrez le menu de votre navigateur (les 3 petits points en haut ou le bouton Partager).</li>
              <li>Touchez <strong>« Ajouter à l’écran d’accueil »</strong> ou <strong>« Installer l’application »</strong>.</li>
              <li>Vous retrouverez l’icône <strong>Alphabette</strong> directement sur votre téléphone !</li>
            </ol>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full min-h-[54px] rounded-2xl bg-blue-900 text-white dark:bg-amber-300 dark:text-slate-950 font-extrabold text-lg cursor-pointer"
            >
              J’ai compris
            </button>
          </div>
        </div>
      )}

      {activeModal === 'feedback' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div className="max-w-lg w-full p-6 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-7 h-7 text-blue-900 dark:text-amber-300" />
                <h2 id="feedback-modal-title" className="text-2xl font-serif-title font-bold">
                  Donner mon avis
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold border-2 border-slate-900 dark:border-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {feedbackSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-800 text-center space-y-3">
                <p className="text-xl font-bold">Merci beaucoup pour votre retour chaleureux !</p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="min-h-[50px] px-6 rounded-xl bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg">Comment trouvez-vous L’Atelier Alphabette aujourd’hui ?</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    '😊 Très agréable et facile à utiliser',
                    '🎨 J’aimerais encore plus d’ateliers créatifs',
                    '🔍 Je souhaite des boutons encore plus grands',
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFeedbackSent(true)}
                      className="min-h-[56px] px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-amber-300 font-bold text-left text-lg cursor-pointer"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeModal === 'language' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
        >
          <div className="max-w-md w-full p-6 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 text-slate-950 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-7 h-7 text-blue-900 dark:text-amber-300" />
                <h2 id="lang-modal-title" className="text-2xl font-serif-title font-bold">
                  Langue de l’application
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold border-2 border-slate-900 dark:border-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <div className="space-y-2.5">
              {['Français (France)', 'Français (Belgique / Suisse / Canada)'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang);
                    setActiveModal(null);
                  }}
                  className={`w-full min-h-[54px] px-4 rounded-2xl border-2 font-bold text-lg flex items-center justify-between cursor-pointer ${
                    selectedLang === lang
                      ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-slate-300'
                  }`}
                >
                  <span>{lang}</span>
                  {selectedLang === lang && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
