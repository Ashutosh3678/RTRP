document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ai-suggestion-form');
    const resultDiv = document.getElementById('suggestions-result');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        resultDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p>Generating suggestions...</p></div>';

        // Get form values
        const interests = document.getElementById('interests').value.split(',').map(s => s.trim()).filter(Boolean);
        const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean);
        const difficulty = document.getElementById('difficulty').value;

        // Get JWT token from localStorage (assuming student is logged in)
        const token = localStorage.getItem('token');
        if (!token) {
            resultDiv.innerHTML = '<div class="alert alert-danger">You must be logged in to get AI suggestions.</div>';
            return;
        }

        try {
            const response = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ interests, skills, difficulty })
            });
            const data = await response.json();
            if (data.success && data.data && data.data.suggestions) {
                renderSuggestions(data.data.suggestions);
            } else {
                resultDiv.innerHTML = `<div class="alert alert-danger">${data.error || 'Failed to get suggestions.'}</div>`;
            }
        } catch (err) {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
        }
    });

    function renderSuggestions(suggestions) {
        if (!suggestions.length) {
            resultDiv.innerHTML = '<div class="alert alert-warning">No suggestions found.</div>';
            return;
        }
        let html = '<h4 class="mb-3">AI Suggestions</h4>';
        suggestions.forEach((s, i) => {
            html += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${s.title}</h5>
                        <p class="card-text">${s.description}</p>
                        <p><strong>Technologies:</strong> ${s.technologies ? s.technologies.join(', ') : ''}</p>
                        <p><strong>Estimated Time:</strong> ${s.estimatedTime || 'N/A'}</p>
                        <p><strong>Learning Outcomes:</strong> ${s.learningOutcomes ? s.learningOutcomes.join(', ') : ''}</p>
                    </div>
                </div>
            `;
        });
        resultDiv.innerHTML = html;
    }
}); 