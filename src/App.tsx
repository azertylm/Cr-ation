import React, { useState, useEffect, useRef } from 'react';
import {
  CATEGORIES,
  CategoryId,
  WorkshopDefinition,
  SavedCreation,
} from './data/workshops';
import {
  FONT_SCALE_VALUES,
  getNextFontScale,
  getWorkshopsByCategory,
  getWorkshopById,
  getCategoryById,
  buildWorkshopUserPrompt,
  generateLocalCreationFallback,
  generateLocalQuizFallback,
  generateLocalInteractiveFallback,
} from './utils/atelierLogic';
import { TopBarAlphabette } from './components/TopBarAlphabette';
import { BottomBarAlphabette } from './components/BottomBarAlphabette';
import { ResultView } from './components/ResultView';
import { SavedGalleryView } from './components/SavedGalleryView';
import {
  Mic,
  CheckCircle2,
  ArrowRight,
  Wand2,
  HeartHandshake,
} from 'lucide-react';

type ScreenState =
  | { type: 'home' }
  | { type: 'category'; categoryId: CategoryId }
  | { type: 'workshop-step'; workshopId: string; stepIndex: 0 | 1 | 2 }
  | { type: 'loading'; workshopId: string }
  | { type: 'result'; workshopId: string; creation: SavedCreation }
  | { type: 'gallery' };

const STORAGE_KEY_CREATIONS = 'alphabette_saved_creations_v1';
const STORAGE_KEY_FONT_INDEX = 'alphabette_font_scale_index';
const STORAGE_KEY_CONTRAST = 'alphabette_high_contrast_dark';

const INITIAL_DEMO_CREATION: SavedCreation = {
  id: 'demo-bienvenue-1',
  workshopId: 'contes-petits-enfants',
  workshopTitle: 'Contes pour mes petits-enfants',
  workshopEmoji: '🧸',
  categoryId: 'memoire',
  createdAt: 'Aujourd’hui',
  selections: {
    step1: 'Un petit écureuil curieux',
    step2: 'Dans une forêt dorée d’automne',
    step3: 'Le bonheur de partager avec ses amis',
  },
  title: 'Le Secret de Noisette l’Écureuil',
  subtitle: 'Un conte tendre imaginé pour mes petits-enfants',
  content:
    "Il était une fois, dans une grande forêt aux feuilles dorées d'automne, un petit écureuil au pelage roux qui adorait collectionner les noisettes les plus brillantes.\n\nUn matin de fraîche rosée, il aperçut son ami le petit hérisson qui cherchait en vain de quoi remplir son panier avant les premiers vents frais. Sans hésiter un seul instant, notre petit écureuil ouvrit sa cachette secrète au creux du vieux chêne et partagea ses plus beaux trésors.\n\nCe soir-là, autour d'une tisane de fleurs des bois, ils rirent tous les deux bien au chaud.\n\nMorale de l'histoire : Une joie partagée avec ceux qu'on aime brille deux fois plus fort dans le cœur.",
  tips: [
    'À lire d’une voix douce avant de dormir',
    'Un souvenir précieux conservé dans votre galerie Alphabette',
  ],
  visualStyle: 'storybook',
};

