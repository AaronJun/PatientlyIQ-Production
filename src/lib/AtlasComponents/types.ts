// types.ts
export interface SubMetric {
    value: number;
    weight: number;
    min: number;
    max: number;
}

export interface MetricGroup {
    score: number;
    weight: number;
    isInverse: boolean;
    subMetrics: {
        [key: string]: SubMetric;
    };
}

export interface CalculatedMetrics {
    [key: string]: MetricGroup;
}

export interface CountryData {
    name: string;
    id: string;
    compositeScore: number;
    calculatedMetrics: CalculatedMetrics;
    baseMetrics: {
        studyStartUpDays: number;
        studiesWithCountryExperience: number;
        competingStudies: number;
        experiencedSites: number;
        totalIPFCases: number;
        ipfPatientRegistry: string;
        worldwideIPFExperience: number;
        medidataAggregateRecruitmentRate: number;
    };
}