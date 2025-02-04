# RankingDisplay.svelte
<script lang="ts">
    import type { CountryData, CalculatedMetrics, MetricGroup } from './types';
    import { metricConfig } from './metricConfig';

    export let selectedCountry: CountryData;
    export let metrics: CalculatedMetrics;
    export let allData: CountryData[];

    interface Ranking {
        name: string;
        rank: number;
        total: number;
        score: string;
        isInverse: boolean;
    }

    $: rankings = calculateRankings();

    function calculateRankings(): Ranking[] {
        if (!selectedCountry || !metrics || !allData) return [];

        const rankings: Ranking[] = [];
        
        // Overall composite score ranking
        const compositeRanking = allData
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .findIndex(c => c.id === selectedCountry.id) + 1;
            
        rankings.push({
            name: 'Overall Composite Score',
            rank: compositeRanking,
            total: allData.length,
            score: selectedCountry.compositeScore.toFixed(2),
            isInverse: false
        });

        // Individual metric rankings
        Object.entries(metrics).forEach(([key, metric]) => {
            const score = metric.score;
            const isInverse = metricConfig[key]?.isInverse || false;
            const allScores = allData.map(c => c.calculatedMetrics[key]?.score || 0);
            
            const sortedScores = isInverse 
                ? allScores.sort((a, b) => a - b)
                : allScores.sort((a, b) => b - a);
                
            const ranking = sortedScores.findIndex(s => s === score) + 1;

            rankings.push({
                name: metricConfig[key]?.label || key,
                rank: ranking,
                total: allData.length,
                score: score.toFixed(3),
                isInverse
            });
        });

        return rankings;
    }
</script>

<div class="bg-white rounded-lg shadow p-4">
    <h3 class="text-lg font-semibold mb-4">Rankings</h3>
    <div class="space-y-4">
        {#each rankings as ranking}
            <div class="space-y-1">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">{ranking.name}</span>
                    <span class="text-sm font-mono">{ranking.score}</span>
                </div>
                <div class="relative pt-2">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                class="h-full bg-blue-600 transition-all duration-500"
                                style="width: {(ranking.rank / ranking.total) * 100}%"
                            ></div>
                        </div>
                        <span class="text-xs text-gray-600 whitespace-nowrap">
                            {ranking.rank} of {ranking.total}
                        </span>
                    </div>
                    {#if ranking.isInverse}
                        <span class="text-xs text-gray-500 mt-1">*Lower is better</span>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .bg-white {
        background-color: white;
    }

    .rounded-lg {
        border-radius: 0.5rem;
    }

    .shadow {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
</style>