<script lang="ts">
    import { onMount } from 'svelte';
    import NewJourneyMap from '$lib/patientjourney/NewJourneyMap.svelte';
    import JourneyTracker from '$lib/patientjourney/JourneyTracker.svelte';
    import JourneyMapDrawer from '$lib/patientjourney/JourneyDrawer.svelte';
    import SearchBubbles from '$lib/patientjourney/SearchBubbles.svelte';
    import StageWaffle from '$lib/patientjourney/WaffleStages.svelte';
    import SwipeableJourneyCards from '$lib/patientjourney/TallSwipeableJourneyCards.svelte';
    import PatientQuoteCards from '$lib/patientjourney/PatientQuoteCards.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import { ArrowUpRight } from 'carbon-icons-svelte';
    
    import mergedJourneyData from '$lib/data/cidpJourney.json';
    import cidpQuotes from '$lib/data/cidpPatientQuotes.json';
    import patientStories from '$lib/data/cidp-patient-stories.json';
    import sentimentData from '$lib/patientjourney/stagesSentimentData.json';
    
    const colors = [
        "#FF4A4A", "#002365", "#69295C", "#B5685E", "#006454",
        "#831ED4", "#DD3C9F", "#3b623d", "#27513a", "#362149"
    ];
    
    let isJourneyMapVisible = false;
    let isDrawerOpen = false;
    let selectedStageId = '';
    let selectedStageColor = '';
    
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
    
    onMount(() => {
        const observer = new IntersectionObserver(
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
                rootMargin: '-10% 0px -5% 0px'
            }
        );
    
        const firstSection = document.getElementById('1');
        const lastSection = document.getElementById(mergedJourneyData.length.toString());
        
        if (firstSection) observer.observe(firstSection);
        if (lastSection) observer.observe(lastSection);
    
        return () => observer.disconnect();
    });
</script>

