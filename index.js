require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/gating-ai', async (req, res) => {
  const { totalVolume, patternType, material, moldType } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a senior foundry engineer with 30+ years of experience.
Analyze a ${patternType} casting with the following parameters:
- Geometry Volume: ${totalVolume} cm³
- Material: ${material || 'Grey Cast Iron'}
- Mold Type: ${moldType || 'Green Sand'}

Provide structured analysis covering:
1. **Gating System Design** - Sprue, runner, gate sizing and rationale
2. **Pouring Time Analysis** - Assessment and recommendations
3. **Riser Design** - Directional solidification strategy
4. **Quality Concerns** - Potential defects (shrinkage, porosity, cold shuts)
5. **Material Advice** - Metallurgical considerations
6. **Optimization Tips** - 3 specific improvements

Keep response to 300-400 words. Be specific and engineering-precise.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ explanation: text });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({ explanation: 'AI processing failed. Check your Gemini API Key.' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'VISHVAKARMA FOUNDRY BACKEND ACTIVE' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚙ VISHVAKARMA FOUNDRY BACKEND ACTIVE ON PORT ${PORT}`));
