const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile);

module.exports = router; 