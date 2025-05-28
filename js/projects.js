document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;
    let totalPages = 0;
    let allProjects = [];
    let filteredProjects = [];

    // Search functionality
    const searchProjects = (searchTerm) => {
        searchTerm = searchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            filteredProjects = [];
            renderProjects(currentPage);
            renderPagination();
            return;
        }
        
        filteredProjects = allProjects.filter(project => {
            const titleMatch = project.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = project.description.toLowerCase().includes(searchTerm);
            return titleMatch || descriptionMatch;
        });
        
        totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
        currentPage = 1;
        renderProjects(currentPage);
        renderPagination();
        
        // Scroll to results if found
        if (filteredProjects.length > 0) {
            projectsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Search event listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            if (!searchTerm) {
                filteredProjects = [];
                renderProjects(currentPage);
                renderPagination();
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProjects(searchInput.value);
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            searchProjects(searchInput.value);
        });
    }

    // Handle search from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const keywordParam = urlParams.get('keyword');
    if (keywordParam) {
        searchInput.value = keywordParam;
        searchProjects(keywordParam);
    }

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects?sort=popularity');
            if (!response.ok) throw new Error('Failed to fetch projects');
            
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                allProjects = data.data.sort((a, b) => b.popularity - a.popularity);
                totalPages = Math.ceil(allProjects.length / ITEMS_PER_PAGE);
                renderProjects(currentPage);
                renderPagination();
            } else {
                projectsContainer.innerHTML = '<div class="text-center my-5"><p>No projects found.</p></div>';
            }
        } catch (error) {
            console.error('Error:', error);
            projectsContainer.innerHTML = `
                <div class="text-center my-5">
                    <p>Error loading projects. Please try again later.</p>
                    <p class="text-muted small">${error.message}</p>
                </div>
            `;
        }
    };

    // Get badge class for project category
    const getCategoryBadgeClass = (category) => {
        const categoryClasses = {
            'Web Development': 'bg-design',
            'IOT': 'bg-advertising',
            'App Development': 'bg-finance',
            'Machine Learning': 'bg-music',
            'UI/UX': 'bg-education'
        };
        return categoryClasses[category] || 'bg-secondary';
    };

    // Render projects
    const renderProjects = (page) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const projectsList = filteredProjects.length > 0 ? filteredProjects : allProjects;
        const projectsToShow = projectsList.slice(startIndex, endIndex);
        
        if (projectsToShow.length === 0) {
            if (searchInput.value.trim()) {
                projectsContainer.innerHTML = `
                    <div class="text-center my-5">
                        <h4 class="mb-3">No projects found</h4>
                        <p class="text-muted">No projects found matching "${searchInput.value}". Try different keywords or check your spelling.</p>
                        <button class="btn custom-btn mt-3" onclick="window.location.reload()">View All Projects</button>
                    </div>`;
            } else {
                projectsContainer.innerHTML = '<div class="text-center my-5"><p>Loading projects...</p></div>';
            }
            return;
        }
        
        let html = '';
        projectsToShow.forEach(project => {
            const badgeClass = getCategoryBadgeClass(project.category);
            html += `
                <div class="custom-block custom-block-topics-listing bg-white shadow-lg mb-5">
                    <div class="d-flex">
                        <img src="${project.imageUrl}" class="custom-block-image img-fluid" alt="${project.title}">
                        <div class="custom-block-topics-listing-info d-flex">
                            <div>
                                <h5 class="mb-2">${project.title}</h5>
                                <p class="mb-0">${project.description}</p>
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
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                    <span aria-hidden="true">Prev</span>
                </a>
            </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}" aria-current="page">
                    <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})" aria-label="Next">
                    <span aria-hidden="true">Next</span>
                </a>
            </li>
        `;
        
        paginationContainer.innerHTML = html;
    };

    // Change page function
    window.changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderProjects(currentPage);
        renderPagination();
        projectsContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // View project details
    window.viewProjectDetails = (projectId) => {
        fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).catch(error => console.error('Error:', error));
    };

    // Initialize by fetching projects
    fetchProjects();
});