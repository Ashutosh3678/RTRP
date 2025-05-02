const express = require('express');
const { 
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    deleteCompleted
} = require('../controllers/todoController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getTodos).post(createTodo);
router.route('/reorder').put(reorderTodos);
router.route('/completed').delete(deleteCompleted);
router.route('/:id').put(updateTodo).delete(deleteTodo);

module.exports = router; 