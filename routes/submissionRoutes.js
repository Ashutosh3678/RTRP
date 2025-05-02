const express = require('express');
const { 
    submitProject, 
    getSubmissions, 
    approveSubmission, 
    rejectSubmission 
} = require('../controllers/projectSubmissionController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/').post(submitProject);

// Admin only routes
router.route('/').get(protect, admin, getSubmissions);
router.route('/:id/approve').put(protect, admin, approveSubmission);
router.route('/:id/reject').put(protect, admin, rejectSubmission);

module.exports = router; 