/**
 * AI Classification Module
 * Uses keyword analysis and image pattern recognition to classify civic complaints
 */
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const jpeg = require('jpeg-js');
const pngjs = require('pngjs').PNG;

let model = null;
async function loadModel() {
  if (!model) {
    try {
      model = await mobilenet.load({ version: 2, alpha: 1.0 });
      console.log('✅ MobileNet model loaded successfully');
    } catch (e) {
      console.error('Failed to load MobileNet', e);
    }
  }
  return model;
}

// Map ImageNet classes to civic categories
const IMAGENET_MAPPING = {
  'Garbage': ['trash', 'ashcan', 'garbage', 'wastebin', 'dump', 'barrow', 'cart', 'street', 'plastic bag', 'shopping cart'],
  'Water Leakage': ['fountain', 'geyser', 'hose', 'pipe', 'plumbing', 'water', 'bucket'],
  'Drainage': ['manhole cover', 'sewer', 'drain', 'grille', 'grate'],
  'Streetlight': ['street sign', 'traffic light', 'pole', 'lampshade', 'beacon', 'spotlight'],
  'Pothole': ['crater', 'hole', 'cliff', 'alp', 'valley', 'dirt', 'earth'],
  'Road Damage': ['barrier', 'barricade', 'fence', 'chainlink'],
  'Encroachment': ['tent', 'awning', 'canopy', 'market', 'barrow', 'vendor'],
};

const CATEGORIES = {
  'Pothole': {
    keywords: ['pothole', 'hole', 'road damage', 'crater', 'road surface', 'asphalt', 'bumpy road', 'road broken'],
    department: 'Roads & Infrastructure',
    basePriority: 'high',
    safetyRisk: 7,
  },
  'Garbage': {
    keywords: ['garbage', 'waste', 'trash', 'dump', 'litter', 'rubbish', 'debris', 'overflowing bin', 'stinking', 'foul smell'],
    department: 'Sanitation',
    basePriority: 'medium',
    safetyRisk: 5,
  },
  'Streetlight': {
    keywords: ['streetlight', 'street light', 'light', 'lamp', 'bulb', 'dark', 'no light', 'flickering', 'electrical', 'pole light'],
    department: 'Electrical',
    basePriority: 'medium',
    safetyRisk: 6,
  },
  'Water Leakage': {
    keywords: ['water', 'leak', 'leakage', 'pipe', 'pipeline', 'burst', 'water supply', 'tap', 'overflow', 'flooding'],
    department: 'Water Supply',
    basePriority: 'high',
    safetyRisk: 6,
  },
  'Drainage': {
    keywords: ['drain', 'drainage', 'sewer', 'manhole', 'sewage', 'clogged', 'storm drain', 'waterlogging', 'flood'],
    department: 'Water Supply',
    basePriority: 'high',
    safetyRisk: 8,
  },
  'Road Damage': {
    keywords: ['road', 'divider', 'median', 'barrier', 'crack', 'broken road', 'speed breaker', 'road sign', 'zebra crossing'],
    department: 'Roads & Infrastructure',
    basePriority: 'medium',
    safetyRisk: 6,
  },
  'Encroachment': {
    keywords: ['encroachment', 'illegal', 'unauthorized', 'footpath', 'sidewalk', 'parking', 'vendor', 'construction'],
    department: 'Urban Planning',
    basePriority: 'low',
    safetyRisk: 3,
  },
  'Public Safety': {
    keywords: ['danger', 'hazard', 'unsafe', 'accident', 'collapse', 'falling', 'wire', 'electric', 'exposed', 'sharp'],
    department: 'Public Safety',
    basePriority: 'critical',
    safetyRisk: 10,
  },
};

/**
 * Classify a complaint based on text description
 */
