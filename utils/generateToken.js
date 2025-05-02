const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'micro_projects_secret_key', {
        expiresIn: '30d'
    });
};

module.exports = generateToken; 