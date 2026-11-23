import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, WORKSHOPS, SavedCreation } from '../data/workshops';
import {
  getNextFontScale,
  getWorkshopsByCategory,
  getWorkshopById,
  buildWorkshopUserPrompt,
  generateLocalCreationFallback,
  generateLocalQuizFallback,
  generateLocalInteractiveFallback,
  generateLocalStepSuggestionsFallback,
  HOME_QUICK_PROPOSITIONS,
} from './atelierLogic';
import {
  sanitizeTextForSpeech,
  splitTextIntoSpeechChunks,
  selectBestFrenchVoice,
  buildReadableCreationText,
} from './alphabetteAudio';

test('Alphabette ecosystem contains exactly 4 categories and 20 workshops (5 per category)', () => {
  assert.equal(CATEGORIES.length, 4);
  assert.equal(WORKSHOPS.length, 20);

  for (const cat of CATEGORIES) {
    const list = getWorkshopsByCategory(cat.id);
    assert.equal(list.length, 5, `Category ${cat.id} must have 5 workshops`);
  }
});

test('Every workshop has exactly 3 guided steps with at least 8 rich propositions each', () => {
  for (const workshop of WORKSHOPS) {
    assert.equal(workshop.steps.length, 3, `Workshop ${workshop.id} must have 3 steps`);
    for (const step of workshop.steps) {
      assert.ok(
        step.options.length >= 8,
        `Step ${step.id} in ${workshop.id} must have >= 8 options (found ${step.options.length})`
      );
    }
  }
});

test('Home quick propositions reference valid workshops and offer rich variety', () => {
  assert.ok(HOME_QUICK_PROPOSITIONS.length >= 10);
  for (const prop of HOME_QUICK_PROPOSITIONS) {
    const workshop = getWorkshopById(prop.workshopId);
    assert.ok(workshop, `Quick proposition ${prop.id} references unknown workshop ${prop.workshopId}`);
    assert.ok(prop.selections.step1 && prop.selections.step2 && prop.selections.step3);
  }
});

test('Font scale A+ / A- increments and clamps within accessible senior range (16px to 22px)', () => {
  assert.equal(getNextFontScale(0, 'down'), 0);
  assert.equal(getNextFontScale(0, 'up'), 1);
  assert.equal(getNextFontScale(2, 'up'), 3);
  assert.equal(getNextFontScale(3, 'up'), 3);
});

test('Local fallback generator works deterministically for all 20 workshops including 4-choice interactive and step suggestions', () => {
  for (const workshop of WORKSHOPS) {
    const selections = {
      step1: workshop.steps[0].options[0].label,
      step2: workshop.steps[1].options[0].label,
      step3: workshop.steps[2].options[0].label,
    };

    const prompt = buildWorkshopUserPrompt(workshop, selections);
    assert.ok(prompt.includes(workshop.title));

    const creation = generateLocalCreationFallback(workshop, selections);
    assert.ok(creation.title.length > 0);
    assert.ok(creation.content.length > 30);

    const extra = generateLocalStepSuggestionsFallback(
      workshop,
      0,
      workshop.steps[0].options.map((o) => o.label)
    );
    assert.equal(extra.length, 4);
  }

  const quiz = generateLocalQuizFallback({
    step1: 'Le grand cinéma français',
    step2: 'Détente',
    step3: 'Seul',
  });
  assert.equal(quiz.questions.length, 5);

  const cafeWorkshop = getWorkshopById('cafe-histoire')!;
  const chapter = generateLocalInteractiveFallback(
    cafeWorkshop,
    {
      step1: 'Victor Hugo',
      step2: 'Un grand café parisien',
      step3: 'Quel est votre plus beau souvenir ?',
    },
    0
  );
  assert.equal(chapter.choices.length, 4);
});

test('Alphabette speech formatter cleans emojis/symbols, chunks cleanly and formats quiz/interactive creations', () => {
  const cleaned = sanitizeTextForSpeech('☕ Atelier n° 19 · Café avec Victor Hugo — 100% plaisir\n\nBonjour !');
  assert.equal(cleaned.includes('☕'), false);
  assert.ok(cleaned.includes('numéro 19'));
  assert.ok(cleaned.includes('100 pour cent'));

  const longSentence = Array(12).fill('Voici une belle phrase française fluide et facile à écouter.').join(' ');
  const antiCutoffChunks = splitTextIntoSpeechChunks(longSentence);
  assert.ok(antiCutoffChunks.length >= 4);
  for (const c of antiCutoffChunks) {
    assert.ok(c.length <= 190, `Chunk exceeds 190 chars: ${c.length}`);
  }

  const picked = selectBestFrenchVoice([
    { name: 'English US', lang: 'en-US' },
    { name: 'French eSpeak', lang: 'fr-FR' },
    { name: 'Microsoft Denise Online (Natural) - French (France)', lang: 'fr-FR' },
    { name: 'Google français', lang: 'fr-FR' },
  ]);
  assert.equal(picked?.name, 'Google français');

  const pickedNatural = selectBestFrenchVoice([
    { name: 'French eSpeak', lang: 'fr-FR' },
    { name: 'Microsoft Denise Online (Natural) - French (France)', lang: 'fr-FR' },
  ]);
  assert.equal(pickedNatural?.name, 'Microsoft Denise Online (Natural) - French (France)');

  const quizWorkshop = getWorkshopById('quiz-maison')!;
  const quizFallback = generateLocalQuizFallback({
    step1: 'Le grand cinéma français',
    step2: 'Détente',
    step3: 'Seul',
  });
  const quizCreation: SavedCreation = {
    id: 'q1',
    workshopId: 'quiz-maison',
    workshopTitle: quizWorkshop.title,
    workshopEmoji: '🏆',
    categoryId: 'musique',
    createdAt: 'Aujourd’hui',
    selections: { step1: 'Cinéma', step2: 'Détente', step3: 'Seul' },
    title: quizFallback.title,
    subtitle: quizFallback.subtitle,
    content: 'Quiz',
    quizQuestions: quizFallback.questions,
  };
  const quizSpeech = buildReadableCreationText(quizCreation, quizWorkshop);
  assert.ok(quizSpeech.includes('Question 1'));
  assert.ok(quizSpeech.includes('Choix A'));
});
