<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import timelineData from '$lib/data/japanSuccessTimeline.json';
    import "carbon-components-svelte/css/all.css";

    const strategyColors = {
        "Global Phase 3 Inclusion": "#3b82f6",
        "Sakigake & Orphan Designation": "#f59e0b",
        "Strategic Partnership & Acquisition": "#ef4444",
        "Entirely Positive": "#083607"
    };

    const colorScale = d3.scaleOrdinal()
        .domain(Object.keys(strategyColors))
        .range(Object.values(strategyColors));

    function getStrategyColor(strategy: string): string {
        return strategyColors[strategy as keyof typeof strategyColors] || "#083607";
    }
</script>

<div class="chart-container flex flex-col md:align-start md:justify-center p-8 bg-slate-50 outline-1 outline-dashed outline-slate-200">
    <div class="flex flex-col w-full align-start justify-start">
        <h5 class="text-md font-semibold text-slate-700 text-left">
            Initial Successes in Japan
        </h5>
        <p class="text-sm text-slate-600 text-left mb-4">
The changes in policy and incentives have already started to pay off. Here are some of the success stories of foreign biotech companies in Japan.    
    </p>
        </div>
        
    <div class="flex flex-row gap-6 overflow-x-auto pb-4 min-h-[300px] align-baseline">
        {#each timelineData.timeline as item, index (item.id)}
            <div class="relative flex-shrink-0">
      
                {#if index > 0}
                   
                    <div class="mt-4 bg-slate-300"></div>
                {/if}
                <div 
                    class="timeline-card bg-white/50 p-4 w-80 h-fit mb-8"
                    style:border=".625px solid {getStrategyColor(item.strategy)}"
                >
                
                    <div class="flex flex-row items-center align-middle gap-3 mb-3">
                        
                        <div 
                            class="h-2 w-2 rounded-full shrink-0"
                            style:background-color={getStrategyColor(item.strategy)}
                        >
                        </div>

               
                    </div>
                    
                    <div class="flex flex-col gap-2 items-baseline">
                        <h3 class="text-sm font-medium text-slate-800 shrink-0">{item.company}</h3>
                    </div>
                    
                    <div class="mt-2">
                        <p class="text-slate-600 text-left text-sm mb-4">{item.description}</p>
                        
                        <span 
                        class="text-[9.25px] text-left font-semibold uppercase shrink-0"
                        style:color={getStrategyColor(item.strategy)}
                    >{item.strategy}</span>
                    </div>
                </div>
                <span class="text-md text-left font-semibold capitalize text-slate-500 pl-4">{item.timeframe}</span>       
            </div>
        {/each}
    </div>
</div>

<style>
    .timeline-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* Custom scrollbar for horizontal scroll */
    .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
    }

    .overflow-x-auto::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
</style> 