// metricConfig.ts
export interface MetricOption {
    label: string;
    value: number;
}

export interface MetricConfig {
    label: string;
    options: MetricOption[];
    isInverse?: boolean;
}

export const metricConfig: Record<string, MetricConfig> = {
    startupDays: {
        label: "Study Start-Up Days",
        isInverse: true,
        options: [
            { label: "Very Fast (< 60 days)", value: 60 },
            { label: "Fast (60-90 days)", value: 90 },
            { label: "Average (90-120 days)", value: 120 },
            { label: "Slow (120-150 days)", value: 150 },
            { label: "Very Slow (> 150 days)", value: 180 }
        ]
    },
    experiencedSites: {
        label: "Experienced Sites",
        options: [
            { label: "Very High (> 400)", value: 400 },
            { label: "High (300-400)", value: 350 },
            { label: "Moderate (200-300)", value: 250 },
            { label: "Low (100-200)", value: 150 },
            { label: "Very Low (< 100)", value: 50 }
        ]
    },
    countryExperience: {
        label: "Country Experience",
        options: [
            { label: "Extensive (> 40 studies)", value: 40 },
            { label: "High (30-40 studies)", value: 35 },
            { label: "Moderate (20-30 studies)", value: 25 },
            { label: "Limited (10-20 studies)", value: 15 },
            { label: "Minimal (< 10 studies)", value: 5 }
        ]
    },
    competingTrials: {
        label: "Competing Trials",
        isInverse: true,
        options: [
            { label: "Very Low (0-5)", value: 5 },
            { label: "Low (6-10)", value: 8 },
            { label: "Moderate (11-15)", value: 13 },
            { label: "High (16-20)", value: 18 },
            { label: "Very High (> 20)", value: 25 }
        ]
    },
    recruitmentRate: {
        label: "Recruitment Rate",
        options: [
            { label: "Excellent (> 0.15)", value: 0.15 },
            { label: "Good (0.12-0.15)", value: 0.135 },
            { label: "Average (0.09-0.12)", value: 0.105 },
            { label: "Below Average (0.06-0.09)", value: 0.075 },
            { label: "Poor (< 0.06)", value: 0.045 }
        ]
    },
    totalCases: {
        label: "Total Cases",
        options: [
            { label: "Very High (> 50,000)", value: 50000 },
            { label: "High (40,000-50,000)", value: 45000 },
            { label: "Moderate (30,000-40,000)", value: 35000 },
            { label: "Low (20,000-30,000)", value: 25000 },
            { label: "Very Low (< 20,000)", value: 15000 }
        ]
    }
};