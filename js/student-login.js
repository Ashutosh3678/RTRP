document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabs = document.querySelectorAll('.tab a');
    const formPanels = document.querySelectorAll('.form-panel');
    
    const studentLoginForm = document.getElementById('student-login-form');
    const studentRegisterForm = document.getElementById('student-register-form');
    const otpVerificationForm = document.getElementById('otp-verification-form');
    const otpContainer = document.getElementById('otp-container');
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const otpInput = document.getElementById('otp-input');
    
    const regUsernameInput = document.getElementById('reg-username');
    const regPasswordInput = document.getElementById('reg-password');
    const regPhoneInput = document.getElementById('reg-phone');
    
    const errorMessageContainer = document.getElementById('error-message');
    const successMessageContainer = document.getElementById('success-message');
    const countdownElement = document.getElementById('countdown');
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    
    // Variables
    let userId = null;
    let countdownInterval = null;
    let countdown = 0;
    let currentActivePanel = 'login';
    
    // Tab Handling
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('href').substring(1);
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            formPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetId) {
                    panel.classList.add('active');
                    currentActivePanel = targetId;
                }
            });
            
            // Clear messages
            clearMessages();
        });
    });
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Check if user is a student or admin to redirect accordingly
        fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    // Redirect to student dashboard or home page
                    window.location.href = 'index.html';
                }
            } else {
                // If profile check fails, clear token
                localStorage.removeItem('token');
            }
        })
        .catch(error => {
            console.error('Error checking user profile:', error);
            localStorage.removeItem('token');
        });
    }
    
    // Helper Functions
    const displayError = (message) => {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
        successMessageContainer.style.display = 'none';
    };
    
    const displaySuccess = (message) => {
        successMessageContainer.textContent = message;
        successMessageContainer.style.display = 'block';
        errorMessageContainer.style.display = 'none';
    };
    
    const clearMessages = () => {
        errorMessageContainer.style.display = 'none';
        successMessageContainer.style.display = 'none';
    };
    
    const validatePhoneNumber = (phoneNumber) => {
        // Basic phone number validation - should start with + and have at least 8 digits
        const phoneRegex = /^\+[0-9]{8,15}$/;
        return phoneRegex.test(phoneNumber);
    };
    
    const showLoadingState = (buttonId, isLoading, originalText) => {
        const button = document.getElementById(buttonId);
        if (isLoading) {
            button.disabled = true;
            button.value = 'Processing...';
        } else {
            button.disabled = false;
            button.value = originalText;
        }
    };
    
    const startCountdown = (durationInSeconds) => {
        clearInterval(countdownInterval);
        countdown = durationInSeconds;
        
        const updateCountdown = () => {
            const minutes = Math.floor(countdown / 60);
            const seconds = countdown % 60;
            countdownElement.textContent = `OTP expires in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = 'OTP has expired. Please request a new one.';
                resendOtpBtn.style.display = 'inline-block';
            } else {
                countdown--;
            }
        };
        
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    };
    
    const showOTPVerification = () => {
        studentLoginForm.parentElement.style.display = 'none';
        studentRegisterForm.parentElement.style.display = 'none';
        otpContainer.style.display = 'block';
        otpInput.focus();
        startCountdown(10 * 60); // 10 minutes countdown
    };
    
    const resetForms = () => {
        studentLoginForm.reset();
        studentRegisterForm.reset();
        otpVerificationForm.reset();
        otpContainer.style.display = 'none';
        
        // Show the appropriate form panel
        formPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === 'login') {
                panel.classList.add('active');
                currentActivePanel = 'login';
            }
        });
        
        // Update active tab
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('href') === '#login') {
                tab.classList.add('active');
            }
        });
    };
    
    // API Calls
    const loginUser = async (username, password) => {
        try {
            showLoadingState('login-btn', true);
            clearMessages();
            
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
                    // OTP flow for students
                    userId = data.userId;
                    displaySuccess('OTP sent to your registered phone number');
                    showOTPVerification();
                } else {
                    // Direct login flow for admins
                    localStorage.setItem('token', data.token);
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            } else {
                displayError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayError('Connection error. Please try again.');
        } finally {
            showLoadingState('login-btn', false, 'Log In');
        }
    };
    
    const registerUser = async (username, password, phoneNumber) => {
        try {
            showLoadingState('register-btn', true);
            clearMessages();
            
            if (!validatePhoneNumber(phoneNumber)) {
                displayError('Please enter a valid phone number with country code (e.g., +1234567890)');
                showLoadingState('register-btn', false, 'Register');
                return;
            }
            
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, phoneNumber })
            });
            
            const data = await response.json();
            
            if (data.success) {
                displaySuccess('Registration successful! You can now log in.');
                
                // Switch to login tab and pre-fill username
                formPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === 'login') {
                        panel.classList.add('active');
                        currentActivePanel = 'login';
                    }
                });
                
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.getAttribute('href') === '#login') {
                        tab.classList.add('active');
                    }
                });
                
                // Fill the username in login form to make it easier
                usernameInput.value = username;
                passwordInput.focus();
            } else {
                displayError(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            displayError('Connection error. Please try again.');
        } finally {
            showLoadingState('register-btn', false, 'Register');
        }
    };
    
    const verifyOTP = async (userId, otp) => {
        try {
            showLoadingState('verify-btn', true);
            clearMessages();
            
            // Debug info for development mode - will show OTP state
            console.log('Verifying OTP:', otp, 'for user ID:', userId);
            
            // Normalize OTP to string
            const normalizedOTP = String(otp).trim();
            
            const response = await fetch('/api/users/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, otp: normalizedOTP })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save token and redirect
                localStorage.setItem('token', data.token);
                displaySuccess('Login successful! Redirecting...');
                
                // Check if user is admin to redirect accordingly
                if (data.user.role === 'admin') {
                    setTimeout(() => window.location.href = 'admin-dashboard.html', 1500);
                } else {
                    // If student, we may want to redirect to a student dashboard in the future
                    setTimeout(() => window.location.href = 'index.html', 1500);
                }
            } else {
                // In development mode, provide a link to check the OTP
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log(`Debug OTP check: ${window.location.origin}/api/users/debug-otp/${userId}`);
                    displayError(`${data.message}. Check console for debug info.`);
                } else {
                    displayError(data.message || 'OTP verification failed');
                }
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            displayError('Connection error. Please try again.');
        } finally {
            showLoadingState('verify-btn', false, 'Verify');
        }
    };
    
    const resendOTP = async () => {
        try {
            if (!userId) {
                displayError('Session expired. Please login again.');
                resetForms();
                return;
            }
            
            // Get credentials from the form
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                displayError('Session expired. Please login again.');
                resetForms();
                return;
            }
            
            resendOtpBtn.disabled = true;
            resendOtpBtn.textContent = 'Sending...';
            clearMessages();
            
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success && data.requireOTP) {
                userId = data.userId;
                displaySuccess('New OTP sent to your registered phone number');
                startCountdown(10 * 60); // 10 minutes countdown
                resendOtpBtn.style.display = 'none';
            } else {
                displayError(data.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            displayError('Connection error. Please try again.');
        } finally {
            resendOtpBtn.disabled = false;
            resendOtpBtn.textContent = 'Resend OTP';
        }
    };
    
    // Event Listeners
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                displayError('Please enter both username and password');
                return;
            }
            
            loginUser(username, password);
        });
    }
    
    if (studentRegisterForm) {
        studentRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = regUsernameInput.value.trim();
            const password = regPasswordInput.value.trim();
            const phoneNumber = regPhoneInput.value.trim();
            
            if (!username || !password || !phoneNumber) {
                displayError('Please fill in all fields');
                return;
            }
            
            if (password.length < 3) {
                displayError('Password must be at least 3 characters long');
                return;
            }
            
            registerUser(username, password, phoneNumber);
        });
    }
    
    if (otpVerificationForm) {
        otpVerificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const otp = otpInput.value.trim();
            
            if (!otp) {
                displayError('Please enter the OTP sent to your phone');
                return;
            }
            
            if (!userId) {
                displayError('Session expired. Please login again.');
                resetForms();
                return;
            }
            
            verifyOTP(userId, otp);
        });
    }
    
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resendOTP();
        });
    }
}); 