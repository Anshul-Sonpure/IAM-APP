// server.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './config.js'; // Your secret for JWT

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// File path
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ✅ Updated Register Endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let { grants } = req.body;

    if (!username || !password || !role || !grants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize grants to always be an array
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

    // ✅ Send JSON response instead of redirecting
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Login Endpoint (Updated)
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

    // 👇 Return role and username as well
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

// ===========================
// ✅ Start Server
// ===========================
app.listen(PORT, () => {
  console.log(`IAM server running at http://localhost:${PORT}`);
  console.log(`Register: http://localhost:${PORT}/views/register.html`);
  console.log(`Login:    http://localhost:${PORT}/views/login.html`);
});
