export const negativeSentimentData = {
    stages: [
        "Initial Discovery",
        "Initial Planning",
        "Day-To-Day Management",
        "New Treatment Consideration",
        "Long-Term Planning"
    ],
    categories: [
        "Clinical Uncertainty",
        "Emotional Burden",
        "Access Barriers",
        "Social Impact",
        "Financial Concerns"
    ],
    data: [
        {
            // Initial Discovery - Total: 86
            "Clinical Uncertainty": 25,    // High due to initial diagnosis uncertainty
            "Emotional Burden": 22,        // Strong initial emotional response
            "Access Barriers": 15,         // Initial access to specialists
            "Social Impact": 14,           // Initial family/social concerns
            "Financial Concerns": 10       // Initial financial worries
        },
        {
            // Psychological Processing - Total: 56
            "Clinical Uncertainty": 12,    // Reduced but still present
            "Emotional Burden": 20,        // Peaks during processing
            "Access Barriers": 8,          // Finding mental health support
            "Social Impact": 10,           // Family dynamics
            "Financial Concerns": 6        // Initial planning costs
        },
        {
            // Initial Planning - Total: 71
            "Clinical Uncertainty": 15,    // Questions about treatment options
            "Emotional Burden": 12,        // Adjusting to new reality
            "Access Barriers": 18,         // Treatment access challenges
            "Social Impact": 14,           // Support system engagement
            "Financial Concerns": 12       // Treatment planning costs
        },
        {
            // Treatment Consideration - Total: 51
            "Clinical Uncertainty": 10,    // Treatment efficacy questions
            "Emotional Burden": 8,         // Treatment anxiety
            "Access Barriers": 15,         // Treatment availability
            "Social Impact": 8,            // Treatment impact on lifestyle
            "Financial Concerns": 12       // Treatment costs
        },
        {
            // Long-Term Planning - Total: 45
            "Clinical Uncertainty": 10,     // Future progression
            "Emotional Burden": 13,         // Long-term adjustment
            "Access Barriers": 7,         // Long-term care access
            "Social Impact": 9,            // Long-term social impact
            "Financial Concerns": 19       // Long-term financial planning
        }
    ]
};
// Color scheme focused on negative sentiment visualization
export const categoryColors = {
    "Clinical Uncertainty": "#8B0000",     // Dark red
    "Emotional Burden": "#CD5C5C",         // Indian red
    "Access Barriers": "#B22222",          // Firebrick
    "Social Impact": "#DC143C",            // Crimson
    "Financial Concerns": "#A52A2A"        // Brown
};