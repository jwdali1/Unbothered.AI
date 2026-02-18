// @ts-nocheck

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'signup',
};

app.post('/api/journal', async (req, res) => {
  console.log('Received request at /api/journal');
  console.log('Request body:', req.body);
  const { text, feeling, userId, name } = req.body;

  if (!text || !feeling || !userId || !name) {
    return res.status(400).json({ summary: 'Missing required fields.', keywords: [] });
  }

  const prompt = `
  You are a confident, emotionally intelligent assistant for a journaling app called "Unbothered".

  The user named "${name}" is currently feeling "${feeling}" and wrote the following journal entry:

  "${text}"

  Respond ONLY with valid minified JSON. No markdown, no commentary.

  Instructions:
  - say the persons name once in the first sentence.
  - Write 8  warm sentences as advice.
  - say the persons name once in a sentence.
  - Make the user feel seen and supported.
  - Then extract 3–5 keywords from the journal (1–3 words each), and for each:
      - Give a short sentence explaining why the feeling/situation happened or what caused it, using cause-effect logic.

  Respond as:
  {
    "summary": "10-sentence advice",
    "keywords": [
      { "keyword": "<word>", "summary": "cause-effect explanation" }
    ]
  }
  `;

  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      model: 'mistral',
      prompt: prompt,
      temperature: 0.7,          // Increase creativity
      num_predict: 150,          // Allow longer responses
      stream: false
      })
    });


app.listen(3000, () => {
  console.log('API listening at http://local:3000');
});

    const data = await ollamaResponse.json();
    let summary = '';
    let keywords = [];

    try {
      const cleaned = data.response.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      const ai = JSON.parse(cleaned);
      summary = ai.summary;
      keywords = ai.keywords;
    } catch (e) {
      console.warn('Failed to parse AI JSON, falling back to raw output.' , e);
      summary = data.response.trim();
      keywords = [];
    }

    // ✅ Save to MySQL
    try {
      const conn = await mysql.createConnection(dbConfig);
      const [result] = await conn.execute(
        'INSERT INTO journal_entries (user_id, name, text, feeling, summary, keywords, date_created) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          name,
          text,
          feeling,
          summary,
          JSON.stringify(keywords),
          new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        ]
      );
      await conn.end();
      console.log('Journal entry saved with ID:', result.insertId);
    } catch (err) {
      console.error('DB insert error:', err);
    }

    res.status(200).json({ summary, keywords });
  } catch (err) {
    console.error('Ollama error:', err);
    res.status(500).json({ summary: 'Error generating advice.', keywords: [] });
  }
});

app.get('/', (req, res) => {
  res.send('Journal AI API is running...');
});

  app.get('/api/journal/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [entries] = await conn.execute(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date_created DESC',
      [userId]
    );
    await conn.end();
    res.status(200).json(entries);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
});

// DELETE route: delete a journal entry by its ID
app.delete('/api/journal/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute('DELETE FROM journal_entries WHERE id = ?', [id]);
    await conn.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

app.listen(3000, () => {
  console.log('API listening at http://localhost:3000');
});
