// stores/countryStore.js
import { writable, derived } from 'svelte/store';
import countryDataJson from '../expCompScore.json';

// Create the base country store
export const countryStore = writable(countryDataJson);

// Create a derived store for sorted data
export const sortedCountryStore = derived(
    [countryStore],
    ([$countryStore]) => $countryStore.sort((a, b) => b.compositeScore - a.compositeScore)
);

export function updateCountryData(countryId, newScore) {
    countryStore.update(countries => 
        countries.map(country => 
            country.id === countryId 
                ? { ...country, compositeScore: newScore }
                : country
        )
    );
}

// Helper function to get rankings
export function getRankings(countries, metric = 'compositeScore') {
    return countries
        .sort((a, b) => b[metric] - a[metric])
        .reduce((acc, country, index) => {
            acc[country.id] = index + 1;
            return acc;
        }, {});
}