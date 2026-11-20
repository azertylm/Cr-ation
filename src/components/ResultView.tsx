import React, { useState } from 'react';
import {
  SavedCreation,
  WorkshopDefinition,
  QuizQuestion,
} from '../data/workshops';
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
} from 'lucide-react';

interface ResultViewProps {
  workshop: WorkshopDefinition;
  creation: SavedCreation;
  isSaved: boolean;
  onSave: () => void;
  isSpeaking: boolean;
  onToggleSpeak: (textToRead: string) => void;
  onAdjust: (instruction: string) => void;
  onContinueInteractive: (choice: string) => void;
  isLoadingAdjustment: boolean;
  isListening: boolean;
  onToggleDictateQuestion: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  workshop,
  creation,
  isSaved,
  onSave,
  isSpeaking,
  onToggleSpeak,
  onAdjust,
  onContinueInteractive,
  isLoadingAdjustment,
  isListening,
  onToggleDictateQuestion,
}) => {
  const [copied, setCopied] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

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

  const fullReadableText = `${creation.title}. ${creation.subtitle}. ${creation.content}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Main Creation Card */}
      <article className="print-card p-6 md:p-10 rounded-3xl border-4 border-slate-900 dark:border-amber-300 bg-white dark:bg-slate-900 shadow-md">
        <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-6 mb-6">
          <p className="text-lg font-bold text-blue-900 dark:text-amber-300 flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl">
              {creation.workshopEmoji}
            </span>
            <span>Atelier {workshop.number} · {creation.workshopTitle}</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-serif-title font-bold text-slate-950 dark:text-white mt-2">
            {creation.title}
          </h1>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-medium mt-2">
            {creation.subtitle}
          </p>
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
          <div className="space-y-8">
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-300 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-800 dark:text-amber-300 shrink-0" />
                <span className="text-xl font-bold text-slate-950 dark:text-white">
                  Votre score : {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {quizQuestions.length}
                </span>
              </div>
              <span className="text-lg font-medium text-slate-800 dark:text-slate-200">
                Touchez une réponse pour chaque question
              </span>
            </div>

            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = quizAnswers[qIdx];
              const hasAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={qIdx}
                  className="p-6 rounded-2xl border-2 border-slate-900 dark:border-slate-300 bg-slate-50/70 dark:bg-slate-800/80 space-y-4"
                >
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                    Question {qIdx + 1} : {q.question}
                  </h2>

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
                          className={`min-h-[64px] px-5 py-3 rounded-2xl border-2 font-bold text-xl text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${btnStyle}`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {hasAnswered && isCorrect && (
                            <span className="text-base font-extrabold px-3 py-1 rounded-xl bg-white text-emerald-950 shrink-0">
                              ✓ Bonne réponse
                            </span>
                          )}
                          {hasAnswered && isThisSelected && !isCorrect && (
                            <span className="text-base font-extrabold px-3 py-1 rounded-xl bg-white text-rose-950 shrink-0">
                              Votre choix
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-slate-900 border-2 border-emerald-900 dark:border-emerald-300 text-slate-950 dark:text-emerald-100 text-lg font-medium">
                      💡 <strong>Le saviez-vous ?</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {answeredCount === quizQuestions.length && (
              <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border-4 border-emerald-900 dark:border-emerald-300 text-center space-y-2">
                <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-200">
                  🎉 Bravo ! Vous avez terminé les 5 questions avec un score de {correctCount} / {quizQuestions.length} !
                </p>
              </div>
            )}
          </div>
        ) : workshop.mode === 'interactive' && creation.interactiveHistory ? (
          /* Interactive Story / Historical Café Mode (#17, #19, #20) */
          <div className="space-y-8">
            {creation.interactiveHistory.map((chap, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-3"
              >
                {chap.choiceMade && (
                  <p className="text-base font-bold text-blue-900 dark:text-amber-300">
                    ➔ Votre choix : « {chap.choiceMade} »
                  </p>
                )}
                <h2 className="text-2xl font-serif-title font-bold text-slate-950 dark:text-white">
                  {chap.chapterTitle}
                </h2>
                <div className="text-xl leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line">
                  {chap.content}
                </div>
              </div>
            ))}

            {/* 2 Large Interactive Choice Buttons to advance */}
            {latestInteractiveChapter && latestInteractiveChapter.choices.length > 0 && (
              <div className="no-print p-6 rounded-2xl bg-blue-50 dark:bg-slate-800 border-4 border-blue-900 dark:border-amber-300 space-y-4">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {workshop.id === 'cafe-histoire'
                    ? 'Que souhaitez-vous lui demander maintenant ?'
                    : 'Que décidez-vous de faire pour la suite ?'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestInteractiveChapter.choices.map((choiceText, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      disabled={isLoadingAdjustment}
                      onClick={() => onContinueInteractive(choiceText)}
                      className="min-h-[72px] p-5 rounded-2xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200 font-bold text-xl text-left flex items-center justify-between gap-3 border-2 border-slate-950 dark:border-white shadow-sm cursor-pointer"
                    >
                      <span>{choiceText}</span>
                      <ArrowRight className="w-7 h-7 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                {workshop.id === 'cafe-histoire' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onToggleDictateQuestion}
                      className="min-h-[64px] w-full md:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 dark:bg-slate-900 dark:text-rose-200 font-bold border-2 border-rose-900 dark:border-rose-300 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Mic className="w-6 h-6 shrink-0" aria-hidden="true" />
                      <span>
                        {isListening
                          ? 'Parlez maintenant, je vous écoute...'
                          : 'Ou posez votre propre question à voix haute'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Standard & Visual Text Content */
          <div className="space-y-6">
            <div className="text-xl md:text-2xl leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line font-normal">
              {creation.content}
            </div>

            {creation.tips && creation.tips.length > 0 && (
              <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-900 dark:border-amber-300 space-y-3">
                <h2 className="text-2xl font-bold text-amber-950 dark:text-amber-200">
                  ✨ Les petits conseils de l’Atelier :
                </h2>
                <ul className="space-y-2 text-xl text-slate-900 dark:text-slate-100 list-disc list-inside">
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

      {/* 4 Primary Action Buttons + 2 Rapid Adjustment Buttons */}
      <section
        className="no-print space-y-6"
        aria-label="Actions sur votre création"
      >
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          Que souhaitez-vous faire avec cette création ?
        </h2>

        {/* Primary 4 Buttons: Écouter, Sauvegarder, Imprimer / PDF, Copier pour envoyer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onToggleSpeak(fullReadableText)}
            className={`min-h-[72px] px-5 py-4 rounded-2xl font-bold text-xl border-2 flex items-center justify-center gap-3 shadow-sm cursor-pointer ${
              isSpeaking
                ? 'bg-emerald-800 text-white border-slate-950 dark:bg-emerald-400 dark:text-slate-950'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-200 dark:border-emerald-300'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-7 h-7 shrink-0" aria-hidden="true" />
                <span>Arrêter l’écoute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-7 h-7 shrink-0" aria-hidden="true" />
                <span>Écouter</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`min-h-[72px] px-5 py-4 rounded-2xl font-bold text-xl border-2 flex items-center justify-center gap-3 shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-blue-900 text-white border-slate-950 dark:bg-amber-300 dark:text-slate-950'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-200 dark:border-blue-300'
            }`}
          >
            <BookmarkCheck className="w-7 h-7 shrink-0" aria-hidden="true" />
            <span>{isSaved ? 'Sauvegardé ✓' : 'Sauvegarder'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[72px] px-5 py-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 font-bold text-xl border-2 border-amber-900 dark:border-amber-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            <Printer className="w-7 h-7 shrink-0" aria-hidden="true" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[72px] px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-xl border-2 border-slate-900 dark:border-slate-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-7 h-7 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <span>Texte copié ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-7 h-7 shrink-0" aria-hidden="true" />
                <span>Copier pour envoyer</span>
              </>
            )}
          </button>
        </div>

        {/* 2 Quick Adjustment Buttons */}
        <div className="pt-2">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Envie d’ajuster le résultat en un clic ?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="min-h-[68px] px-6 py-4 rounded-2xl bg-white hover:bg-amber-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-xl border-2 border-slate-900 dark:border-amber-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              <SmilePlus className="w-7 h-7 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <span>
                {workshop.id === 'atelier-poesie'
                  ? 'Rendre plus doux / Changer la fin'
                  : 'Rendre plus joyeux'}
              </span>
            </button>

            <button
              type="button"
              disabled={isLoadingAdjustment}
              onClick={() =>
                onAdjust('Propose une autre version différente, originale et tout aussi chaleureuse.')
              }
              className="min-h-[68px] px-6 py-4 rounded-2xl bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-950 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-xl border-2 border-slate-900 dark:border-blue-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              <RefreshCw
                className={`w-7 h-7 shrink-0 text-blue-800 dark:text-blue-300 ${
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
