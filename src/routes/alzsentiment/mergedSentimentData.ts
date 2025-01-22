export const mergedSentimentData = {
  stages: [
    "Initial Discovery",
    "Initial Planning",
    "Day-To-Day Management",
    "New Treatment Consideration",
    "Long-Term Planning"
  ],
  sentimentTypes: {
    negative: {
      categories: [
        "Clinical Uncertainty",
        "Emotional Burden",
        "Access Barriers",
        "Social Impact",
        "Financial Concerns"
      ],
      colors: {
        "Clinical Uncertainty": "#8B0000",
        "Emotional Burden": "#CD5C5C",
        "Access Barriers": "#B22222",
        "Social Impact": "#DC143C",
        "Financial Concerns": "#A52A2A"
      },
      data: [
        {
          "Clinical Uncertainty": 25,
          "Emotional Burden": 22,
          "Access Barriers": 15,
          "Social Impact": 14,
          "Financial Concerns": 10
        },
        {
          "Clinical Uncertainty": 12,
          "Emotional Burden": 20,
          "Access Barriers": 8,
          "Social Impact": 10,
          "Financial Concerns": 6
        },
        {
          "Clinical Uncertainty": 15,
          "Emotional Burden": 12,
          "Access Barriers": 18,
          "Social Impact": 14,
          "Financial Concerns": 12
        },
        {
          "Clinical Uncertainty": 10,
          "Emotional Burden": 8,
          "Access Barriers": 15,
          "Social Impact": 8,
          "Financial Concerns": 12
        },
        {
          "Clinical Uncertainty": 10,
          "Emotional Burden": 13,
          "Access Barriers": 7,
          "Social Impact": 9,
          "Financial Concerns": 19
        }
      ]
    },
    positive: {
      categories: [
        "Treatment Hope",
        "Support System",
        "Care Access",
        "Daily Coping",
        "Future Outlook"
      ],
      colors: {
        "Treatment Hope": "#228B22",
        "Support System": "#32CD32",
        "Care Access": "#90EE90",
        "Daily Coping": "#98FB98",
        "Future Outlook": "#3CB371"
      },
      data: [
        {
          "Treatment Hope": 3,
          "Support System": 3,
          "Care Access": 1,
          "Daily Coping": 0,
          "Future Outlook": 1
        },
        {
          "Treatment Hope": 3,
          "Support System": 5,
          "Care Access": 1,
          "Daily Coping": 2,
          "Future Outlook": 2
        },
        {
          "Treatment Hope": 2,
          "Support System": 4,
          "Care Access": 3,
          "Daily Coping": 3,
          "Future Outlook": 1
        },
        {
          "Treatment Hope": 3,
          "Support System": 2,
          "Care Access": 4,
          "Daily Coping": 1,
          "Future Outlook": 3
        },
        {
          "Treatment Hope": 2,
          "Support System": 1,
          "Care Access": 2,
          "Daily Coping": 2,
          "Future Outlook": 3
        }
      ]
    }
  }
}