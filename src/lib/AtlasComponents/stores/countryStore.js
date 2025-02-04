// stores/countryStore.js
import { writable } from 'svelte/store';
import countryDataJson from '../expCompScore.json';

export const countryStore = writable(countryDataJson);

export function updateCountryData(countryId, metrics) {
    countryStore.update(countries => {
        return countries.map(country => {
            if (country.id === countryId) {
                return {
                    ...country,
                    calculatedMetrics: metrics,
                    compositeScore: calculateCompositeScore(metrics)
                };
            }
            return country;
        });
    });
}

function calculateCompositeScore(metrics) {
    const baseScore = 10;
    let score = baseScore;
    
    Object.values(metrics).forEach(metricGroup => {
        const metricScore = calculateMetricScore(metricGroup);
        score += metricScore * metricGroup.weight;
    });
    
    return score;
}

function calculateMetricScore(metricGroup) {
    let score = 0;
    for (const [key, subMetric] of Object.entries(metricGroup.subMetrics)) {
        const normalizedValue = (subMetric.value - subMetric.min) / (subMetric.max - subMetric.min);
        const adjustedValue = metricGroup.isInverse ? 1 - normalizedValue : normalizedValue;
        score += adjustedValue * subMetric.weight;
    }
    return score;
}