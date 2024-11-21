<script lang="ts">  
    import { createEventDispatcher } from 'svelte';
    import sentimentData from '$lib/data/sentimentData.json';
    
    const dispatch = createEventDispatcher<{
        filter: { disease: string; compareWithCategory: boolean }
    }>();
    
    let selectedDisease = "pompe";
    let selectedCategory = sentimentData.diseases[0].category;
    let compareWithCategory = false;

    $: categories = [...new Set(sentimentData.diseases.map(d => d.category))];
    $: filteredDiseases = sentimentData.diseases.filter(d => d.category === selectedCategory);
    
    function handleCategoryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedCategory = target.value;
        selectedDisease = filteredDiseases[0]?.id || '';
        dispatch('filter', { disease: selectedDisease, compareWithCategory });
    }

    function handleDiseaseChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedDisease = target.value;
        dispatch('filter', { disease: selectedDisease, compareWithCategory });
    }

    function toggleComparison() {
        compareWithCategory = !compareWithCategory;
        dispatch('filter', { disease: selectedDisease, compareWithCategory });
    }
</script>

<div class="filter-container flex items-center gap-4">
    <select 
        class="p-2 border border-[#ff1515] text-sm rounded-full bg-white dark:bg-gray-900"
        bind:value={selectedCategory}
        on:change={handleCategoryChange}
    >
        {#each categories as category}
            <option value={category}>{category}</option>
        {/each}
    </select>

    <select 
        class="p-2 border border-[#ff1515] text-sm rounded-full bg-white dark:bg-gray-900"
        bind:value={selectedDisease}
        on:change={handleDiseaseChange}
    >
        {#each filteredDiseases as disease}
            <option value={disease.id}>{disease.name}</option>
        {/each}
    </select>


</div>

<style>
    select {
        width: 250px;
        height: 40px;
    }
</style>