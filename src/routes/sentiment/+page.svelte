<script lang="ts">
    import { onMount } from 'svelte';
    import SentimentChart from './SimpleSentimentChart.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    import SimpleSentimentDrawer from './SimpleSentimentDrawer.svelte';
    import TrialAwarenessChart from './TrialAwarenessChart.svelte';
    import TopTopicsChart from './TopTopicsChart.svelte';
    import PatientJourneyCards from '$lib/patientcards/PatientJourneyCards.svelte';
    import sentimentData from '$lib/data/sentimentData.json';
    import TopNegativeTopicsChart from './TopNegativeTopicsChart.svelte';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';

    import SentimentPictogram from "carbon-pictograms-svelte/lib/HeartHealth.svelte";
    import AwarenessPictogram from "carbon-pictograms-svelte/lib/ChartBubbleLine.svelte";
    import JourneysPictogram from "carbon-pictograms-svelte/lib/MovementInOverlappingNetworks.svelte";
    
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

        const sections = ['sentiment', 'awareness', 'journeys'];
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

<div class="mx-auto mt-24 px-2 md:px-8">
    <div class="text-left mb-16">
        <div class="mb-4 mt-12 flex items-left gap-5">
            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                Sentiment IQ
            </span>
        </div>
    </div>

    {#if currentDiseaseData}
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Total entries for {currentDiseaseData.name}: {Object.values(currentDiseaseData.sentiments).reduce((sum, val) => sum + val, 0)}
        </div>
    {/if}

    <div class="mb-12">
        <SentimentFilter on:filter={handleFilter} />
    </div>

    <div class="grid grid-cols-3 gap-2 mb-8 max-w-sm">
        <button
            class="p-2 rounded-lg text-xs transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'sentiment' ? 'bg-[#ff5151] text-white scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('sentiment')}
        >
            <SentimentPictogram 
                class="w-8 h-8 mb-2"
                fill={activeTab === 'sentiment' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-extrabold">Sentiment</span>
        </button>
        <button
            class="p-2 rounded-lg text-xs font-extrabold transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'awareness' ? 'bg-[#ff5151] text-white scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('awareness')}
        >
            <AwarenessPictogram 
                class="w-8 h-8 mb-2"
                fill={activeTab === 'awareness' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-extrabold">Trial Awareness</span>
        </button>
        <button
            class="p-2 rounded-lg text-xs font-extrabold transition-all duration-200 aspect-square flex flex-col items-center justify-center {activeTab === 'journeys' ? 'bg-[#ff5151] text-white scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02] dark:bg-gray-800 dark:text-gray-300'}"
            on:click={() => setActiveTab('journeys')}
        >
            <JourneysPictogram 
                class="w-8 h-8 mb-2"
                fill={activeTab === 'journeys' ? 'white' : 'currentColor'}
            />
            <span class="text-center font-extrabold">Journeys</span>
        </button>
    </div>

    <div class="relative">
        {#if activeTab === 'sentiment' && currentDiseaseData}
        <div>
            <SentimentChart 
                data={currentDiseaseData.sentiments}
                on:barClick={handleBarClick} 
            />
            {#if currentTopicData.topPositiveTopics?.length > 0}
            <div class="grid 2xl">
            <div class="mt-8">
                    <h3 class="text-sm font-medium mb-4">Top Positive Topics</h3>
                    <TopTopicsChart data={currentTopicData.topPositiveTopics} />
                </div>
                <div class="mt-8">
                    <h3 class="text-sm font-medium mb-4">Top Negative Topics</h3>
                    <TopNegativeTopicsChart data={currentTopicData.topNegativeTopics} />
                </div>
            </div>
            {/if}
        </div>
        {:else if activeTab === 'awareness'}
            <div class="p-8 text-center text-gray-600 dark:text-gray-400">
                <TrialAwarenessChart selectedDisease={selectedDisease} />            
            </div>
        {:else if activeTab === 'journeys'}
            <PatientJourneyCards selectedDisease={selectedDisease} />
        {/if}
    </div>
</div>

{#if isDrawerOpen && currentDiseaseData}
<SimpleSentimentDrawer 
    isOpen={isDrawerOpen}
    onClose={handleDrawerClose}
    disease={currentDiseaseData.name}
    sentiments={currentDiseaseData.sentiments}
    {currentTopicData}
/>
{/if}

<style>
    .mb-4 {
        border-top: .25px solid #ff5151;
        padding-top: .525rem;
    }

    :global(button svg) {
        transition: fill 0.2s ease-in-out;
    }
</style>