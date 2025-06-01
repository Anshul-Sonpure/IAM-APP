// server.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { SECRET_KEY } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ✅ Register Endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let { grants } = req.body;

    if (!username || !password || !role || !grants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof grants === 'string') {
      grants = [grants];
    }

    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);

    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = { username, password, role, grants };
    users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Login Endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role, grants: user.grants },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      username: user.username
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Validate Token Endpoint
app.post('/validate-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ valid: false, error: 'Token invalid or expired' });
    }

    return res.status(200).json({
      valid: true,
      username: decoded.username,
      role: decoded.role
    });
  });
});

// ✅ Get All Users (Admin Only)
app.get('/users', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);

    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// ✅ Add New User (Admin Only)
app.post('/users', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { username, password, role } = req.body;
    let { grants } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!grants) {
      grants = role === 'admin' ? ['add_user'] : [];
    } else if (typeof grants === 'string') {
      grants = [grants];
    }

    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);

    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = { username, password, role, grants };
    users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'User added successfully.' });

  } catch (err) {
    console.error('Failed to add user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`IAM server running at: http://localhost:${PORT}`);
  console.log(`Access Register page: http://localhost:${PORT}/views/register.html`);
  console.log(`Access Login page: http://localhost:${PORT}/views/login.html`);
});
