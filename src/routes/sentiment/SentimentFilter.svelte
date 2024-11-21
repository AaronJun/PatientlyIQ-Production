<script lang="ts">  
    import { createEventDispatcher } from 'svelte';
    import { diseases } from '$lib/data/diseases';
    
    const dispatch = createEventDispatcher<{
        filter: { disease: string; compareWithCategory: boolean }
    }>();
    
    let selectedDisease = "pompe";
    let selectedCategory = diseases[0].category;
    let compareWithCategory = false;

    $: filteredDiseases = diseases.find(cat => cat.category === selectedCategory)?.items || [];
    
    function handleCategoryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedCategory = target.value;
        selectedDisease = diseases.find(cat => cat.category === selectedCategory)?.items[0].id || '';
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
        {#each diseases as category}
            <option value={category.category}>{category.category}</option>
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

    <button 
        class="px-4 py-2 bg-[#ff1515] text-white text-sm rounded-full hover:bg-orange-700 transition-colors {compareWithCategory ? 'bg-orange-700' : ''}"
        on:click={toggleComparison}
    >
        {compareWithCategory ? 'Hide' : 'Show'} Category Comparison
    </button>
</div>

<style>
    select {
        width: 250px;
        height: 40px;
    }
</style>