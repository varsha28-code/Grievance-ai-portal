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
  `);

  // Seed sample data if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c;
  if (count === 0) seedData(db);

  // Migration: ensure password column exists and has demo passwords
  try {
    db.prepare('SELECT password FROM users LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE users ADD COLUMN password TEXT');
  }
  // Set demo passwords for seeded users if they don't have one
  const usersWithoutPw = db.prepare("SELECT id, email FROM users WHERE password IS NULL").all();
  if (usersWithoutPw.length > 0) {
    const updatePw = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    usersWithoutPw.forEach(u => {
      let pw = 'citizen123';
      if (u.email.includes('admin')) pw = 'admin123';
      else if (u.email.includes('municipal.gov')) pw = 'officer123';
      updatePw.run(hashPassword(pw), u.id);
    });
    console.log(`✅ Updated ${usersWithoutPw.length} user(s) with default passwords`);
  }

  // Ensure demo citizen exists
  const demoCitizen = db.prepare("SELECT id FROM users WHERE email = 'citizen@example.com'").get();
  if (!demoCitizen) {
    db.prepare('INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), 'Citizen User', 'citizen@example.com', 'citizen', hashPassword('citizen123')
    );
    console.log('✅ Added demo citizen account');
  }
}

function seedData(db) {
  // Sample users with passwords
  const officers = [
    { id: uuidv4(), name: 'Rajesh Kumar', email: 'rajesh@municipal.gov', role: 'officer', department: 'Roads & Infrastructure', password: hashPassword('officer123') },
    { id: uuidv4(), name: 'Priya Sharma', email: 'priya@municipal.gov', role: 'officer', department: 'Sanitation', password: hashPassword('officer123') },
    { id: uuidv4(), name: 'Amit Patel', email: 'amit@municipal.gov', role: 'officer', department: 'Water Supply', password: hashPassword('officer123') },
    { id: uuidv4(), name: 'Sneha Reddy', email: 'sneha@municipal.gov', role: 'officer', department: 'Electrical', password: hashPassword('officer123') },
    { id: uuidv4(), name: 'Admin User', email: 'admin@municipal.gov', role: 'admin', department: 'Administration', password: hashPassword('admin123') },
  ];

  // Also add a demo citizen
  const citizenId = uuidv4();
  const insertUserWithPw = db.prepare('INSERT INTO users (id, name, email, role, department, password) VALUES (?, ?, ?, ?, ?, ?)');
  officers.forEach(o => insertUserWithPw.run(o.id, o.name, o.email, o.role, o.department, o.password));
  insertUserWithPw.run(citizenId, 'Citizen User', 'citizen@example.com', 'citizen', null, hashPassword('citizen123'));

  // Sample complaints across multiple cities
  const sampleComplaints = [
    { title: 'Large pothole on MG Road', description: 'A dangerous pothole approximately 2 feet wide near the bus stop. Multiple vehicles have been damaged.', category: 'Pothole', priority: 'high', status: 'in_progress', lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore', department: 'Roads & Infrastructure', officer: officers[0].id, upvotes: 15 },
    { title: 'Garbage pile near Central Park', description: 'Large garbage dump forming near the park entrance. Causing foul smell and health hazard.', category: 'Garbage', priority: 'high', status: 'assigned', lat: 12.9780, lng: 77.5900, address: 'Central Park, Indiranagar', department: 'Sanitation', officer: officers[1].id, upvotes: 23 },
    { title: 'Broken streetlight on 5th Cross', description: 'Streetlight not working for the past 2 weeks. Area is very dark at night, safety concern.', category: 'Streetlight', priority: 'medium', status: 'registered', lat: 12.9650, lng: 77.6010, address: '5th Cross, Koramangala', department: 'Electrical', officer: null, upvotes: 8 },
    { title: 'Water leakage on Pipeline Road', description: 'Major water leakage from underground pipeline. Water wasting continuously for 3 days.', category: 'Water Leakage', priority: 'critical', status: 'in_progress', lat: 12.9850, lng: 77.5820, address: 'Pipeline Road, Malleshwaram', department: 'Water Supply', officer: officers[2].id, upvotes: 31 },
    { title: 'Drainage overflow in Jayanagar', description: 'Storm drain overflowing during slight rain. Road completely flooded.', category: 'Drainage', priority: 'critical', status: 'assigned', lat: 12.9250, lng: 77.5830, address: '4th Block, Jayanagar', department: 'Water Supply', officer: officers[2].id, upvotes: 42 },
    { title: 'Damaged road divider on NH44', description: 'Road divider broken after accident. No warning signs placed.', category: 'Road Damage', priority: 'high', status: 'registered', lat: 12.9550, lng: 77.6150, address: 'NH44, Marathahalli', department: 'Roads & Infrastructure', officer: null, upvotes: 11 },
    { title: 'Overflowing garbage bin at market', description: 'Garbage bin at KR Market overflowing. Not collected for 5 days.', category: 'Garbage', priority: 'medium', status: 'resolved', lat: 12.9610, lng: 77.5770, address: 'KR Market, Chamarajpet', department: 'Sanitation', officer: officers[1].id, upvotes: 7 },
    { title: 'Street light flickering near school', description: 'Streetlight near DPS school flickering dangerously. Sparks observed.', category: 'Streetlight', priority: 'critical', status: 'in_progress', lat: 12.9420, lng: 77.6230, address: 'BDA Complex, HSR Layout', department: 'Electrical', officer: officers[3].id, upvotes: 19 },
    { title: 'Pothole cluster near bridge', description: 'Multiple potholes formed near Silk Board bridge. Traffic hazard.', category: 'Pothole', priority: 'high', status: 'resolved', lat: 12.9170, lng: 77.6230, address: 'Silk Board Junction', department: 'Roads & Infrastructure', officer: officers[0].id, upvotes: 55 },
    { title: 'Illegal dumping in vacant plot', description: 'Construction debris and household waste being dumped regularly.', category: 'Garbage', priority: 'medium', status: 'registered', lat: 12.9350, lng: 77.6120, address: 'Madiwala, BTM Layout', department: 'Sanitation', officer: null, upvotes: 6 },
    { title: 'Broken water main on Church St', description: 'Water main burst causing road erosion and water loss.', category: 'Water Leakage', priority: 'critical', status: 'resolved', lat: 12.9750, lng: 77.6060, address: 'Church Street, Central Bangalore', department: 'Water Supply', officer: officers[2].id, upvotes: 28 },
    { title: 'Open manhole cover missing', description: 'Manhole cover missing near residential area. Extremely dangerous for pedestrians and children.', category: 'Drainage', priority: 'critical', status: 'in_progress', lat: 12.9680, lng: 77.5700, address: 'Rajajinagar 2nd Block', department: 'Roads & Infrastructure', officer: officers[0].id, upvotes: 37 },
  ];

  const insertComplaint = db.prepare(`
    INSERT INTO complaints (id, ticket_id, title, description, category, priority, status, latitude, longitude, address, department, assigned_officer_id, upvotes, ai_classification, ai_confidence, citizen_name, citizen_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO complaint_history (complaint_id, status, notes, created_at)
    VALUES (?, ?, ?, ?)
  `);

  sampleComplaints.forEach((c, i) => {
    const id = uuidv4();
    const ticketId = `CG-2026-${String(i + 1).padStart(4, '0')}`;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    insertComplaint.run(id, ticketId, c.title, c.description, c.category, c.priority, c.status, c.lat, c.lng, c.address, c.department, c.officer, c.upvotes, c.category, 0.85 + Math.random() * 0.14, 'Citizen User', 'citizen@example.com', createdAt);

    insertHistory.run(id, 'registered', 'Complaint registered via platform', createdAt);
    if (c.status !== 'registered') {
      insertHistory.run(id, 'assigned', 'Assigned to officer', new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString());
    }
    if (c.status === 'in_progress') {
      insertHistory.run(id, 'in_progress', 'Work started on the issue', new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000).toISOString());
    }
    if (c.status === 'resolved') {
      insertHistory.run(id, 'resolved', 'Issue has been resolved', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString());
    }
  });

  console.log('✅ Database seeded with sample data');
}

module.exports = { getDB, initDB };
