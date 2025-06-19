const aiService = require('../services/aiService');

// Generate project suggestions
const generateSuggestions = async (req, res) => {
    try {
        const { interests, skills, difficulty } = req.body;
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated. Please log in again.'
            });
        }
        const userId = req.user._id;

        if (!interests || !skills || !difficulty) {
            return res.status(400).json({
                success: false,
                error: 'Please provide interests, skills, and difficulty level'
            });
        }

        const suggestions = await aiService.generateProjectSuggestions(
            userId,
            interests,
            skills,
            difficulty
        );

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error in generateSuggestions:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error generating project suggestions'
        });
    }
};

// Get user's project suggestions
const getSuggestions = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated. Please log in again.'
            });
        }
        const userId = req.user._id;
        const suggestions = await aiService.getProjectSuggestions(userId);

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Error in getSuggestions:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error fetching project suggestions'
        });
    }
};

module.exports = {
    generateSuggestions,
    getSuggestions
}; 