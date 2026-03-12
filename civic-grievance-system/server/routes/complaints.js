const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../database');
const { classifyComplaint, calculatePriority, findDuplicates, classifyImage, CATEGORIES } = require('../ai/classifier');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all complaints with optional filters
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { status, category, priority, department, search, sort, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM complaints WHERE duplicate_of IS NULL';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }
    if (department) { query += ' AND department = ?'; params.push(department); }
    if (search) { query += ' AND (title LIKE ? OR description LIKE ? OR address LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    // Sorting
    switch (sort) {
      case 'newest': query += ' ORDER BY created_at DESC'; break;
      case 'oldest': query += ' ORDER BY created_at ASC'; break;
      case 'priority': query += " ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END"; break;
      case 'upvotes': query += ' ORDER BY upvotes DESC'; break;
      default: query += ' ORDER BY created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const complaints = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM complaints WHERE duplicate_of IS NULL';
    const countParams = [];
    if (status) { countQuery += ' AND status = ?'; countParams.push(status); }
    if (category) { countQuery += ' AND category = ?'; countParams.push(category); }
    if (priority) { countQuery += ' AND priority = ?'; countParams.push(priority); }
    if (department) { countQuery += ' AND department = ?'; countParams.push(department); }
    if (search) { countQuery += ' AND (title LIKE ? OR description LIKE ? OR address LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({ complaints, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single complaint
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ? OR ticket_id = ?').get(req.params.id, req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const history = db.prepare('SELECT * FROM complaint_history WHERE complaint_id = ? ORDER BY created_at ASC').all(complaint.id);
    const officer = complaint.assigned_officer_id
      ? db.prepare('SELECT id, name, email, department FROM users WHERE id = ?').get(complaint.assigned_officer_id)
      : null;

    res.json({ ...complaint, history, officer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new complaint
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const db = getDB();
    const { title, description, latitude, longitude, address, citizen_name, citizen_phone, citizen_email, category: userCategory } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // AI Classification (Text)
    let classification = classifyComplaint(title, description);

    // AI Classification (Image)
    if (req.file) {
      try {
        const buffer = fs.readFileSync(req.file.path);
        const imgClass = await classifyImage(buffer, req.file.mimetype);
        if (imgClass && imgClass.category !== 'Other') {
          // Image classification takes precedence if confident
          classification.category = imgClass.category;
          classification.confidence = Math.max(classification.confidence, imgClass.confidence);
          classification.department = CATEGORIES[imgClass.category]?.department || classification.department;
        }
      } catch (err) {
        console.error('Failed to classify image:', err);
      }
    }

    const category = userCategory || classification.category;
    const finalClassification = userCategory ? { ...classification, category: userCategory } : classification;

    // Check for duplicates
    const lat = parseFloat(latitude) || null;
    const lng = parseFloat(longitude) || null;
    const duplicates = lat && lng ? findDuplicates(db, category, lat, lng) : [];

    // If strong duplicate found, merge
    if (duplicates.length > 0) {
      const primary = duplicates[0];
      const updateUpvotes = db.prepare('UPDATE complaints SET upvotes = upvotes + 1, merged_count = merged_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateUpvotes.run(primary.id);

      // Recalculate priority
      const newPriority = calculatePriority(finalClassification, primary.upvotes + 1);
      db.prepare('UPDATE complaints SET priority = ? WHERE id = ?').run(newPriority, primary.id);

      return res.status(200).json({
        message: 'Similar complaint already exists. Your report has been merged to increase priority.',
        merged: true,
        existingTicket: primary.ticket_id,
        complaint: db.prepare('SELECT * FROM complaints WHERE id = ?').get(primary.id),
      });
    }

    // Create new complaint
    const id = uuidv4();
    const ticketCount = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c;
    const ticketId = `CG-2026-${String(ticketCount + 1).padStart(4, '0')}`;
    const priority = calculatePriority(finalClassification, 1);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Auto-assign to department officer
    const officer = db.prepare('SELECT id FROM users WHERE department = ? AND role = ? LIMIT 1')
      .get(finalClassification.department, 'officer');

    const stmt = db.prepare(`
      INSERT INTO complaints (id, ticket_id, title, description, category, subcategory, priority, status, latitude, longitude, address, image_url, ai_classification, ai_confidence, department, assigned_officer_id, citizen_name, citizen_phone, citizen_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialStatus = officer ? 'assigned' : 'registered';
    stmt.run(id, ticketId, title, description, category, null, priority, initialStatus, lat, lng, address || '', imageUrl, finalClassification.category, finalClassification.confidence, finalClassification.department, officer?.id || null, citizen_name || 'Anonymous', citizen_phone || '', citizen_email || '');

    // Add history entry
    db.prepare('INSERT INTO complaint_history (complaint_id, status, notes) VALUES (?, ?, ?)')
      .run(id, 'registered', 'Complaint registered via platform');

    if (officer) {
      db.prepare('INSERT INTO complaint_history (complaint_id, status, notes) VALUES (?, ?, ?)')
        .run(id, 'assigned', `Auto-assigned to ${finalClassification.department} department`);
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.status(201).json({
      message: 'Complaint registered successfully',
      complaint,
      classification: finalClassification,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update complaint status
router.put('/:id/status', (req, res) => {
  try {
    const db = getDB();
    const { status, notes } = req.body;
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ? OR ticket_id = ?').get(req.params.id, req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    db.prepare('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP' + (status === 'resolved' ? ', resolved_at = CURRENT_TIMESTAMP' : '') + ' WHERE id = ?')
      .run(status, complaint.id);

    db.prepare('INSERT INTO complaint_history (complaint_id, status, notes) VALUES (?, ?, ?)')
      .run(complaint.id, status, notes || `Status updated to ${status}`);

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaint.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upvote a complaint
router.post('/:id/upvote', (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ? OR ticket_id = ?').get(req.params.id, req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    db.prepare('UPDATE complaints SET upvotes = upvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(complaint.id);

    // Recalculate priority
    const classification = classifyComplaint(complaint.title, complaint.description);
    const newPriority = calculatePriority(classification, complaint.upvotes + 1);
    db.prepare('UPDATE complaints SET priority = ? WHERE id = ?').run(newPriority, complaint.id);

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaint.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST verify resolution
router.post('/:id/verify', (req, res) => {
  try {
    const db = getDB();
    const { verified } = req.body;
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ? OR ticket_id = ?').get(req.params.id, req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (verified) {
      db.prepare('UPDATE complaints SET citizen_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(complaint.id);
      db.prepare('INSERT INTO complaint_history (complaint_id, status, notes) VALUES (?, ?, ?)').run(complaint.id, 'verified', 'Resolution verified by citizen');
    } else {
      db.prepare('UPDATE complaints SET status = ?, citizen_verified = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('reopened', complaint.id);
      db.prepare('INSERT INTO complaint_history (complaint_id, status, notes) VALUES (?, ?, ?)').run(complaint.id, 'reopened', 'Citizen reported issue not resolved');
    }

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaint.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET map data
router.get('/map/all', (req, res) => {
  try {
    const db = getDB();
    const complaints = db.prepare(`
      SELECT id, ticket_id, title, category, priority, status, latitude, longitude, address, upvotes, created_at
      FROM complaints
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND duplicate_of IS NULL
    `).all();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
