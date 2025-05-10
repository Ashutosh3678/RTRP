const express = require('express');
const { 
    handleFormspreeWebhook,
    getFormspreeSubmissions,
    clearFormspreeSubmission
} = require('../controllers/formspreeController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes - webhook from Formspree
router.route('/webhook').post(handleFormspreeWebhook);

// Admin only routes
router.route('/').get(protect, admin, getFormspreeSubmissions);
router.route('/:index').delete(protect, admin, clearFormspreeSubmission);

module.exports = router; 