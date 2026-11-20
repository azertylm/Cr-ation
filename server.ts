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
} from './src/utils/atelierLogic';

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

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

    const workshop = getWorkshopById(workshopId) || getWorkshopById('contes-petits-enfants')!;
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

      const textResponse = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: fullPrompt,
        config: {
          systemInstruction:
            systemInstruction ||
            "Tu es L'Atelier Alphabette, un compagnon créatif français chaleureux, bienveillant et respectueux pour les seniors. Rédige en français impeccable, sans jargon technique, avec une mise en page claire et un ton doux.",
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
        },
      });

      const parsed = JSON.parse((textResponse.text ?? '{}').trim());

      let imageUrl: string | undefined = undefined;
      if (isVisual) {
        try {
          const imgPrompt = `Illustration artistique chaleureuse et très lisible pour "${workshopTitle}" (${parsed.title || ''}). Choix : ${Object.values(safeSelections).join(', ')}. Style soigné, lumineux, sans texte sur l'image.`;
          const imgResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: imgPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: '4:3',
              },
            },
          });

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

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            "Tu es un animateur de jeu culturel bienveillant pour les seniors français. Tes questions évoquent de beaux souvenirs, le patrimoine, la chanson, la cuisine ou le cinéma français.",
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json(generateLocalQuizFallback(safeSelections));
    }
  });

  // 3. Interactive Story / Armchair Travel / Historical Café Step Endpoint (Workshops #17, #19, #20)
  app.post('/api/atelier/interactive', async (req, res) => {
    const { workshopId, selections, history, userChoice } = req.body;
    const workshop = getWorkshopById(workshopId) || getWorkshopById('cafe-histoire')!;
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

      let prompt = '';
      if (workshopId === 'cafe-histoire') {
        const figure = safeSelections.step1 || 'Victor Hugo';
        const place = safeSelections.step2 || 'Un café parisien';
        const topic =
          userChoice || safeSelections.step3 || 'Parlez-moi de votre plus beau souvenir';
        prompt = `Tu incarnes ${figure}, attablé dans "${place}". L'utilisateur te demande : "${topic}".
Historique de la conversation :
${historyText}

Réponds à la première personne avec chaleur, authenticité historique et bienveillance (environ 100 à 140 mots). Propose ensuite 2 nouvelles questions simples et passionnantes que l'utilisateur peut te poser en cliquant sur un gros bouton.`;
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
}

Rédige un chapitre court, immersif, sensoriel et très agréable à lire (110 à 150 mots). Puis propose exactement 2 choix clairs et courts (maximum 8 mots chacun) pour continuer l'aventure.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            "Tu es un conteur et historien chaleureux pour L'Atelier Alphabette. Tes récits sont apaisants, riches en détails sensoriels et adaptés aux seniors.",
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              chapterTitle: { type: Type.STRING },
              content: { type: Type.STRING },
              choices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactement 2 propositions courtes pour la suite.',
              },
            },
            required: ['title', 'chapterTitle', 'content', 'choices'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
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
    console.log(`Serveur L'Atelier Alphabette démarré sur http://localhost:${PORT}`);
  });
}

startServer();
