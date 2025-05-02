document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = '/api/todos';
    const todoList = document.getElementById('todo-list');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    let todos = [];
    let token = localStorage.getItem('token');
    
    // Check if user is logged in
    const checkAuth = () => {
        if (!token) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
        }
    };
    
    // Fetch todos from API
    const fetchTodos = async () => {
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                todos = data.data;
                renderTodos();
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };
    
    // Add new todo
    const addTodo = async (title) => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title })
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                todos.push(data.data);
                renderTodos();
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };
    
    // Toggle todo completed status
    const toggleTodo = async (id, completed) => {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed })
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            await response.json();
            
            // Update local array
            todos = todos.map(todo => 
                todo._id === id ? { ...todo, completed } : todo
            );
            
            renderTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };
    
    // Delete todo
    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            await response.json();
            
            // Update local array
            todos = todos.filter(todo => todo._id !== id);
            
            renderTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };
    
    // Delete all completed todos
    const clearCompleted = async () => {
        try {
            const response = await fetch(`${apiUrl}/completed`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                todos = data.data;
                renderTodos();
            }
        } catch (error) {
            console.error('Error clearing completed todos:', error);
        }
    };
    
    // Handle reordering
    const reorderTodos = async (updatedTodos) => {
        try {
            const todoArray = updatedTodos.map((todo, index) => ({
                id: todo._id,
                order: index
            }));
            
            const response = await fetch(`${apiUrl}/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ todos: todoArray })
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                checkAuth();
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                todos = data.data;
                renderTodos();
            }
        } catch (error) {
            console.error('Error reordering todos:', error);
        }
    };
    
    // Render todos to the DOM
    const renderTodos = () => {
        if (!todoList) return;
        
        todoList.innerHTML = '';
        
        todos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');
            todoItem.dataset.id = todo._id;
            todoItem.draggable = true;
            
            if (todo.completed) {
                todoItem.classList.add('completed');
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                toggleTodo(todo._id, checkbox.checked);
            });
            
            const text = document.createElement('span');
            text.textContent = todo.title;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTodo(todo._id);
            });
            
            todoItem.appendChild(checkbox);
            todoItem.appendChild(text);
            todoItem.appendChild(deleteBtn);
            
            todoList.appendChild(todoItem);
        });
        
        // Set up drag and drop functionality
        setupDragAndDrop();
    };
    
    // Setup drag and drop
    const setupDragAndDrop = () => {
        const todoItems = document.querySelectorAll('.todo-item');
        let draggedItem = null;
        
        todoItems.forEach(item => {
            item.addEventListener('dragstart', () => {
                draggedItem = item;
                setTimeout(() => {
                    item.classList.add('dragging');
                }, 0);
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
                
                // Update order in database
                const updatedTodos = [...document.querySelectorAll('.todo-item')]
                    .map(el => todos.find(todo => todo._id === el.dataset.id));
                
                reorderTodos(updatedTodos);
            });
            
            item.addEventListener('dragover', e => {
                e.preventDefault();
            });
            
            item.addEventListener('dragenter', e => {
                e.preventDefault();
                if (item !== draggedItem) {
                    const draggingItem = document.querySelector('.dragging');
                    const afterElement = getDragAfterElement(todoList, e.clientY);
                    
                    if (afterElement) {
                        todoList.insertBefore(draggingItem, afterElement);
                    } else {
                        todoList.appendChild(draggingItem);
                    }
                }
            });
        });
    };
    
    // Determine where to place dragged element
    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };
    
    // Event listeners
    if (todoForm) {
        todoForm.addEventListener('submit', e => {
            e.preventDefault();
            const todoText = todoInput.value.trim();
            
            if (todoText) {
                addTodo(todoText);
                todoInput.value = '';
            }
        });
    }
    
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompleted);
    }
    
    // Initialize
    checkAuth();
    fetchTodos();
    
    // Add logout button functionality if it exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
}); 