document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const paginationContainer = document.getElementById('pagination-container');
    const ITEMS_PER_PAGE = 6; // Number of items to show per page
    let currentPage = 1;
    let totalPages = 0;
    let allProjects = [];

    // Fetch projects from the database
    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects?sort=popularity', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                allProjects = data.data.sort((a, b) => b.popularity - a.popularity); // Sort by popularity
                totalPages = Math.ceil(allProjects.length / ITEMS_PER_PAGE);
                renderProjects(currentPage);
                renderPagination();
            } else {
                projectsContainer.innerHTML = '<div class="text-center my-5"><p>No projects found.</p></div>';
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectsContainer.innerHTML = `
                <div class="text-center my-5">
                    <p>Error loading projects. Please try again later.</p>
                    <p class="text-muted small">${error.message}</p>
                </div>
            `;
        }
    };

    // Get category badge class based on project category
    const getCategoryBadgeClass = (category) => {
        const categoryClasses = {
            'Web Development': 'bg-design',
            'IOT': 'bg-advertising',
            'App Development': 'bg-finance',
            'API Development': 'bg-music',
            'UI/UX': 'bg-education',
            'Machine Learning': 'bg-design'
        };
        
        return categoryClasses[category] || 'bg-secondary';
    };

    // Render projects for the current page
    const renderProjects = (page) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const projectsToShow = allProjects.slice(startIndex, endIndex);
        
        if (projectsToShow.length === 0) {
            projectsContainer.innerHTML = '<div class="text-center my-5"><p>No projects found for this page.</p></div>';
            return;
        }
        
        let html = '';
        
        projectsToShow.forEach(project => {
            const badgeClass = getCategoryBadgeClass(project.category);
            const description = project.description || 'No description available';
            
            html += `
                <div class="custom-block custom-block-topics-listing bg-white shadow-lg mb-5">
                    <div class="d-flex">
                        <img src="${project.imageUrl}" class="custom-block-image img-fluid" alt="${project.title}">

                        <div class="custom-block-topics-listing-info d-flex">
                            <div>
                                <h5 class="mb-2">${project.title}</h5>
                                <p class="mb-0">${description}</p>
                                <p class="mb-1"><small class="text-muted">Category: ${project.category}</small></p>
                                <a href="#" class="btn custom-btn mt-3 mt-lg-4" onclick="viewProjectDetails('${project._id}')">Learn More</a>
                            </div>

                            <span class="badge ${badgeClass} rounded-pill ms-auto">${project.popularity}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        projectsContainer.innerHTML = html;
    };

    // Render pagination
    const renderPagination = () => {
        let html = '';
        
        // Previous button
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                    <span aria-hidden="true">Prev</span>
                </a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}" aria-current="page">
                    <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})" aria-label="Next">
                    <span aria-hidden="true">Next</span>
                </a>
            </li>
        `;
        
        paginationContainer.innerHTML = html;
    };

    // Change page
    window.changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderProjects(currentPage);
        renderPagination();
        
        // Scroll to top of projects section
        projectsContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // View project details
    window.viewProjectDetails = (projectId) => {
        // You can redirect to a project detail page or show a modal with project details
        // For now, we'll just log the project ID
        console.log('Viewing project:', projectId);
        
        // Increment popularity count in the backend
        fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(error => console.error('Error incrementing popularity:', error));
    };

    // Start fetching projects
    fetchProjects();
}); 