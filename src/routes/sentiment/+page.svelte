<script lang="ts">
    import SentimentChart from './SentimentChart.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    import SentimentDrawer from './SentimentDrawer.svelte';
    import TrialAwarenessChart from './TrialAwarenessChart.svelte';
    
    // Import Carbon pictograms
    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    
    let selectedDisease = "pompe";
    let compareWithCategory = false;
    let isDrawerOpen = false;
    let selectedData: any = null;
    let activeTab = 'sentiment';
    
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

    function setActiveTab(tab: string) {
        activeTab = tab;
    }
</script>

<div class="mx-auto mt-24 px-2 md:px-8">
    <div class="text-left mb-16">
        <div class="mb-4 mt-12 flex items-left gap-5">
            <span class="font-mono text-xs font-bold text-gray-500">05</span>
            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                Patient insights analysis
            </span>
        </div>
    </div>

    <h1 class="text-3xl mt-12 mb-8">Sentiment IQ</h1>

    <!-- Filter moved above tabs -->
    <div class="mb-12">
        <SentimentFilter on:filter={handleFilter} />
    </div>

    <!-- Tab Buttons -->
    <div class="grid grid-cols-3 gap-4 mb-8 max-w-md">
        <button
            class="p-4 rounded-lg text-sm font-medium transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'sentiment' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('sentiment')}
        >
            <SentimentPictogram 
                class="w-12 h-12 mb-2"
                fill={activeTab === 'sentiment' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Sentiment</span>
        </button>
        <button
            class="p-4 rounded-lg text-sm font-medium transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'awareness' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('awareness')}
        >
            <AwarenessPictogram 
                class="w-12 h-12 mb-2"
                fill={activeTab === 'awareness' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Trial Awareness</span>
        </button>
        <button
            class="p-4 rounded-lg text-sm font-medium transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'journeys' ? 'bg-[#ff5151] text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('journeys')}
        >
            <JourneysPictogram 
                class="w-12 h-12 mb-2"
                fill={activeTab === 'journeys' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-medium">Journeys</span>
        </button>
    </div>

    <div class="relative mt-12">
        {#if activeTab === 'sentiment'}
            <div class="sentiment mt-8 mb-28">
                <SentimentChart 
                    {selectedDisease} 
                    {compareWithCategory}
                    on:barClick={handleBarClick} 
                />
            </div>
        {:else if activeTab === 'awareness'}
            <div class="p-8 text-center text-gray-600 dark:text-gray-400">
                <TrialAwarenessChart selectedDisease={selectedDisease} />            
            </div>
        {:else if activeTab === 'journeys'}
            <div class="p-8 text-center text-gray-600 dark:text-gray-400">
                Patient journey data for {selectedDisease}
            </div>
        {/if}
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

    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>