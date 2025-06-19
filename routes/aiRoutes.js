const express = require('express');
const router = express.Router();
const { generateSuggestions, getSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protected routes - require authentication
router.post('/suggestions', protect, generateSuggestions);
router.get('/suggestions', protect, getSuggestions);

module.exports = router; 