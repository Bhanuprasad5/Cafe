import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint 1: AI Palate Sommelier (Conversational & Sensory Drink Matching)
app.post('/api/sommelier', async (req, res) => {
  try {
    const { mood, activity, caffeineTolerance, milkPreference, flavorNotes, previousDrinks } = req.body;

    if (!ai) {
      // Fallback expert 30-year barista recommendation
      return res.json({
        drinkName: "Velvet Honey Cortado with Anaerobic Huila Beans",
        origin: "Colombia, Huila (Anaerobic Natural Fermentation)",
        roastLevel: "Medium-Light",
        flavorProfile: ["Spiced Honey", "Blood Orange", "Roasted Hazelnut"],
        caffeineLevel: "Medium (85mg)",
        caffeineCurve: "Gentle 3-hour plateau with no jitters, ideal for sustained deep work",
        brewMethod: "Double Ristretto + Micro-foamed Oat Milk (1:1 ratio)",
        artisanNotes: "The anaerobic fermentation brings out winey fruitiness softened by creamy steamed oat milk.",
        pairingRecommendation: "Cardamom & Pistachio Morning Bun",
        baristaTip: "Sip without stirring first to experience the crema-foam gradient.",
      });
    }

    const prompt = `You are a world-class 30-year specialty coffee veteran and sensory sommelier.
A café guest just sat down with this context:
- Current Mood / Feeling: "${mood || 'Looking for inspiration'}"
- Current Activity / Work Focus: "${activity || 'Deep focus work on laptop'}"
- Caffeine Preference: "${caffeineTolerance || 'Medium'}"
- Milk / Dietary Preference: "${milkPreference || 'Oat milk'}"
- Desired Flavor Notes: "${flavorNotes || 'Nutty, warm, balanced'}"
- Recent drinks / context: "${previousDrinks || 'None'}"

Curate the PERFECT specialty coffee drink for this exact human moment. Think beyond basic syrups; think like a third-wave barista master using single-origin beans, extraction ratios, temperature nuances, and functional cognitive synergy.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, award-winning specialty coffee sommelier and café operator with 30 years of sensory experience. Return vivid, enticing, authentic coffee craftsmanship in strict JSON.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drinkName: { type: Type.STRING },
            origin: { type: Type.STRING },
            roastLevel: { type: Type.STRING },
            flavorProfile: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            caffeineLevel: { type: Type.STRING },
            caffeineCurve: { type: Type.STRING },
            brewMethod: { type: Type.STRING },
            artisanNotes: { type: Type.STRING },
            pairingRecommendation: { type: Type.STRING },
            baristaTip: { type: Type.STRING },
          },
          required: [
            'drinkName',
            'origin',
            'roastLevel',
            'flavorProfile',
            'caffeineLevel',
            'caffeineCurve',
            'brewMethod',
            'artisanNotes',
            'pairingRecommendation',
            'baristaTip',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Sommelier API error:', error);
    // Graceful fallback
    return res.json({
      drinkName: "Kyoto Cold Drip with Sweet Citrus Zest",
      origin: "Ethiopia Yirgacheffe G1 Washed",
      roastLevel: "Light Roast",
      flavorProfile: ["Bergamot", "Jasmine Blossom", "Crisp Peach"],
      caffeineLevel: "High (160mg)",
      caffeineCurve: "Immediate clean alertness with smooth, prolonged cognitive endurance",
      brewMethod: "12-hour slow cold water drip extraction over Japanese glass tower",
      artisanNotes: "Zero bitterness, high aromatic clarity, with a silky tea-like body.",
      pairingRecommendation: "Lemon Poppyseed Almond Scone",
      baristaTip: "Swirl the glass gently before drinking to release floral aromatics.",
    });
  }
});

// Endpoint 2: The Third Place Community Matchmaker (Connect People Sparks)
app.post('/api/connect/spark', async (req, res) => {
  try {
    const { currentUser, otherUsers } = req.body;

    if (!ai) {
      return res.json({
        sparks: [
          {
            targetUserId: otherUsers?.[0]?.id || 'guest_1',
            targetUserName: otherUsers?.[0]?.name || 'Maya',
            sharedInterest: 'Creative UI Design & Modern Web Apps',
            suggestedIcebreaker: 'Hey, noticed you’re also into design systems. Are you using Tailwind v4 or Figma Variables for token management?',
            synergyScore: 94,
            vibeTag: 'Design & Code Synapse',
          },
        ],
      });
    }

    const prompt = `You are the Community Curator of a vibrant neighborhood specialty café (The Third Place).
Current user:
${JSON.stringify(currentUser)}

Other active guests currently in the café who have opted-in to the Community Beacon:
${JSON.stringify(otherUsers)}

Analyze the subtle, natural affinities between the current user and the other guests.
Generate 1 to 2 tasteful, non-creepy, genuinely interesting "Sparks" (conversation starters or shared curiosities) that could spark a serendipitous, warm conversation between table neighbors. Avoid aggressive networking language. Keep it collegiate, creative, and gentle.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are the warm, intuitive curator of a modern creative café. Help guests discover serendipitous shared interests without awkwardness.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sparks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetUserId: { type: Type.STRING },
                  targetUserName: { type: Type.STRING },
                  sharedInterest: { type: Type.STRING },
                  suggestedIcebreaker: { type: Type.STRING },
                  synergyScore: { type: Type.INTEGER },
                  vibeTag: { type: Type.STRING },
                },
                required: [
                  'targetUserId',
                  'targetUserName',
                  'sharedInterest',
                  'suggestedIcebreaker',
                  'synergyScore',
                  'vibeTag',
                ],
              },
            },
          },
          required: ['sparks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Community Spark error:', error);
    return res.json({
      sparks: [
        {
          targetUserId: 'guest_1',
          targetUserName: 'Maya',
          sharedInterest: 'Frontend Design Systems',
          suggestedIcebreaker: 'Love your focus setup! Quick question—have you tried the new CSS container queries in production yet?',
          synergyScore: 89,
          vibeTag: 'Design Synergy',
        },
      ],
    });
  }
});

