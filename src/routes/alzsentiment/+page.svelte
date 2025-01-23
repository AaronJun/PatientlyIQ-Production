<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";  
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import NegativeSentimentChart from './NegativeSentimentChart.svelte';
    import NegativeSentimetDriversChart from './NegativeSentimentDriversChart.svelte';
    import PatientJourneyCards from '$lib/patientcards/ALZPatientJourneyCards.svelte';
    import ScrollProgress from './ScrollProgress.svelte';

    import ALZIntroduction from './ALZIntroduction.svelte';
    import AlzIntroductionS1P1 from './ALZIntroductionS1P1.svelte';
    import AlzIntroductionS1P2 from './ALZIntroductionS1P2.svelte';
    import AlzIntroductionS2P1 from './ALZIntroductionS2P1.svelte';
    import AlzIntroductionS3P1 from './ALZIntroductionS3P1.svelte';
    import AlzIntroductionS2P2 from './ALZIntroductionS2P2.svelte';
    import AlzIntroductionS3P2 from './ALZIntroductionS3P2.svelte';
    import ALZMethology from './ALZMethology.svelte';
    import sentimentData from './sentimentData.json';
    import WaffleStages from './WaffleStages.svelte';
    import ZoomBurst from './ZoomBurst.svelte';
    import PatientStoryCircles from '$lib/RPDPatientStories/ALZPatientStoryCircles1.svelte';

    import flareData from '$lib/data/flare-alz.json';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';
	import PatientJourneyDrawer from '$lib/patientcards/ALZPatientJourneyDrawer.svelte';
	import PositiveSentimentDriversChart from './PositiveSentimentDriversChart.svelte';
	import NegativeSentimentDriversChart from './NegativeSentimentDriversChart.svelte';
    
    let selectedDisease = "pompe";
    let isDrawerOpen = false;
   
    
</script>


<div class="flex-1 place-content-center  bg-slate-100 pt-12 bg-b">
    <!-- Sidebar -->
    <!-- Main Content -->

<ScrollProgress />


    <div class="relative max-w-full mx-auto px-4 place-content-center">

    <div id="1. Introduction" class="flex-1 place-content-center pt-8 col-span-4">
        <ALZIntroduction />
    </div>
    <div id="1.1 APOE4 Journey" class="flex-1 place-content-center pt-8 col-span-8">
    <AlzIntroductionS1P1 />
    <WaffleStages data={ sentimentData } />
</div>
</div>
    <div id="1.2 Sentiment Drivers" class="mb-16 pb-24 place-content-center justify-center">
        <AlzIntroductionS1P2 />
        <PositiveSentimentDriversChart />
        <NegativeSentimentDriversChart />
    </div>
    
    <div id="1.3 APOE4 Stories" class="mb-16 pb-24 place-content-center justify-center">
        <PatientStoryCircles {selectedDisease} />
        <PatientJourneyCards />
    </div>

    <div id="2.1 Genetic Testing" class="mb-16 pb-24 place-content-center justify-center">
    <AlzIntroductionS2P1 />
    </div>
    <div id="2.2 Sentiment Drivers" class="mb-16 pb-24 place-content-center justify-center"> 
    <NegativeSentimentChart />
    <NegativeSentimetDriversChart />
    </div>  
    <div id="2.3 APOE4 Stories" class="mb-16 pb-24 place-content-center justify-center">
    <PatientStoryCircles {selectedDisease} />
    <PatientJourneyCards />
    </div>
    
    <div id="3.1 Clinical Trials" class="mb-16 pb-24 place-content-center justify-center">
        <AlzIntroductionS3P1 />
        </div>
        <div id="3.2 Perception of Alzheon" class="mb-16 pb-24 place-content-center justify-center"> 
        <NegativeSentimentChart />
        <NegativeSentimetDriversChart />
        </div>  
        <div id="3.3 APOE4 Stories" class="mb-16 pb-24 place-content-center justify-center">
        <PatientStoryCircles {selectedDisease} />
        <PatientJourneyCards />
        </div>

</div>
          
                <div class="grid grid-cols-8 lg:grid-cols-8 gap-2">
                    <div class="col-start-1 col-span-6">
                    </div>
                  
                </div>
                <ALZMethology />


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

    .section-header {
        font-size: 1rem;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 1.5rem;
        text-align: center;
        letter-spacing: 0.025em;
        border-top: 1px solid #661126;
        padding-top: 2rem;
    }
</style>