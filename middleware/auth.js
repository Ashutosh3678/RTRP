const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'projects_secret_key');
        
        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }
        
        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Admin only middleware
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
}; 