// Endpoint 3: Room Sentiment & Barista Sixth Sense (Understand the Room)
app.post('/api/room/pulse', async (req, res) => {
  try {
    const { feedbackLogs, roomMetrics } = req.body;

    if (!ai) {
      return res.json({
        vibeIndex: 88,
        atmosphereSummary: "Warm, energetic buzz with steady creative focus. Acoustic levels are optimal, though northern seating is cooling slightly.",
        musicRecommendation: "Shift to Khruangbin / Mild Orange for mellow rhythm",
        operationalAlerts: [
          "Check temperature near window tables (slight draft reported)",
          "Batch 3 batch-brew carafes ready for incoming 2:00 PM sprint",
        ],
        baristaMoodBooster: "The room feels grateful today—guest satisfaction with the single-origin espresso is at 98%!",
      });
    }

    const prompt = `You are an expert café operations consultant and acoustic sentiment analyst.
Analyze current café telemetry and guest micro-feedback:
Feedback Logs:
${JSON.stringify(feedbackLogs)}

Room Metrics:
${JSON.stringify(roomMetrics)}

Provide a concise, highly actionable "Room Pulse" assessment for the barista team on the bar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert café director optimizing room ambiance, barista flow, and guest hospitality.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibeIndex: { type: Type.INTEGER },
            atmosphereSummary: { type: Type.STRING },
            musicRecommendation: { type: Type.STRING },
            operationalAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            baristaMoodBooster: { type: Type.STRING },
          },
          required: [
            'vibeIndex',
            'atmosphereSummary',
            'musicRecommendation',
            'operationalAlerts',
            'baristaMoodBooster',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Room Pulse error:', error);
    return res.json({
      vibeIndex: 85,
      atmosphereSummary: "High creative synergy. Tables are occupied with focused workers; queue flow is steady.",
      musicRecommendation: "Warm downtempo jazz / vinyl grooves",
      operationalAlerts: [
        "Water station carafes need a fresh citrus slice refill",
        "Prep oat milk cartons for the 2:30 PM afternoon rush",
      ],
      baristaMoodBooster: "Great work maintaining latte art quality during the peak hour!",
    });
  }
});

// Endpoint 4: Barista Handwritten Cup Note Generator (Personal Connection)
app.post('/api/barista/cup-note', async (req, res) => {
  const { customerName = 'Friend', drinkName = 'Coffee', userActivity } = req.body || {};
  try {
    if (!ai) {
      return res.json({
        cupNote: `To ${customerName}: May this ${drinkName} power your creative breakthrough today! ✨ - With warmth from the bar`,
      });
    }

    const prompt = `A barista wants to write a quick, 1-to-2 sentence handwritten note with a sharpie on the coffee cup for customer "${customerName}".
Customer ordered: "${drinkName}".
Customer is currently working on: "${userActivity || 'their goals'}".
Write a warm, authentic, uplifting note that feels like a real human barista who cares about their craft and neighborhood. No cheesy sales talk.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You write brief, heartfelt, handwritten sharpie notes for specialty coffee cups.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cupNote: { type: Type.STRING },
          },
          required: ['cupNote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    return res.json({
      cupNote: `To ${customerName}: Brewed with love. Crush your session today! ☕ — Team CaféPulse`,
    });
  }
});

// Start Express server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`☕ CaféPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
