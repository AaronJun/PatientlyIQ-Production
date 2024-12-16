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

<div class="row px-2">
    <div class="flex mb-2">
    <select 
        class="border border-[#ff1515] h-10 text-sm bg-white dark:bg-gray-900 min-w-full hover:cursor-pointer hover:font-medium hover:text-[#ff1515]"
        bind:value={selectedCategory}
        on:change={handleCategoryChange}
    >
        {#each categories as category}
            <option value={category}>{category}</option>
        {/each}
    </select>
</div>

    <select 
       class="border border-[#ff1515] h-10 text-sm bg-white dark:bg-gray-900 min-w-full hover:cursor-pointer hover:font-medium hover:text-[#ff1515]"
        bind:value={selectedDisease}
        on:change={handleDiseaseChange}
    >
        {#each filteredDiseases as disease}
            <option value={disease.id}>{disease.name}</option>
        {/each}
    </select>
    </div>


<style>
    
</style>