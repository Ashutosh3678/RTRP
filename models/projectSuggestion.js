const mongoose = require('mongoose');

const projectSuggestionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interests: [{
        type: String,
        required: true
    }],
    skills: [{
        type: String,
        required: true
    }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    suggestions: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        technologies: [{
            type: String
        }],
        estimatedTime: {
            type: String
        },
        learningOutcomes: [{
            type: String
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ProjectSuggestion', projectSuggestionSchema); 