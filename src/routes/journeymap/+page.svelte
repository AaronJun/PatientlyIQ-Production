<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import JourneyFilterHeader from '$lib/patientjourney/JourneyFilterHeader.svelte';
    import StageWaffle from '$lib/patientjourney/WaffleStages.svelte';
    import PatientQuoteCards from '$lib/patientjourney/PatientQuoteCards.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import { ArrowUpRight } from 'carbon-icons-svelte';
    import StackedBars from '$lib/patientjourney/StackedBarsLegend.svelte';
    import JourneyTracker from '$lib/patientjourney/JourneyTracker.svelte';
    import JourneyMapDrawer from '$lib/patientjourney/JourneyDrawer.svelte';
    
    // Data imports
    import mergedJourneyData from '$lib/data/cidpJourney.json';
    import cidpQuotes from '$lib/data/cidpPatientQuotes.json';
    import sentimentData from '$lib/patientjourney/stagesSentimentData.json';
    
    const STAGE_COLORS = [
        "#330000", "#002365", "#69295C", "#B5685E", "#006454",
        "#831ED4", "#AB2B7A", "#3b623d", "#27513a", "#362149"
    ];
    
    // State management
    let isDrawerOpen = false;
    let selectedStageId = '';
    let selectedStageColor = '';
    let activeSection = '';
    
    function getStageColor(index: number) {
        return STAGE_COLORS[index % STAGE_COLORS.length];
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
        const headerObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        activeSection = entry.target.id;
                    }
                });
            },
            { threshold: 0.1 }
        );
    
        document.querySelectorAll('section').forEach(section => {
            headerObserver.observe(section);
        });
    
        return () => headerObserver.disconnect();
    });
    </script>
    
    <div class="min-h-screen bg-slate-50">
        <!-- Hero Section -->
        <header class="container mx-auto px-4 pt-24 pb-12">
            <img src={PIQLogo} alt="PIQ Logo" class="h-8 mb-8" />
            <h1 class="text-4xl font-semibold mb-8">
                Mapping the <JourneyFilterHeader /> Journey
            </h1>
            <div class="max-w-prose">
                <p class="text-lg text-slate-800 mb-8">
                    The CIDP patient journey is a complex, multistage process characterized by progressive 
                    challenges and emotional transitions.
                </p>
                <p class="text-lg text-slate-800 mb-12">
                    Compiled through the consolidation and analysis of more than 
                    <span class="appendix-link">400</span> social media posts, forum comments, blog posts, 
                    videos, and more, this report provides an overview of this community's goals and challenges, 
                    from symptom onset to clinical trial consideration.
                </p>
            </div>
            <StageWaffle data={sentimentData} />
        </header>
    
        <!-- Journey Stages -->
        <main class="container mx-auto px-4">
            {#each mergedJourneyData as stage, index}
                <section id={stage.id.toString()} class="mb-24">
                    <!-- Stage Header -->
                    <div class="sticky top-0 z-40 bg-slate-100">
                        <div class="text-xs uppercase tracking-wide px-4 py-2 bg-slate-200" 
                             style="color: {getStageColor(index)}; border-color: {getStageColor(index)}">
                            {stage.sectionHeader}
                        </div>
                        <div class="flex justify-between items-center px-4 pt-2 pb-4">
                            <h2 class="text-2xl font-medium" style="color: {getStageColor(index)}">
                                {stage.Stage}
                            </h2>
                            <button 
                                class="flex items-center px-4 py-2 rounded-full text-xs font-medium text-slate-100 bg-slate-50 hover:bg-white transition-colors shadow-sm"
                                style="background-color: {getStageColor(index)}"
                                on:click={() => openDrawer(stage.id.toString(), index)}>
                                Learn More
                                <ArrowUpRight class="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
    
                    <!-- Stage Content -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-24 py-12 px-4" 
                         style="background-color: {getStageColor(index)}">
                        <div class="md:col-span-2">
                            <p class="text-white max-w-prose">{stage.bodyText}</p>
                        </div>
                        <div>
                            <JourneyTracker id={stage.id.toString()} />
                        </div>
                    </div>
    
                    <!-- Milestones -->
                    <div class="my-12">
                       <h3 class="text-lg font-medium mb-4" 
                                style="color: {getStageColor(index)}; border-bottom: .5px solid">
                            Key Milestones
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {#each stage.substages as substage}
                                <div class="lined-col py-2 pr-4">
                                    <h4 class="font-mono text-xs mb-2" 
                                        style="color: {getStageColor(index)}">
                                        {substage.id}
                                    </h4>
                                    <h5 class="font-medium mb-4" 
                                        style="color: {getStageColor(index)}">
                                        {substage.title}
                                    </h5>
                                    <p class="text-xs text-slate-800 mb-6">
                                        {substage.description}
                                    </p>
    
                                    {#if substage.conversationTopics}
                                        <div class="mb-4">
                                            <h6 class="text-xs font-medium mb-2" 
                                                style="color: {getStageColor(index)}">
                                                Frequently-Discussed Topics
                                            </h6>
                                            <ul class="space-y-1 text-xs text-slate-600">
                                                {#each substage.conversationTopics as topic}
                                                    <li>• {topic}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
    
                                    {#if substage.searchTerms}
                                        <div>
                                            <h6 class="text-xs font-medium mb-2" 
                                                style="color: {getStageColor(index)}">
                                                Common Search Terms
                                            </h6>
                                            <div class="flex flex-wrap gap-2">
                                                {#each substage.searchTerms as term}
                                                    <span class="text-[10px] px-2 py-1 rounded-full 
                                                               bg-slate-200 text-slate-800">
                                                        {term}
                                                    </span>
                                                {/each}
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
    
                    <!-- Community Quotes -->
                    <div class="my-12">
   <h3 class="text-lg font-medium mb-8" 
                                style="color: {getStageColor(index)}; border-bottom: .5px solid">
                            What the Community Says
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="md:col-span-2">
                                <PatientQuoteCards 
                                    stageId={stage.id}
                                    quotes={cidpQuotes}
                                    quotesDescription={stage.quotesDescription}
                                    color={getStageColor(index)}
                                />
                            </div>
                        </div>
                    </div>
    
                    <!-- Search Analysis -->
                    {#if stage.searchTerms}
                        <div class="my-12">
                            <h3 class="text-lg font-medium mb-8" 
                                style="color: {getStageColor(index)}; border-bottom: .5px solid">
                                What the Community Looks For
                            </h3>
                            <StackedBars
                                searchTerms={stage.searchTerms}
                                stageColor={getStageColor(index)}
                            />
                        </div>
                    {/if}
    
                    <!-- Community Support -->
                    <div class="my-12">
   <h3 class="text-lg font-medium mb-8" 
                                style="color: {getStageColor(index)}; border-bottom: .5px solid">
                            How We Can Support the Community
                        </h3>
                        <div class="space-y-6">
                            {#each stage.engagementIdeas as idea}
                                <div class="lined-row grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div class="md:col-span-2">
                                        <h4 class="text-base font-medium mb-4" 
                                            style="color: {getStageColor(index)}">
                                            {idea.title}
                                        </h4>
                                        <p class="text-slate-800 text-sm max-w-prose">{idea.description}</p>
                                    </div>
                                    <div class="w-52">
                                        <div class="mb-2 text-slate-50" 
                                             style="color: {getStageColor(index)}">
                                            <p class="font-mono font-semibold">
                                                {idea.dataPoint}
                                            </p>
                                        </div>
                                        <p class="text-xs text-slate-800">
                                            {idea.dataDescription}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </section>
            {/each}
        </main>
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
    
        .appendix-link {
            color: #2A7980;
            border: 1px dotted #2A7980;
            padding: 0.125rem 0.425rem;
            font-weight: 800;
            cursor: pointer;
        }
    
        .appendix-link:hover {
            border: 1px solid #2A7980;
            background-color: #2a798020;
            padding: 0.1525rem 0.475rem;
        }

        .lined-row {
            border-bottom: .25px dotted #565656;
            padding-bottom: 1rem;
            align-items: center;
        }

    </style>