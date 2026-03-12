const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const db = getDB();

    const total = db.prepare('SELECT COUNT(*) as c FROM complaints WHERE duplicate_of IS NULL').get().c;
    const registered = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'registered' AND duplicate_of IS NULL").get().c;
    const assigned = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'assigned' AND duplicate_of IS NULL").get().c;
    const inProgress = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'in_progress' AND duplicate_of IS NULL").get().c;
    const resolved = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'resolved' AND duplicate_of IS NULL").get().c;
    const critical = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE priority = 'critical' AND status != 'resolved' AND duplicate_of IS NULL").get().c;

    // Category distribution
    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM complaints WHERE duplicate_of IS NULL
      GROUP BY category ORDER BY count DESC
    `).all();

    // Priority distribution
    const byPriority = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM complaints WHERE duplicate_of IS NULL
      GROUP BY priority
    `).all();

    // Department workload
    const byDepartment = db.prepare(`
      SELECT department, COUNT(*) as total,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status != 'resolved' THEN 1 ELSE 0 END) as pending
      FROM complaints WHERE duplicate_of IS NULL
      GROUP BY department ORDER BY total DESC
    `).all();

    // Trend data (last 30 days)
    const trend = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as complaints
      FROM complaints WHERE duplicate_of IS NULL
      AND created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at) ORDER BY date
    `).all();

    // Resolution rate
    const avgResolution = db.prepare(`
      SELECT AVG(julianday(resolved_at) - julianday(created_at)) as avg_days
      FROM complaints WHERE resolved_at IS NOT NULL AND duplicate_of IS NULL
    `).get();

    // Status distribution
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM complaints WHERE duplicate_of IS NULL
      GROUP BY status
    `).all();

    // Top issues by upvotes
    const topIssues = db.prepare(`
      SELECT id, ticket_id, title, category, upvotes, status, priority
      FROM complaints WHERE duplicate_of IS NULL
      ORDER BY upvotes DESC LIMIT 5
    `).all();

    res.json({
      overview: { total, registered, assigned, inProgress, resolved, critical },
      byCategory,
      byPriority,
      byDepartment,
      byStatus,
      trend,
      topIssues,
      avgResolutionDays: avgResolution.avg_days ? Math.round(avgResolution.avg_days * 10) / 10 : 0,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET officer performance
router.get('/officers', (req, res) => {
  try {
    const db = getDB();
    const officers = db.prepare(`
      SELECT u.id, u.name, u.department,
        COUNT(c.id) as total_assigned,
        SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN c.status != 'resolved' THEN 1 ELSE 0 END) as pending,
        AVG(CASE WHEN c.resolved_at IS NOT NULL THEN julianday(c.resolved_at) - julianday(c.created_at) END) as avg_resolution_days
      FROM users u
      LEFT JOIN complaints c ON u.id = c.assigned_officer_id
      WHERE u.role = 'officer'
      GROUP BY u.id
      ORDER BY resolved DESC
    `).all();

    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET area hotspots
router.get('/hotspots', (req, res) => {
  try {
    const db = getDB();
    const hotspots = db.prepare(`
      SELECT
        ROUND(latitude, 2) as lat_group,
        ROUND(longitude, 2) as lng_group,
        COUNT(*) as complaint_count,
        GROUP_CONCAT(DISTINCT category) as categories,
        AVG(latitude) as center_lat,
        AVG(longitude) as center_lng
      FROM complaints
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND duplicate_of IS NULL
      GROUP BY lat_group, lng_group
      HAVING complaint_count > 1
      ORDER BY complaint_count DESC
    `).all();

    res.json(hotspots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
