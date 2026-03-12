const express = require('express');
const router = express.Router();
const { classifyComplaint, CATEGORIES } = require('../ai/classifier');

const QUICK_REPLIES = {
  greeting: [
    "Hello! 👋 I'm CivicBot, your civic grievance assistant. How can I help you today?",
    "You can:\n• Report a new complaint\n• Track an existing complaint\n• Learn about complaint categories\n• Get help with the platform",
  ],
  categories: [
    "We handle the following civic issues:\n\n🛣️ **Pothole** - Road damage, potholes\n🗑️ **Garbage** - Waste accumulation, overflowing bins\n💡 **Streetlight** - Broken/flickering lights\n💧 **Water Leakage** - Pipe bursts, water waste\n🚰 **Drainage** - Blocked drains, sewage issues\n🛤️ **Road Damage** - Dividers, barriers, road signs\n🏗️ **Encroachment** - Unauthorized constructions\n⚠️ **Public Safety** - Hazardous conditions",
  ],
  report: [
    "To report a new complaint:\n\n1. Click **'Report Issue'** in the navigation\n2. Describe the problem\n3. Upload a photo (optional but recommended)\n4. Mark the location on the map\n5. Submit!\n\nOur AI will automatically classify and route your complaint to the right department.",
  ],
  track: [
    "To track your complaint:\n\n1. Go to **'Track Complaint'** page\n2. Enter your ticket ID (e.g., CG-2026-0001)\n3. View real-time status updates\n\nStatus stages: Registered → Assigned → In Progress → Resolved → Verified",
  ],
  escalation: [
    "Complaints are automatically escalated if:\n\n• Not addressed within **48 hours** (registered)\n• Not resolved within **7 days** (in progress)\n• Multiple citizens report the same issue\n• Safety-critical issues are detected\n\nYou can also upvote complaints to increase their priority!",
  ],
};

router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const text = message.toLowerCase().trim();
  let response = '';
  let suggestions = [];

  // Intent detection
  if (text.match(/^(hi|hello|hey|help|start|menu)/)) {
    response = QUICK_REPLIES.greeting.join('\n\n');
    suggestions = ['Report an issue', 'Track complaint', 'View categories', 'How escalation works'];
  } else if (text.match(/categor|type|kind|what.*issue/)) {
    response = QUICK_REPLIES.categories[0];
    suggestions = ['Report an issue', 'Go back'];
  } else if (text.match(/report|new.*complaint|submit|file|register/)) {
    response = QUICK_REPLIES.report[0];
    suggestions = ['View categories', 'Track complaint'];
  } else if (text.match(/track|status|check|find|ticket|where.*complaint/)) {
    response = QUICK_REPLIES.track[0];
    suggestions = ['Report an issue', 'Go back'];
  } else if (text.match(/escalat|priority|urgent|speed|fast/)) {
    response = QUICK_REPLIES.escalation[0];
    suggestions = ['Report an issue', 'Track complaint'];
  } else {
    // Try to classify the message as a potential complaint
    const classification = classifyComplaint(text, text);
    if (classification.confidence > 0.5) {
      response = `It sounds like you're describing a **${classification.category}** issue.\n\nThis would be handled by the **${classification.department}** department.\n\nWould you like to file a formal complaint? Click **'Report Issue'** in the navigation to submit it with full details and location.`;
      suggestions = ['Report an issue', 'View categories', 'Go back'];
    } else {
      response = "I'm not sure I understand. Here's what I can help with:\n\n• **Report** a new civic complaint\n• **Track** an existing complaint\n• **Learn** about complaint categories\n• **Understand** how escalation works\n\nTry saying something like 'I want to report a pothole' or 'track my complaint'.";
      suggestions = ['Report an issue', 'Track complaint', 'View categories'];
    }
  }

  res.json({ response, suggestions });
});

module.exports = router;
