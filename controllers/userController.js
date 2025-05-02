const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
        const { username, password } = req.body;

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
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
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
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                token: generateToken(user._id)
            });
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