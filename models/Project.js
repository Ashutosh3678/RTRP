const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Web Development', 'IOT', 'App Development', 'API Development', 'UI/UX', 'Machine Learning']
    },
    imageUrl: {
        type: String,
        default: 'images/topics/undraw_Redesign_feedback_re_jvm0.png'
    },
    popularity: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema); 