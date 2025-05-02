const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Import routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const todoRoutes = require('./routes/todoRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const formspreeRoutes = require('./routes/formspreeRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect('mongodb+srv://ashutoshsingh2081:ashutoshsingh2081@rtrp.7sfxwhx.mongodb.net/?retryWrites=true&w=majority&appName=RTRP', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Static files - serve the frontend
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/formspree-submissions', formspreeRoutes);

// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 