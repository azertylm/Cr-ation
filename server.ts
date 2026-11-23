import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  getWorkshopById,
  generateLocalCreationFallback,
  generateLocalQuizFallback,
  generateLocalInteractiveFallback,
  generateLocalStepSuggestionsFallback,
} from './src/utils/atelierLogic';

const PORT = 3000;

function isQuotaOrAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|RESOURCE_EXHAUSTED|quota|403|PERMISSION_DENIED|API_KEY_INVALID/i.test(msg);
}

function getAiClient(apiVersion?: string): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      timeout: 30000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms (${label})`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateStructuredJson(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    responseSchema: Record<string, unknown>;
    label: string;
    fastOnly?: boolean;
  }
): Promise<string> {
  if (!params.fastOnly) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: params.responseSchema,
          },
        }),
        20000,
        `${params.label}-primary`
      );
      return (res.text ?? '{}').trim();
    } catch (err) {
      if (isQuotaOrAuthError(err)) {
        console.warn(`[${params.label}-primary] quota/auth limit reached`);
        throw err;
      }
      console.warn(`[${params.label}-primary] fallback to fast:`, err instanceof Error ? err.message : err);
    }
  }

  try {
    const retryRes = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseSchema: params.responseSchema,
        },
      }),
      12000,
      `${params.label}-fast`
    );
    return (retryRes.text ?? '{}').trim();
  } catch (fastErr) {
    if (params.fastOnly && !isQuotaOrAuthError(fastErr)) {
      console.warn(`[${params.label}-fast] retrying backup:`, fastErr instanceof Error ? fastErr.message : fastErr);
      const backupRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: params.responseSchema,
          },
        }),
        10000,
        `${params.label}-backup`
      );
      return (backupRes.text ?? '{}').trim();
    }
    throw fastErr;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // 0b. Universal Audio Dictation Transcription Endpoint (gemini-3.5-transcribe)
  app.post('/api/atelier/transcribe', async (req, res) => {
    const { audioBase64, mimeType } = req.body ?? {};
    if (typeof audioBase64 !== 'string' || !audioBase64) {
      return res.status(200).json({ transcript: '' });
    }

    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(200).json({ transcript: '' });
      }

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: typeof mimeType === 'string' && mimeType ? mimeType : 'audio/webm',
                  data: audioBase64,
                },
              },
              {
                text: 'Transcris fidèlement en français ce que dit la personne, en phrases simples sans commentaire ni guillemets.',
              },
            ],
          },
        }),
        14000,
        'transcribe'
      );

      return res.status(200).json({
        transcript: (response.text ?? '').trim(),
      });
    } catch {
      return res.status(200).json({ transcript: '' });
    }
  });

  // 0c. Dynamic Extra Propositions Endpoint (Step choices or Interactive continuations)
  app.post('/api/atelier/suggestions', async (req, res) => {
    const { mode, workshopId, stepIndex, existingLabels, selections, history } =
      req.body ?? {};
    const workshop =
      getWorkshopById(workshopId) || getWorkshopById('contes-petits-enfants')!;
    const safeStepIndex = (stepIndex === 1 || stepIndex === 2 ? stepIndex : 0) as
      | 0
      | 1
      | 2;

    if (mode === 'interactive') {
      const existingList = Array.isArray(existingLabels) ? existingLabels : [];
      const fallbackChoices = [
        'Découvrir un détail secret ou une anecdote inattendue',
        'Prendre un instant calme pour observer les alentours',
        'Poser une question sur les souvenirs d’enfance',
        'Partager un moment gourmand ou musical ensemble',
      ].filter((c) => !existingList.includes(c));

      try {
        const ai = getAiClient();
        if (!ai) {
          return res.status(200).json({ choices: fallbackChoices });
        }

        const lastText = Array.isArray(history) && history.length > 0
          ? history[history.length - 1]?.text || ''
          : '';

        const prompt = `Pour l'atelier interactif "${workshop.title}" (choix de départ : ${JSON.stringify(selections || {})}), propose 4 nouvelles suites ou questions très différentes de celles-ci : ${existingList.join(' | ')}.
Dernier passage : ${lastText.slice(0, 350)}
Chaque proposition doit faire maximum 10 mots, être en français naturel, chaleureuse et donner envie de cliquer.`;

        const rawJson = await generateStructuredJson(ai, {
          contents: prompt,
          systemInstruction:
            "Tu es un animateur créatif bienveillant de L'Atelier Alphabette. Propose des suites originales et variées.",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              choices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['choices'],
          },
          label: 'suggestions-interactive',
          fastOnly: true,
        });

        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.choices) && parsed.choices.length > 0) {
          return res.status(200).json({ choices: parsed.choices.slice(0, 4) });
        }
        return res.status(200).json({ choices: fallbackChoices });
      } catch (err) {
        console.warn('[atelier/suggestions-interactive] fallback:', err instanceof Error ? err.message : err);
        return res.status(200).json({ choices: fallbackChoices });
      }
    }

    // Step suggestions mode
    const existing = Array.isArray(existingLabels) ? existingLabels : [];
    const step = workshop.steps[safeStepIndex];

    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(200).json({
          options: generateLocalStepSuggestionsFallback(
            workshop,
            safeStepIndex,
            existing
          ),
        });
      }

      const prompt = `Pour l'atelier "${workshop.title}", à la question "${step.question}", propose 4 nouvelles idées originales, concrètes et touchantes pour des seniors français.
