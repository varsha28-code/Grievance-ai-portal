/**
 * AI Classification Module (Frontend Port)
 * Uses keyword analysis to classify civic complaints
 */

export const CATEGORIES = {
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
export function classifyComplaint(title, description) {
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
export function calculatePriority(classification, upvotes, locationImportance = 5) {
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
