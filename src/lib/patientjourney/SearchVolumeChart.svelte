<script lang="ts">
    import { onMount } from 'svelte';
    import { BarChartGrouped } from "@carbon/charts-svelte";
    import type { ChartConfig } from "@carbon/charts";

    interface RelatedSearch {
        term: string;
        volume: number;
    }

    interface SearchTerm {
        term: string;
        volume: number;
        relatedSearches: RelatedSearch[];
    }

    interface ChartDataPoint {
        group: string;
        key: string;
        value: number;
    }

    export let searchTerms: SearchTerm[] = [];
    export let stageColor: string;

    let chartData: ChartDataPoint[] = [];
    
    $: {
        if (searchTerms) {
            // Sort search terms by volume in descending order and take top 5
            const topSearchTerms = [...searchTerms]
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 5);

            chartData = topSearchTerms.flatMap(term => {
                // Main search term data point
                const mainPoint: ChartDataPoint = {
                    group: "Primary Term",
                    key: term.term,
                    value: term.volume
                };

                // Get average volume of related searches
                const avgRelatedVolume = term.relatedSearches.reduce((sum, rel) => sum + rel.volume, 0) / term.relatedSearches.length;

                const relatedPoint: ChartDataPoint = {
                    group: "Related Searches (Avg)",
                    key: term.term,
                    value: Math.round(avgRelatedVolume)
                };

                return [mainPoint, relatedPoint];
            });
        }
    }

    const options: ChartConfig<ChartDataPoint> = {
        title: "Top Search Terms by Volume",
        height: "400px",
        axes: {
            left: {
                title: "Monthly Search Volume",
                mapsTo: "value",
                scaleType: "linear",
                includeZero: true
            },
            bottom: {
                title: "Search Terms",
                mapsTo: "key",
                scaleType: "labels"
            }
        },
        legend: {
            alignment: "center",
            position: "bottom"
        },
        color: {
            scale: {
                "Primary Term": stageColor,
                "Related Searches (Avg)": `${stageColor}80`
            }
        },
        toolbar: {
            enabled: false
        },
        theme: "g100",
        tooltip: {
            enabled: true,
            customHTML: (data, defaultHTML) => {
                const term = searchTerms.find(t => t.term === data[0].key);
                if (!term) return defaultHTML;

                const relatedTerms = term.relatedSearches
                    .sort((a, b) => b.volume - a.volume)
                    .map(r => `<li class="text-sm my-1">${r.term}: ${r.volume.toLocaleString()}</li>`)
                    .join('');

                return `
                    <div class="bg-slate-900 p-3 rounded-lg shadow-lg">
                        <div class="font-medium mb-2">${term.term}</div>
                        <div class="text-sm mb-2">Volume: ${term.volume.toLocaleString()}</div>
                        <div class="text-sm font-medium mt-2 mb-1">Related Searches:</div>
                        <ul class="list-none p-0 m-0">
                            ${relatedTerms}
                        </ul>
                    </div>
                `;
            }
        }
    };
</script>

<div class="chart-container bg-slate-900 rounded-lg p-4">
    <BarChartGrouped 
        data={chartData} 
        options={options} 
    />
</div>

<div class="mt-6 space-y-4">
    <h4 class="text-lg font-semibold text-slate-800">All Search Terms</h4>
    <div class="grid gap-4">
        {#each searchTerms as term}
            <div class="p-4 rounded-lg bg-slate-50 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{term.term}</span>
                    <span 
                        class="text-sm px-2 py-1 rounded"
                        style="background-color: {stageColor}25; color: {stageColor}"
                    >
                        {term.volume.toLocaleString()} searches
                    </span>
                </div>
                <div class="mt-2 space-y-1">
                    {#each term.relatedSearches as related}
                        <div class="flex justify-between items-center text-sm text-slate-600 pl-4">
                            <span>{related.term}</span>
                            <span>{related.volume.toLocaleString()}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(.chart-container .bx--cc--grid) {
        font-family: 'IBM Plex Sans', sans-serif;
    }
    
    :global(.chart-container .bx--cc--title) {
        @apply text-white;
    }

    :global(.chart-container .bx--cc--legend-item text) {
        @apply text-slate-300;
    }
</style>