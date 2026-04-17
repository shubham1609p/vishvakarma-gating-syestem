// ═══════════════════════════════════════════════════════════════
//  VISHVAKARMA FOUNDRY — BACKEND SERVER
//  Team Vishvakarma | Node.js + Express + Gemini AI
// ═══════════════════════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve the frontend HTML as the root page ──────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Gemini AI Client ──────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'VISHVAKARMA FOUNDRY BACKEND ACTIVE',
    ai: process.env.GEMINI_API_KEY ? 'GEMINI CONNECTED' : 'NO API KEY',
    timestamp: new Date().toISOString()
  });
});

// ── GATING AI ANALYSIS ENDPOINT ───────────────────────────────
app.post('/gating-ai', async (req, res) => {
  const { totalVolume, patternType, material, moldType, partName } = req.body;

  if (!totalVolume) {
    return res.status(400).json({ explanation: 'Missing totalVolume parameter.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a senior foundry engineer with 30+ years of experience.
Analyze a ${patternType || 'casting'} for part: ${partName || 'Mechanical Component'}

Casting parameters:
- Geometry Volume: ${totalVolume} cm³
- Material: ${material || 'Grey Cast Iron'}
- Mold Type: ${moldType || 'Green Sand'}

Provide structured analysis:
1. **Gating System Design** — Sprue, runner, gate sizing and rationale
2. **Pouring Time Analysis** — Assessment and recommendations
3. **Riser Design** — Directional solidification strategy
4. **Quality Concerns** — Potential defects (shrinkage, porosity, cold shuts)
5. **Material Advice** — Metallurgical considerations
6. **Optimization Tips** — 3 specific improvements

Keep response to 300-400 words. Be specific and engineering-precise.`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    res.json({ explanation: text });

  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({
      explanation: `AI processing failed: ${error.message}. Check your GEMINI_API_KEY in the .env file.`
    });
  }
});

// ── 3D GEOMETRY INFO ENDPOINT ─────────────────────────────────
app.post('/geometry-info', async (req, res) => {
  const { partName, shape, formula } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `In 2-3 sentences, explain for a foundry engineer: 
What is a "${partName}" (geometry: ${shape}), where is it used in industry, and what casting challenges does it present? Be concise and technical.`;
    const result = await model.generateContent(prompt);
    res.json({ info: result.response.text() });
  } catch (error) {
    res.status(500).json({ info: 'Could not load AI info.' });
  }
});

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n⚙  VISHVAKARMA FOUNDRY BACKEND ACTIVE`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ LOADED' : '❌ MISSING — add to .env'}\n`);
});
