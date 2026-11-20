import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, WORKSHOPS } from '../data/workshops';
import {
  getNextFontScale,
  getWorkshopsByCategory,
  getWorkshopById,
  buildWorkshopUserPrompt,
  generateLocalCreationFallback,
  generateLocalQuizFallback,
  generateLocalInteractiveFallback,
} from './atelierLogic';

test('Alphabette ecosystem contains exactly 4 categories and 20 workshops (5 per category)', () => {
  assert.equal(CATEGORIES.length, 4);
  assert.equal(WORKSHOPS.length, 20);

  for (const cat of CATEGORIES) {
    const list = getWorkshopsByCategory(cat.id);
    assert.equal(list.length, 5, `Category ${cat.id} must have 5 workshops`);
  }
});

test('Every workshop has exactly 3 guided steps with at least 4 large button options each', () => {
  for (const workshop of WORKSHOPS) {
    assert.equal(workshop.steps.length, 3, `Workshop ${workshop.id} must have 3 steps`);
    for (const step of workshop.steps) {
      assert.ok(step.options.length >= 4, `Step ${step.id} in ${workshop.id} must have >= 4 options`);
    }
  }
});

test('Font scale A+ / A- increments and clamps within accessible senior range (20px to 29px)', () => {
  assert.equal(getNextFontScale(0, 'down'), 0);
  assert.equal(getNextFontScale(0, 'up'), 1);
  assert.equal(getNextFontScale(2, 'up'), 3);
  assert.equal(getNextFontScale(3, 'up'), 3);
});

test('Local fallback generator works deterministically for all 20 workshops including quiz and interactive modes', () => {
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
  assert.equal(chapter.choices.length, 2);
});
