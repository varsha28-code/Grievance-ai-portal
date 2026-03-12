const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../data/grievances.db');

let db;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getDB() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT,
      role TEXT DEFAULT 'citizen',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      ticket_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'registered',
      latitude REAL,
      longitude REAL,
      address TEXT,
      image_url TEXT,
      ai_classification TEXT,
      ai_confidence REAL,
      department TEXT,
      assigned_officer_id TEXT,
      citizen_id TEXT,
      citizen_name TEXT,
      citizen_phone TEXT,
      citizen_email TEXT,
      upvotes INTEGER DEFAULT 1,
      duplicate_of TEXT,
      merged_count INTEGER DEFAULT 0,
      resolution_notes TEXT,
      resolution_image_url TEXT,
      citizen_verified INTEGER DEFAULT 0,
      escalated INTEGER DEFAULT 0,
      escalation_level INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS complaint_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      updated_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      voter_identifier TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(complaint_id, voter_identifier),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample data if empty
  // (Removed seedData call to start with a clean database)

  // Migration: ensure password column exists and has demo passwords
  try {
    db.prepare('SELECT password FROM users LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE users ADD COLUMN password TEXT');
  }

  // Ensure demo citizen exists
  const demoCitizen = db.prepare("SELECT id FROM users WHERE email = 'citizen@example.com'").get();
  if (!demoCitizen) {
    db.prepare('INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), 'Citizen User', 'citizen@example.com', 'citizen', hashPassword('citizen123')
    );
    console.log('✅ Added demo citizen account');
  }

  // Ensure demo admin exists
  const demoAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@municipal.gov'").get();
  if (!demoAdmin) {
    db.prepare('INSERT INTO users (id, name, email, role, password, department) VALUES (?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'Admin User', 'admin@municipal.gov', 'admin', hashPassword('admin123'), 'Administration'
    );
    console.log('✅ Added demo admin account');
  }
}

module.exports = { getDB, initDB, hashPassword };
