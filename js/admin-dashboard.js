document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Fetch submissions
    const fetchSubmissions = async (status = '') => {
        try {
            const response = await fetch(`/api/submissions${status ? `?status=${status}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching submissions:', error);
            return [];
        }
    };

    // Fetch Formspree submissions (if available)
    const fetchFormspreeSubmissions = async () => {
        try {
            // Note: This is a mock function as Formspree doesn't have a direct API for this purpose
            // In a real implementation, you might need to set up a webhook or use Formspree's API with proper authentication
            const response = await fetch('/api/formspree-submissions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                return [];
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching Formspree submissions:', error);
            return [];
        }
    };

    // Render submissions
    const renderSubmissions = (submissions, containerId) => {
        const container = document.getElementById(containerId);
        
        if (submissions.length === 0) {
            container.innerHTML = '<div class="text-center">No submissions found</div>';
            return;
        }
        
        let html = '';
        
        submissions.forEach(submission => {
            let badgeClass = 'badge-pending';
            if (submission.status === 'approved') badgeClass = 'badge-approved';
            if (submission.status === 'rejected') badgeClass = 'badge-rejected';
            
            html += `
                <div class="submission-card" data-id="${submission._id}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">${submission.title}</h5>
                        <span class="badge ${badgeClass}">${submission.status}</span>
                    </div>
                    <p><strong>Student:</strong> ${submission.studentName} (${submission.rollNumber})</p>
                    <p><strong>Email:</strong> ${submission.email}</p>
                    <p><strong>Category:</strong> ${submission.category}</p>
                    <p><strong>Description:</strong> ${submission.description}</p>
                    <p><strong>Submitted:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
                    
                    ${submission.status === 'pending' ? `
                        <div class="action-buttons">
                            <button class="btn btn-success approve-btn" data-id="${submission._id}">Approve</button>
                            <button class="btn btn-danger reject-btn" data-id="${submission._id}">Reject</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await handleSubmission(id, 'approve');
            });
        });
        
        container.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await handleSubmission(id, 'reject');
            });
        });
    };

    // Render Formspree submissions
    const renderFormspreeSubmissions = (submissions, containerId) => {
        const container = document.getElementById(containerId);
        
        if (submissions.length === 0) {
            if (container.innerHTML === '') {
                container.innerHTML = '<div class="text-center">No Formspree submissions found</div>';
            }
            return;
        }
        
        let html = container.innerHTML || '';
        html += '<h4 class="mt-4">Formspree Submissions</h4>';
        
        submissions.forEach((submission, index) => {
            html += `
                <div class="submission-card formspree-submission" data-index="${index}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">${submission.title || 'Untitled Project'}</h5>
                        <span class="badge badge-info">Formspree</span>
                    </div>
                    <p><strong>Student:</strong> ${submission.studentName || 'Not provided'}</p>
                    <p><strong>Email:</strong> ${submission.email || 'Not provided'}</p>
                    <p><strong>Category:</strong> ${submission.category || 'Not specified'}</p>
                    <p><strong>Description:</strong> ${submission.description || 'No description'}</p>
                    <p><strong>Submitted:</strong> ${new Date(submission.submittedAt || Date.now()).toLocaleString()}</p>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary import-btn" data-index="${index}">Import to System</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add event listeners for importing Formspree submissions
        container.querySelectorAll('.import-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = e.target.dataset.index;
                await importFormspreeSubmission(submissions[index]);
            });
        });
    };

    // Import a Formspree submission to our system
    const importFormspreeSubmission = async (submission) => {
        try {
            // Format the submission data for our API
            const formData = {
                title: submission.title || 'Imported Project',
                description: submission.description || 'Imported from Formspree',
                studentName: submission.studentName || 'Unknown',
                rollNumber: submission.rollNumber || 'Not provided',
                email: submission.email || 'Not provided',
                category: submission.category || 'Web Development'
            };

            // Submit to our API
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Submission imported successfully!');
                loadSubmissions();
            } else {
                alert(data.message || 'Failed to import submission.');
            }
        } catch (error) {
            console.error('Error importing submission:', error);
            alert('Error importing submission. Please try again.');
        }
    };

    // Handle submission approval/rejection
    const handleSubmission = async (id, action) => {
        try {
            const response = await fetch(`/api/submissions/${id}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh all submission tabs
                loadSubmissions();
            } else {
                alert(data.message || 'An error occurred');
            }
        } catch (error) {
            console.error(`Error ${action}ing submission:`, error);
            alert('Connection error. Please try again.');
        }
    };

    // Load all submissions
    const loadSubmissions = async () => {
        const allSubmissions = await fetchSubmissions();
        const pendingSubmissions = allSubmissions.filter(s => s.status === 'pending');
        const approvedSubmissions = allSubmissions.filter(s => s.status === 'approved');
        const rejectedSubmissions = allSubmissions.filter(s => s.status === 'rejected');
        
        renderSubmissions(allSubmissions, 'all-submissions-container');
        renderSubmissions(pendingSubmissions, 'pending-submissions-container');
        renderSubmissions(approvedSubmissions, 'approved-submissions-container');
        renderSubmissions(rejectedSubmissions, 'rejected-submissions-container');
        
        // Add Formspree submissions to pending tab (if any)
        const formspreeSubmissions = await fetchFormspreeSubmissions();
        if (formspreeSubmissions.length > 0) {
            renderFormspreeSubmissions(formspreeSubmissions, 'pending-submissions-container');
        }
    };
    
    // Initialize
    loadSubmissions();
}); 