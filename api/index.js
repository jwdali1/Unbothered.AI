import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '', // <-- Change this to your MySQL password
  database: 'signup'
};

app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, gender, country, dob, email, password } = req.body;
  if (!firstName || !lastName || !gender || !country || !dob || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      await conn.end();
      return res.status(409).json({ error: 'Email already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await conn.execute(
      'INSERT INTO users (first_name, last_name, gender, country, dob, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, gender, country, dob, email, hash]
    );
    await conn.end();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
      console.error('Database error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    res.json({ message: 'Sign in successful', user: { id: user.id, email: user.email, firstName: user.first_name } });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, first_name, last_name, gender, country, dob, email FROM users WHERE id = ?', [id]);
    await conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    rows[0].dob = rows[0].dob ? rows[0].dob.toISOString().slice(0, 10) : null;
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// Update user details
app.put('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, gender, country, dob, email } = req.body;
  if (!first_name || !last_name || !gender || !country || !dob || !email) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Check if user exists
    const [rows] = await conn.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'User not found.' });
    }
    // Check if email is used by another user
    const [emailRows] = await conn.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (emailRows.length > 0) {
      await conn.end();
      return res.status(409).json({ error: 'Email already in use.' });
    }
    await conn.execute(
      'UPDATE users SET first_name = ?, last_name = ?, gender = ?, country = ?, dob = ?, email = ? WHERE id = ?',
      [first_name, last_name, gender, country, dob, email, id]
    );
    await conn.end();
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

app.listen(3001, 'localhost',() => console.log('API running on http://localhost:3001'));
