<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";  
    import SimpleSentimentDrawer from './SimpleSentimentDrawer.svelte';
    import PatientJourneyCards from '$lib/patientcards/PatientJourneyCards.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';

    import WordNetwork from './WordNetwork.svelte';
    import wordCloudData from '$lib/data/wordCloudData.json';
    import SentimentDistribution from './CategoryComp.svelte';
    import NegativeSentimentChart from './NegativeSentimentChart.svelte';
    import NegativeSentimetDriversChart from './NegativeSentimentDriversChart.svelte';
    import ALZMethology from './ALZMethology.svelte';
    import PositiveSentimentChart from './PositiveSentimentChart.svelte';
    import PositiveSentimentDriversChart from './PositiveSentimentDriversChart.svelte';
    import SearchVolumeChart from '$lib/search/SearchVolumeChart.svelte';
    import InteractiveSentimentView from './InteractiveSentimentView.svelte';
    import PieChartStages from './PieChartStages.svelte';
    
    import SearchTrends from '$lib/search/SearchTrends.svelte';
    import DashboardSidebar from '$lib/sentimentComponents/DashboardSidebar.svelte';
    import ZoomBurst from './ZoomBurst.svelte';
    import WaffleWrapper from './WaffleWrapper.svelte';
    import PatientStoryCircles from '$lib/RPDPatientStories/PatientStoryCircles.svelte';

    import sentimentData from '$lib/data/sentimentData.json';
    import searchData from '$lib/data/searchData.json';
    import flareData from '$lib/data/flare-alz.json';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';
    
    let selectedDisease = "pompe";
    let isDrawerOpen = false;
    let activeTab = 'sentiment';
    let currentTopicData = getTopicsForDisease(selectedDisease);

    const data = [
    // Initial Discovery
        {
            "Entirely Negative": 3,
            "Somewhat Negative": 7,
            "Neutral": 14,  
            "Somewhat Positive": 16,
            "Entirely Positive": 5,
        },
        // Initial Planning

        {
            "Entirely Negative": 25,
            "Somewhat Negative": 24,
            "Neutral": 8,
            "Somewhat Positive": 3,
            "Entirely Positive": 1
        },
        // Day-to-Day 
        {
            "Entirely Negative": 9,
            "Somewhat Negative": 16,
            "Neutral": 25,
            "Somewhat Positive": 12,
            "Entirely Positive": 5
        },
        // Treatment Consideration
        {
            "Entirely Negative": 10,
            "Somewhat Negative": 8,
            "Neutral": 21,
            "Somewhat Positive": 11,
            "Entirely Positive": 3  
        },
        // Long-Term Planning
        {
            "Entirely Negative": 7,
            "Somewhat Negative": 11,
            "Neutral": 4,
            "Somewhat Positive": 12,
            "Entirely Positive": 5
        }
    ];

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

<div class="flex-1 place-content-center pt-8 bg-b">
    <!-- Sidebar -->
    <!-- Main Content -->
    <div class="flex-1 place-content-center pt-8 bg-slate-100 col-span-4">

                <div class="flex-1 place-content-center pt-8 bg-cream">
                    <div class="relative max-w-4xl mx-auto px-4 place-content-center">

                        <img src={PIQLogo} alt="PIQ Logo" class="h-12" />

                        <div class="text-center py-16">
                            <h1 class="text-6xl font-serif mb-6">A Deep Dive into APOE4 Experience</h1>
                            <h2 class="text-xl font-semibold text-gray-500 max-w-2xl mx-auto">
                                What an analysis of more than 350 online posts, conversations, and comments reveal about the needs and hopes of this population.
                            </h2>
                            <div class="w-10/12 mx-auto mt-16">
                                
                            <p class="prose place-content-center mt-8 mb-12">
                                We often talk about medical breakthroughs and genetic testing as unalloyed goods – more knowledge means better outcomes. <br><br> Or so we assume. <br> <br>But what happens when that knowledge arrives before the solutions? Our analysis of over 350 conversations among APOE4 carriers and caregivers reveals a profound mismatch between genetic awareness and therapeutic options. This gap creates a distinctly modern predicament: people armed with precise knowledge of their genetic risks but limited tools to act on this information. <br><br>
                                Their stories, chronicled through online communities and support groups, show us how medical advances are outpacing our systems for handling their psychological and social implications. Understanding this disconnect isn't just about improving patient care – it's about rethinking how we help people navigate the sometimes painful space between genetic knowledge and medical intervention.                            </p>
                            </div>
                        </div>
                

             <!-- Patient Stories Section -->
             <section class="mb-16 place-content-center justify-center">
                <h3 class="text-sm font-semibold text-gray-700 border-t border-orange-500 pt-2 mb-6">
                    Patient Stories
                </h3>
                <PatientStoryCircles {selectedDisease}>
                    <!-- Patient story circles content -->
                </PatientStoryCircles>
            </section>
                </div>

                <div class="grid grid-cols-8 lg:grid-cols-8 pt-12">
                    <div class="col-start-1 col-span-8">

                        <WaffleWrapper {data} />

                    </div>
                    <div class="col-start-1 col-span-8">   
                     <NegativeSentimetDriversChart />
                    </div>
                    <div class="col-start-1 col-span-8">
                        <NegativeSentimentChart />  
                    </div>
            
                    <div class="col-start-1 col-span-8">
                        <PieChartStages {data}/>
                    </div>
                </div>
                <div class="grid grid-cols-8 lg:grid-cols-8 gap-2">
                    <div class="col-start-1 col-span-6">
                        <ZoomBurst data={flareData} />
                    </div>
                  
                </div>
                <ALZMethology />
            </div>
        </div>
    </div>


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
        align-items: center;
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