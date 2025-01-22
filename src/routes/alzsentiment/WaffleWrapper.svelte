<script lang="ts">
    import { onMount } from 'svelte';
    import WaffleStages from './WaffleStages.svelte';
    import PositiveSentimentDriversChart from './PositiveSentimentDriversChart.svelte';
    import NegativeSentimentDriversChart from './NegativeSentimentDriversChart.svelte';
    
    export let data = [];
    export let stages = ["Initial Discovery", "Initial Planning", "Day-to-Day Management", "New Treatment", "Long-Term Planning", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    let activeView = 'stages';

    const viewOptions = [
        { id: 'stages', label: 'Stage Overview' },
        { id: 'positive', label: 'Positive Drivers' },
        { id: 'negative', label: 'Negative Drivers' }
    ];
</script>

<div class="flex flex-col space-y-6">
    <!-- View Selection Controls -->
    <div class="flex justify-center space-x-4 p-4">
        {#each viewOptions as option}
            <button 
                class="px-4 py-2 rounded-full text-xs font-medium transition-colors
                    {activeView === option.id 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                on:click={() => activeView = option.id}
            >
                {option.label}
            </button>
        {/each}
    </div>

    <!-- View Content -->
    <div class="w-full">
        {#if activeView === 'stages'}
            <WaffleStages {data} {stages} {categories} />
        {:else if activeView === 'positive'}
            <PositiveSentimentDriversChart />
        {:else if activeView === 'negative'}
            <NegativeSentimentDriversChart />
        {/if}
    </div>
</div>

<style>
    button {
        border: none;
        outline: none;
        cursor: pointer;
    }
    
    button:focus {
        outline: 2px solid #4299e1;
        outline-offset: 2px;
    }
</style>