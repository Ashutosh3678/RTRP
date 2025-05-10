document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const errorMessageContainer = document.getElementById('error-message');
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Verify if the user is an admin before redirecting
        fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user.role === 'admin') {
                // Redirect to admin dashboard if already logged in and is admin
                window.location.href = 'admin-dashboard.html';
            } else {
                // If not admin, clear token and stay on login page
                localStorage.removeItem('token');
            }
        })
        .catch(error => {
            console.error('Error checking user profile:', error);
            localStorage.removeItem('token');
        });
    }
    
    // Helper functions
    const displayError = (message) => {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
    };
    
    const clearError = () => {
        errorMessageContainer.style.display = 'none';
    };
    
    const showLoadingState = (isLoading) => {
        const button = document.getElementById('login-btn');
        if (isLoading) {
            button.disabled = true;
            button.value = 'Logging in...';
        } else {
            button.disabled = false;
            button.value = 'Admin Login';
        }
    };
    
    // API calls
    const login = async (username, password) => {
        try {
            // Show loading state
            showLoadingState(true);
            clearError();
            
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.requireOTP) {
                    // If OTP required, this is not an admin account
                    displayError('This is not an admin account. Please use student login.');
                    showLoadingState(false);
                } else {
                    // Save token to localStorage
                    localStorage.setItem('token', data.token);
                    
                    // Verify if the logged-in user is actually an admin
                    if (data.user.role === 'admin') {
                        // Redirect to admin dashboard
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        displayError('This account does not have admin privileges.');
                        localStorage.removeItem('token');
                        showLoadingState(false);
                    }
                }
            } else {
                displayError(data.message || 'Invalid username or password');
                showLoadingState(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            displayError('Connection error. Please try again.');
            showLoadingState(false);
        }
    };
    
    // Event listeners
    if (loginForm) {
        // Clear error on input
        usernameInput.addEventListener('input', clearError);
        passwordInput.addEventListener('input', clearError);
        
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