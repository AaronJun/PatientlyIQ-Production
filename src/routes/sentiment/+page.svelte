<script lang="ts">
    import SentimentChart from './SentimentChart.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    import SentimentDrawer from './SentimentDrawer.svelte';
    
    let selectedDisease = "pompe";
    let compareWithCategory = false;
    let isDrawerOpen = false;
    let selectedData: any = null;
    
    function handleFilter(event: CustomEvent<{disease: string; compareWithCategory: boolean}>) {
        selectedDisease = event.detail.disease;
        compareWithCategory = event.detail.compareWithCategory;
    }

    function handleBarClick(event: CustomEvent) {
        selectedData = event.detail;
        isDrawerOpen = true;
    }

    function handleDrawerClose() {
        isDrawerOpen = false;
        selectedData = null;
    }
</script>

<div class="mx-auto mt-24 px-2 md:px-8">
    <div class="text-left mb-16">
        <div class="mb-4 mt-12 flex items-left gap-5">
            <span class="font-mono text-xs font-bold text-gray-500">05</span>
            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                Patient sentiment analysis
            </span>
        </div>
    </div>

    <h1 class="text-3xl mt-12 mb-8">Disease Sentiment Analysis</h1>
    <div class="relative mt-12">
        <SentimentFilter on:filter={handleFilter} />
        <div class="sentiment mt-8 mb-28">
            <SentimentChart 
                {selectedDisease} 
                {compareWithCategory}
                on:barClick={handleBarClick} 
            />
        </div>
    </div>
</div>

{#if isDrawerOpen && selectedData}
    <SentimentDrawer 
        isOpen={isDrawerOpen}
        data={selectedData}
        onClose={handleDrawerClose}
    />
{/if}

<style>
    .mb-4 {
        border-top: .25px solid #ff5151;
        padding-top: .525rem;
    }

    .sentiment {
        min-height: 70vh;
        flex-direction: column;
        display: flex;
        justify-content: center;
        align-items: stretch;
    }
</style>