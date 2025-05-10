const express = require('express');
const { registerUser, loginUser, getUserProfile, verifyOTP, debugOTP } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-otp').post(verifyOTP);

// Debug route (development only)
if (process.env.NODE_ENV === 'development') {
    router.route('/debug-otp/:userId').get(debugOTP);
}

// Protected routes
router.route('/profile').get(protect, getUserProfile);

module.exports = router; 