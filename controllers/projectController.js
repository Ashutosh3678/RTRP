const Project = require('../models/Project');

// Helper function to determine the best image for a project based on title and category
const findMatchingImage = (title, category) => {
    const titleLower = title.toLowerCase();
    
    // Map of keywords to image files
    const imageMap = {
        // Web/App development related keywords
        'web': 'undraw_Redesign_feedback_re_jvm0.png',
        'website': 'undraw_Redesign_feedback_re_jvm0.png',
        'app': 'undraw_Group_video_re_btu7.png',
        'mobile': 'undraw_Group_video_re_btu7.png',
        'android': 'undraw_Group_video_re_btu7.png',
        'ios': 'undraw_Group_video_re_btu7.png',
        
        // Music/Audio related keywords
        'music': 'undraw_happy_music_g6wc.png',
        'audio': 'undraw_happy_music_g6wc.png',
        'sound': 'undraw_Compose_music_re_wpiw.png',
        'podcast': 'undraw_Podcast_audience_re_4i5q.png',
        
        // Finance/Business related keywords
        'bank': 'undraw_Finance_re_gnv2.png',
        'finance': 'undraw_Finance_re_gnv2.png',
        'payment': 'undraw_Finance_re_gnv2.png',
        'blockchain': 'undraw_Finance_re_gnv2.png',
        
        // Education related keywords
        'education': 'undraw_Educator_re_ju47.png',
        'learning': 'undraw_Educator_re_ju47.png',
        'book': 'undraw_Graduation_re_gthn.png',
        'school': 'undraw_Graduation_re_gthn.png',
        'student': 'undraw_Graduation_re_gthn.png',
        'career': 'undraw_Graduation_re_gthn.png',
        
        // IoT/Hardware related keywords
        'iot': 'undraw_Remote_design_team_re_urdx.png',
        'smart': 'undraw_Remote_design_team_re_urdx.png',
        'device': 'undraw_Remote_design_team_re_urdx.png',
        'robot': 'undraw_Remote_design_team_re_urdx.png',
        'sensor': 'undraw_Remote_design_team_re_urdx.png',
        'automatic': 'undraw_Remote_design_team_re_urdx.png',
        'elevator': 'undraw_Remote_design_team_re_urdx.png',
        'gas': 'undraw_Remote_design_team_re_urdx.png',
        'detection': 'undraw_Remote_design_team_re_urdx.png',
        
        // AI/ML related keywords
        'ai': 'undraw_online_ad_re_ol62.png',
        'machine learning': 'undraw_online_ad_re_ol62.png',
        'deep': 'undraw_online_ad_re_ol62.png',
        'neural': 'undraw_online_ad_re_ol62.png',
        'prediction': 'undraw_online_ad_re_ol62.png',
        
        // Social media related keywords
        'social': 'undraw_viral_tweet_gndb.png',
        'tweet': 'undraw_viral_tweet_gndb.png',
        'media': 'undraw_viral_tweet_gndb.png'
    };
    
    // Default images by category
    const categoryDefaults = {
        'Web Development': 'undraw_Redesign_feedback_re_jvm0.png',
        'IOT': 'undraw_Remote_design_team_re_urdx.png',
        'App Development': 'undraw_Group_video_re_btu7.png',
        'API Development': 'undraw_online_ad_re_ol62.png',
        'UI/UX': 'undraw_Compose_music_re_wpiw.png',
        'Machine Learning': 'undraw_online_ad_re_ol62.png'
    };
    
    // Check title for matching keywords
    for (const [keyword, image] of Object.entries(imageMap)) {
        if (titleLower.includes(keyword)) {
            return `images/topics/${image}`;
        }
    }
    
    // If no keyword match, use category default
    if (categoryDefaults[category]) {
        return `images/topics/${categoryDefaults[category]}`;
    }
    
    // Fallback to a default image
    return 'images/topics/undraw_Redesign_feedback_re_jvm0.png';
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
    try {
        const category = req.query.category;
        const query = category ? { category } : {};
        
        const projects = await Project.find(query).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'username');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Increment popularity count
        project.popularity += 1;
        await project.save();
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
    try {
        // Add user to request body
        req.body.createdBy = req.user._id;
        
        // Set appropriate image based on title and category if not provided
        if (!req.body.imageUrl) {
            req.body.imageUrl = findMatchingImage(req.body.title, req.body.category);
        }
        
        const project = await Project.create(req.body);
        
        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Make sure user is project owner or admin
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this project'
            });
        }
        
        // Update imageUrl if title or category changed
        if ((req.body.title && req.body.title !== project.title) || 
            (req.body.category && req.body.category !== project.category)) {
            req.body.imageUrl = findMatchingImage(
                req.body.title || project.title, 
                req.body.category || project.category
            );
        }
        
        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Make sure user is project owner or admin
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this project'
            });
        }
        
        await project.deleteOne();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Public
exports.searchProjects = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search keyword'
            });
        }
        
        const projects = await Project.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });
        
        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 