Ne répète AUCUNE des idées déjà présentes : ${existing.join(' | ')}.
Chaque proposition doit contenir un emoji adapté et un libellé court et clair (5 à 10 mots).`;

      const rawJson = await generateStructuredJson(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es L'Atelier Alphabette. Génère des idées créatives variées, chaleureuses et très accessibles en français.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                },
                required: ['label', 'emoji'],
              },
            },
          },
          required: ['options'],
        },
        label: 'suggestions-step',
        fastOnly: true,
      });

      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed.options) && parsed.options.length > 0) {
        const formatted = parsed.options
          .slice(0, 4)
          .map((opt: { label: string; emoji: string }, i: number) => ({
            id: `ai-opt-${Date.now()}-${i}`,
            label: opt.label,
            emoji: opt.emoji || workshop.emoji,
          }));
        return res.status(200).json({ options: formatted });
      }

      return res.status(200).json({
        options: generateLocalStepSuggestionsFallback(
          workshop,
          safeStepIndex,
          existing
        ),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[atelier/suggestions-step] fallback:', msg);
      return res.status(200).json({
        options: generateLocalStepSuggestionsFallback(
          workshop,
          safeStepIndex,
          existing
        ),
      });
    }
  });

  // 1. Standard & Visual Creation Endpoint
  app.post('/api/atelier/create', async (req, res) => {
    const {
      workshopId,
      workshopTitle,
      categoryTitle,
      selections,
      systemInstruction,
      userPrompt,
      adjustmentInstruction,
      isVisual,
    } = req.body;

    const workshop =
      getWorkshopById(workshopId) || getWorkshopById('contes-petits-enfants')!;
    const safeSelections = selections || {
      step1: workshop.steps[0].options[0].label,
      step2: workshop.steps[1].options[0].label,
      step3: workshop.steps[2].options[0].label,
    };

    try {
      const ai = getAiClient();
      if (!ai) {
        const fallback = generateLocalCreationFallback(
          workshop,
          safeSelections,
          adjustmentInstruction
        );
        return res.status(200).json(fallback);
      }

      const fullPrompt = adjustmentInstruction
        ? `${userPrompt}\n\nConsigne d'ajustement supplémentaire : ${adjustmentInstruction}`
        : userPrompt;

      const rawJson = await generateStructuredJson(ai, {
        contents: fullPrompt,
        systemInstruction:
          systemInstruction ||
          "Tu es L'Atelier Alphabette, un compagnon créatif français chaleureux, bienveillant et respectueux pour les seniors. Rédige en français impeccable, sans jargon technique, avec une mise en page claire et un ton doux.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Un beau titre chaleureux en français pour la création.',
            },
            subtitle: {
              type: Type.STRING,
              description: 'Un sous-titre doux ou une courte dédicace.',
            },
            content: {
              type: Type.STRING,
              description: 'Le texte principal complet, bien aéré avec des paragraphes clairs.',
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Optionnel : 3 conseils simples, blagues ou points clés si pertinent.',
            },
            visualMood: {
              type: Type.STRING,
              description: 'Ambiance visuelle ou couleur dominante pour illustrer la carte.',
            },
          },
          required: ['title', 'subtitle', 'content'],
        },
        label: 'create',
      });

      const parsed = JSON.parse(rawJson);

      let imageUrl: string | undefined = undefined;
      if (isVisual) {
        try {
          const imgPrompt = `Illustration artistique chaleureuse et très lisible pour "${workshopTitle}" (${parsed.title || ''}). Choix : ${Object.values(safeSelections).join(', ')}. Style soigné, lumineux, sans texte sur l'image.`;
          const imgResponse = await withTimeout(
            ai.models.generateContent({
              model: 'gemini-3.1-flash-lite-image',
              contents: {
                parts: [{ text: imgPrompt }],
              },
              config: {
                imageConfig: {
                  aspectRatio: '4:3',
                },
              },
            }),
            10000,
            'create-image'
          );

          for (const part of imgResponse.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType ?? 'image/png';
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch {
          imageUrl = undefined;
        }
      }

      return res.status(200).json({
        title: parsed.title || workshopTitle,
        subtitle: parsed.subtitle || categoryTitle,
        content: parsed.content || '',
        tips: parsed.tips || [],
        visualMood: parsed.visualMood || 'warm',
        imageUrl,
      });
    } catch {
      const fallback = generateLocalCreationFallback(
        workshop,
        safeSelections,
        adjustmentInstruction
      );
      return res.status(200).json(fallback);
    }
  });

  // 2. Interactive 5-Question Quiz Endpoint (Workshop #14)
  app.post('/api/atelier/quiz', async (req, res) => {
    const { selections, adjustmentInstruction } = req.body;
    const safeSelections = selections || {
      step1: 'Culture et patrimoine français',
      step2: 'Détente et plaisir',
      step3: 'Seul au calme',
    };

    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(200).json(generateLocalQuizFallback(safeSelections));
      }

      const theme = safeSelections.step1;
      const difficulty = safeSelections.step2;
      const ambiance = safeSelections.step3;

      const prompt = `Crée un quiz convivial de 5 questions en français sur le thème "${theme}", niveau "${difficulty}", ambiance "${ambiance}". ${adjustmentInstruction || ''}
Chaque question doit avoir 3 propositions courtes et claires, l'index de la bonne réponse (0, 1 ou 2), et une anecdote bienveillante d'explication.`;

      const rawJson = await generateStructuredJson(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es un animateur de jeu culturel bienveillant pour les seniors français. Tes questions évoquent de beaux souvenirs, le patrimoine, la chanson, la cuisine ou le cinéma français.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'subtitle', 'questions'],
        },
        label: 'quiz',
      });

      const parsed = JSON.parse(rawJson);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json(generateLocalQuizFallback(safeSelections));
    }
  });

  // 3. Interactive Story / Armchair Travel / Historical Café Step Endpoint (Workshops #17, #19, #20)
  app.post('/api/atelier/interactive', async (req, res) => {
    const { workshopId, selections, history, userChoice, adjustmentInstruction } =
      req.body;
    const workshop =
      getWorkshopById(workshopId) || getWorkshopById('cafe-histoire')!;
    const safeSelections = selections || {
      step1: workshop.steps[0].options[0].label,
      step2: workshop.steps[1].options[0].label,
      step3: workshop.steps[2].options[0].label,
    };
    const stepIndex = Array.isArray(history) ? history.length : 0;

    try {
      const ai = getAiClient();
      if (!ai) {
        return res
          .status(200)
          .json(
            generateLocalInteractiveFallback(
              workshop,
              safeSelections,
              stepIndex,
              userChoice
            )
          );
      }

      const historyText = Array.isArray(history)
        ? history
            .map(
              (h: { text: string; choice?: string }, i: number) =>
                `Étape ${i + 1}: ${h.text}\nChoix fait: ${h.choice || ''}`
            )
            .join('\n\n')
        : '';

      const extraTone = adjustmentInstruction
        ? `\nConsigne d'ambiance : ${adjustmentInstruction}`
        : '';

      let prompt = '';
      if (workshopId === 'cafe-histoire') {
        const figure = safeSelections.step1 || 'Victor Hugo';
        const place = safeSelections.step2 || 'Un café parisien';
        const topic =
          userChoice ||
          safeSelections.step3 ||
          'Parlez-moi de votre plus beau souvenir';
        prompt = `Tu incarnes ${figure}, attablé dans "${place}". L'utilisateur te demande : "${topic}".
Historique de la conversation :
${historyText}${extraTone}

Réponds à la première personne avec chaleur, authenticité historique et bienveillance (environ 100 à 140 mots). Propose ensuite exactement 4 nouvelles questions simples, variées et passionnantes que l'utilisateur peut te poser en cliquant sur un gros bouton.`;
      } else {
        const setting = safeSelections.step1 || 'Un village ensoleillé';
        const eraOrMood = safeSelections.step2 || 'Atmosphère paisible';
        const companion = safeSelections.step3 || 'En bonne compagnie';
        prompt = `Récit interactif ("${
          workshopId === 'voyage-fauteuil'
            ? 'Voyage en Fauteuil'
            : "L'Histoire dont vous êtes le Héros"
        }").
Cadre : ${setting}, ${eraOrMood}, ${companion}.
${
  historyText
    ? `Ce qui s'est déjà passé :\n${historyText}\n\nAction choisie par le lecteur : "${userChoice}"`
    : 'Début du voyage / de l’aventure.'
}${extraTone}

Rédige un chapitre court, immersif, sensoriel et très agréable à lire (110 à 150 mots). Puis propose exactement 4 choix clairs, variés et courts (maximum 9 mots chacun) pour continuer l'aventure.`;
      }

      const rawJson = await generateStructuredJson(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es un conteur et historien chaleureux pour L'Atelier Alphabette. Tes récits sont apaisants, riches en détails sensoriels et adaptés aux seniors.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            chapterTitle: { type: Type.STRING },
            content: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactement 4 propositions courtes et variées pour la suite.',
            },
          },
          required: ['title', 'chapterTitle', 'content', 'choices'],
        },
        label: 'interactive',
      });

      const parsed = JSON.parse(rawJson);
      return res.status(200).json(parsed);
    } catch {
      return res
        .status(200)
        .json(
          generateLocalInteractiveFallback(
            workshop,
            safeSelections,
            stepIndex,
            userChoice
          )
        );
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Serveur L'Atelier Alphabette démarré sur http://localhost:${PORT}`
    );
  });
}

startServer();
