<!-- WaffleChartWrapper.svelte -->
<script lang="ts">
    import TherapeuticAreaWaffleChart from './TherapeuticAreaWaffleChart.svelte';
    import MarketCapWaffleChart from './MarketCapWaffleChart.svelte';
    
    interface DataEntry {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchased?: string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        [key: string]: any;
    }
    
    export let data: DataEntry[] = [];
    export let visualizationType: 'therapeutic-area' | 'market-cap' = 'therapeutic-area';
    export let width = 800;
    export let height = 400;
    export let maxCols = 20;
    export let cellSize = 12;
    export let cellPadding = 4;
    export let borderRadius = 50;
    export let showLegend = true;
    export let legendTitle = "";
    export let useColorVariations = true;
    
    // Event handlers
    function handleTherapeuticAreaClick(event: CustomEvent<string>) {
        dispatch('areaClick', event.detail);
    }
    
    function handleMarketCapClick(event: CustomEvent<string>) {
        dispatch('marketCapClick', event.detail);
    }
    
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher<{
        areaClick: string;
        marketCapClick: string;
    }>();
</script>

<div class="waffle-chart-wrapper">
    {#if visualizationType === 'therapeutic-area'}
        <TherapeuticAreaWaffleChart 
            {data}
            {width}
            {height}
            {maxCols}
            {cellSize}
            {cellPadding}
            {borderRadius}
            {showLegend}
            {useColorVariations}
            legendTitle={legendTitle || "Therapeutic Areas"}
            onAreaClick={(area) => dispatch('areaClick', area)}
        />
    {:else if visualizationType === 'market-cap'}
        <MarketCapWaffleChart 
            {data}
            {width}
            {height}
            {maxCols}
            {cellSize}
            {cellPadding}
            {borderRadius}
            {showLegend}
            legendTitle={legendTitle || "Market Cap"}
            onMarketCapClick={(marketCap) => dispatch('marketCapClick', marketCap)}
        />
    {/if}
</div>

<style>
    .waffle-chart-wrapper {
        width: 100%;
        height: 100%;
    }
</style> 