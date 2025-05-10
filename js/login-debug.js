// Debug script to ensure login links work properly
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login debug initialized');
    
    // Find all login icons
    const loginIcons = document.querySelectorAll('a.navbar-icon.bi-person');
    console.log('Found login icons:', loginIcons.length);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in - setup profile dropdown
        loginIcons.forEach((icon) => {
            // Remove existing event listeners by cloning
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
            
            // Change the icon to a profile circle
            newIcon.classList.remove('bi-person');
            newIcon.classList.add('bi-person-circle');
            
            // Create a dropdown container
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            dropdown.style.cssText = 'display: none; position: absolute; background: white; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 10px; min-width: 150px; z-index: 1000; right: 0; margin-top: 5px;';
            
            // Position the dropdown parent
            newIcon.parentNode.style.position = 'relative';
            newIcon.parentNode.appendChild(dropdown);
            
            // Load user data for the dropdown
            fetchUserData(dropdown);
            
            // Show dropdown on hover instead of click
            const iconParent = newIcon.parentNode;
            
            // Detect if we're on a touch device (mobile)
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (!isTouchDevice) {
                // Desktop behavior: show on hover
                // Show dropdown on mouse enter
                iconParent.addEventListener('mouseenter', function() {
                    dropdown.style.display = 'block';
                });
                
                // Hide dropdown on mouse leave from the parent container
                iconParent.addEventListener('mouseleave', function(e) {
                    // Small delay to prevent flickering when moving from icon to dropdown
                    setTimeout(function() {
                        // Only hide if we're not hovering over the dropdown or icon
                        if (!iconParent.matches(':hover')) {
                            dropdown.style.display = 'none';
                        }
                    }, 100);
                });
            }
            
            // Keep the click behavior for all devices (primary for mobile)
            newIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (dropdown.style.display === 'none') {
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
                
                return false;
            });
            
            // Close dropdown when tapping elsewhere (for mobile)
            document.addEventListener('touchstart', function(e) {
                if (!newIcon.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
            
            // Also close dropdown when clicking elsewhere (for all devices)
            document.addEventListener('click', function(e) {
                if (!newIcon.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        });
    } else {
        // User is not logged in - keep login navigation
        loginIcons.forEach((icon) => {
            // Remove existing event listeners by cloning
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
            
            // Change the class to avoid smoothscroll selector
            if (newIcon.classList.contains('smoothscroll')) {
                newIcon.classList.remove('smoothscroll');
            }
            
            // Add direct click handler
            newIcon.addEventListener('click', function(e) {
                console.log('Login icon clicked, navigating to:', this.href);
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    // Try multiple navigation methods
                    setTimeout(function() {
                        window.location.href = 'student-login.html';
                    }, 0);
                } catch (err) {
                    console.error('Navigation error:', err);
                    // Fallback navigation 
                    window.open('student-login.html', '_self');
                }
                return false;
            });
        });
        
        // Also add a direct handler to the body for all login icons (event delegation)
        document.body.addEventListener('click', function(e) {
            const target = e.target.closest('.navbar-icon.bi-person');
            if (target) {
                const link = target.closest('a');
                if (link && link.href.includes('student-login.html')) {
                    console.log('Login icon captured via delegation, navigating to:', link.href);
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        // Try multiple navigation methods
                        setTimeout(function() {
                            window.location.href = 'student-login.html';
                        }, 0);
                    } catch (err) {
                        console.error('Navigation error:', err);
                        // Fallback navigation 
                        window.open('student-login.html', '_self');
                    }
                    return false;
                }
            }
        }, true);
    }
    
    // Function to fetch user data and populate dropdown
    function fetchUserData(dropdown) {
        fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                // Create user profile section
                const userInfo = document.createElement('div');
                userInfo.style.cssText = 'padding: 5px 10px; border-bottom: 1px solid #eee; margin-bottom: 8px;';
                
                const username = document.createElement('div');
                username.style.cssText = 'font-weight: bold; font-size: 14px;';
                username.textContent = data.user.username;
                
                const role = document.createElement('div');
                role.style.cssText = 'color: #666; font-size: 12px;';
                role.textContent = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
                
                userInfo.appendChild(username);
                userInfo.appendChild(role);
                dropdown.appendChild(userInfo);
                
                // Create profile link or dashboard link based on role
                const profileLink = document.createElement('a');
                profileLink.href = data.user.role === 'admin' ? 'admin-dashboard.html' : 'user-profile.html';
                profileLink.style.cssText = 'display: block; padding: 8px 10px; color: #333; text-decoration: none; border-radius: 4px;';
                profileLink.textContent = data.user.role === 'admin' ? 'Dashboard' : 'My Profile';
                profileLink.addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#f5f5f5';
                });
                profileLink.addEventListener('mouseout', function() {
                    this.style.backgroundColor = 'transparent';
                });
                dropdown.appendChild(profileLink);
                
                // Create logout link
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.style.cssText = 'display: block; padding: 8px 10px; color: #dc3545; text-decoration: none; border-radius: 4px;';
                logoutLink.textContent = 'Logout';
                logoutLink.addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#f5f5f5';
                });
                logoutLink.addEventListener('mouseout', function() {
                    this.style.backgroundColor = 'transparent';
                });
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                });
                dropdown.appendChild(logoutLink);
                
            } else {
                // Error fetching profile or invalid token
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'padding: 10px; color: #666;';
                errorMsg.textContent = 'Session expired';
                
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.style.cssText = 'display: block; padding: 8px 10px; color: #dc3545; text-decoration: none;';
                logoutLink.textContent = 'Logout';
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                });
                
                dropdown.appendChild(errorMsg);
                dropdown.appendChild(logoutLink);
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            
            // Error handling
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'padding: 10px; color: #666;';
            errorMsg.textContent = 'Could not load profile';
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.style.cssText = 'display: block; padding: 8px 10px; color: #dc3545; text-decoration: none;';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            });
            
            dropdown.appendChild(errorMsg);
            dropdown.appendChild(logoutLink);
        });
    }
}); 