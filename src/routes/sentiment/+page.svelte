<script lang="ts">
    import { onMount } from 'svelte';
    import SentimentChart from './SimpleSentimentChart.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    import SimpleSentimentDrawer from './SimpleSentimentDrawer.svelte';
    import TrialAwarenessChart from './TrialAwarenessChart.svelte';
    import TopTopicsChart from './TopTopicsChart.svelte';
    import PatientJourneyCards from '$lib/patientcards/PatientJourneyCards.svelte';
    import sentimentData from '$lib/data/sentimentData.json';
    import WordNetwork from './WordNetwork.svelte';
    import wordCloudData from '$lib/data/wordCloudData.json';
    import SentimentDistribution from './CategoryComp.svelte';
    import SearchVolumeChart from '$lib/search/SearchVolumeChart.svelte';
    import searchData from '$lib/data/searchData.json';
    import SentimentBars from './SentimentBars.svelte';
    import "carbon-components-svelte/css/all.css";
    import radialSampleData from '$lib/data/radialSampleData.json';
    import SearchTrends from '$lib/search/SearchTrends.svelte';
    import DashboardSidebar from '$lib/sentimentComponents/DashboardSidebar.svelte';

    
    import TopNegativeTopicsChart from './TopNegativeTopicsChart.svelte';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';

    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    import NetworkPictogram from "carbon-pictograms-svelte/lib/Network.svelte";
    
    let selectedDisease = "pompe";
    let isDrawerOpen = false;
    let activeTab = 'sentiment';
    let currentTopicData = getTopicsForDisease(selectedDisease);
    
    $: currentDiseaseData = sentimentData.diseases.find(d => d.id === selectedDisease);
    $: currentTopicData = getTopicsForDisease(selectedDisease);

    onMount(() => {
        const options = {
            root: null,
            rootMargin: '-50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const section = entry.target.id;
                    setActiveTab(section);
                }
            });
        }, options);

        const sections = ['sentiment', 'awareness', 'journeys', 'network'];
        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    });
    
    function handleFilter(event: CustomEvent<{disease: string}>) {
        selectedDisease = event.detail.disease;
    }

    function handleBarClick() {
        isDrawerOpen = true;
    }

    function handleDrawerClose() {
        isDrawerOpen = false;
    }

    function setActiveTab(tab: string) {
        activeTab = tab;
    }
</script>

<div class="grid grid-cols-5">
    <!-- Sidebar -->
    <div class="min-w-fit min-h-screen border-r border-gray-200 dark:border-gray-800 col-spaconstn-1">
        <DashboardSidebar 
        {currentDiseaseData}
        on:filter={handleFilter}
    />
    </div>
    <!-- Main Content -->
    <div class="flex-1 px-8 pt-8 bg-slate-50 col-span-4">
        <div class="grid grid-cols-3 items-stretch min-w-full">
            <button
                     class="w-16 h-10 p-2 rounded-sm text-xs font-mono font-semibold  transition-all duration-200 grid grid-cols-2 justify-start place-items-stretch items-center gap-1 min-w-full 
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
        />Trial
            </button>
            
         <button
         class="w-16 h-10 border-b border-slate-200 px-2 rounded-sm text-xs font-mono font-semibold transition-all duration-200 grid grid-cols-2 justify-start place-items-around items-center gap-1 min-w-full 
         {activeTab === 'journeys' ? 'border-b-2 border-[#ff5624] text-[#ff1515] font-bold italic' : 'text-gray-600 hover:border-orange-200 dark:bg-gray-800 dark:text-gray-300'}"
          on:click={() => setActiveTab('journeys')}
        
            >
                <JourneysPictogram 
                    class="w-6 h-6"
                    fill={activeTab === 'journeys' ? '#ff1515 n m mn ' : 'currentColor'}
                />
                <span class="text-center font-bold">Journeys</span>
            </button>
        </div>

        <div class="relative">
            {#if activeTab === 'sentiment' && currentDiseaseData}
            <div>
                <div class="mb-4 mt-12 flex items-left gap-5">
                    <span class="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Sentiment Analysis
                    </span>
                </div>
                <div class="grid grid-cols-8 lg:grid-cols-8 gap-2">
                    <div class="col-start-1 col-span-6">
                        <SentimentChart 
                            data={currentDiseaseData.sentiments}
                            on:barClick={handleBarClick} 
                        />
                    </div>
                    <div class="col-start-7 col-span-2">
                        <SentimentDistribution 
                            selectedDisease={selectedDisease}
                            data={sentimentData}
                        />
                    </div>
                </div>
                

                {#if currentTopicData.topPositiveTopics?.length > 0}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mr-2 pl-8">
                    <div>
                        <h3 class="text-sm font-medium mb-4">Top Positive Topics</h3>
                        <TopTopicsChart data={currentTopicData.topPositiveTopics} />
                    </div>
                    <div>
                        <h3 class="text-sm font-medium mb-4">Top Negative Topics</h3>
                        <TopNegativeTopicsChart data={currentTopicData.topNegativeTopics} />
                    </div>
                </div>
                {/if}
            </div>
          {:else if activeTab === 'awareness'}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {#key selectedDisease}
                    <SearchVolumeChart 
                        selectedDisease={selectedDisease} 
                        data={searchData} 
                    />
                    <SearchTrends 
                        selectedDisease={selectedDisease} 
                        data={searchData}
                    />
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
    <SimpleSentimentDrawer class="z-index-1000"
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

    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>