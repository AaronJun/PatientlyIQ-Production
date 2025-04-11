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
    import { lazyLoad } from '$lib/actions/lazyLoad';
    
    let selectedDisease = "pompe";
    
    let isDrawerOpen = false;
   
    const siteUrl = 'https://patientlyiq.com';
    const pageTitle = "APOE4 Genotype Carrier + Caregiver Journey";
    const pageDescription = "Explore the patient journey of individuals who carry the APOE4 genotype. Learn about this community's sentiment towards genetic testing, clinical trials, and the future of Alzheimer's disease research.";
    const pageImage = `${siteUrl}/rpd-program-preview.png`; // Make image URL absolute
    const pageUrl = `${siteUrl}/alzapoe4`; // Make page URL absolute
    
    // Component visibility states
    let waffleStagesVisible = false;
    let sentimentDriversVisible = false;
    let ctWaffleStagesVisible = false;
    let ctPositiveChartVisible = false;
    let journeyCard1Visible = false;
    let journeyCard2Visible = false;
    let journeyCard3Visible = false;
</script>

<svelte:options immutable={false} />

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
    <div
        use:lazyLoad
        class="visualization-placeholder min-h-[400px] flex items-center justify-center"
        on:lazyload={() => waffleStagesVisible = true}
    >
        {#if waffleStagesVisible}
            <WaffleStages data={ sentimentData } />
        {:else}
            <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center">
                <p class="text-slate-500">Loading visualization...</p>
            </div>
        {/if}
    </div>
</div>
</div>
    <div class="mb-2 place-content-center justify-center">
        <AlzIntroductionS1P2 />
        <div
            use:lazyLoad
            class="visualization-container min-h-[400px]"
            on:lazyload={() => sentimentDriversVisible = true}
        >
            {#if sentimentDriversVisible}
                <PositiveSentimentDriversChart />
                <NegativeSentimentDriversChart />
            {:else}
                <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center">
                    <p class="text-slate-500">Loading sentiment analysis...</p>
                </div>
            {/if}
        </div>
    </div>
    
    <div class="vignette text-slate-800 pt-6 pb-8 place-content-center">        
        <p class="text-sm max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2  underline underline-offset-4 text-left">
           Community Vignette
       </p>
       <div
            use:lazyLoad
            class="journey-card-container min-h-[600px]"
            on:lazyload={() => journeyCard1Visible = true}
        >
            {#if journeyCard1Visible}
                <SwipeableJourneyCards selectedDisease="pompe" selectedId="maggie-p" isVisible={journeyCard1Visible} />
            {:else}
                <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center h-[500px] flex items-center justify-center">
                    <p class="text-slate-500">Loading patient journey...</p>
                </div>
            {/if}
        </div>
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
              <div
                  use:lazyLoad
                  class="journey-card-container min-h-[600px]"
                  on:lazyload={() => journeyCard2Visible = true}
              >
                  {#if journeyCard2Visible}
                      <SwipeableJourneyCards selectedDisease="pompe" selectedId="timothy-k" isVisible={journeyCard2Visible} />
                  {:else}
                      <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center h-[500px] flex items-center justify-center">
                          <p class="text-slate-500">Loading patient journey...</p>
                      </div>
                  {/if}
              </div>
    </div>
    </div>

    </div>  
    
    <div id="3. Clinical Trials" class="place-content-center justify-center">
        <AlzIntroductionS3P1 />
        <div
            use:lazyLoad
            class="visualization-container min-h-[400px]"
            on:lazyload={() => ctWaffleStagesVisible = true}
        >
            {#if ctWaffleStagesVisible}
                <CtWaffleStages data={ ctsentimentData } />
            {:else}
                <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center">
                    <p class="text-slate-500">Loading clinical trial visualization...</p>
                </div>
            {/if}
        </div>
        <div
            use:lazyLoad
            class="visualization-container min-h-[400px]"
            on:lazyload={() => ctPositiveChartVisible = true}
        >
            {#if ctPositiveChartVisible}
                <CtPositiveSentimentChart />
            {:else}
                <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center">
                    <p class="text-slate-500">Loading sentiment chart...</p>
                </div>
            {/if}
        </div>
    </div>  
    <div class="mb-2 place-content-center justify-center">
        <AlzIntroductionS3P2 />
            
        <div class="vignette text-slate-800 pt-6 pb-8 place-content-center">                <p class="text-xs max-w-fit mx-auto mb-8 rounded-full font-mono px-4 py-2 bg-orange-100 text-left">
                Community Vignette
            </p>
            <div
                use:lazyLoad
                class="journey-card-container min-h-[600px]"
                on:lazyload={() => journeyCard3Visible = true}
            >
                {#if journeyCard3Visible}
                    <SwipeableJourneyCards selectedDisease="pompe" selectedId="nancy-a" isVisible={journeyCard3Visible} />
                {:else}
                    <div class="loading-placeholder bg-slate-100 animate-pulse rounded-lg p-8 text-center h-[500px] flex items-center justify-center">
                        <p class="text-slate-500">Loading patient journey...</p>
                    </div>
                {/if}
            </div>
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
    
    .loading-placeholder {
        width: 100%;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .visualization-container {
        transition: opacity 0.5s ease;
    }
</style>