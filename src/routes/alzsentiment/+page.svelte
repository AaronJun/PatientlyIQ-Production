<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";  
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import NegativeSentimentChart from './NegativeSentimentChart.svelte';
    import NegativeSentimetDriversChart from './NegativeSentimentDriversChart.svelte';
    import PatientJourneyCards from '$lib/patientcards/ALZPatientJourneyCards.svelte';
    import ScrollProgress from './ScrollProgress.svelte';
    import AlzStoryCardXlContainer from './ALZStoryCardXLContainer.svelte';

    import ALZIntroduction from './ALZIntroduction.svelte';
    import AlzIntroductionS1P1 from './ALZIntroductionS1P1.svelte';
    import AlzIntroductionS1P2 from './ALZIntroductionS1P2.svelte';
    import AlzIntroductionS1P3 from './ALZIntroductionS1P3.svelte';
    import AlzIntroductionS2P1 from './ALZIntroductionS2P1.svelte';
    import AlzIntroductionS3P1 from './ALZIntroductionS3P1.svelte';
    import AlzIntroductionS2P2 from './ALZIntroductionS2P2.svelte';
    import AlzIntroductionS2P3 from './ALZIntroductionS2P3.svelte';
    import AlzIntroductionS3P2 from './ALZIntroductionS3P2.svelte';
    import AlzConclusion from './ALZConclusion.svelte';
    import GeneticPatientQuoteCards from '$lib/patientcards/GeneticPatientQuoteCards.svelte';
    import CtPatientQuoteCards from '$lib/patientcards/CtPatientQuoteCards.svelte';
    import AlzheonQuoteCards from '$lib/patientcards/AlzheonQuoteCards.svelte';

    import ALZMethology from './ALZMethology.svelte';
    import sentimentData from './sentimentData.json';
    import ctsentimentData from './ctsentimentData.json';
    import WaffleStages from './WaffleStages.svelte';
    import CtWaffleStages from './CTWaffleStages.svelte';
    import PatientStoryCircles from '$lib/RPDPatientStories/ALZPatientStoryCircles1.svelte';
    import CtPositiveSentimentChart from './CTPositiveSentimentChart.svelte';

    import flareData from '$lib/data/flare-alz.json';
    import { getTopicsForDisease } from '$lib/stores/sentimentTopicsStore';
	import PatientJourneyDrawer from '$lib/patientcards/ALZPatientJourneyDrawer.svelte';
	import PositiveSentimentDriversChart from './PositiveSentimentDriversChart.svelte';
	import NegativeSentimentDriversChart from './NegativeSentimentDriversChart.svelte';
    
    let selectedDisease = "pompe";
    
    let isDrawerOpen = false;
   
    
</script>


<div class="flex-1 place-content-center bg-slate-50 pt-12">
    <!-- Sidebar -->
    <!-- Main Content -->

<ScrollProgress />


    <div class="relative max-w-full mx-auto place-content-center">

    <div id="1. Introduction" class="flex-1 place-content-center pt-4 col-span-4">
        <ALZIntroduction />
    </div>
    <div class="flex-1 place-content-center pt-4 col-span-8">        
    <AlzIntroductionS1P1 />
    <WaffleStages data={ sentimentData } />
</div>
</div>
    <div class="mb-2 place-content-center justify-center">
        <AlzIntroductionS1P2 />
        <PositiveSentimentDriversChart />
        <NegativeSentimentDriversChart />
    </div>
    
    <div class="max-w-3xl bg-blue-50 text-slate-800 px-10 pt-6 pb-4  place-content-center mx-auto">
        <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
            Click to learn more 
       </p>
        <PatientStoryCircles selectedDisease={selectedDisease} selectedId="maggie-p" />
        <p class="caption text-sm max-w-96 font-serif text-left mx-auto mt-12 text-pretty">
            Maggie P. is a retired physician who recently helps manage her husband's APOE4/4 status, and readily admits that her medical background did not fullyprepare her for the demands of caregiving. Click to learn more about her story. </p>
   </div>


    <div id="2. Genetic Testing" class="mb-2 place-content-center justify-center">
    <AlzIntroductionS2P1 />
    </div>
    <div class="mb-2 place-content-center justify-center"> 
        <AlzIntroductionS2P2 />
    </div>  
    <div class="mb-2 place-content-center justify-center"> 
        <AlzIntroductionS2P3 />       
        <div class="max-w-3xl bg-blue-50 text-slate-800 px-12 pt-10 pb-4 place-content-center mx-auto">
            <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
                Click to learn more 
           </p>
         <PatientStoryCircles selectedDisease={selectedDisease} selectedId="timothy-k" />
         <p class="caption text-sm max-w-96 font-serif text-left mx-auto mt-12 text-pretty">
            Timothy K. took a 23andMe genetic test after his mother passed away from Alzheimer's-related complications, and found that learning his genotype was more fraught than he expected. Click the circle to learn more about his story.
        </p>
    </div>

    </div>  
    
    <div id="3. Clinical Trials" class="place-content-center justify-center">
        <AlzIntroductionS3P1 />
        <CtWaffleStages data={ ctsentimentData } />
            <CtPositiveSentimentChart />
        </div>  
        <div class="mb-2 place-content-center justify-center">
            <AlzIntroductionS3P2 />
            
            <div class="max-w-3xl bg-blue-50 text-slate-800 px-10 pt-6 pb-4  place-content-center mx-auto">
                <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
                    Click to learn more 
               </p>
                <PatientStoryCircles selectedDisease={selectedDisease} selectedId="nancy-A"/>
                <p class="caption text-sm max-w-96 font-serif text-left mx-auto mt-12 text-pretty">
                    Nancy, who lost her mother to Alzheimer's, leans on her research background to stay up-to-date with the latest research and is beginning to consider clinical trial options. Click the circle to learn more about her story.
           </p>
        
           </div>
        </div>
        <div id="4. Looking Forward" class="mb-2 place-content-center justify-center">
        <AlzConclusion />
        </div>
        </div>    
        <div class="grid grid-cols-8 lg:grid-cols-8 gap-2">

        </div>
        <ALZMethology />


<style>

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