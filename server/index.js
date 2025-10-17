// /api/generate.js
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GENAI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'GENAI_API_KEY missing' });

  try {
    const { prompt = '', framework = 'html-css' } = req.body || {};
    if (!prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert web developer. Generate a UI component for: ${prompt}\nFramework: ${framework}\nReturn ONLY the code in a single HTML file inside markdown code block.`,
    });

    res.status(200).json({ code: response.text || '' });
  } catch (err) {
    console.error('Generation failed', err);
    res.status(500).json({ error: 'Generation failed', details: String(err) });
  }
}
