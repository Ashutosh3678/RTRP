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
mongoose.connect('mongodb+srv://ashutoshsingh2081:ashutoshsingh2081@rtrp.7sfxwhx.mongodb.net/?retryWrites=true&w=majority&appName=RTRP', {
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
        
        jsonArray.forEach(row => {
            // Add project 1 if it exists
            if (row['project 1'] && row['project 1'] !== 'Null(Lateral entry)') {
                projectsToInsert.push({
                    title: row['project 1'],
                    description: `Project by ${row['Name of the Student']} (${row['Roll Number']})`,
                    category: 'Web Development', // Default category
                    popularity: Math.floor(Math.random() * 100), // Random popularity
                    createdAt: new Date()
                });
            }
            
            // Add project 2 if it exists
            if (row['project 2'] && row['project 2'].trim() !== '') {
                projectsToInsert.push({
                    title: row['project 2'],
                    description: `Project by ${row['Name of the Student']} (${row['Roll Number']})`,
                    category: 'Web Development', // Default category
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