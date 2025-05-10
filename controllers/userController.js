const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, sendOTP } = require('../utils/twilioService');

// @desc    Create admin user if not exists
// @route   Internal function
// @access  Private
const createAdminIfNotExists = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ username: 'admin' }).select('+password');
        
        if (!adminExists) {
            // Create admin user
            await User.create({
                username: 'admin',
                password: '123',
                role: 'admin',
                is_admin: true
            });
            console.log('Admin user created successfully');
        } else {
            // Check if admin role is set correctly
            const needsUpdate = adminExists.role !== 'admin' || !adminExists.is_admin;
            
            if (needsUpdate) {
                // Update admin user
                adminExists.role = 'admin';
                adminExists.is_admin = true;
                await adminExists.save();
                console.log('Admin user updated with correct role');
            }
        }
    } catch (error) {
        console.error('Error managing admin user:', error);
    }
};

// Call the function to ensure admin exists
createAdminIfNotExists();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { username, password, phoneNumber } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            phoneNumber
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid user data' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username }).select('+password');
        
        // Check if user exists and password matches
        if (user && (await user.comparePassword(password))) {
            // Check if user is admin - provide direct login
            if (user.role === 'admin') {
                return res.json({
                    success: true,
                    user: {
                        _id: user._id,
                        username: user.username,
                        role: user.role
                    },
                    token: generateToken(user._id)
                });
            } 
            
            // If not admin and no phone number, return error
            if (!user.phoneNumber) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No phone number associated with this account. Please contact support.' 
                });
            }
            
            // Ensure phone number has country code
            let phoneNumber = user.phoneNumber;
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+' + phoneNumber;
                user.phoneNumber = phoneNumber;
                await user.save();
            }
            
            // Generate OTP for student
            const otp = generateOTP();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
            
            // Save OTP to user
            user.otp.code = otp;
            user.otp.expiresAt = expiresAt;
            await user.save();
            
            // Mask phone number for privacy in response
            const maskedPhone = maskPhoneNumber(phoneNumber);
            
            // Send OTP via Twilio
            const result = await sendOTP(phoneNumber, otp);
            
            if (result.success) {
                return res.json({
                    success: true,
                    message: `OTP sent to ${maskedPhone}`,
                    userId: user._id,
                    requireOTP: true
                });
            } else {
                return res.status(500).json({ 
                    success: false, 
                    message: result.message || 'Failed to send OTP. Please try again.' 
                });
            }
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Helper function to mask phone number
function maskPhoneNumber(phone) {
    if (!phone || phone.length < 8) return phone;
    const lastFour = phone.slice(-4);
    const maskLength = phone.length - 4;
    return '*'.repeat(maskLength) + lastFour;
}

// @desc    Verify OTP and complete login
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Verify OTP
        if (user.verifyOTP(otp)) {
            // Clear OTP after successful verification
            user.otp.code = null;
            user.otp.expiresAt = null;
            await user.save();
            
            return res.json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                },
                token: generateToken(user._id)
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired OTP' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (user) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Debug endpoint to check OTP (DEVELOPMENT ONLY)
// @route   GET /api/users/debug-otp/:userId
// @access  Public (should be restricted in production)
exports.debugOTP = async (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is only available in development mode'
        });
    }
    
    try {
        const userId = req.params.userId;
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.json({
            success: true,
            debug: {
                username: user.username,
                phoneNumber: user.phoneNumber,
                otp: user.otp.code,
                expiresAt: user.otp.expiresAt,
                currentTime: new Date(),
                isExpired: user.otp.expiresAt ? new Date() > user.otp.expiresAt : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 