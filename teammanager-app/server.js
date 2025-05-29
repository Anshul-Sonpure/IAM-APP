import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// ✅ Correct path to your local users.json inside teammanager-app/data
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to verify JWT token
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Missing token');
  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'your-super-secret-key', (err, decoded) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = decoded;
    next();
  });
});

// GET users
app.get('/users', async (req, res) => {
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users = JSON.parse(data);
  res.json(users);
});

// POST new user
app.post('/users', async (req, res) => {
  const { username, password, roles } = req.body;
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users = JSON.parse(data);

  if (users.find(u => u.username === username)) {
    return res.status(409).send('User already exists');
  }

  users.push({ username, password, role: roles[0], grants: [] });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  res.status(201).send('User added');
});

// DELETE user
app.delete('/users/:username', async (req, res) => {
  const { username } = req.params;
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  let users = JSON.parse(data);

  users = users.filter(u => u.username !== username);
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  res.status(200).send('User deleted');
});

app.listen(PORT, () => {
  console.log(`TeamManager server running at http://localhost:${PORT}`);
  console.log(`Access Register page at http://localhost:${PORT}/views/admin.html`);
  console.log(`Access Login page at http://localhost:${PORT}/views/user.html`);
});
