const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const dotenv = require('dotenv');

// Import Project model
const Project = require('../models/Project');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/micro-projects', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to import projects from CSV
const importProjects = async () => {
    try {
        // Clear existing projects
        await Project.deleteMany({});
        console.log('Deleted all existing projects');

        // Read CSV file
        const csvFilePath = path.join(__dirname, '../Project Details (Responses).csv');
        const jsonArray = await csv().fromFile(csvFilePath);
        
        const projectsToInsert = [];
        
        jsonArray.forEach(row => {            // Function to determine category and image based on project title            const getCategoryAndImage = (title) => {
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

                title = title.toLowerCase();
                if (title.includes('ai') || title.includes('ml') || title.includes('machine learning') || title.includes('detection')) {
                    return {
                        category: 'Machine Learning',
                        imageUrl: getRandomImage('ml')
                    };
                } else if (title.includes('app') || title.includes('mobile')) {
                    return {
                        category: 'App Development',
                        imageUrl: getRandomImage('app')
                    };
                } else if (title.includes('iot') || title.includes('smart') || title.includes('device') || title.includes('system')) {
                    return {
                        category: 'IOT',
                        imageUrl: getRandomImage('iot')
                    };
                } else if (title.includes('ui') || title.includes('ux') || title.includes('design')) {
                    return {
                        category: 'UI/UX',
                        imageUrl: getRandomImage('uiux')
                    };
                } else {
                    return {
                        category: 'Web Development',
                        imageUrl: getRandomImage('web')
                    };
                }
            };

            // Add project 1 if it exists
            if (row['project 1'] && row['project 1'] !== 'Null(Lateral entry)') {
                const { category, imageUrl } = getCategoryAndImage(row['project 1']);
                projectsToInsert.push({
                    title: row['project 1'],
                    description: `Project by ${row['Name of the Student']} (${row['Roll Number']})`,
                    category,
                    imageUrl,
                    popularity: Math.floor(Math.random() * 100), // Random popularity
                    createdAt: new Date()
                });
            }
            
            // Add project 2 if it exists
            if (row['project 2'] && row['project 2'].trim() !== '') {
                const { category, imageUrl } = getCategoryAndImage(row['project 2']);
                projectsToInsert.push({
                    title: row['project 2'],
                    description: `Project by ${row['Name of the Student']} (${row['Roll Number']})`,
                    category,
                    imageUrl,
                    popularity: Math.floor(Math.random() * 100), // Random popularity
                    createdAt: new Date()
                });
            }
        });
        
        // Insert projects into database
        const result = await Project.insertMany(projectsToInsert);
        console.log(`Successfully imported ${result.length} projects`);
        
        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('Error importing projects:', error);
        mongoose.disconnect();
    }
};

// Execute the import function
importProjects(); 