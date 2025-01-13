<script lang="ts">
    import { onMount } from 'svelte';
    import SimpleSentimentDrawer from './SimpleSentimentDrawer.svelte';
    import PatientJourneyCards from '$lib/patientcards/PatientJourneyCards.svelte';
    import WordNetwork from './WordNetwork.svelte';
    import wordCloudData from '$lib/data/wordCloudData.json';
    import SentimentDistribution from './CategoryComp.svelte';
    import SearchVolumeChart from '$lib/search/SearchVolumeChart.svelte';
    
    import SearchTrends from '$lib/search/SearchTrends.svelte';
    import DashboardSidebar from '$lib/sentimentComponents/DashboardSidebar.svelte';
    import ZoomBurst from './ZoomBurst.svelte';
    import PatientStoryCircles from '$lib/RPDPatientStories/PatientStoryCircles.svelte';

    import sentimentData from '$lib/data/sentimentData.json';
    import searchData from '$lib/data/searchData.json';
    import flareData from '$lib/data/flare-2.json';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';
    
    let selectedDisease = "pompe";
    let isDrawerOpen = false;
    let activeTab = 'sentiment';
    let currentTopicData = getTopicsForDisease(selectedDisease);
    
    $: currentDiseaseData = sentimentData.diseases.find(d => d.id === selectedDisease);
    $: currentTopicData = getTopicsForDisease(selectedDisease);

    function handleFilter(event: CustomEvent<{disease: string, activeTab: string}>) {
        selectedDisease = event.detail.disease;
        activeTab = event.detail.activeTab;
    }

    function handleBarClick() {
        isDrawerOpen = true;
    }

    function handleDrawerClose() {
        isDrawerOpen = false;
    }
</script>

<div class="grid grid-cols-5">
    <!-- Sidebar -->
    <div class="min-w-fit min-h-screen border-r border-gray-200 dark:border-gray-800 col-span-1">
        <DashboardSidebar 
            {currentDiseaseData}
            {activeTab}
            on:filter={handleFilter}
        />
    </div>
    <!-- Main Content -->
    <div class="flex-1 px-8 pt-8 bg-slate-50 col-span-4">
        <div class="relative">
            {#if activeTab === 'sentiment' && currentDiseaseData}
            <div>
                <div class="patient-stories-section mt-12 mb-8">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Patient Stories
                    </h3>
                    <PatientStoryCircles {selectedDisease}>
                        <div class="patient-circle-container">
                            <button class="story-circle more-circle" on:click={handleBarClick}>
                                <span class="plus-icon">+</span>
                                <div class="hover-circle"></div>
                            </button>
                            <span class="patient-name">More Details</span>
                        </div>
                    </PatientStoryCircles>
                </div>

                <div class="grid grid-cols-8 lg:grid-cols-8 gap-2">
                    <div class="col-start-1 col-span-6">
                        <ZoomBurst data={flareData} />
                    </div>
                    <div class="col-start-7 col-span-2">
                        <SentimentDistribution 
                            selectedDisease={selectedDisease}
                            data={sentimentData}
                        />
                    </div>
                </div>
            </div>
            {:else if activeTab === 'awareness'}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {#key selectedDisease}
                        <SearchVolumeChart selectedDisease={selectedDisease} data={searchData} />
                        <SearchTrends selectedDisease={selectedDisease} data={searchData} />
                    {/key}
                </div>
            {:else if activeTab === 'journeys'}
                <div class="mb-4 mt-12 flex items-left gap-5">
                    <span class="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Patient Journeys
                    </span>
                </div>
                <PatientJourneyCards {selectedDisease} />
            {:else if activeTab === 'network'}
                <div class="mb-4 mt-12 flex min-h-52 items-left gap-5">
                    <span class="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Term Network
                    </span>
                </div>
                <div class="p-8">
                    <WordNetwork data={wordCloudData.wordCloudData} />
                </div>
            {/if}
        </div>
    </div>
</div>

{#if isDrawerOpen && currentDiseaseData}
    <SimpleSentimentDrawer
        class="z-index-1000"
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        disease={currentDiseaseData.name}
        sentiments={currentDiseaseData.sentiments}
        {currentTopicData}
        {selectedDisease}
    />
{/if}

<style>
    .mb-4 {
        border-top: .25px solid #FF5624;
        padding-top: .525rem;
    }

    .story-circle {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 100%;
        background: rgba(255, 81, 81, 0.1);
        border: 2.5px solid #ff5151;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: relative;
        overflow: hidden;
    }

    .more-circle {
        background: rgba(255, 81, 81, 0.1);
    }

    .plus-icon {
        font-size: 2rem;
        color: #ff5151;
        line-height: 1;
        position: relative;
        z-index: 2;
    }

    .hover-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 81, 81, 0);
        transition: background-color 0.2s ease;
    }

    .story-circle:hover {
        transform: scale(1.1);
    }

    .story-circle:hover .hover-circle {
        background: rgba(255, 81, 81, 0.3);
    }

    .patient-circle-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .patient-name {
        font-size: 0.75rem;
        color: #666;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
    }
</style>