function classifyComplaint(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  let bestCategory = 'Other';
  let bestScore = 0;
  let confidence = 0;

  for (const [category, config] of Object.entries(CATEGORIES)) {
    let score = 0;
    let matchedKeywords = 0;

    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        score += keyword.split(' ').length; // Multi-word keywords score higher
        matchedKeywords++;
      }
    }

    // Normalize score
    const normalizedScore = matchedKeywords / config.keywords.length;

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
      confidence = Math.min(0.95, 0.6 + normalizedScore * 0.35);
    }
  }

  if (bestScore === 0) {
    bestCategory = 'Other';
    confidence = 0.3;
  }

  const categoryConfig = CATEGORIES[bestCategory] || { department: 'General', basePriority: 'medium', safetyRisk: 5 };

  return {
    category: bestCategory,
    confidence: Math.round(confidence * 100) / 100,
    department: categoryConfig.department,
    suggestedPriority: categoryConfig.basePriority,
    safetyRisk: categoryConfig.safetyRisk,
  };
}

/**
 * Calculate intelligent priority based on multiple factors
 */
function calculatePriority(classification, upvotes, locationImportance = 5) {
  let score = 0;

  // Safety risk (0-10) → 40% weight
  score += (classification.safetyRisk / 10) * 40;

  // Affected citizens / upvotes → 30% weight
  const upvoteScore = Math.min(upvotes / 50, 1);
  score += upvoteScore * 30;

  // Location importance (0-10) → 20% weight
  score += (locationImportance / 10) * 20;

  // Base priority → 10% weight
  const priorityMap = { critical: 10, high: 7, medium: 5, low: 3 };
  score += ((priorityMap[classification.suggestedPriority] || 5) / 10) * 10;

  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Check for duplicate complaints based on proximity and category
 */
function findDuplicates(db, category, lat, lng, radiusKm = 0.2) {
  if (!lat || !lng) return [];

  // Simple approximate distance calculation
  const latRange = radiusKm / 111; // 1 degree lat ≈ 111km
  const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

  const duplicates = db.prepare(`
    SELECT id, ticket_id, title, latitude, longitude, upvotes, status
    FROM complaints
    WHERE category = ?
    AND latitude BETWEEN ? AND ?
    AND longitude BETWEEN ? AND ?
    AND status != 'resolved'
    AND duplicate_of IS NULL
    ORDER BY upvotes DESC
  `).all(category, lat - latRange, lat + latRange, lng - lngRange, lng + lngRange);

  return duplicates;
}

/**
 * Run MobileNet classification on raw image buffer
 * Maps ImageNet predictions to civic categories
 */
async function classifyImage(imageBuffer, mimeType = 'image/jpeg') {
  try {
    const net = await loadModel();
    if (!net) return null;

    let tensor;
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      const imgData = jpeg.decode(imageBuffer, { useTArray: true });
      const numChannels = 3;
      const numPixels = imgData.width * imgData.height;
      const values = new Int32Array(numPixels * numChannels);
      for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; c++) {
          values[i * numChannels + c] = imgData.data[i * 4 + c]; // Ignore Alpha
        }
      }
      tensor = tf.tensor3d(values, [imgData.height, imgData.width, numChannels], 'int32');
    } else if (mimeType === 'image/png') {
      const imgData = pngjs.sync.read(imageBuffer);
      const numChannels = 3;
      const numPixels = imgData.width * imgData.height;
      const values = new Int32Array(numPixels * numChannels);
      for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; c++) {
          values[i * numChannels + c] = imgData.data[i * 4 + c];
        }
      }
      tensor = tf.tensor3d(values, [imgData.height, imgData.width, numChannels], 'int32');
    } else {
      // Return unclassified for other types
      return null;
    }

    const predictions = await net.classify(tensor, 5); // Get top 5 ImageNet classes
    tensor.dispose();

    // Map predictions to our civic categories
    let bestCategory = 'Other';
    let bestConfidence = 0;

    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      for (const [civicCategory, keywords] of Object.entries(IMAGENET_MAPPING)) {
        for (const keyword of keywords) {
          if (className.includes(keyword) && pred.probability > bestConfidence) {
            bestCategory = civicCategory;
            bestConfidence = pred.probability;
          }
        }
      }
    }

    if (bestCategory === 'Other' && predictions.length > 0) {
      bestConfidence = 0.3; // Low confidence fallback
    }

    return {
      category: bestCategory,
      confidence: Math.round(bestConfidence * 100) / 100,
      labels: predictions,
    };
  } catch (err) {
    console.error('Image classification failed:', err);
    return null;
  }
}

module.exports = {
  classifyComplaint,
  calculatePriority,
  findDuplicates,
  classifyImage,
  CATEGORIES,
};
