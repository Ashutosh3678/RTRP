document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const errorMessageContainer = document.getElementById('error-message');
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Redirect to admin dashboard if already logged in
        window.location.href = 'admin-dashboard.html';
    }
    
    const displayError = (message) => {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
    };
    
    const login = async (username, password) => {
        try {
            // Show loading state
            document.getElementById('login-btn').value = 'Logging in...';
            document.getElementById('login-btn').disabled = true;
            
            console.log('Attempting login with:', { username, password });
            
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success) {
                // Save token to localStorage
                localStorage.setItem('token', data.token);
                
                // Redirect to admin dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                displayError(data.message || 'Invalid username or password');
                document.getElementById('login-btn').value = 'Log In';
                document.getElementById('login-btn').disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            displayError('Connection error. Please try again.');
            document.getElementById('login-btn').value = 'Log In';
            document.getElementById('login-btn').disabled = false;
        }
    };
    
    // Event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                displayError('Please enter both username and password');
                return;
            }
            
            login(username, password);
        });
    }
}); 