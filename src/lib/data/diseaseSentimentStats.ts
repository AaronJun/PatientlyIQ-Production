// src/lib/data/diseaseSentimentStats.ts

export interface DiseaseSentimentStats {
    specificDisease: string;
    categoryBaseline: string; // e.g., "Cancer" for "Pancreatic Cancer"
    metrics: {
        symptomBurden: {
            specific: {
                current: number;
                historical: number;
                percentChange: number;
            };
            baseline: {
                current: number;
                historical: number;
                percentChange: number;
            };
            timeRange: {
                start: number;
                end: number;
            };
            distribution: number[]; // For the small distribution graph
            comparisonText: string; // e.g., "burden higher than 91% of other cancer types"
        };
        treatmentSatisfaction: {
            specific: {
                current: number;
                historical: number;
                percentChange: number;
            };
            baseline: {
                current: number;
                historical: number;
                percentChange: number;
            };
            timeRange: {
                start: number;
                end: number;
            };
            distribution: number[];
            comparisonText: string;
        };
        caregiverImpact: {
            specific: {
                current: number;
                historical: number;
                percentChange: number;
            };
            baseline: {
                current: number;
                historical: number;
                percentChange: number;
            };
            timeRange: {
                start: number;
                end: number;
            };
            distribution: number[];
            comparisonText: string;
        };
        relativeImpactScore: number; // Comparative score against baseline
    };
    historicalData: {
        symptomBurden: {
            specific: Array<{ year: number; value: number }>;
            baseline: Array<{ year: number; value: number }>;
        };
        treatmentSatisfaction: {
            specific: Array<{ year: number; value: number }>;
            baseline: Array<{ year: number; value: number }>;
        };
        caregiverImpact: {
            specific: Array<{ year: number; value: number }>;
            baseline: Array<{ year: number; value: number }>;
        };
    };
}

// Example data comparing pancreatic cancer to overall cancer baseline
export const exampleDiseaseData: DiseaseSentimentStats = {
    specificDisease: "Pancreatic Cancer",
    categoryBaseline: "Cancer Overall",
    metrics: {
        symptomBurden: {
            specific: {
                current: 78.4,
                historical: 65.1,
                percentChange: 20.4
            },
            baseline: {
                current: 62.1,
                historical: 58.0,
                percentChange: 7.1
            },
            timeRange: {
                start: 2018,
                end: 2024
            },
            distribution: [0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3],
            comparisonText: "burden higher than 91% of other cancer types"
        },
        treatmentSatisfaction: {
            specific: {
                current: 43.3,
                historical: 58.0,
                percentChange: -25.3
            },
            baseline: {
                current: 68.0,
                historical: 65.0,
                percentChange: 4.6
            },
            timeRange: {
                start: 2018,
                end: 2024
            },
            distribution: [0.2, 0.3, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.2],
            comparisonText: "satisfaction lower than 97% of other cancer types"
        },
        caregiverImpact: {
            specific: {
                current: 8.8,
                historical: 4.9,
                percentChange: 79.6
            },
            baseline: {
                current: 5.9,
                historical: 4.2,
                percentChange: 40.5
            },
            timeRange: {
                start: 2018,
                end: 2024
            },
            distribution: [0.1, 0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.1],
            comparisonText: "caregiver burden higher than 98% of other cancer types"
        },
        relativeImpactScore: 8.4 // Higher score indicates greater divergence from baseline
    },
    historicalData: {
        symptomBurden: {
            specific: [
                { year: 2018, value: 65.1 },
                { year: 2019, value: 68.4 },
                { year: 2020, value: 72.3 },
                { year: 2021, value: 74.8 },
                { year: 2022, value: 76.2 },
                { year: 2023, value: 77.8 },
                { year: 2024, value: 78.4 }
            ],
            baseline: [
                { year: 2018, value: 58.0 },
                { year: 2019, value: 58.9 },
                { year: 2020, value: 59.5 },
                { year: 2021, value: 60.2 },
                { year: 2022, value: 61.0 },
                { year: 2023, value: 61.5 },
                { year: 2024, value: 62.1 }
            ]
        },
        treatmentSatisfaction: {
            specific: [
                { year: 2018, value: 58.0 },
                { year: 2019, value: 55.2 },
                { year: 2020, value: 52.1 },
                { year: 2021, value: 48.4 },
                { year: 2022, value: 45.9 },
                { year: 2023, value: 44.2 },
                { year: 2024, value: 43.3 }
            ],
            baseline: [
                { year: 2018, value: 65.0 },
                { year: 2019, value: 65.8 },
                { year: 2020, value: 66.4 },
                { year: 2021, value: 67.0 },
                { year: 2022, value: 67.5 },
                { year: 2023, value: 67.8 },
                { year: 2024, value: 68.0 }
            ]
        },
        caregiverImpact: {
            specific: [
                { year: 2018, value: 4.9 },
                { year: 2019, value: 5.8 },
                { year: 2020, value: 6.6 },
                { year: 2021, value: 7.2 },
                { year: 2022, value: 7.9 },
                { year: 2023, value: 8.4 },
                { year: 2024, value: 8.8 }
            ],
            baseline: [
                { year: 2018, value: 4.2 },
                { year: 2019, value: 4.6 },
                { year: 2020, value: 4.9 },
                { year: 2021, value: 5.2 },
                { year: 2022, value: 5.5 },
                { year: 2023, value: 5.7 },
                { year: 2024, value: 5.9 }
            ]
        }
    }
};