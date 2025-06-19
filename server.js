const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const todoRoutes = require('./routes/todoRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const formspreeRoutes = require('./routes/formspreeRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files - serve the frontend
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'html')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/formspree-submissions', formspreeRoutes);
app.use('/api/ai', aiRoutes);

// Handle HTML file requests
app.get('*.html', (req, res, next) => {
    const htmlPath = path.join(__dirname, req.path);
    res.sendFile(htmlPath, err => {
        if (err) {
            console.error(`Error serving ${req.path}:`, err);
            next();
        }
    });
});

// Serve index.html for non-matching routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});