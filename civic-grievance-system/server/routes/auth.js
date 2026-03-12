const express = require('express');
const { getDB } = require('../database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const router = express.Router();

// Simple password hashing (for demo purposes)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data (excluding password)
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `demo-token-${user.id}` // Simple demo token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const db = getDB();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const id = uuidv4();
    const hashedPassword = hashPassword(password);

    db.prepare(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, phone || null, hashedPassword, 'citizen');

    const user = db.prepare('SELECT id, name, email, phone, role, department, created_at FROM users WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      user,
      token: `demo-token-${id}`
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been generated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Invalidate old tokens for this email
    db.prepare('UPDATE password_resets SET used = 1 WHERE email = ?').run(email.toLowerCase());

    db.prepare(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)'
    ).run(email.toLowerCase(), token, expiresAt);

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    // In production you'd send an email; for demo we return the link directly
    res.json({
      success: true,
      message: 'Reset link generated (demo mode — no email server)',
      resetToken: token,
      resetUrl
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const record = db.prepare(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime("now")'
    ).get(token);

    if (!record) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const hashedPassword = hashPassword(newPassword);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, record.email);
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(record.id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
