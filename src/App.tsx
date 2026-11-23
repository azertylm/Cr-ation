import React, { useState, useEffect, useRef } from 'react';
import {
  CATEGORIES,
  CategoryId,
  WorkshopDefinition,
  SavedCreation,
  ChoiceOption,
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
  generateLocalStepSuggestionsFallback,
  HOME_QUICK_PROPOSITIONS,
  HomeQuickProposition,
} from './utils/atelierLogic';
import {
  alphabetteAudio,
  AlphabetteAudioState,
  buildReadableCreationText,
} from './utils/alphabetteAudio';
import { TopBarAlphabette } from './components/TopBarAlphabette';
import { ResultView } from './components/ResultView';
import { SavedGalleryView } from './components/SavedGalleryView';
import {
  Mic,
  CheckCircle2,
  ArrowRight,
  Wand2,
  HeartHandshake,
  FolderHeart,
  Sparkles,
  RefreshCw,
  Loader2,
  Check,
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

  // Unified Alphabette Audio & Dictation states
  const [audioState, setAudioState] = useState<AlphabetteAudioState>(() =>
    alphabetteAudio.getState()
  );
  const isSpeaking = audioState.status === 'playing';
  const isAudioLoading = audioState.status === 'loading';
  const speakingTargetId = audioState.targetId;

  const [isListening, setIsListening] = useState(false);
  const [voiceBannerMessage, setVoiceBannerMessage] = useState<string | null>(null);
  const [isLoadingAdjustment, setIsLoadingAdjustment] = useState(false);

  // Rich Propositions states
  const [homePropBatchIndex, setHomePropBatchIndex] = useState(0);
  const [extraStepOptions, setExtraStepOptions] = useState<Record<string, ChoiceOption[]>>({});
  const [isLoadingStepSuggestions, setIsLoadingStepSuggestions] = useState(false);
  const [isLoadingMoreInteractiveChoices, setIsLoadingMoreInteractiveChoices] = useState(false);
  const [customStepIdea, setCustomStepIdea] = useState('');

  const recognitionRef = useRef<unknown>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const unsubscribe = alphabetteAudio.subscribe(setAudioState);
    return () => {
      unsubscribe();
      alphabetteAudio.stop();
    };
  }, []);

  // Sync font size CSS variable (16px base, 20px in BIG mode)
  useEffect(() => {
    const px = FONT_SCALE_VALUES[fontScaleIndex] || 16;
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
    setHistoryStack((prev) => [...prev, screen]);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    stopSpeaking();
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
    setHistoryStack([]);
    setScreen({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Unified Alphabette Audio Playback (Google Gemini TTS across all screens)
  const stopSpeaking = () => {
    alphabetteAudio.stop();
  };

  const toggleSpeakText = (text: string, targetId = 'global') => {
    alphabetteAudio.toggle(text, targetId);
  };

  const getCurrentScreenSummaryForSpeech = (): string => {
    if (screen.type === 'home') {
      return "Bienvenue dans L'Atelier Alphabette. Que souhaitez-vous créer aujourd'hui ? Choisissez parmi nos 4 grandes catégories : 1. Mémoire et Transmission. 2. Arts Visuels et Création. 3. Musique, Poésie et Humour. 4. Cuisine, Voyages et Curiosité. Vous trouverez aussi juste dessous des propositions rapides prêtes à démarrer.";
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
      const extra = extraStepOptions[`${w.id}-${screen.stepIndex}`] || [];
      const allOpts = [...step.options, ...extra];
      return `Atelier ${w.title}. Étape ${screen.stepIndex + 1} sur 3. ${step.question}. Voici quelques choix proposés : ${allOpts
        .slice(0, 6)
        .map((o) => o.label)
        .join(', ')}.`;
    }
    if (screen.type === 'result') {
      const workshop = getWorkshopById(screen.workshopId);
      return buildReadableCreationText(screen.creation, workshop);
    }
    if (screen.type === 'gallery') {
      return `Mes Créations sauvegardées. Vous avez ${savedCreations.length} création${
        savedCreations.length > 1 ? 's' : ''
      } dans votre album.`;
    }
    return 'Votre création est en train de prendre vie.';
  };

  // Speech Recognition (Web Speech API + Gemini Transcribe universal microphone fallback)
  const handleToggleDictate = async (onTranscriptReady?: (transcript: string) => void) => {
    const applyTranscript = (transcript: string) => {
      setVoiceBannerMessage(`Texte dicté reçu : « ${transcript} »`);
      if (onTranscriptReady) {
        onTranscriptReady(transcript);
      } else if (screen.type === 'workshop-step') {
        const stepKey = `step${screen.stepIndex + 1}` as 'step1' | 'step2' | 'step3';
        setSelections((prev) => ({ ...prev, [stepKey]: transcript }));
      }
    };

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
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
            applyTranscript(transcript);
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
        return;
      } catch {
        setIsListening(false);
      }
    }

    // Fallback via MediaRecorder + Google Gemini Transcribe (/api/atelier/transcribe)
    if (isListening && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const chunks: BlobPart[] = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunks.push(ev.data);
        };

        recorder.onstop = async () => {
          setIsListening(false);
          mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;

          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          if (blob.size < 200) return;

          setVoiceBannerMessage('Transcription de votre voix en cours...');
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = String(reader.result || '');
            const base64 = dataUrl.split(',')[1] || '';
            if (!base64) return;
            try {
              const res = await fetch('/api/atelier/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64,
                  mimeType: blob.type || 'audio/webm',
                }),
              });
              const data = await res.json();
              if (data?.transcript) {
                applyTranscript(data.transcript);
              } else {
                setVoiceBannerMessage('Nous n’avons pas pu reconnaître la phrase, essayez à nouveau ou touchez une proposition.');
              }
            } catch {
              setVoiceBannerMessage('Impossible de joindre le service vocal pour le moment.');
            }
          };
          reader.readAsDataURL(blob);
        };

        setIsListening(true);
        setVoiceBannerMessage('Parlez maintenant, puis touchez le bouton pour arrêter l’enregistrement...');
        recorder.start();
        return;
      } catch {
        setIsListening(false);
      }
    }

    setVoiceBannerMessage(
      'Astuce : La dictée vocale directe dépend de votre microphone. Touchez l’une des nombreuses propositions ou écrivez librement votre idée !'
    );
    setTimeout(() => setVoiceBannerMessage(null), 5000);
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

    const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 38000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    };

    try {
      if (workshop.mode === 'quiz') {
        const res = await fetchWithTimeout('/api/atelier/quiz', {
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
        const res = await fetchWithTimeout('/api/atelier/interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workshopId: workshop.id,
            selections: currentSelections,
            history: [],
            adjustmentInstruction,
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
              : [
                  'Continuer la promenade',
                  'Poser une autre question',
                  'Découvrir un détail secret',
                  'S’accorder une pause gourmande',
                ],
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

      const res = await fetchWithTimeout('/api/atelier/create', {
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
      }, workshop.mode === 'visual' ? 45000 : 38000);

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
      let newCreation: SavedCreation;
      if (workshop.mode === 'quiz') {
        const quizData = generateLocalQuizFallback(currentSelections);
        newCreation = {
          id: `creation-${Date.now()}`,
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopEmoji: workshop.emoji,
          categoryId: workshop.categoryId,
          createdAt: nowFormatted,
          selections: currentSelections,
          title: quizData.title,
          subtitle: quizData.subtitle,
          content: `Quiz interactif de 5 questions sur « ${currentSelections.step1} ».`,
          quizQuestions: quizData.questions,
        };
      } else if (workshop.mode === 'interactive') {
        const chapter = generateLocalInteractiveFallback(workshop, currentSelections, 0);
        newCreation = {
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
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 38000);
      let res: Response;
      try {
        res = await fetch('/api/atelier/interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
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
      } finally {
        clearTimeout(timer);
      }

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

  // Load 4 more fresh step propositions from Google Gemini / local pool
  const handleLoadMoreStepSuggestions = async (
    workshop: WorkshopDefinition,
    stepIndex: 0 | 1 | 2
  ) => {
    const key = `${workshop.id}-${stepIndex}`;
    const currentStep = workshop.steps[stepIndex];
    const existingExtra = extraStepOptions[key] || [];
    const existingLabels = [...currentStep.options, ...existingExtra].map((o) => o.label);

    setIsLoadingStepSuggestions(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let newOptions: ChoiceOption[] = [];
      try {
        const res = await fetch('/api/atelier/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            mode: 'step',
            workshopId: workshop.id,
            stepIndex,
            existingLabels,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.options)) {
            newOptions = data.options;
          }
        }
      } finally {
        clearTimeout(timer);
      }

      if (newOptions.length === 0) {
        newOptions = generateLocalStepSuggestionsFallback(workshop, stepIndex, existingLabels);
      }

      setExtraStepOptions((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...newOptions],
      }));
    } catch {
      const fallback = generateLocalStepSuggestionsFallback(workshop, stepIndex, existingLabels);
      setExtraStepOptions((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...fallback],
      }));
    } finally {
      setIsLoadingStepSuggestions(false);
    }
  };

  // Load 4 fresh continuation choices in interactive mode (#17, #19, #20)
  const handleMoreInteractiveChoices = async (
    workshop: WorkshopDefinition,
    creation: SavedCreation
  ) => {
    const existingHistory = creation.interactiveHistory || [];
    if (existingHistory.length === 0) return;

    const latest = existingHistory[existingHistory.length - 1];
    setIsLoadingMoreInteractiveChoices(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let freshChoices: string[] = [];
      try {
        const res = await fetch('/api/atelier/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            mode: 'interactive',
            workshopId: workshop.id,
            selections: creation.selections,
            existingLabels: latest.choices,
            history: existingHistory.map((h) => ({ text: h.content, choice: h.choiceMade })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.choices) && data.choices.length > 0) {
            freshChoices = data.choices;
          }
        }
      } finally {
        clearTimeout(timer);
      }

      if (freshChoices.length === 0) {
        freshChoices = [
          'Découvrir un détail secret ou une anecdote inattendue',
          'Prendre un instant calme pour observer les alentours',
          'Poser une question sur les souvenirs d’enfance',
          'Partager un moment gourmand ou musical ensemble',
        ];
      }

      const updatedHistory = existingHistory.map((chap, idx) =>
        idx === existingHistory.length - 1 ? { ...chap, choices: freshChoices } : chap
      );
      const updatedCreation: SavedCreation = {
        ...creation,
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
      setIsLoadingMoreInteractiveChoices(false);
    }
  };

  // Launch a Home quick proposition directly
  const handleSelectQuickProposition = (prop: HomeQuickProposition) => {
    const workshop = getWorkshopById(prop.workshopId);
    if (!workshop) return;
    setSelections(prop.selections);
    navigateTo({
      type: 'workshop-step',
      workshopId: workshop.id,
      stepIndex: 2,
    });
  };

  const handleToggleBigMode = () => {
    setFontScaleIndex((prev) => (prev === 0 ? 2 : 0));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-950 dark:text-white">
      {/* DOUBLE BARRE ALPHABETTE FIXE */}
      <TopBarAlphabette
        onGoHome={handleGoHome}
        fontScaleIndex={fontScaleIndex}
        maxFontScaleIndex={FONT_SCALE_VALUES.length - 1}
        onChangeFontScale={(dir) =>
          setFontScaleIndex((prev) => getNextFontScale(prev, dir))
        }
        onToggleBigMode={handleToggleBigMode}
        isBigModeActive={fontScaleIndex > 0}
        highContrastDark={highContrastDark}
        onToggleContrast={() => setHighContrastDark((prev) => !prev)}
        canGoBack={screen.type !== 'home'}
        onGoBack={handleGoBack}
        isSpeaking={isSpeaking}
        isAudioLoading={isAudioLoading}
        onToggleSpeakScreen={() => {
          if (isSpeaking || isAudioLoading) {
            stopSpeaking();
            return;
          }
          toggleSpeakText(getCurrentScreenSummaryForSpeech(), `topbar-${screen.type}`);
        }}
        isListening={isListening}
        onToggleDictate={() => handleToggleDictate()}
      />

      {/* Voice / Dictation Feedback Banner */}
      {voiceBannerMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print max-w-6xl mx-auto mt-3 px-3 sm:px-4 w-full"
        >
          <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-900 dark:border-amber-300 text-slate-950 dark:text-amber-100 font-semibold text-base flex items-center justify-between gap-3">
            <span>🎙️ {voiceBannerMessage}</span>
            <button
              type="button"
              onClick={() => setVoiceBannerMessage(null)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-900 dark:border-amber-300 text-sm cursor-pointer shrink-0"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-14">
        {/* ================================================================
            ÉCRAN D'ACCUEIL : Message chaleureux + 4 Cartes Catégories
           ================================================================ */}
        {screen.type === 'home' && (
          <div className="space-y-4 sm:space-y-5">
            <section className="p-4 sm:p-6 rounded-2xl border-2 border-slate-300 dark:border-amber-300/70 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-xs">
              <p className="text-sm sm:text-base font-bold text-[#3f51b5] dark:text-amber-300">
                Bienvenue dans votre espace créatif sans complexe
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-slate-950 dark:text-white leading-snug">
                Que souhaitez-vous créer aujourd’hui ?
              </h1>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
                Touchez simplement une grande catégorie ci-dessous. Vous serez guidé(e) pas à pas par de gros boutons clairs, sans avoir à taper au clavier.
              </p>
            </section>

            {/* Accès rapide Mes Créations sauvegardées */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigateTo({ type: 'gallery' })}
                className="min-h-[44px] px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-sm sm:text-base border-2 border-slate-900 dark:border-amber-300 flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                aria-label={`Ouvrir mon album (${savedCreations.length} création${savedCreations.length > 1 ? 's' : ''})`}
              >
                <FolderHeart className="w-4 h-4 text-[#3f51b5] dark:text-amber-300 shrink-0" aria-hidden="true" />
                <span>Mon Album ({savedCreations.length})</span>
              </button>
            </div>

            {/* 4 Cartes Catégories aux couleurs distinctes et rassurantes */}
            <section
              aria-label="Les 4 grandes catégories d'ateliers"
              className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4"
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
                    className={`min-h-[140px] p-4 sm:p-5 rounded-2xl border-2 ${category.borderClass} ${category.bgLightClass} hover:brightness-95 active:scale-[0.99] text-left flex flex-col justify-between gap-2.5 shadow-xs transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="space-y-0.5">
                        <span
                          className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${category.badgeTextClass}`}
                        >
                          Catégorie {category.number} · {workshopsInCategory.length} ateliers
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-slate-950 dark:text-white leading-snug">
                          {category.title}
                        </h2>
                      </div>
                      <span
                        className="text-3xl sm:text-4xl shrink-0"
                        aria-hidden="true"
                      >
                        {category.emoji}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-snug">
                      {category.subtitle}
                    </p>

                    <div className="pt-2 flex items-center justify-between w-full border-t border-slate-900/15 dark:border-white/15">
                      <span className="text-sm sm:text-base font-bold text-slate-950 dark:text-amber-300">
                        Ouvrir les 5 ateliers
                      </span>
                      <ArrowRight
                        className="w-5 h-5 text-slate-950 dark:text-amber-300"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Propositions rapides prêtes à démarrer sur l'accueil */}
            <section
              aria-label="Propositions rapides prêtes à démarrer"
              className="p-4 sm:p-5 rounded-2xl border-2 border-blue-900/30 dark:border-amber-300/60 bg-white dark:bg-slate-900 space-y-3.5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#3f51b5] dark:text-amber-300 shrink-0" aria-hidden="true" />
                  <h2 className="text-lg sm:text-xl font-serif-title font-bold text-slate-950 dark:text-white">
                    Envie d’inspiration ? Propositions prêtes en 1 clic
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setHomePropBatchIndex(
                      (prev) => (prev + 4) % HOME_QUICK_PROPOSITIONS.length
                    )
                  }
                  className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 font-bold text-sm border border-blue-900/40 dark:border-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>D’autres propositions</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }, (_, offset) => {
                  const item =
                    HOME_QUICK_PROPOSITIONS[
                      (homePropBatchIndex + offset) % HOME_QUICK_PROPOSITIONS.length
                    ];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectQuickProposition(item)}
                      className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50/70 hover:bg-amber-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0" aria-hidden="true">
                          {item.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-base text-slate-950 dark:text-white leading-snug">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#3f51b5] dark:text-amber-300 shrink-0" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Reassuring Helper Card */}
            <section className="p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HeartHandshake
                  className="w-7 h-7 text-[#3f51b5] dark:text-amber-300 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">
                  <strong>Tout est sauvegardé automatiquement</strong> sur votre appareil dans « Mon Album ».
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo({ type: 'gallery' })}
                className="min-h-[42px] px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-950 dark:text-white font-bold text-sm sm:text-base border border-slate-900 dark:border-slate-400 cursor-pointer shrink-0"
              >
                Voir mes créations
              </button>
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
            <div className="space-y-5">
              <div
                className={`p-4 sm:p-6 rounded-2xl border-2 ${category.borderClass} ${category.bgLightClass}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl shrink-0" aria-hidden="true">
                    {category.emoji}
                  </span>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${category.badgeTextClass}`}
                    >
                      Catégorie {category.number} · Choisissez votre atelier
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-slate-950 dark:text-white">
                      {category.title}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 mt-0.5">
                      Touchez l’atelier qui vous fait plaisir parmi les 5 propositions ci-dessous :
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {workshops.map((workshop) => (
                  <button
                    key={workshop.id}
                    type="button"
                    onClick={() => handleStartWorkshop(workshop)}
                    className="min-h-[96px] p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-200 bg-white hover:bg-amber-50/70 dark:bg-slate-900 dark:hover:bg-slate-800 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-start md:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-amber-300 flex items-center justify-center text-3xl shrink-0">
                        <span aria-hidden="true">{workshop.emoji}</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-amber-300">
                          Atelier n° {workshop.number}
                        </p>
                        <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-slate-950 dark:text-white">
                          {workshop.title}
                        </h2>
                        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200">
                          {workshop.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="min-h-[48px] px-5 py-2.5 rounded-xl bg-blue-900 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-base sm:text-lg flex items-center gap-2 shrink-0 self-stretch md:self-center justify-center">
                      <span>Commencer</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
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
            <div className="space-y-5">
              {/* Step Progress Header */}
              <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl shrink-0" aria-hidden="true">
                      {workshop.emoji}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-amber-300">
                        Atelier n° {workshop.number} · {workshop.title}
                      </p>
                      <h1 className="text-xl sm:text-2xl font-serif-title font-bold text-slate-950 dark:text-white">
                        Étape {stepIndex + 1} sur 3 : {currentStep.question}
                      </h1>
                    </div>
                  </div>

                  {/* Step Indicator Buttons (1 - 2 - 3) */}
                  <div
                    className="flex items-center gap-1.5"
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
                        className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold text-sm sm:text-base border-2 cursor-pointer ${
                          stepIndex === idx
                            ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950'
                            : 'bg-slate-50 text-slate-900 border-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-400'
                        }`}
                      >
                        Étape {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium">
                  {currentStep.helperText}
                </p>
              </div>

              {/* 8+ Large Visual Choice Buttons + Dynamic "Voir d'autres propositions" */}
              {(() => {
                const extraKey = `${workshop.id}-${stepIndex}`;
                const allStepOptions = [
                  ...currentStep.options,
                  ...(extraStepOptions[extraKey] || []),
                ];

                return (
                  <div className="space-y-3">
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      role="group"
                      aria-label={currentStep.question}
                    >
                      {allStepOptions.map((opt) => {
                        const isSelected = currentValue === opt.label;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleSelectStepOption(workshop, stepIndex, opt.label)
                            }
                            className={`min-h-[70px] p-4 sm:p-5 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] cursor-pointer ${
                              isSelected
                                ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950 dark:border-white shadow-sm'
                                : 'bg-white hover:bg-blue-50/70 text-slate-950 border-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white dark:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl shrink-0" aria-hidden="true">
                                {opt.emoji}
                              </span>
                              <span className="text-base sm:text-lg font-bold leading-snug">
                                {opt.label}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2
                                className="w-6 h-6 shrink-0"
                                aria-label="Choix sélectionné"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        disabled={isLoadingStepSuggestions}
                        onClick={() =>
                          handleLoadMoreStepSuggestions(workshop, stepIndex)
                        }
                        className="min-h-[50px] px-6 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 disabled:opacity-60 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 font-bold text-base sm:text-lg border-2 border-amber-700 dark:border-amber-300 flex items-center gap-2.5 shadow-xs cursor-pointer"
                      >
                        {isLoadingStepSuggestions ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                            <span>Recherche de nouvelles idées...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span>Voir d’autres propositions ({allStepOptions.length} disponibles)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Optional Custom Text & Microphone Button ("Ou dites-le à voix haute") */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-rose-900 dark:border-rose-300 bg-rose-50/60 dark:bg-slate-900 space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center md:text-left">
                    <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                      🎙️ Vous préférez le dire ou l’écrire avec vos propres mots ?
                    </p>
                    <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200">
                      Choix actuel pour cette étape :{' '}
                      <strong className="underline">{currentValue}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDictate()}
                    className={`min-h-[50px] px-5 py-2 rounded-xl font-bold text-base sm:text-lg border-2 flex items-center gap-2.5 shrink-0 cursor-pointer ${
                      isListening
                        ? 'bg-rose-800 text-white border-slate-950'
                        : 'bg-white hover:bg-rose-100 text-rose-950 border-rose-900 dark:bg-slate-800 dark:text-rose-200 dark:border-rose-300'
                    }`}
                  >
                    <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>
                      {isListening
                        ? 'Je vous écoute... (toucher pour finir)'
                        : 'Dicter à voix haute'}
                    </span>
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = customStepIdea.trim();
                    if (!trimmed) return;
                    setSelections((prev) => ({ ...prev, [stepKey]: trimmed }));
                    setCustomStepIdea('');
                  }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={customStepIdea}
                    onChange={(e) => setCustomStepIdea(e.target.value)}
                    placeholder={
                      currentStep.voicePromptPlaceholder ||
                      'Écrivez ici votre propre idée si vous le souhaitez (facultatif)...'
                    }
                    className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-900 dark:border-slate-300 text-base font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!customStepIdea.trim()}
                    className="min-h-[48px] px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white dark:bg-amber-300 dark:text-slate-950 font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Utiliser cette idée</span>
                  </button>
                </form>
              </div>

              {/* Summary of 3 Choices & Giant Final Button "Créer maintenant" */}
              <div className="p-4 sm:p-6 rounded-2xl border-2 border-emerald-900 dark:border-emerald-300 bg-emerald-50 dark:bg-slate-900 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                    Vos 3 choix pour cet atelier :
                  </h2>
                  <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    1. <strong>{selections.step1}</strong> · 2.{' '}
                    <strong>{selections.step2}</strong> · 3.{' '}
                    <strong>{selections.step3}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                      className="min-h-[54px] px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Passer à l’étape {stepIndex + 2} sur 3</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCreateNow(workshop, selections)}
                    className="min-h-[58px] flex-1 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 font-extrabold text-lg sm:text-xl border-2 border-slate-950 dark:border-white flex items-center justify-center gap-3 shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <Wand2 className="w-6 h-6 shrink-0" aria-hidden="true" />
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
              key={screen.creation.id}
              workshop={workshop}
              creation={screen.creation}
              isSaved={isAlreadySaved}
              onSave={() => {
                if (!isAlreadySaved) {
                  setSavedCreations((prev) => [screen.creation, ...prev]);
                }
                setVoiceBannerMessage(
                  'Votre création est bien sauvegardée dans « Album » !'
                );
              }}
              speakingTargetId={speakingTargetId}
              isAudioLoading={isAudioLoading}
              onToggleSpeak={(txt, targetId) => toggleSpeakText(txt, targetId)}
              onAdjust={(instruction) =>
                handleCreateNow(workshop, screen.creation.selections, instruction)
              }
              onContinueInteractive={(choiceText) =>
                handleContinueInteractive(workshop, screen.creation, choiceText)
              }
              onMoreInteractiveChoices={() =>
                handleMoreInteractiveChoices(workshop, screen.creation)
              }
              isLoadingMoreChoices={isLoadingMoreInteractiveChoices}
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
            speakingTargetId={speakingTargetId}
            isAudioLoading={isAudioLoading}
            onOpenCreation={(item) =>
              navigateTo({
                type: 'result',
                workshopId: item.workshopId,
                creation: item,
              })
            }
            onSpeakCreation={(item) =>
              toggleSpeakText(
                buildReadableCreationText(item, getWorkshopById(item.workshopId)),
                `gallery-${item.id}`
              )
            }
            onDeleteCreation={(id) =>
              setSavedCreations((prev) => prev.filter((c) => c.id !== id))
            }
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
}
