import React, { useState } from 'react';
import {
  SavedCreation,
  WorkshopDefinition,
  QuizQuestion,
} from '../data/workshops';
import { buildReadableCreationText } from '../utils/alphabetteAudio';
import { VisualCardFallback } from './VisualCardFallback';
import {
  Volume2,
  VolumeX,
  BookmarkCheck,
  Printer,
  Copy,
  Check,
  SmilePlus,
  RefreshCw,
  Mic,
  ArrowRight,
  Award,
  Loader2,
  Sparkles,
  Heart,
  AlignLeft,
  Scissors,
  Send,
} from 'lucide-react';

interface ResultViewProps {
  workshop: WorkshopDefinition;
  creation: SavedCreation;
  isSaved: boolean;
  onSave: () => void;
  speakingTargetId: string | null;
  isAudioLoading: boolean;
  onToggleSpeak: (textToRead: string, targetId: string) => void;
  onAdjust: (instruction: string) => void;
  onContinueInteractive: (choice: string) => void;
  onMoreInteractiveChoices?: () => void;
  isLoadingMoreChoices?: boolean;
  isLoadingAdjustment: boolean;
  isListening: boolean;
  onToggleDictateQuestion: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  workshop,
  creation,
  isSaved,
  onSave,
  speakingTargetId,
  isAudioLoading,
  onToggleSpeak,
  onAdjust,
  onContinueInteractive,
  onMoreInteractiveChoices,
  isLoadingMoreChoices = false,
  isLoadingAdjustment,
  isListening,
  onToggleDictateQuestion,
}) => {
  const [copied, setCopied] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [customInteractiveInput, setCustomInteractiveInput] = useState('');

  const handleCopy = async () => {
    const fullText = `${creation.title}\n${creation.subtitle}\n\n${creation.content}${
      creation.tips && creation.tips.length > 0
        ? `\n\nConseils :\n- ${creation.tips.join('\n- ')}`
        : ''
    }\n\n— Créé avec L'Atelier Alphabette`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmitCustomInteractive = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInteractiveInput.trim();
    if (!val || isLoadingAdjustment) return;
    setCustomInteractiveInput('');
    onContinueInteractive(val);
  };

  const quizQuestions: QuizQuestion[] = creation.quizQuestions || [];
  const answeredCount = Object.keys(quizAnswers).length;
  const correctCount = quizQuestions.reduce((acc, q, idx) => {
    if (quizAnswers[idx] === q.correctIndex) return acc + 1;
    return acc;
  }, 0);

  const latestInteractiveChapter =
    creation.interactiveHistory && creation.interactiveHistory.length > 0
      ? creation.interactiveHistory[creation.interactiveHistory.length - 1]
      : null;

  const fullReadableText = buildReadableCreationText(creation, workshop);
  const mainTargetId = `result-${creation.id}`;
  const isMainActive = speakingTargetId === mainTargetId;
  const isMainLoading = isMainActive && isAudioLoading;
  const isMainPlaying = isMainActive && !isAudioLoading;

  return (
    <div className="space-y-6 pb-10">
      {/* Main Creation Card */}
      <article className="print-card p-5 sm:p-7 rounded-2xl border-2 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-sm sm:text-base font-bold text-blue-900 dark:text-amber-300 flex items-center gap-2">
              <span aria-hidden="true" className="text-xl">
                {creation.workshopEmoji}
              </span>
              <span>Atelier {workshop.number} · {creation.workshopTitle}</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-slate-950 dark:text-white mt-1.5">
              {creation.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium mt-1">
              {creation.subtitle}
            </p>
          </div>

          {/* Quick inline Listen button right at the top of the card */}
          <button
            type="button"
            onClick={() => onToggleSpeak(fullReadableText, mainTargetId)}
            className={`no-print min-h-[44px] px-4 py-2 rounded-full font-bold text-sm sm:text-base border-2 flex items-center gap-2 shrink-0 cursor-pointer self-start transition-colors ${
              isMainPlaying
                ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
                : isMainLoading
                  ? 'bg-amber-100 text-amber-950 border-amber-700 dark:bg-slate-800 dark:text-amber-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-800 dark:bg-slate-800 dark:text-emerald-200 dark:border-emerald-300'
            }`}
          >
            {isMainLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Préparation...</span>
              </>
            ) : isMainPlaying ? (
              <>
                <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Arrêter</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Écouter</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Workshop Display (if mode === 'visual') */}
        {workshop.mode === 'visual' && (
          <VisualCardFallback
            title={creation.title}
            subtitle={creation.subtitle}
            selections={creation.selections}
            visualStyle={creation.visualStyle || workshop.visualStyle}
            imageUrl={creation.imageUrl}
          />
        )}

        {/* Quiz Interactive Mode (Workshop #14) */}
        {workshop.mode === 'quiz' && quizQuestions.length > 0 ? (
          <div className="space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-300 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-7 h-7 text-amber-800 dark:text-amber-300 shrink-0" />
                <span className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                  Votre score : {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {quizQuestions.length}
                </span>
              </div>
              <span className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200">
                Touchez une réponse pour chaque question
              </span>
            </div>

            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = quizAnswers[qIdx];
              const hasAnswered = selectedOpt !== undefined;
              const qTargetId = `quiz-${creation.id}-${qIdx}`;
              const isQActive = speakingTargetId === qTargetId;
              const qSpeech = `Question ${qIdx + 1} : ${q.question}. ${q.options
                .map((opt, oIdx) => `Choix ${String.fromCharCode(65 + oIdx)} : ${opt}`)
                .join('. ')}`;

              return (
                <div
                  key={qIdx}
                  className="p-5 sm:p-6 rounded-2xl border-2 border-slate-900 dark:border-slate-300 bg-slate-50/70 dark:bg-slate-800/80 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                      Question {qIdx + 1} : {q.question}
                    </h2>
                    <button
                      type="button"
                      onClick={() => onToggleSpeak(qSpeech, qTargetId)}
                      className={`no-print min-h-[40px] px-3 py-1.5 rounded-full font-bold text-sm border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isQActive
                          ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
                          : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-800 dark:bg-slate-900 dark:text-emerald-200 dark:border-emerald-300'
                      }`}
                      aria-label={`Écouter la question ${qIdx + 1}`}
                    >
                      {isQActive && isAudioLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : isQActive ? (
                        <VolumeX className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">
                        {isQActive ? 'Arrêter' : 'Écouter'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle =
                        'bg-white hover:bg-blue-50 text-slate-950 border-slate-900 dark:bg-slate-900 dark:hover:bg-slate-700 dark:text-white dark:border-slate-300';

                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle =
                            'bg-emerald-800 text-white border-emerald-950 dark:bg-emerald-400 dark:text-slate-950 dark:border-white';
                        } else if (isThisSelected) {
                          btnStyle =
                            'bg-rose-800 text-white border-rose-950 dark:bg-rose-400 dark:text-slate-950';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                          className={`min-h-[58px] px-4 sm:px-5 py-3 rounded-2xl border-2 font-bold text-lg sm:text-xl text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${btnStyle}`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {hasAnswered && isCorrect && (
                            <span className="text-sm sm:text-base font-extrabold px-3 py-1 rounded-xl bg-white text-emerald-950 shrink-0">
                              ✓ Bonne réponse
                            </span>
                          )}
                          {hasAnswered && isThisSelected && !isCorrect && (
                            <span className="text-sm sm:text-base font-extrabold px-3 py-1 rounded-xl bg-white text-rose-950 shrink-0">
                              Votre choix
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-slate-900 border-2 border-emerald-900 dark:border-emerald-300 text-slate-950 dark:text-emerald-100 text-base sm:text-lg font-medium">
                      💡 <strong>Le saviez-vous ?</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {answeredCount === quizQuestions.length && (
              <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-900 dark:border-emerald-300 text-center space-y-2">
                <p className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-200">
                  🎉 Bravo ! Vous avez terminé les 5 questions avec un score de {correctCount} / {quizQuestions.length} !
                </p>
              </div>
            )}
          </div>
        ) : workshop.mode === 'interactive' && creation.interactiveHistory ? (
          /* Interactive Story / Historical Café Mode (#17, #19, #20) */
          <div className="space-y-6">
            {creation.interactiveHistory.map((chap, idx) => {
              const chapTargetId = `chap-${creation.id}-${idx}`;
              const isChapActive = speakingTargetId === chapTargetId;
              const chapSpeech = `${chap.chapterTitle}. ${chap.content}`;

              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-3"
                >
                  {chap.choiceMade && (
                    <p className="text-sm sm:text-base font-bold text-blue-900 dark:text-amber-300">
                      ➔ Votre choix : « {chap.choiceMade} »
                    </p>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-slate-950 dark:text-white">
                      {chap.chapterTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => onToggleSpeak(chapSpeech, chapTargetId)}
                      className={`no-print min-h-[38px] px-3 py-1.5 rounded-full font-bold text-sm border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isChapActive
                          ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
                          : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-800 dark:bg-slate-900 dark:text-emerald-200 dark:border-emerald-300'
                      }`}
                      aria-label={`Écouter ${chap.chapterTitle}`}
                    >
                      {isChapActive && isAudioLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : isChapActive ? (
                        <VolumeX className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{isChapActive ? 'Arrêter' : 'Écouter'}</span>
                    </button>
                  </div>
                  <div className="text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line">
                    {chap.content}
                  </div>
                </div>
              );
            })}

            {/* 4 Large Interactive Choice Buttons + More Ideas + Custom Question/Input */}
            {latestInteractiveChapter && latestInteractiveChapter.choices.length > 0 && (
              <div className="no-print p-5 sm:p-6 rounded-2xl bg-blue-50 dark:bg-slate-800 border-2 border-blue-900 dark:border-amber-300 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                    {workshop.id === 'cafe-histoire'
                      ? 'Que souhaitez-vous lui demander maintenant ?'
                      : 'Que décidez-vous de faire pour la suite ?'}
                  </h3>

                  {onMoreInteractiveChoices && (
                    <button
                      type="button"
                      disabled={isLoadingMoreChoices || isLoadingAdjustment}
                      onClick={onMoreInteractiveChoices}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-amber-50 disabled:opacity-50 text-blue-950 dark:bg-slate-900 dark:text-amber-300 font-bold text-sm sm:text-base border-2 border-blue-900 dark:border-amber-300 flex items-center gap-2 cursor-pointer"
                    >
                      {isLoadingMoreChoices ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>Proposer d’autres pistes</span>
                    </button>
                  )}
                </div>

                {isLoadingAdjustment && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-800 text-blue-950 dark:text-amber-200 font-bold flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                    <span>Suite en cours de préparation avec soin...</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {latestInteractiveChapter.choices.map((choiceText, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      disabled={isLoadingAdjustment}
                      onClick={() => onContinueInteractive(choiceText)}
                      className="min-h-[68px] p-4 sm:p-5 rounded-2xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200 font-bold text-lg sm:text-xl text-left flex items-center justify-between gap-3 border-2 border-slate-950 dark:border-white shadow-sm cursor-pointer"
                    >
                      <span>{choiceText}</span>
                      <ArrowRight className="w-6 h-6 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                {/* Custom question / action input + Microphone for ALL interactive workshops */}
                <form
                  onSubmit={handleSubmitCustomInteractive}
                  className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={customInteractiveInput}
                    onChange={(e) => setCustomInteractiveInput(e.target.value)}
                    placeholder={
                      workshop.id === 'cafe-histoire'
                        ? 'Ou écrivez votre propre question...'
                        : 'Ou proposez votre propre idée pour la suite...'
                    }
                    className="flex-1 min-h-[52px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 dark:border-slate-300 text-base sm:text-lg font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!customInteractiveInput.trim() || isLoadingAdjustment}
                    className="min-h-[52px] px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white dark:bg-emerald-400 dark:text-slate-950 font-bold text-base sm:text-lg border-2 border-slate-950 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Envoyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleDictateQuestion}
                    className={`min-h-[52px] px-4 py-2.5 rounded-xl font-bold text-base border-2 flex items-center justify-center gap-2 cursor-pointer ${
                      isListening
                        ? 'bg-rose-800 text-white border-slate-950'
                        : 'bg-white hover:bg-rose-50 text-rose-950 border-rose-900 dark:bg-slate-900 dark:text-rose-200 dark:border-rose-300'
                    }`}
                  >
                    <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{isListening ? 'Je vous écoute...' : 'À voix haute'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Standard & Visual Text Content */
          <div className="space-y-5">
            <div className="text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line font-normal">
              {creation.content}
            </div>

            {creation.tips && creation.tips.length > 0 && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-300 space-y-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-200">
                  ✨ Les petits conseils de l’Atelier :
                </h2>
                <ul className="space-y-1.5 text-base sm:text-lg text-slate-900 dark:text-slate-100 list-disc list-inside">
                  {creation.tips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </article>

      {/* 4 Primary Action Buttons + 6 Rich Adjustment Propositions */}
      <section
        className="no-print space-y-6"
        aria-label="Actions sur votre création"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
          Que souhaitez-vous faire avec cette création ?
        </h2>

        {/* Primary 4 Buttons: Écouter, Sauvegarder, Imprimer / PDF, Copier pour envoyer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            type="button"
            onClick={() => onToggleSpeak(fullReadableText, mainTargetId)}
            className={`min-h-[68px] px-5 py-3.5 rounded-2xl font-bold text-lg sm:text-xl border-2 flex items-center justify-center gap-3 shadow-sm cursor-pointer ${
              isMainPlaying
                ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
                : isMainLoading
                  ? 'bg-amber-100 text-amber-950 border-amber-800 dark:bg-slate-800 dark:text-amber-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-200 dark:border-emerald-300'
            }`}
          >
            {isMainLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin shrink-0" aria-hidden="true" />
                <span>Préparation de la voix...</span>
              </>
            ) : isMainPlaying ? (
              <>
                <VolumeX className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>Arrêter l’écoute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>Écouter</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`min-h-[68px] px-5 py-3.5 rounded-2xl font-bold text-lg sm:text-xl border-2 flex items-center justify-center gap-3 shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-200 dark:border-blue-300'
            }`}
          >
            <BookmarkCheck className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>{isSaved ? 'Sauvegardé ✓' : 'Sauvegarder'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[68px] px-5 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 font-bold text-lg sm:text-xl border-2 border-amber-900 dark:border-amber-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            <Printer className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[68px] px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-lg sm:text-xl border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-6 h-6 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <span>Texte copié ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>Copier pour envoyer</span>
              </>
            )}
          </button>
        </div>

        {/* 6 Rich Quick Adjustment Propositions */}
        <div className="pt-2 space-y-3">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Envie d’essayer une autre proposition ou d’ajuster le résultat en un clic ?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  workshop.id === 'atelier-poesie'
                    ? 'Rends ce poème encore plus doux et lumineux, avec une nouvelle fin pleine de tendresse.'
                    : 'Rends cette création encore plus joyeuse, ensoleillée et pleine de bonne humeur !'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-amber-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-amber-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <SmilePlus className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <span>Rendre plus joyeux</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  'Adopte un ton encore plus tendre, chaleureux et plein d’émotion douce.'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-rose-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-rose-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <Heart className="w-5 h-5 shrink-0 text-rose-700 dark:text-rose-300" aria-hidden="true" />
              <span>Plus tendre et émouvant</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  'Ajoute une pointe d’humour souriant et de malice bon enfant.'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-emerald-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-emerald-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-5 h-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              <span>Ajouter un peu d’humour</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  'Développe davantage cette création avec plus de détails sensoriels et de jolies images.'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-blue-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <AlignLeft className="w-5 h-5 shrink-0 text-blue-800 dark:text-blue-300" aria-hidden="true" />
              <span>Version plus détaillée</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  'Propose une version plus courte, très claire et facile à lire en une minute.'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <Scissors className="w-5 h-5 shrink-0 text-slate-700 dark:text-slate-300" aria-hidden="true" />
              <span>Version plus courte</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust(
                  'Propose une autre version complètement différente, originale et tout aussi chaleureuse.'
                )
              }
              className="min-h-[60px] px-4 py-3 rounded-2xl bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-base sm:text-lg border-2 border-slate-900 dark:border-blue-300 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 shrink-0 text-blue-800 dark:text-blue-300 ${
                  isLoadingAdjustment ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
              <span>Essayer une autre version</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
