
<script lang="ts">  
    import { createEventDispatcher } from 'svelte';
    import sentimentData from '$lib/data/sentimentData.json';
    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import "carbon-components-svelte/css/all.css";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    
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

<div class="px-2 py-24">
    <h3 class="text-xs font-medium text-slate-500 dark:text-gray-300 mb-2">
        Select a disease
    </h3>
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
        class="text-sm min-w-full hover:cursor-pointer hover:font-medium hover:text-[#ff1515]"
        bind:value={selectedDisease}
        on:change={handleDiseaseChange}
    >
        {#each filteredDiseases as disease}
            <option value={disease.id}>{disease.name}</option>
        {/each}
    </select>
    <div class="grid items-stretch min-w-full mb-4 pt-12">
        <h3 class="text-xs font-medium text-slate-500 dark:text-gray-300 mb-2">
            Select a dataset
        </h3>
        
        <button
        class="w-16 h-10 border-b border-slate-200 px-2 text-xs transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 

            {activeTab === 'sentiment' ? 'bg-[#ff5624] text-slate-100 font-semibold' :'hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('sentiment')}
        >
            <SentimentPictogram 
                class="w-6 h-6 mb-1"
                fill={activeTab === 'sentiment' ? '#FFC6B8' : 'currentColor'}
            />
            Sentiment
        </button>
        
        <button
            class="w-16 h-10 border-b border-slate-200 px-2 text-xs transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 

            {activeTab === 'awareness' ? 'bg-[#ff5624] text-slate-100 font-semibold' :'hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('awareness')}
        >
            <AwarenessPictogram 
                class="w-6 h-6"
                fill={activeTab === 'awareness' ? '#FFC6B8' : 'currentColor'}
            />
                Trial
        </button>
        
        <button
            class="w-16 h-10 border-b border-slate-200 px-2 rounded-sm text-xs  transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 
            
            {activeTab === 'journeys' ?'bg-[#ff5624] text-slate-100 font-semibold' :'hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('journeys')}
        >
            <JourneysPictogram 
                class="w-6 h-6"
                fill={activeTab === 'journeys' ? '#FFC6B8' : 'currentColor'}
            />
                Journeys
        </button>
    </div>
</div>

<style>
    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>