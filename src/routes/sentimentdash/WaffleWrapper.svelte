<script lang="ts">
    import WaffleChart from './WaffleChart.svelte';
    import WaffleStages from './WaffleStages.svelte';
    
    export let data = [];
    export let stages = ["Initial Discovery", "Initial Planning", "Day-to-Day Management", "New Treatment", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    let isDetailedView = true;
</script>

<div class="flex flex-col space-y-4">
    <div class="flex justify-end">
        <button 
            class="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            on:click={() => isDetailedView = !isDetailedView}
        >
            {isDetailedView ? 'Show Stage View' : 'Show Detailed View'}
        </button>
    </div>
    
    {#if isDetailedView}
        <WaffleChart {data} {stages} {categories} />
    {:else}
        <WaffleStages {data} {stages} {categories} />
    {/if}
</div>