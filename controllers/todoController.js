const Todo = require('../models/Todo');

// @desc    Get user's todos
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ order: 1 });
        
        res.json({
            success: true,
            count: todos.length,
            data: todos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title'
            });
        }
        
        // Count existing todos to set order
        const count = await Todo.countDocuments({ user: req.user._id });
        
        const todo = await Todo.create({
            title,
            user: req.user._id,
            order: count
        });
        
        res.status(201).json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }
        
        // Check if todo belongs to user
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this todo'
            });
        }
        
        todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }
        
        // Check if todo belongs to user
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this todo'
            });
        }
        
        await todo.deleteOne();
        
        // Reorder remaining todos
        const remainingTodos = await Todo.find({ user: req.user._id }).sort('order');
        for (let i = 0; i < remainingTodos.length; i++) {
            remainingTodos[i].order = i;
            await remainingTodos[i].save();
        }
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reorder todos
// @route   PUT /api/todos/reorder
// @access  Private
exports.reorderTodos = async (req, res) => {
    try {
        const { todos } = req.body;
        
        if (!todos || !Array.isArray(todos)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide todos array'
            });
        }
        
        // Update each todo's order
        for (const item of todos) {
            await Todo.findOneAndUpdate(
                { _id: item.id, user: req.user._id },
                { order: item.order }
            );
        }
        
        const updatedTodos = await Todo.find({ user: req.user._id }).sort('order');
        
        res.json({
            success: true,
            data: updatedTodos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete completed todos
// @route   DELETE /api/todos/completed
// @access  Private
exports.deleteCompleted = async (req, res) => {
    try {
        await Todo.deleteMany({ user: req.user._id, completed: true });
        
        // Reorder remaining todos
        const remainingTodos = await Todo.find({ user: req.user._id }).sort('order');
        for (let i = 0; i < remainingTodos.length; i++) {
            remainingTodos[i].order = i;
            await remainingTodos[i].save();
        }
        
        res.json({
            success: true,
            data: remainingTodos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 