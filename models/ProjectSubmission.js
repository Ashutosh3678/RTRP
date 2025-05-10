const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required']
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    category: {
        type: String,
        default: 'Web Development',
        enum: ['Web Development', 'IOT', 'App Development', 'API Development', 'UI/UX', 'Machine Learning']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema); 