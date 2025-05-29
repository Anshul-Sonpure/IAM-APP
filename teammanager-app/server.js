import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../iam-app/config.js'; // Adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT validation middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send(`
      <h2 style="color: red; font-family: sans-serif;">
        Please login through IAM application.
      </h2>
    `);
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send(`
        <h2 style="color: red; font-family: sans-serif;">
          Invalid or expired token. Please login through IAM application.
        </h2>
      `);
    }

    req.user = user;
    next();
  });
}

// Protect admin.html
app.get('/views/admin.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'admin.html'));
});

// Protect user.html
app.get('/views/user.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'user.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`TeamManager server running at http://localhost:${PORT}`);
  console.log(`Access Admin page at http://localhost:${PORT}/views/admin.html`);
  console.log(`Access User page at http://localhost:${PORT}/views/user.html`);
});
