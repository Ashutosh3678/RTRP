const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

const repeatedProjects = [
  { title: "Career Guidance Website", description: "A website which guides you to select your career.", popularity: 75, imageUrl: "../images/topics/undraw_Redesign_feedback_re_jvm0.png", category: "Web Development" },
  { title: "Clubs @ MLRIT", description: "A website which displays different clubs at MLRIT.", popularity: 65, imageUrl: "../images/topics/undraw_Remote_design_team_re_urdx.png", category: "Web Development" },
  { title: "To Do App", description: "To Do app which records your tasks.", popularity: 100, imageUrl: "../images/topics/colleagues-working-cozy-office-medium-shot.png", category: "Web Development" },
  { title: "Plant Watering System", description: "Automatic plant watering system using humidity sensor.", popularity: 30, imageUrl: "../images/topics/undraw_online_ad_re_ol62.png", category: "IOT" },
  { title: "Water Level Checker", description: "A Device Which Checks Water Level To Avoid Floods", popularity: 65, imageUrl: "../images/topics/undraw_Group_video_re_btu7.png", category: "IOT" },
  { title: "Water trash collector", description: "Collects trash from water bodies using solar", popularity: 50, imageUrl: "../images/topics/undraw_viral_tweet_gndb.png", category: "IOT" },
  { title: "Student Management System", description: "A web application to manage student data", popularity: 45, imageUrl: "../images/topics/undraw_happy_music_g6wc.png", category: "Web Development" },
  { title: "Smart Home Automation", description: "Control your home devices with a smartphone app", popularity: 80, imageUrl: "../images/topics/undraw_Educator_re_ju47.png", category: "IOT" }
];

async function importProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    for (const proj of repeatedProjects) {
      const exists = await Project.findOne({ title: proj.title });
      if (!exists) {
        await Project.create(proj);
        console.log(`Imported: ${proj.title}`);
      } else {
        console.log(`Already exists: ${proj.title}`);
      }
    }
    mongoose.disconnect();
    console.log('Import complete.');
  } catch (err) {
    console.error('Error importing projects:', err);
    mongoose.disconnect();
  }
}

importProjects(); 