<div class="page-layout flex flex-col min-h-screen">
    <!-- Hero Section -->
    <div class="min-h-[80vh] bg-slate-50 flex-col items-center justify-start pt-16 md:pt-32 px-4 md:px-16">
        <img src={PIQLogo} alt="PIQ Logo" class="w-12 h-auto mt-8 md:mt-12 mb-6 md:mb-8" />
        <h1 class="text-2xl md:text-4xl/normal max-w-prose mb-4 text-slate-800 font-light">
            Mapping the CIDP Patient Journey
        </h1>
        <p class="max-w-prose">
            The CIDP patient journey is a complex, multistage process characterized by progressive 
            challenges and emotional transitions. It typically begins with subtle symptom onset—often 
            unrecognized tingling or weakness—where patients frequently delay seeking medical attention. 
            The diagnostic pathway is particularly challenging, with the community reporting navigating towards a proper diagnosis as a major driver of negative sentiment.
        </p>
        
        <StageWaffle data={sentimentData} />
    </div>

    <!-- Main Content -->
    <div class="relative bg-slate-50">
        <div class="sticky top-0 bg-slate-50 z-40">
            <NewJourneyMap 
                data={mergedJourneyData} 
                isVisible={isJourneyMapVisible} 
            />
        </div>
        
        <div class="w-full">
            <div class="min-w-full flex-row mx-auto">
                {#each mergedJourneyData as stage, index}
                    <section id={stage.id.toString()} class="mb-8 md:mb-12">
                        <div class="flex flex-col mt-4 mb-8 pt-8 pb-16 w-full" 
                             style="background-color: {getStageColor(index)}">
                            <div class="flex gap-4 items-center mb-6 md:mb-8 justify-start px-4 md:pl-16 md:pr-32">
                            
                            </div>
                            
                            <div class="grid grid-cols-4 gap-64 px-4">
                                <div class="flex-col col-span-2">
                                    <div class="w-fit px-4 py-2 mb-4 rounded-full bg-slate-900/40">
                                        <h3 class="text-base font-sans font-medium text-slate-50">
                                            {stage.sectionHeader}
                                        </h3>
                                        </div>
                                <h2 class="text-3xl md:text-5xl/tight md:col-span-2 text-white mb-12">
                                {stage.Stage}
                            </h2>     
                            <JourneyTracker 
                                id={stage.id.toString()}
                            />
                            </div>
                                <div class="flex-col max-w-prose place-content-end col-span-2 gap-4">
                                <p class="md:col-span-2 text-white">{stage.bodyText}</p>
                                <button 
                                class="drawer-button mt-8 flex flex-row py-2 px-4 justify-evenly w-fit rounded-full text-base font-sans font-medium cursor-pointer text-slate-100 bg-slate-50 hover:bg-slate-100"
                                style="hover:font-weight:800; color:{getStageColor(index)}"
                                on:click={() => openDrawer(stage.id.toString(), index)}>
                                Learn More
                                <ArrowUpRight 
                                class="w-4 h-4 ml-4" 
                                style="color: {getStageColor(index)}" 
                                />
                            </button>
                            </div>
                        </div>
                        </div>

                        <div class="mt-8 mb-12">
                            <SwipeableJourneyCards 
                                selectedDisease="cidp"
                                selectedId={patientStories.diseases.cidp.patients.find(p => p.stage === stage.id)?.id}
                            />
                        </div>

                        <div class="flex flex-col px-4 md:pl-16 w-full md:w-2/3">
                            <div class="flex flex-row gap-4 align-middle items-center mt-4 mb-6 md:mb-8">
                                <div class="grid grid-rows-2 gap-4 align-middle w-full items-center mt-4 mb-8 md:mb-12">
                                    <div class="w-full h-fit row-span-2 p-4 mb-12 rounded-sm" 
                                         style="background-color: {getStageColor(index)}">
                                        <h4 class="text-xl font-sans font-medium text-slate-50">
                                            What the Community Says
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <PatientQuoteCards 
                                stageId={stage.id} 
                                quotes={cidpQuotes}
                                color={getStageColor(index)} 
                            />

                            {#if stage.searchTerms}
                                <div class="mt-6 md:mt-8 mb-8 md:mb-12">
                                    <div class="flex flex-row gap-4 align-middle items-center mt-4 mb-4">
                                        <div class="w-full h-fit row-span-2 p-4 mb-12 rounded-sm" 
                                             style="background-color: {getStageColor(index)}">
                                            <h4 class="text-xl font-sans font-semibold align-middle text-slate-50">
                                                What the Community Looks For
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="search-bubbles-container">
                                        <SearchBubbles searchTerms={stage.searchTerms} />
                                    </div>
                                </div>
                            {/if}

                            <div class="mt-6 md:mt-8 mb-16 md:mb-24">
                                <div class="grid grid-rows-2 gap-4 align-middle items-center mt-4 mb-8 md:mb-12">
                                    <div class="w-full h-fit row-span-2 p-4 mb-12 rounded-sm" 
                                         style="background-color: {getStageColor(index)}">
                                        <h4 class="text-xl font-sans font-medium text-slate-50">
                                            The Steps the Community Takes
                                        </h4>
                                    </div>

                                    <div class="grid grid-cols-1 gap-6">
                                        {#each stage.substages as substage}
                                            <div class="stat-line px-2">
                                                <h5 class="font-sans text-lg md:text-xl pb-3 md:pb-4 
                                                           font-normal font-semibold md:w-80 py-3 md:py-4 w-full" 
                                                    style="color: {getStageColor(index)}">
                                                    {substage.id} {substage.title}
                                                </h5>
                                                <p class="md:max-w-96 text-sm text-slate-800">
                                                    {substage.description}
                                                </p>
                                            </div>
                                        {/each}
                                    </div>
                                </div>

                                <div class="mt-6 md:mt-8 space-y-4">
                                    <div class="flex flex-row gap-4 md:gap-8 align-middle mt-4 mb-6 md:mb-8">
                                        <div class="w-full h-fit row-span-2 p-4 mb-12 rounded-sm" 
                                             style="background-color: {getStageColor(index)}">
                                            <h4 class="text-xl font-sans font-medium text-slate-50">
                                                How We Can Support the Community
                                            </h4>
                                        </div>
                                    </div>

                                    <div class="flex-col gap-6 md:gap-8">
                                        {#each stage.engagementIdeas as idea}
                                            <div class="flex flex-col place-content-around w-full mt-6 md:mt-8" 
                                                 style="border-color: {getStageColor(index)}">
                                                <div class="flex flex-col max-w-full justify-between font-sans mb-4" 
                                                     style="color: {getStageColor(index)}">
                                                    <div class="flex flex-col md:flex-row">
                                                        <div class="stat-line flex flex-col py-3 md:py-4 px-2 w-full">
                                                            <h5 class="font-sans text-lg md:text-xl pb-3 md:pb-4 
                                                                      font-normal font-semibold md:w-80">
                                                                {idea.title}
                                                            </h5>
                                                            <p class="md:max-w-96 text-sm text-slate-800">
                                                                {idea.description}
                                                            </p>
                                                        </div>
                                                        <div class="flex-col bg-blue-50 text-slate-800 px-4 py-4 ml-8 
                                                                    outline-dashed outline-1 place-content-center 
                                                                    items-center mx-auto">
                                                            <div class="px-3 py-1 rounded-full w-fit h-fit text-center 
                                                                        align-middle mb-2" 
                                                                 style="background-color: {getStageColor(index)}">
                                                                <p class="font-mono text-lg md:text-lg font-semibold 
                                                                          text-slate-50">
                                                                    {idea.dataPoint}
                                                                </p>
                                                            </div>
                                                            <p class="font-mono md:max-w-96 text-xs text-slate-800">
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

    .stat-line {
        border-top: .5px solid #161616;
    }

    .sticky {
        border-bottom: .25px solid #432eaa;
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
</style>