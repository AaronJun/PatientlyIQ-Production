# SentimentFilter.svelte
<script lang="ts">  
    import { createEventDispatcher } from 'svelte';
    import sentimentData from '$lib/data/sentimentData.json';
    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    import NetworkPictogram from "carbon-pictograms-svelte/lib/Network.svelte";
    
    const dispatch = createEventDispatcher<{
        filter: { disease: string; activeTab: string }
    }>();
    
    let selectedDisease = "pompe";
    let selectedCategory = sentimentData.diseases[0].category;
    let activeTab = 'sentiment';

    $: categories = [...new Set(sentimentData.diseases.map(d => d.category))];
    $: filteredDiseases = sentimentData.diseases.filter(d => d.category === selectedCategory);
    
    function handleCategoryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedCategory = target.value;
        selectedDisease = filteredDiseases[0]?.id || '';
        dispatch('filter', { disease: selectedDisease, activeTab });
    }

    function handleDiseaseChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedDisease = target.value;
        dispatch('filter', { disease: selectedDisease, activeTab });
    }

    function setActiveTab(tab: string) {
        activeTab = tab;
        dispatch('filter', { disease: selectedDisease, activeTab });
    }
</script>

<div class="px-2">
    <div class="grid grid-cols-3 items-stretch min-w-full mb-4">
        <button
            class="w-16 h-10 p-2 rounded-sm text-xs font-mono font-semibold transition-all duration-200 grid grid-cols-2 justify-start place-items-stretch items-center gap-1 min-w-full 
            {activeTab === 'sentiment' ? 'border-b-2 border-[#ff5624] text-[#ff1515] font-bold italic' : 'text-gray-600 hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('sentiment')}
        >
            <SentimentPictogram 
                class="w-6 h-6 mb-1"
                fill={activeTab === 'sentiment' ? '#ff1515' : 'currentColor'}
            />
            <span class="text-center font-bold">Sentiment</span>
        </button>
        
        <button
            class="w-16 h-10 border-b border-slate-200 px-2 rounded-sm text-xs font-mono font-semibold transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 
            {activeTab === 'awareness' ? 'border-b-2 border-[#ff5624] text-[#ff1515] font-bold italic' : 'text-gray-600 hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('awareness')}
        >
            <AwarenessPictogram 
                class="w-6 h-6"
                fill={activeTab === 'awareness' ? '#ff1515' : 'currentColor'}
            />
            Trial
        </button>
        
        <button
            class="w-16 h-10 border-b border-slate-200 px-2 rounded-sm text-xs font-mono font-semibold transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 
            {activeTab === 'journeys' ? 'border-b-2 border-[#ff5624] text-[#ff1515] font-bold italic' : 'text-gray-600 hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('journeys')}
        >
            <JourneysPictogram 
                class="w-6 h-6"
                fill={activeTab === 'journeys' ? '#ff1515' : 'currentColor'}
            />
            <span class="text-center font-bold">Journeys</span>
        </button>
    </div>

    <div class="flex mb-2">
        <select 
            class="p-2 border border-custom-red text-sm w-full hover:cursor-pointer hover:font-medium hover:text-custom-red"
            bind:value={selectedCategory}
            on:change={handleCategoryChange}
        >
            {#each categories as category}
                <option value={category}>{category}</option>
            {/each}
        </select>
    </div>

    <select 
        class="text-sm bg-white dark:bg-gray-900 min-w-full hover:cursor-pointer hover:font-medium hover:text-[#ff1515]"
        bind:value={selectedDisease}
        on:change={handleDiseaseChange}
    >
        {#each filteredDiseases as disease}
            <option value={disease.id}>{disease.name}</option>
        {/each}
    </select>
</div>

<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>