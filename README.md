# Micro Projects Website

Website which consists of list of all projects done by first year students at MLRIT.

Made by Vedansh Sharma & team

CSE - G

I - Sem

## Backend Setup

This project now includes a Node.js backend with MongoDB integration.

### Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14.x or higher)
2. Clone this repository
3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

2. Access the website at http://localhost:5000

### Features Added

- MongoDB database integration
- User authentication system
- RESTful API for To-Do application
- Project management functionality
- Token-based authentication

### API Endpoints

#### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile (protected)

#### Projects
- GET /api/projects - Get all projects
- GET /api/projects/search - Search projects
- GET /api/projects/:id - Get single project
- POST /api/projects - Create a project (protected)
- PUT /api/projects/:id - Update project (protected)
- DELETE /api/projects/:id - Delete project (protected)

#### Todos
- GET /api/todos - Get user's todos (protected)
- POST /api/todos - Create a todo (protected)
- PUT /api/todos/:id - Update todo (protected)
- DELETE /api/todos/:id - Delete todo (protected)
- PUT /api/todos/reorder - Reorder todos (protected)
- DELETE /api/todos/completed - Delete completed todos (protected)
