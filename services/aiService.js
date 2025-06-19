// Use the global fetch API available in Node.js v18+
const ProjectSuggestion = require('../models/projectSuggestion');

// Use a public, available Hugging Face model
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';

const generateProjectSuggestions = async (userId, interests, skills, difficulty) => {
    try {
        const prompt = `Generate 3 project suggestions for a student with the following:
        Interests: ${interests.join(', ')}
        Skills: ${skills.join(', ')}
        Difficulty Level: ${difficulty}

        For each project, provide:
        1. A creative and engaging title
        2. A detailed description
        3. Required technologies
        4. Estimated completion time
        5. Key learning outcomes

        Format the response as a JSON array with the following structure:
        [{
            "title": "Project Title",
            "description": "Detailed description",
            "technologies": ["tech1", "tech2"],
            "estimatedTime": "time estimate",
            "learningOutcomes": ["outcome1", "outcome2"]
        }]`;

        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 1000,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const result = await response.json();
        let suggestions;

        try {
            // Extract JSON from the response text
            const jsonMatch = result[0].generated_text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Fallback to a default suggestion if parsing fails
            suggestions = [{
                title: "Web Development Portfolio",
                description: "Create a personal portfolio website showcasing your projects and skills",
                technologies: ["HTML", "CSS", "JavaScript"],
                estimatedTime: "2-3 weeks",
                learningOutcomes: ["Frontend development", "Responsive design", "Project presentation"]
            }];
        }

        // Save suggestions to database
        const projectSuggestion = new ProjectSuggestion({
            userId,
            interests,
            skills,
            difficulty,
            suggestions
        });

        await projectSuggestion.save();

        return projectSuggestion;
    } catch (error) {
        console.error('Error generating project suggestions:', error);
        throw error;
    }
};
const getProjectSuggestions = async (userId) => {
    try {
        return await ProjectSuggestion.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);
    } catch (error) {
        console.error('Error fetching project suggestions:', error);
        throw error;
    }
};

module.exports = {
    generateProjectSuggestions,
    getProjectSuggestions
}; 