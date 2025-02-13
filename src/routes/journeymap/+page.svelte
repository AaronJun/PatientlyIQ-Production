<script lang="ts">
import { onMount } from 'svelte';
import * as d3 from 'd3';
import JourneyFilterHeader from '$lib/patientjourney/JourneyFilterHeader.svelte';
import NewJourneyMap from '$lib/patientjourney/NewJourneyMap.svelte';
import JourneyTracker from '$lib/patientjourney/JourneyTracker.svelte';
import JourneyMapDrawer from '$lib/patientjourney/JourneyDrawer.svelte';
import SearchBubbles from '$lib/patientjourney/SearchBubbles.svelte';
import StageWaffle from '$lib/patientjourney/WaffleStages.svelte'; 
import SwipeableJourneyCards from '$lib/patientjourney/TallSwipeableJourneyCards.svelte';
import PatientQuoteCards from '$lib/patientjourney/PatientQuoteCards.svelte';
import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
import { ArrowUpRight } from 'carbon-icons-svelte';
import StackedBars from '$lib/patientjourney/StackedBarsLegend.svelte';
import StageDetailWaffle from '$lib/patientjourney/StageDetailWaffle.svelte';

import mergedJourneyData from '$lib/data/cidpJourney.json';
import cidpQuotes from '$lib/data/cidpPatientQuotes.json';
import patientStories from '$lib/data/cidp-patient-stories.json';
import sentimentData from '$lib/patientjourney/stagesSentimentData.json';

const colors = [
    "#330000", "#002365", "#69295C", "#B5685E", "#006454",
    "#831ED4", "#DD3C9F", "#3b623d", "#27513a", "#362149"
];

let isJourneyMapVisible = false;
let isDrawerOpen = false;
let selectedStageId = '';
let selectedStageColor = '';
let activeSection = '';

function getStageColor(index: number) {
    return colors[index % colors.length];
}

function openDrawer(stageId: string, index: number) {
    selectedStageId = stageId;
    selectedStageColor = getStageColor(index);
    isDrawerOpen = true;
}

function closeDrawer() {
    isDrawerOpen = false;
    selectedStageId = '';
    selectedStageColor = '';
}

function updateActiveSection(sectionId: string) {
    activeSection = sectionId;
}

onMount(() => {
    // Initialize intersection observers for journey map visibility
    const mapObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.target.id === '1') {
                    if (entry.isIntersecting) {
                        isJourneyMapVisible = true;
                    }
                } else if (entry.target.id === mergedJourneyData.length.toString()) {
                    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                        isJourneyMapVisible = false;
                    }
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0% 0px -0% 0px'
        }
    );

    // Initialize intersection observers for sticky headers
    const headerObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const header = entry.target.querySelector('.sticky');
                const sectionId = entry.target.id;
                
                if (entry.isIntersecting) {
                    header?.classList.add('is-visible');
                    updateActiveSection(sectionId);
                } else {
                    if (entry.boundingClientRect.top < 0) {
                        header?.classList.remove('is-visible');
                    }
                }
            });
        },
        {
            threshold: 0,
            rootMargin: '-1px 0px 0px 0px'
        }
    );

    const sections = document.querySelectorAll('section');
    const firstSection = document.getElementyId('1');
    const lastSection = document.getElementById(mergedJourneyData.length.toString());
    
    if (firstSection) mapObserver.observe(firstSection);
    if (lastSection) mapObserver.observe(lastSection);
    sections.forEach(section => headerObserver.observe(section));

    return () => {
        mapObserver.disconnect();
        headerObserver.disconnect();
    };
});
</script>

