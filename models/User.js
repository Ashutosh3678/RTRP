const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 3,
        select: false
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    otp: {
        code: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
    console.log('OTP verification attempt:');
    console.log('- Stored OTP:', this.otp.code);
    console.log('- Entered OTP:', enteredOTP);
    console.log('- OTP Expires At:', this.otp.expiresAt);
    console.log('- Current time:', new Date());
    console.log('- OTP expired?', new Date() > this.otp.expiresAt);
    
    // Check if OTP exists and is not expired
    if (!this.otp.code || !this.otp.expiresAt || new Date() > this.otp.expiresAt) {
        console.log('OTP validation failed: OTP missing or expired');
        return false;
    }
    
    // Compare as strings to ensure type consistency
    const isValid = String(this.otp.code) === String(enteredOTP);
    console.log('OTP match result:', isValid);
    return isValid;
};

module.exports = mongoose.model('User', userSchema); 