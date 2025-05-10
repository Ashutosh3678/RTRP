const ProjectSubmission = require('../models/ProjectSubmission');
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

// @desc    Submit a new project
// @route   POST /api/submissions
// @access  Public
exports.submitProject = async (req, res) => {
    try {
        const { title, description, studentName, rollNumber, email, category } = req.body;
        
        // Create new submission
        const submission = await ProjectSubmission.create({
            title,
            description,
            studentName,
            rollNumber,
            email,
            category: category || 'Web Development'
        });
        
        res.status(201).json({
            success: true,
            data: submission,
            message: 'Project submitted successfully. Awaiting admin approval.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all project submissions
// @route   GET /api/submissions
// @access  Private/Admin
exports.getSubmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        
        const submissions = await ProjectSubmission.find(query).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve a project submission
// @route   PUT /api/submissions/:id/approve
// @access  Private/Admin
exports.approveSubmission = async (req, res) => {
    try {
        const submission = await ProjectSubmission.findById(req.params.id);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Update submission status
        submission.status = 'approved';
        await submission.save();
        
        // Select appropriate image based on title and category
        const imageUrl = findMatchingImage(submission.title, submission.category);
        
        // Create project from submission
        await Project.create({
            title: submission.title,
            description: `Project by ${submission.studentName} (${submission.rollNumber})`,
            category: submission.category,
            imageUrl: imageUrl,
            createdBy: req.user._id,
            popularity: Math.floor(Math.random() * 50) + 10 // Random popularity between 10-60
        });
        
        res.json({
            success: true,
            data: submission,
            message: 'Project approved and added to the website'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject a project submission
// @route   PUT /api/submissions/:id/reject
// @access  Private/Admin
exports.rejectSubmission = async (req, res) => {
    try {
        const submission = await ProjectSubmission.findById(req.params.id);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Update submission status
        submission.status = 'rejected';
        await submission.save();
        
        res.json({
            success: true,
            data: submission,
            message: 'Project submission rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 