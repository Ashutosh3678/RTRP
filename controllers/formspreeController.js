// Store Formspree submissions in memory (In a production app, you would use a database)
const formspreeSubmissions = [];

// @desc    Handle webhook from Formspree
// @route   POST /api/formspree-webhook
// @access  Public
exports.handleFormspreeWebhook = async (req, res) => {
    try {
        const { form, payload } = req.body;
        
        // Check if this is a project submission form
        if (payload['form-type'] === 'project-submission') {
            // Extract project details from payload
            const submission = {
                title: payload.title,
                description: payload.description,
                studentName: payload.studentName,
                rollNumber: payload.rollNumber,
                email: payload.email,
                category: payload.category,
                submittedAt: new Date(),
                formId: form
            };
            
            // Store submission
            formspreeSubmissions.push(submission);
            
            console.log('Received new project submission from Formspree:', submission);
        }
        
        // Always return success to Formspree
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing Formspree webhook:', error);
        res.status(200).json({ success: true }); // Still return 200 to Formspree
    }
};

// @desc    Get all Formspree submissions
// @route   GET /api/formspree-submissions
// @access  Private/Admin
exports.getFormspreeSubmissions = async (req, res) => {
    try {
        res.json({
            success: true,
            count: formspreeSubmissions.length,
            data: formspreeSubmissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clear a Formspree submission
// @route   DELETE /api/formspree-submissions/:index
// @access  Private/Admin
exports.clearFormspreeSubmission = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        
        if (isNaN(index) || index < 0 || index >= formspreeSubmissions.length) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Remove the submission
        formspreeSubmissions.splice(index, 1);
        
        res.json({
            success: true,
            message: 'Submission cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 