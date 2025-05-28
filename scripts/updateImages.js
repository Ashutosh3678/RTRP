const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project');

// Load environment variables
dotenv.config();

// Image mappings
const images = {
    ml: ['../images/topics/undraw_Compose_music_re_wpiw.png', '../images/topics/undraw_happy_music_g6wc.png'],
    app: ['../images/topics/undraw_Remote_design_team_re_urdx.png', '../images/topics/undraw_Finance_re_gnv2.png'],
    iot: ['../images/topics/undraw_Group_video_re_btu7.png', '../images/topics/undraw_Podcast_audience_re_4i5q.png'],
    uiux: ['../images/topics/undraw_Redesign_feedback_re_jvm0.png', '../images/topics/undraw_viral_tweet_gndb.png'],
    web: ['../images/topics/undraw_online_ad_re_ol62.png', '../images/topics/undraw_Graduation_re_gthn.png', '../images/topics/undraw_Educator_re_ju47.png']
};

const getRandomImage = (category) => {
    const categoryImages = images[category];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
};

const getCategoryImage = (title, category) => {
    title = title.toLowerCase();
    if (category === 'Machine Learning' || title.includes('ai') || title.includes('ml') || title.includes('detection')) {
        return getRandomImage('ml');
    } else if (category === 'App Development' || title.includes('app') || title.includes('mobile')) {
        return getRandomImage('app');
    } else if (category === 'IOT' || title.includes('iot') || title.includes('smart') || title.includes('device') || title.includes('system')) {
        return getRandomImage('iot');
    } else if (category === 'UI/UX' || title.includes('ui') || title.includes('ux') || title.includes('design')) {
        return getRandomImage('uiux');
    } else {
        return getRandomImage('web');
    }
};

const updateProjectImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/micro-projects', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');

        const projects = await Project.find({});
        
        for (const project of projects) {
            const newImageUrl = getCategoryImage(project.title, project.category);
            await Project.updateOne(
                { _id: project._id },
                { $set: { imageUrl: newImageUrl } }
            );
        }

        console.log('Successfully updated all project images');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error updating project images:', error);
        mongoose.disconnect();
    }
};

updateProjectImages();
