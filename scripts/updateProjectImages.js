const mongoose = require('mongoose');
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
    
    // Special project-specific matches
    const specialMatches = {
        'automatic glasses': 'undraw_Remote_design_team_re_urdx.png',
        'deepfake detection': 'undraw_online_ad_re_ol62.png',
        'bank customer churn prediction': 'undraw_Finance_re_gnv2.png',
        'smart elevator system': 'undraw_Remote_design_team_re_urdx.png',
        'the career adventure': 'undraw_Graduation_re_gthn.png',
        'advanced surveillance device': 'undraw_Remote_design_team_re_urdx.png',
        'ai powered mood based music player': 'undraw_happy_music_g6wc.png',
        'alerting and hazardous gas detection': 'undraw_Remote_design_team_re_urdx.png',
        'secure payment method using blockchain': 'undraw_Finance_re_gnv2.png',
        'book & take': 'undraw_Graduation_re_gthn.png'
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
    
    // First check for exact matches
    for (const [projectTitle, image] of Object.entries(specialMatches)) {
        if (titleLower.includes(projectTitle.toLowerCase())) {
            return `images/topics/${image}`;
        }
    }
    
    // Then check for keyword matches
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

// Connect to the database
mongoose.connect('mongodb+srv://ashutoshsingh2081:ashutoshsingh2081@rtrp.7sfxwhx.mongodb.net/?retryWrites=true&w=majority&appName=RTRP', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('MongoDB connected successfully');
    
    try {
        // Get all projects
        const projects = await Project.find({});
        console.log(`Found ${projects.length} projects to update.`);
        
        // Update each project with an appropriate image
        for (const project of projects) {
            const newImageUrl = findMatchingImage(project.title, project.category);
            console.log(`Updating project "${project.title}" with image: ${newImageUrl}`);
            
            // Update the project
            await Project.findByIdAndUpdate(project._id, { imageUrl: newImageUrl });
        }
        
        console.log('All projects updated successfully!');
    } catch (error) {
        console.error('Error updating projects:', error);
    } finally {
        // Close the database connection
        mongoose.disconnect();
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
}); 