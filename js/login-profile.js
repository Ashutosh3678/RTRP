// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    
    if (isLoggedIn || isAdminLoggedIn) {
        // Get user info from the unified user object
        const user = JSON.parse(localStorage.getItem('user')) || { username: 'User' };
        const username = user.username || 'User';
        const role = user.role === 'admin' ? 'Administrator' : 'Student';
        
        // Find all login icons (desktop and mobile)
        const loginIcons = document.querySelectorAll('.navbar-icon.bi-person');
        
        loginIcons.forEach(icon => {
            // Remove the onclick attribute that redirects to login
            icon.removeAttribute('onclick');
            
            // Change to profile icon and add the correct classes
            icon.classList.remove('bi-person');
            icon.classList.add('bi-person-circle');
            
            // Wrap icon in a container for hover effects
            const parent = icon.parentNode;
            const container = document.createElement('div');
            container.className = 'profile-container';
            parent.insertBefore(container, icon);
            container.appendChild(icon);
            
            // Create dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            
            // Add user info section
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const usernameEl = document.createElement('div');
            usernameEl.className = 'username';
            usernameEl.textContent = username;
            
            const roleEl = document.createElement('div');
            roleEl.className = 'role';
            roleEl.textContent = role;
            
            userInfo.appendChild(usernameEl);
            userInfo.appendChild(roleEl);
            dropdown.appendChild(userInfo);
            
            // Add links
            const profileLink = document.createElement('a');
            profileLink.href = 'user-profile.html';
            profileLink.textContent = 'My Profile';
            dropdown.appendChild(profileLink);
            
            if (user.role === 'admin') {
                const dashboardLink = document.createElement('a');
                dashboardLink.href = 'admin-dashboard.html';
                dashboardLink.textContent = 'Admin Dashboard';
                dropdown.appendChild(dashboardLink);
            } else {
                // For students, add link to student projects
                const projectsLink = document.createElement('a');
                projectsLink.href = 'student-projects.html';
                projectsLink.textContent = 'My Projects';
                dropdown.appendChild(projectsLink);
            }
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'logout';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Clear login state
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('isAdminLoggedIn');
                
                // Redirect to home page
                window.location.href = 'index.html';
            });
            dropdown.appendChild(logoutLink);
            
            // Append dropdown to container
            container.appendChild(dropdown);
            
            // Toggle dropdown on click (for both mobile and desktop)
            icon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking elsewhere
            document.addEventListener('click', function() {
                dropdown.classList.remove('show');
            });
        });
    } else {
        // If not logged in, make sure login icons redirect to login page
        const loginIcons = document.querySelectorAll('.navbar-icon.bi-person');
        
        loginIcons.forEach(icon => {
            icon.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'student-login.html';
            };
        });
    }
}); 