import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const WASTE_CATEGORIES = [
  'Plastic',
  'Paper & Cardboard',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'General Landfill',
] as const;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it in Settings > Secrets.');
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
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/classify', async (req, res) => {
    try {
      const { imageBase64, mimeType, enabledCategories, confidenceThreshold, deploymentProfile } =
        req.body as {
          imageBase64?: string;
          mimeType?: string;
          enabledCategories?: string[];
          confidenceThreshold?: number;
          deploymentProfile?: string;
        };

      if (!imageBase64 || !mimeType) {
        res.status(400).json({ error: 'An image payload and MIME type are required.' });
        return;
      }

      const activeCategories =
        Array.isArray(enabledCategories) && enabledCategories.length > 0
          ? enabledCategories
          : [...WASTE_CATEGORIES];

      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      const ai = getAiClient();

      const prompt = [
        'Analyze this image for an AI Waste Sorting and Classification System.',
        `Allowed categories: ${activeCategories.join(', ')}.`,
        `Target edge profile context: ${deploymentProfile || 'Gemini Vision Cloud'}.`,
        `Configured confidence threshold: ${confidenceThreshold ?? 75}%.`,
        'Identify the primary waste item visible in the image, assign the single best matching waste category from the allowed list, estimate a realistic integer confidence percentage (0-100), determine whether it is recyclable, specify a clear sorting instruction, and provide a brief material/recycling education note.',
      ].join(' ');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          systemInstruction:
            'You are a computer vision waste classification engine. Return accurate, concise, structured waste sorting classifications grounded strictly in the visible image.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: {
                type: Type.STRING,
                description: 'Short descriptive name of the detected waste item (e.g., PET Water Bottle, Corrugated Cardboard Box).',
              },
              category: {
                type: Type.STRING,
                description: 'Best matching category from the allowed list.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Estimated classification confidence percentage between 0 and 100.',
              },
              recyclable: {
                type: Type.BOOLEAN,
                description: 'Whether the item can be diverted from landfill via recycling or composting.',
              },
              sortingAction: {
                type: Type.STRING,
                description: 'Concise action instruction for sorting or preparing the item.',
              },
              materialNotes: {
                type: Type.STRING,
                description: 'Short educational note on the material composition and disposal impact.',
              },
            },
            required: [
              'itemName',
              'category',
              'confidence',
              'recyclable',
              'sortingAction',
              'materialNotes',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Classification request failed.';
      const status =
        message.includes('API_KEY') || message.includes('403')
          ? 403
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