<div class="page-layout flex flex-col">
    <!-- Hero Section -->
    <div class="min-h-[80vh] bg-slate-50 flex-row pt-24">
    <div class="flex-col justify-start px-8">
        <img src={PIQLogo} alt="PIQ Logo" class="w-8 col-span-2 mb-8 items-center" />
        <h1 class="main-header w-full text-4xl tracking-tight mb-8 text-">Mapping the <JourneyFilterHeader on:diseaseChange={(event) => {
        // Handle disease change here
        console.log('Selected disease:', event.detail);
    }} /> Journey </h1>
            <p class="max-w-prose justify-center text-left text-slate-800 text-lg">
                The CIDP patient journey is a complex, multistage process characterized by progressive 
                challenges and emotional transitions. <br><br>
                Compiled through the consolidation and analysis of more than <span class="appendix-link"> 400 </span> social media posts, forum comments, blog posts, videos, and more, this report provides an overview of this community's goals and challenges, from symptom onset to clinical trial consideration. <br><br>
            </p>
    </div>
        <div class="flex w-full px-2">
        <StageWaffle data={sentimentData} />
    </div>  
    </div>

    <!-- Main Content -->
    <div class="relative bg-slate-50">
        <!-- <div class="map sticky bg-slate-200 top-20 z-30">
            <NewJourneyMap 
                data={mergedJourneyData} 
                isVisible={isJourneyMapVisible} 
            />
        </div> -->
        
    <div class="w-full">
            <div class="flex-row mx-auto">
                {#each mergedJourneyData as stage, index}
    <section id={stage.id.toString()} class="relative">
        <!-- Sticky header -->
        <div class="sticky top-0 z-40 transition-all duration-300">
            <div class="flex flex-col w-full bg-slate-100" 
                 style="color: {getStageColor(index)}">
                 <h3 class="text-xs font-sans font-medium uppercase tracking-wide w-full px-8 py-2 bg-slate-200">
                     {stage.sectionHeader}
                 </h3>      
                <div class="flex justify-between items-end px-8 pt-2 pb-4">
                        <h2 class="text-3xl">
                            {stage.Stage}
                        </h2>
                    <button 
                        class="drawer-button flex flex-row py-2 px-4 justify-evenly w-fit rounded-full text-sm font-sans font-medium cursor-pointer text-slate-100 bg-slate-200 hover:bg-white"
                        style="hover:font-weight:800; color:{getStageColor(index)}"
                        on:click={() => openDrawer(stage.id.toString(), index)}>
                        Learn More
                        <ArrowUpRight 
                            class="w-4 h-5 ml-4" 
                            style="color: {getStageColor(index)}" 
                        />
                    </button>
                </div>
                <!-- <div class="flex-col w-full">
                    <StageDetailWaffle 
                        stageName={stage.Stage}
                        sentiments={sentimentData.stages.find(s => s.name === stage.Stage)?.sentiments || {}}
                        stageColor={getStageColor(index)}
                    />
                </div> -->
            </div>
            <!-- Bottom border that shows on scroll -->
        </div>
        <div class="flex flex-row items-center justify-between pt-4 pb-8 w-full px-8" 
        style="background-color: {getStageColor(index)}">
       <div class="flex-col w-2/3 max-w-prose">
           <p class="text-white max-w-prose">{stage.bodyText}</p>
        </div>
    </div>
    
    
    <div class="flex flex-row items-center justify-between pt-4 pb-8 w-full px-8" 
    style="background-color: {getStageColor(index)}">
    <div class="flex-col w-2/3 max-w-prose">
    </div>
    <div class="flex-col w-1/3 pt-4 pb-8">
        <JourneyTracker id={stage.id.toString()} />
    </div>
</div>


            <!-- Substages -->
            <div class="grid grid-rows-2 gap-4 align-middle items-center mt-4 mb-8 md:mb-12">
                <div class="w-full h-fit row-span-2 px-8 py-2 mb-4" 
                     style="background-color: {getStageColor(index)}">
                    <h4 class="text-lg font-sans font-medium text-slate-50">
                        Key Milestones
                    </h4>
                </div>
                <div class="flex flex-row w-full pl-4 gap-4">
                    {#each stage.substages as substage}
                        <div class="milestone-card w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] p-4 pb-6">
                            <h5 class="font-mono text-xs" 
                                style="color: {getStageColor(index)}">
                                {substage.id}
                            </h5>
                            <h5 class="font-sans py-2 md:py-4 max-w-md" 
                                style="color: {getStageColor(index)}">
                                {substage.title}
                            </h5>
                            <p class="max-w-prose font-sans text-sm text-slate-800 mb-4">
                                {substage.description}
                            </p>

                            <!-- Conversation Topics -->
                            {#if substage.conversationTopics}
                                <div class="mt-4">
                                    <h6 class="text-xs font-sans mb-2" style="color: {getStageColor(index)}">
                                        Frequently-Discussed Topics
                                    </h6>
                                    <ul class="list-none space-y-1">
                                        {#each substage.conversationTopics as topic}
                                            <li class="text-xs text-slate-600">• {topic}</li>
                                        {/each}
                                    </ul>
                                </div>
                            {/if}

                            <!-- Search Terms -->
                            {#if substage.searchTerms}
                                <div class="mt-4">
                                    <h6 class="text-xs font-sans mb-2" style="color: {getStageColor(index)}">
                                        Relevant Common Search Terms
                                    </h6>
                                    <div class="flex flex-wrap gap-2">
                                        {#each substage.searchTerms as term}
                                            <span class="text-[10px] px-2 py-1 rounded-full bg-slate-200 text-slate-800">
                                                {term}
                                            </span>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>


            <!-- Journey Cards -->
 <!--            <div class="w-full pl-8 mt-8 mb-12">
                <SwipeableJourneyCards 
                    selectedDisease="cidp"
                    selectedId={patientStories.diseases.cidp.patients.find(p => p.stage === stage.id)?.id}
                />
            </div> -->

                        <div class="flex flex-col w-full">
                            <div class="h-fit row-span-2 px-8 py-2 mb-12 " 
                                 style="background-color: {getStageColor(index)}">
                                <h4 class="text-lg font-sans font-medium text-slate-50">
                                    What the Community Says
                                </h4>
                            </div>
                        <div class="flex flex-row">
                            <div class="w-full">
                                <PatientQuoteCards 
                                    stageId={stage.id} 
                                    quotes={cidpQuotes}
                                    quotesDescription={stage.quotesDescription}
                                    color={getStageColor(index)} 
                                />
                            </div>
                            <div class="w-2/5 max-w-80 pl-4">
                                <p class="caption text-slate-800 text-sm">
                                </div>
                            </div>


                            {#if stage.searchTerms}
                                <div class="mt-6 md:mt-8 mb-8 md:mb-12">
                                    <div class="flex flex-row gap-4 align-middle items-center mt-4 mb-4">
                                        <div class="w-full h-fit row-span-2 px-8 py-2 mb-12 " 
                                             style="border-bottom: 1px solid {getStageColor(index)}">
                                            <h4 class="text-lg font-sans font-semibold align-middle" style="color: {getStageColor(index)}">
                                                What the Community Looks For
                                            </h4>
                                        </div>  
                                    </div>
                                    <div class="flex" style="color: {getStageColor(index)}">
                                        <StackedBars
                                        searchTerms={stage.searchTerms}
                                        stageColor={getStageColor(index)}
                                    />                                 
                                   </div>
                                </div>
                            {/if}
                                    
                                    <div class="mt-6 md:mt-8 space-y-4">
                                    <div class="flex flex-row gap-4 md:gap-8 align-middle mt-4 mb-6 md:mb-8">
                                        <div class="w-full h-fit row-span-2 px-2 py-2 mb-12" 
                                             style="background-color: {getStageColor(index)}">
                                            <h4 class="text-lg font-sans font-medium text-slate-50">
                                                How We Can Support the Community
                                            </h4>
                                        </div>
                                </div>

                                    <div class="idea-col flex-col gap-6">
                                        {#each stage.engagementIdeas as idea}
                                            <div class="flex flex-col place-content-around px-8 w-2/3 mt-6 md:mt-8">
                                                <div class="flex flex-col max-w-full justify-between font-sans mb-4" 
                                                     style="color: {getStageColor(index)}">
                                                    <div class="flex flex-col md:flex-row">
                                                        <div class="flex flex-col border-t-black py-3 md:py-4 px-2 w-full">
                                                            <h5 class="font-sans text-lg pb-2 md:pb-4 font-normal font-semibold">
                                                                {idea.title}
                                                            </h5>
                                                            <p class="md:max-w-96 text-sm text-slate-800">
                                                                {idea.description}
                                                            </p>
                                                        </div>
                                                        <div class="flex-col text-slate-600 px-4 ml-8 w-2/5">
                                                            <div class="px-2 py-1 w-full h-fit text-left align-top mb-2" 
                                                                 style="background-color: {getStageColor(index)}">
                                                                <p class="font-mono text-base font-semibold text-slate-50">
                                                                    {idea.dataPoint}
                                                                </p>
                                                            </div>
                                                            <p class="font-sans max-w-96 text-sm text-slate-800">
                                                                {idea.dataDescription}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                {/each}
            </div>
        </div>
    </div>

    <!-- Footer -->
    <section class="min-h-[50vh] bg-slate-600">
        <!-- Footer content -->
    </section>
</div>

<JourneyMapDrawer
    isOpen={isDrawerOpen}
    sectionId={selectedStageId}
    stageColor={selectedStageColor}
    on:close={closeDrawer}
/>

<style>
    
    :global(html) {
        scroll-behavior: smooth;
    }

    .sticky {
        border-bottom: .25px solid #666666;
    }

    .drawer-button {
        font-family: 'IBM Plex Sans', sans-serif;
        transition: all 0.25s ease;
    }

    .drawer-button:hover {
        font-weight: 800 !important;
    }

    .search-bubbles-container {
        border: .525px solid rgba(67, 46, 170, 0.2);
        border-radius: 4px;
        padding: 1rem;
        background-color: rgba(67, 46, 170, 0.02);
    }

    :global(.border-t-sub) {
        border-top: .45px solid #161616;
        padding-top: 0.75rem;
        padding-bottom: 2rem;
    }

    :global(.border-t-main) {
        border-top: 1.1725px solid #161616;
        padding-top: 0.925rem;
        padding-bottom: 4.25rem;
    }

    @media (max-width: 768px) {
        .page-layout {
            margin: 0 0 1.25rem 0;
        }

        .text-4xl {
            font-size: 1.75rem;
        }

        .flex-row {
            flex-direction: column;
        }

        .search-bubbles-container {
            padding: 0.75rem;
        }

        :global(.border-t-sub) {
            padding-bottom: 1.5rem;
        }

        :global(.border-t-main) {
            padding-bottom: 3rem;
        }

        :global(.circle-container-outline) {
            display: none;
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }
    }

    :global(.appendix-link){
        color: #2A7980;
        border: 1px dotted #2A7980;
        padding: 0.125rem .425rem;
        font-weight: 800;
        cursor: pointer;
    }
    :global(.appendix-link:hover){
        border: 1px solid #2A7980;
        background-color: #2a798020;
        padding: 0.1525rem .475rem;
    }

    .milestone-card {
        border: .425px solid #bbbbbb;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .idea-col {

    }
</style>