export default function App() {
  // Accessibility states
  const [fontScaleIndex, setFontScaleIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FONT_INDEX);
    return saved ? Number(saved) || 0 : 0;
  });

  const [highContrastDark, setHighContrastDark] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';
  });

  // Saved creations in localStorage
  const [savedCreations, setSavedCreations] = useState<SavedCreation[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CREATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [INITIAL_DEMO_CREATION];
  });

  // Navigation & Wizard state
  const [screen, setScreen] = useState<ScreenState>({ type: 'home' });
  const [historyStack, setHistoryStack] = useState<ScreenState[]>([]);
  const [selections, setSelections] = useState<{
    step1: string;
    step2: string;
    step3: string;
  }>({
    step1: '',
    step2: '',
    step3: '',
  });

  // Voice & Audio states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceBannerMessage, setVoiceBannerMessage] = useState<string | null>(null);
  const [isLoadingAdjustment, setIsLoadingAdjustment] = useState(false);
  const [hideBarsOnScroll, setHideBarsOnScroll] = useState(false);

  const recognitionRef = useRef<unknown>(null);
  const lastScrollYRef = useRef<number>(0);

  // Auto-hide top and bottom bars on scroll down so the user gets full reading visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= 30) {
        setHideBarsOnScroll(false);
      } else if (delta > 10) {
        // Scrolling down -> hide both bars for full visibility
        setHideBarsOnScroll(true);
      } else if (delta < -12) {
        // Scrolling back up -> reveal bars
        setHideBarsOnScroll(false);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync font size CSS variable
  useEffect(() => {
    const px = FONT_SCALE_VALUES[fontScaleIndex] || 20;
    document.documentElement.style.setProperty('--base-font-size', `${px}px`);
    localStorage.setItem(STORAGE_KEY_FONT_INDEX, String(fontScaleIndex));
  }, [fontScaleIndex]);

  // Sync dark high-contrast mode class on <html>
  useEffect(() => {
    if (highContrastDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_CONTRAST, String(highContrastDark));
  }, [highContrastDark]);

  // Save creations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CREATIONS, JSON.stringify(savedCreations));
    } catch {
      // ignore quota error
    }
  }, [savedCreations]);

  // Navigation helpers
  const navigateTo = (next: ScreenState) => {
    stopSpeaking();
    setHideBarsOnScroll(false);
    setHistoryStack((prev) => [...prev, screen]);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    stopSpeaking();
    setHideBarsOnScroll(false);
    if (historyStack.length === 0) {
      setScreen({ type: 'home' });
      return;
    }
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setScreen(previous);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    stopSpeaking();
    setHideBarsOnScroll(false);
    setHistoryStack([]);
    setScreen({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Speech Synthesis (Web Speech API)
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setVoiceBannerMessage('La lecture vocale n’est pas disponible sur ce navigateur.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92; // Slightly slower, clear and warm pace for seniors
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getCurrentScreenSummaryForSpeech = (): string => {
    if (screen.type === 'home') {
      return "Bienvenue dans L'Atelier Alphabette. Que souhaitez-vous créer aujourd'hui ? Choisissez parmi nos 4 grandes catégories : 1. Mémoire et Transmission. 2. Arts Visuels et Création. 3. Musique, Poésie et Humour. 4. Cuisine, Voyages et Curiosité.";
    }
    if (screen.type === 'category') {
      const cat = getCategoryById(screen.categoryId);
      const list = getWorkshopsByCategory(screen.categoryId);
      return `Catégorie ${cat?.title}. Choisissez l'un des 5 ateliers : ${list
        .map((w) => w.title)
        .join(', ')}.`;
    }
    if (screen.type === 'workshop-step') {
      const w = getWorkshopById(screen.workshopId);
      if (!w) return '';
      const step = w.steps[screen.stepIndex];
      return `Atelier ${w.title}. Étape ${screen.stepIndex + 1} sur 3. ${step.question}. Les choix proposés sont : ${step.options
        .map((o) => o.label)
        .join(', ')}.`;
    }
    if (screen.type === 'result') {
      return `${screen.creation.title}. ${screen.creation.subtitle}. ${screen.creation.content}`;
    }
    if (screen.type === 'gallery') {
      return `Mes Créations sauvegardées. Vous avez ${savedCreations.length} création${
        savedCreations.length > 1 ? 's' : ''
      } dans votre album.`;
    }
    return 'Votre création est en train de prendre vie.';
  };

  // Speech Recognition (Web Speech API Dictation)
  const handleToggleDictate = (onTranscriptReady?: (transcript: string) => void) => {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceBannerMessage(
        'Astuce : La dictée vocale directe dépend de votre microphone. Vous pouvez simplement toucher l’un des gros boutons proposés à l’écran !'
      );
      setTimeout(() => setVoiceBannerMessage(null), 5000);
      return;
    }

    if (isListening) {
      try {
        (recognitionRef.current as { stop?: () => void })?.stop?.();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new (SpeechRecognitionCtor as new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      })();

      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setVoiceBannerMessage(`Texte dicté reçu : « ${transcript} »`);
          if (onTranscriptReady) {
            onTranscriptReady(transcript);
          } else if (screen.type === 'workshop-step') {
            const stepKey = `step${screen.stepIndex + 1}` as 'step1' | 'step2' | 'step3';
            setSelections((prev) => ({ ...prev, [stepKey]: transcript }));
          }
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceBannerMessage(
          'Nous n’avons pas entendu votre voix. Vous pouvez réessayer ou toucher l’un des gros boutons.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      setVoiceBannerMessage('Parlez maintenant à voix haute, nous vous écoutons...');
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Start a workshop
  const handleStartWorkshop = (workshop: WorkshopDefinition) => {
    setSelections({
      step1: workshop.steps[0].options[0].label,
      step2: workshop.steps[1].options[0].label,
      step3: workshop.steps[2].options[0].label,
    });
    navigateTo({
      type: 'workshop-step',
      workshopId: workshop.id,
      stepIndex: 0,
    });
  };

  // Select an option on step 1, 2 or 3
  const handleSelectStepOption = (
    workshop: WorkshopDefinition,
    stepIndex: 0 | 1 | 2,
    optionLabel: string
  ) => {
    const stepKey = `step${stepIndex + 1}` as 'step1' | 'step2' | 'step3';
    const updatedSelections = { ...selections, [stepKey]: optionLabel };
    setSelections(updatedSelections);

    if (stepIndex < 2) {
      navigateTo({
        type: 'workshop-step',
        workshopId: workshop.id,
        stepIndex: (stepIndex + 1) as 1 | 2,
      });
    }
  };

  // Generate final creation ("Créer maintenant")
  const handleCreateNow = async (
    workshop: WorkshopDefinition,
    currentSelections = selections,
    adjustmentInstruction?: string
  ) => {
    if (!adjustmentInstruction) {
      setScreen({ type: 'loading', workshopId: workshop.id });
    } else {
      setIsLoadingAdjustment(true);
    }

    const nowFormatted = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      if (workshop.mode === 'quiz') {
        const res = await fetch('/api/atelier/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selections: currentSelections,
            adjustmentInstruction,
          }),
        });

        let quizData;
        if (res.ok) {
          quizData = await res.json();
        } else {
          quizData = generateLocalQuizFallback(currentSelections);
        }

        const newCreation: SavedCreation = {
          id: `creation-${Date.now()}`,
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopEmoji: workshop.emoji,
          categoryId: workshop.categoryId,
          createdAt: nowFormatted,
          selections: currentSelections,
          title: quizData.title || workshop.title,
          subtitle: quizData.subtitle || currentSelections.step1,
          content: `Quiz interactif de 5 questions sur « ${currentSelections.step1} ».`,
          quizQuestions:
            Array.isArray(quizData.questions) && quizData.questions.length > 0
              ? quizData.questions
              : generateLocalQuizFallback(currentSelections).questions,
        };

        setSavedCreations((prev) => [newCreation, ...prev]);
        setScreen({ type: 'result', workshopId: workshop.id, creation: newCreation });
        setIsLoadingAdjustment(false);
        return;
      }

      if (workshop.mode === 'interactive') {
        const res = await fetch('/api/atelier/interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workshopId: workshop.id,
            selections: currentSelections,
            history: [],
          }),
        });

        let chapter;
        if (res.ok) {
          const data = await res.json();
          chapter = {
            chapterTitle: data.chapterTitle || 'Chapitre 1',
            content: data.content,
            choices: Array.isArray(data.choices) && data.choices.length > 0
              ? data.choices
              : ['Continuer la promenade', 'Poser une autre question'],
          };
        } else {
          chapter = generateLocalInteractiveFallback(workshop, currentSelections, 0);
        }

        const newCreation: SavedCreation = {
          id: `creation-${Date.now()}`,
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopEmoji: workshop.emoji,
          categoryId: workshop.categoryId,
          createdAt: nowFormatted,
          selections: currentSelections,
          title: `${workshop.title} : ${currentSelections.step1.split(' — ')[0]}`,
          subtitle: `${currentSelections.step2}`,
          content: chapter.content,
          interactiveHistory: [chapter],
        };

        setSavedCreations((prev) => [newCreation, ...prev]);
        setScreen({ type: 'result', workshopId: workshop.id, creation: newCreation });
        setIsLoadingAdjustment(false);
        return;
      }

      // Standard or Visual Workshop
      const category = getCategoryById(workshop.categoryId);
      const userPrompt = buildWorkshopUserPrompt(workshop, currentSelections);

      const res = await fetch('/api/atelier/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          categoryTitle: category?.title || '',
          selections: currentSelections,
          systemInstruction: workshop.systemPrompt,
          userPrompt,
          adjustmentInstruction,
          isVisual: workshop.mode === 'visual',
        }),
      });

      let newCreation: SavedCreation;

      if (res.ok) {
        const data = await res.json();
        newCreation = {
          id: `creation-${Date.now()}`,
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopEmoji: workshop.emoji,
          categoryId: workshop.categoryId,
          createdAt: nowFormatted,
          selections: currentSelections,
          title: data.title || workshop.title,
          subtitle: data.subtitle || currentSelections.step1,
          content: data.content,
          tips: data.tips || [],
          imageUrl: data.imageUrl,
          visualStyle: workshop.visualStyle,
        };
      } else {
        const fallback = generateLocalCreationFallback(
          workshop,
          currentSelections,
          adjustmentInstruction
        );
        newCreation = {
          ...fallback,
          id: `creation-${Date.now()}`,
          createdAt: nowFormatted,
        };
      }

      setSavedCreations((prev) => [newCreation, ...prev]);
      setScreen({ type: 'result', workshopId: workshop.id, creation: newCreation });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      const fallback = generateLocalCreationFallback(
        workshop,
        currentSelections,
        adjustmentInstruction
      );
      const newCreation: SavedCreation = {
        ...fallback,
        id: `creation-${Date.now()}`,
        createdAt: nowFormatted,
      };
      setSavedCreations((prev) => [newCreation, ...prev]);
      setScreen({ type: 'result', workshopId: workshop.id, creation: newCreation });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoadingAdjustment(false);
    }
  };

  // Continue interactive story or historical café conversation (#17, #19, #20)
  const handleContinueInteractive = async (
    workshop: WorkshopDefinition,
    creation: SavedCreation,
    choiceText: string
  ) => {
    setIsLoadingAdjustment(true);
    const existingHistory = creation.interactiveHistory || [];

    try {
      const res = await fetch('/api/atelier/interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: workshop.id,
          selections: creation.selections,
          history: existingHistory.map((h) => ({
            text: h.content,
            choice: h.choiceMade,
          })),
          userChoice: choiceText,
        }),
      });

      let nextChapter;
      if (res.ok) {
        const data = await res.json();
        nextChapter = {
          chapterTitle:
            data.chapterTitle || `Suite (${existingHistory.length + 1})`,
          content: data.content,
          choiceMade: choiceText,
          choices:
            Array.isArray(data.choices) && data.choices.length > 0
              ? data.choices
              : ['Continuer la découverte', 'Prendre un autre chemin'],
        };
      } else {
        nextChapter = generateLocalInteractiveFallback(
          workshop,
          creation.selections,
          existingHistory.length,
          choiceText
        );
      }

      const updatedHistory = [...existingHistory, nextChapter];
      const updatedCreation: SavedCreation = {
        ...creation,
        content: updatedHistory.map((h) => h.content).join('\n\n'),
        interactiveHistory: updatedHistory,
      };

      setSavedCreations((prev) =>
        prev.map((c) => (c.id === creation.id ? updatedCreation : c))
      );
      setScreen({
        type: 'result',
        workshopId: workshop.id,
        creation: updatedCreation,
      });
    } catch {
      const nextChapter = generateLocalInteractiveFallback(
        workshop,
        creation.selections,
        existingHistory.length,
        choiceText
      );
      const updatedHistory = [...existingHistory, nextChapter];
      const updatedCreation: SavedCreation = {
        ...creation,
        content: updatedHistory.map((h) => h.content).join('\n\n'),
        interactiveHistory: updatedHistory,
      };
      setSavedCreations((prev) =>
        prev.map((c) => (c.id === creation.id ? updatedCreation : c))
      );
      setScreen({
        type: 'result',
        workshopId: workshop.id,
        creation: updatedCreation,
      });
    } finally {
      setIsLoadingAdjustment(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
      {/* 1. Barre supérieure fixe Alphabette (se masque automatiquement au scroll vers le bas) */}
      <TopBarAlphabette
        onGoHome={handleGoHome}
        fontScaleIndex={fontScaleIndex}
        maxFontScaleIndex={FONT_SCALE_VALUES.length - 1}
        onChangeFontScale={(dir) =>
          setFontScaleIndex((prev) => getNextFontScale(prev, dir))
        }
        highContrastDark={highContrastDark}
        onToggleContrast={() => setHighContrastDark((prev) => !prev)}
        isHiddenOnScroll={hideBarsOnScroll}
      />

      {/* Voice / Dictation Feedback Banner */}
      {voiceBannerMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print max-w-5xl mx-auto mt-4 px-4 w-full"
        >
          <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-900 dark:border-amber-300 text-slate-950 dark:text-amber-100 font-bold text-lg flex items-center justify-between gap-4">
            <span>🎙️ {voiceBannerMessage}</span>
            <button
              type="button"
              onClick={() => setVoiceBannerMessage(null)}
              className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-900 dark:border-amber-300 text-base cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area with bottom padding for the permanent bottom bar */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 pb-40 md:pb-32">
        {/* ================================================================
            ÉCRAN D'ACCUEIL : Message chaleureux + 4 Gros Boutons Catégories
           ================================================================ */}
        {screen.type === 'home' && (
          <div className="space-y-6">
            <section className="p-5 md:p-7 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-amber-50/60 dark:bg-slate-900 text-center space-y-2 shadow-sm">
              <p className="text-lg font-bold text-blue-900 dark:text-amber-300">
                Bienvenue dans votre espace créatif sans complexe
              </p>
              <h1 className="text-3xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white">
                Que souhaitez-vous créer aujourd’hui ?
              </h1>
              <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 max-w-3xl mx-auto">
                Touchez simplement une grande catégorie ci-dessous. Vous serez guidé(e) pas à pas par de gros boutons clairs, sans jamais avoir à taper au clavier.
              </p>
            </section>

            {/* 4 Gros Boutons de Catégories aux couleurs distinctes et rassurantes */}
            <section
              aria-label="Les 4 grandes catégories d'ateliers"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {CATEGORIES.map((category) => {
                const workshopsInCategory = getWorkshopsByCategory(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      navigateTo({ type: 'category', categoryId: category.id })
                    }
                    className={`min-h-[175px] p-5 md:p-6 rounded-3xl border-4 ${category.borderClass} ${category.bgLightClass} hover:brightness-95 active:scale-[0.99] text-left flex flex-col justify-between gap-3 shadow-sm transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="space-y-1">
                        <span
                          className={`text-base font-extrabold uppercase tracking-wider ${category.badgeTextClass}`}
                        >
                          Catégorie {category.number} · {workshopsInCategory.length} ateliers
                        </span>
                        <h2 className="text-2xl md:text-3xl font-serif-title font-bold text-slate-950 dark:text-white">
                          {category.title}
                        </h2>
                      </div>
                      <span
                        className="text-4xl md:text-5xl shrink-0"
                        aria-hidden="true"
                      >
                        {category.emoji}
                      </span>
                    </div>

                    <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 font-medium leading-snug">
                      {category.subtitle}
                    </p>

                    <div className="pt-2 flex items-center justify-between w-full border-t-2 border-slate-900/15 dark:border-white/15">
                      <span className="text-lg font-bold text-slate-950 dark:text-amber-300">
                        Ouvrir les 5 ateliers
                      </span>
                      <ArrowRight
                        className="w-7 h-7 text-slate-950 dark:text-amber-300"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Reassuring Helper Card */}
            <section className="p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <HeartHandshake
                  className="w-10 h-10 text-blue-900 dark:text-amber-300 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  <strong>Tout est sauvegardé automatiquement</strong> sur votre appareil dans l’onglet « Mes Créations » en bas de l’écran.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================
            ÉCRAN DE CATÉGORIE : Les 5 Ateliers sous forme de grandes cartes
           ================================================================ */}
        {screen.type === 'category' && (() => {
          const category = getCategoryById(screen.categoryId)!;
          const workshops = getWorkshopsByCategory(screen.categoryId);

          return (
            <div className="space-y-8">
              <div
                className={`p-6 md:p-8 rounded-3xl border-4 ${category.borderClass} ${category.bgLightClass}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <div>
                    <p
                      className={`text-base font-extrabold uppercase tracking-wider ${category.badgeTextClass}`}
                    >
                      Catégorie {category.number} · Choisissez votre atelier
                    </p>
                    <h1 className="text-3xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white">
                      {category.title}
                    </h1>
                    <p className="text-xl text-slate-800 dark:text-slate-200 mt-1">
                      Touchez l’atelier qui vous fait plaisir parmi les 5 propositions ci-dessous :
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {workshops.map((workshop) => (
                  <button
                    key={workshop.id}
                    type="button"
                    onClick={() => handleStartWorkshop(workshop)}
                    className="min-h-[116px] p-6 md:p-7 rounded-3xl border-4 border-slate-900 dark:border-slate-200 bg-white hover:bg-amber-50/70 dark:bg-slate-900 dark:hover:bg-slate-800 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-start md:items-center gap-5">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-amber-300 flex items-center justify-center text-4xl shrink-0">
                        <span aria-hidden="true">{workshop.emoji}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-blue-900 dark:text-amber-300">
                          Atelier n° {workshop.number}
                        </p>
                        <h2 className="text-2xl md:text-3xl font-serif-title font-bold text-slate-950 dark:text-white">
                          {workshop.title}
                        </h2>
                        <p className="text-xl text-slate-800 dark:text-slate-200">
                          {workshop.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="min-h-[60px] px-6 py-3 rounded-2xl bg-blue-900 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-xl flex items-center gap-2 shrink-0 self-stretch md:self-center justify-center">
                      <span>Commencer</span>
                      <ArrowRight className="w-6 h-6" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ================================================================
            PARCOURS D'UN ATELIER (Toujours en 3 étapes simples maximum)
           ================================================================ */}
        {screen.type === 'workshop-step' && (() => {
          const workshop = getWorkshopById(screen.workshopId)!;
          const stepIndex = screen.stepIndex;
          const currentStep = workshop.steps[stepIndex];
          const stepKey = `step${stepIndex + 1}` as 'step1' | 'step2' | 'step3';
          const currentValue = selections[stepKey];

          return (
            <div className="space-y-8">
              {/* Step Progress Header */}
              <div className="p-6 md:p-8 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-slate-50 dark:bg-slate-900 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl" aria-hidden="true">
                      {workshop.emoji}
                    </span>
                    <div>
                      <p className="text-base font-bold text-blue-900 dark:text-amber-300">
                        Atelier n° {workshop.number} · {workshop.title}
                      </p>
                      <h1 className="text-2xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white">
                        Étape {stepIndex + 1} sur 3 : {currentStep.question}
                      </h1>
                    </div>
                  </div>

                  {/* Step Indicator Buttons (1 - 2 - 3) */}
                  <div
                    className="flex items-center gap-2"
                    aria-label="Progression des 3 étapes"
                  >
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setScreen({
                            type: 'workshop-step',
                            workshopId: workshop.id,
                            stepIndex: idx as 0 | 1 | 2,
                          })
                        }
                        className={`min-h-[54px] px-4 py-2 rounded-2xl font-bold text-lg border-2 cursor-pointer ${
                          stepIndex === idx
                            ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950'
                            : 'bg-white text-slate-900 border-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400'
                        }`}
                      >
                        Étape {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xl text-slate-800 dark:text-slate-200 font-medium">
                  {currentStep.helperText}
                </p>
              </div>

              {/* 4 to 6 Large Visual Choice Buttons */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                role="group"
                aria-label={currentStep.question}
              >
                {currentStep.options.map((opt) => {
                  const isSelected = currentValue === opt.label;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        handleSelectStepOption(workshop, stepIndex, opt.label)
                      }
                      className={`min-h-[88px] p-5 md:p-6 rounded-2xl border-4 text-left flex items-center justify-between gap-4 transition-all active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950 dark:border-white shadow-md'
                          : 'bg-white hover:bg-blue-50/70 text-slate-950 border-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white dark:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl shrink-0" aria-hidden="true">
                          {opt.emoji}
                        </span>
                        <span className="text-xl md:text-2xl font-bold leading-snug">
                          {opt.label}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2
                          className="w-8 h-8 shrink-0"
                          aria-label="Choix sélectionné"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Optional Microphone Button ("Ou dites-le à voix haute") */}
              <div className="p-6 rounded-3xl border-2 border-rose-900 dark:border-rose-300 bg-rose-50/60 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-xl font-bold text-slate-950 dark:text-white">
                    🎙️ Vous préférez le dire avec vos propres mots ?
                  </p>
                  <p className="text-lg text-slate-800 dark:text-slate-200">
                    Choix actuel pour cette étape :{' '}
                    <strong className="underline">{currentValue}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleDictate()}
                  className={`min-h-[68px] px-6 py-4 rounded-2xl font-bold text-xl border-2 flex items-center gap-3 shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-rose-800 text-white border-slate-950'
                      : 'bg-white hover:bg-rose-100 text-rose-950 border-rose-900 dark:bg-slate-800 dark:text-rose-200 dark:border-rose-300'
                  }`}
                >
                  <Mic className="w-7 h-7 shrink-0" aria-hidden="true" />
                  <span>
                    {isListening
                      ? 'Je vous écoute... (toucher pour finir)'
                      : 'Ou dites-le à voix haute'}
                  </span>
                </button>
              </div>

              {/* Summary of 3 Choices & Giant Final Button "Créer maintenant" */}
              <div className="p-6 md:p-8 rounded-3xl border-4 border-emerald-900 dark:border-emerald-300 bg-emerald-50 dark:bg-slate-900 space-y-5">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                    Vos 3 choix pour cet atelier :
                  </h2>
                  <p className="text-xl text-slate-900 dark:text-slate-100">
                    1. <strong>{selections.step1}</strong> · 2.{' '}
                    <strong>{selections.step2}</strong> · 3.{' '}
                    <strong>{selections.step3}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {stepIndex < 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo({
                          type: 'workshop-step',
                          workshopId: workshop.id,
                          stepIndex: (stepIndex + 1) as 1 | 2,
                        })
                      }
                      className="min-h-[72px] px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white font-bold text-xl border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <span>Passer à l’étape {stepIndex + 2} sur 3</span>
                      <ArrowRight className="w-7 h-7" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCreateNow(workshop, selections)}
                    className="min-h-[76px] flex-1 px-8 py-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 font-extrabold text-2xl border-4 border-slate-950 dark:border-white flex items-center justify-center gap-4 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <Wand2 className="w-8 h-8 shrink-0" aria-hidden="true" />
                    <span>Créer maintenant</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================================================================
            ÉCRAN D'ATTENTE DOUX ET RASSURANT
           ================================================================ */}
        {screen.type === 'loading' && (() => {
          const workshop = getWorkshopById(screen.workshopId);

          return (
            <div
              role="status"
              aria-live="polite"
              className="my-12 p-10 md:p-14 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-amber-50/70 dark:bg-slate-900 text-center space-y-6 shadow-md"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white dark:bg-slate-800 border-4 border-slate-900 dark:border-amber-300 flex items-center justify-center text-5xl animate-bounce">
                <span aria-hidden="true">{workshop?.emoji || '✨'}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white">
                Votre création est en train de prendre vie...
              </h1>
              <p className="text-2xl text-slate-800 dark:text-slate-200 max-w-xl mx-auto">
                Installez-vous confortablement, L’Atelier Alphabette prépare votre résultat sur mesure avec soin.
              </p>
            </div>
          );
        })()}

        {/* ================================================================
            ÉCRAN DE RÉSULTAT
           ================================================================ */}
        {screen.type === 'result' && (() => {
          const workshop =
            getWorkshopById(screen.workshopId) ||
            getWorkshopById('contes-petits-enfants')!;
          const isAlreadySaved = savedCreations.some(
            (c) => c.id === screen.creation.id
          );

          return (
            <ResultView
              workshop={workshop}
              creation={screen.creation}
              isSaved={isAlreadySaved}
              onSave={() => {
                if (!isAlreadySaved) {
                  setSavedCreations((prev) => [screen.creation, ...prev]);
                }
                setVoiceBannerMessage(
                  'Votre création est bien sauvegardée dans « Mes Créations » !'
                );
              }}
              isSpeaking={isSpeaking}
              onToggleSpeak={(txt) => speakText(txt)}
              onAdjust={(instruction) =>
                handleCreateNow(workshop, screen.creation.selections, instruction)
              }
              onContinueInteractive={(choiceText) =>
                handleContinueInteractive(workshop, screen.creation, choiceText)
              }
              isLoadingAdjustment={isLoadingAdjustment}
              isListening={isListening}
              onToggleDictateQuestion={() =>
                handleToggleDictate((transcript) => {
                  handleContinueInteractive(workshop, screen.creation, transcript);
                })
              }
            />
          );
        })()}

        {/* ================================================================
            GALERIE LOCALE SAUVEGARDÉE ("MES CRÉATIONS")
           ================================================================ */}
        {screen.type === 'gallery' && (
          <SavedGalleryView
            creations={savedCreations}
            onOpenCreation={(item) =>
              navigateTo({
                type: 'result',
                workshopId: item.workshopId,
                creation: item,
              })
            }
            onSpeakCreation={(item) =>
              speakText(`${item.title}. ${item.subtitle}. ${item.content}`)
            }
            onDeleteCreation={(id) =>
              setSavedCreations((prev) => prev.filter((c) => c.id !== id))
            }
            onGoHome={handleGoHome}
          />
        )}
      </main>

      {/* 2. Barre inférieure fixe Alphabette (se masque automatiquement au scroll vers le bas) */}
      <BottomBarAlphabette
        canGoBack={screen.type !== 'home'}
        onGoBack={handleGoBack}
        onOpenGallery={() => navigateTo({ type: 'gallery' })}
        savedCount={savedCreations.length}
        isGalleryActive={screen.type === 'gallery'}
        isSpeaking={isSpeaking}
        onToggleSpeakScreen={() => speakText(getCurrentScreenSummaryForSpeech())}
        isListening={isListening}
        onToggleDictate={() => handleToggleDictate()}
        isHiddenOnScroll={hideBarsOnScroll}
      />
    </div>
  );
}
