const express = require('express');
const { 
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    searchProjects
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/').get(getProjects);
router.route('/search').get(searchProjects);
router.route('/:id').get(getProject);

// Protected routes
router.route('/').post(protect, createProject);
router.route('/:id').put(protect, updateProject).delete(protect, deleteProject);

module.exports = router; 