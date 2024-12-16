<script lang="ts">
    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    import DiseaseStats from './DiseaseStats.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let activeTab: string;
    export let currentDiseaseData: {
        name: string;
        sentiments: Record<string, number>;
    } | undefined;

    function setActiveTab(tab: string) {
        activeTab = tab;
    }

    function handleFilter(event: CustomEvent) {
        dispatch('filter', event.detail);
    }
</script>

<div class="flex flex-col min-w-fit min-h-screen px-4 bg-slate-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
    <!-- Filter Section -->
    <div class="pt-14 pb-4">
        <SentimentFilter on:filter={handleFilter} />
</div>

    <!-- Stats Section -->
    <div class="px-4 py-2 border-b-2 border-gray-800 dark:border-gray-800">
        <DiseaseStats {currentDiseaseData} />
    </div>
</div>


<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>