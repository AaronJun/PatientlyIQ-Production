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
    import SwipeableJourneyCards from '$lib/patientcards/SwipeableJourneyCards.svelte';

    import ALZMethology from './ALZMethology.svelte';
    import sentimentData from './sentimentData.json';
    import ctsentimentData from './ctsentimentData.json';
    import WaffleStages from './WaffleStages.svelte';
    import CtWaffleStages from './CTWaffleStages.svelte';
    import CtPositiveSentimentChart from './CTPositiveSentimentChart.svelte';

	import PositiveSentimentDriversChart from './PositiveSentimentDriversChart.svelte';
	import NegativeSentimentDriversChart from './NegativeSentimentDriversChart.svelte';
    
    let selectedDisease = "pompe";
    
    let isDrawerOpen = false;
   
    const siteUrl = 'https://patientlyiq.com';
    const pageTitle = "APOE4 Genotype Carrier + Caregiver Journey";
    const pageDescription = "Explore the patient journey of individuals who carry the APOE4 genotype. Learn about this community's sentiment towards genetic testing, clinical trials, and the future of Alzheimer's disease research.";
    const pageImage = `${siteUrl}/rpd-program-preview.png`; // Make image URL absolute
    const pageUrl = `${siteUrl}/alzapoe4`; // Make page URL absolute
    
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
    
    <div class="vignette text-slate-800 pt-6 pb-8 place-content-center">        
        <p class="text-sm max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2  underline underline-offset-4 text-left">
           Community Vignette
       </p>
       <SwipeableJourneyCards selectedDisease="pompe" selectedId="maggie-p" />
   </div>


    <div id="2. Genetic Testing" class="mb-2 place-content-center justify-center">
    <AlzIntroductionS2P1 />
    </div>
    <div class="mb-2 place-content-center justify-center"> 
        <AlzIntroductionS2P2 />
    </div>  
    <div class="mb-2 place-content-center justify-center"> 
        <AlzIntroductionS2P3 />       
        <div class="text-slate-800 px-12 pt-10 pb-4 place-content-center mx-auto">
            <div class="vignette text-slate-800 pt-6 pb-8 place-content-center">
                <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
               Community Vignette
              </p>
              <SwipeableJourneyCards selectedDisease="pompe" selectedId="timothy-k" />
    </div>
    </div>

    </div>  
    
    <div id="3. Clinical Trials" class="place-content-center justify-center">
        <AlzIntroductionS3P1 />
        <CtWaffleStages data={ ctsentimentData } />
            <CtPositiveSentimentChart />
        </div>  
        <div class="mb-2 place-content-center justify-center">
            <AlzIntroductionS3P2 />
            
            <div class="vignette text-slate-800 pt-6 pb-8 place-content-center">                <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
                   Community Vignette
               </p>
               <SwipeableJourneyCards selectedDisease="pompe" selectedId="nancy-a" />
        
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

    .patient-circle-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .vignette {
        border-top: .5px dotted #116661;
        border-bottom: .5px dotted #116661;
        background-color: #f7f7f7;
        padding-top: 4.25rem;
        padding-top: 4.25rem;
    }


    :global(.section-header) {
        font-size: 2rem;
        line-height: 1;
        font-weight: 400;
        color: #FF4A4A
    }
</style>