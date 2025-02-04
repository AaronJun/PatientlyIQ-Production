<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { slide, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Close,
        Quotes
     } from "carbon-icons-svelte";
    import journeyDetails from '$lib/data/cidp-journey-details.json';
    
    const dispatch = createEventDispatcher();
    
    export let isOpen = false;
    export let sectionId: string = '';
    export let stageColor: string;
    
    let currentStageDetails = null;
    let activeTab = 'overview';

    $: {
        if (sectionId) {
            const stageId = parseInt(sectionId);
            currentStageDetails = journeyDetails.stages.find(stage => stage.id === stageId);
            activeTab = 'overview';
        } else {
            currentStageDetails = null;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
            dispatch('close');
        }
    }

    function handleBackgroundClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            dispatch('close');
        }
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

{#if isOpen && currentStageDetails}
    <div 
        class="drawer-overlay fixed inset-0 bg-black bg-opacity-50 z-50"
        on:click={handleBackgroundClick}
        transition:fade={{duration: 200}}
    >
        <div 
            class="drawer fixed right-0 top-0 h-full w-full md:w-2/5 bg-white overflow-hidden"
            transition:slide={{duration: 300, axis: 'x'}}
        >
            <!-- Header Section -->
            <div 
                class="drawer-header p-6 relative"
                style="background-color: {stageColor}"
            >
                <button 
                    class="close-btn absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white"
                    on:click={() => dispatch('close')}
                    aria-label="Close drawer"
                >
                    <Close size={32} />
                </button>
                
                <h2 class="text-2xl font-bold text-white mb-2">{currentStageDetails.name}</h2>
                <p class="text-white/90 text-sm leading-relaxed">{currentStageDetails.description}</p>
            </div>

            <!-- Navigation Tabs -->
            <div class="tab-navigation border-b border-slate-200 px-4 flex space-x-4 overflow-x-auto">
                {#each ['overview', 'insights', 'quotes', 'actions'] as tab}
                    <button
                        class="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
                        class:text-slate-900={activeTab === tab}
                        class:text-slate-500={activeTab !== tab}
                        class:border-b-2={activeTab === tab}
                        style="border-color: {activeTab === tab ? stageColor : 'transparent'}"
                        on:click={() => activeTab = tab}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                {/each}
            </div>

            <!-- Content Area -->
            <div class="drawer-content overflow-y-auto h-[calc(100vh-200px)]">
                {#if activeTab === 'overview'}
                    <div class="p-6 space-y-6">
                        <!-- Summary Points -->
                        <div>
                            <h3 class="text-lg font-semibold text-slate-800 mb-3">Key Points</h3>
                            <ul class="space-y-2">
                                {#each currentStageDetails.summaryPoints as point}
                                    <li class="flex items-start gap-2">
                                        <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0" 
                                             style="background-color: {stageColor}"></div>
                                        <span class="text-slate-600">{point}</span>
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        <!-- Challenges -->
                        <div>
                            <h3 class="text-lg font-semibold text-slate-800 mb-3">Common Challenges</h3>
                            <ul class="space-y-2">
                                {#each currentStageDetails.patientChallenges as challenge}
                                    <li class="flex items-start gap-2">
                                        <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0" 
                                             style="background-color: {stageColor}"></div>
                                        <span class="text-slate-600">{challenge}</span>
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        <!-- Common Searches -->
                        <div>
                            <h3 class="text-lg font-semibold text-slate-800 mb-3">Common Search Terms</h3>
                            <div class="flex flex-wrap gap-2">
                                {#each currentStageDetails.commonSearchTerms as term}
                                    <span 
                                        class="px-3 py-1 rounded-full text-sm"
                                        style="background-color: {stageColor}25; color: {stageColor}"
                                    >
                                        {term}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    </div>

                {:else if activeTab === 'insights'}
                    <div class="p-6">
                        <div class="grid gap-4">
                            {#each Object.entries(currentStageDetails.statisticalInsights) as [key, value]}
                                <div class="p-4 rounded-lg bg-slate-50">
                                    <h4 class="text-sm font-medium text-slate-500 mb-1 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </h4>
                                    <p class="text-lg font-semibold" style="color: {stageColor}">{value}</p>
                                </div>
                            {/each}
                        </div>
                    </div>

                {:else if activeTab === 'quotes'}
                    <div class="p-6 space-y-6">
                        {#each currentStageDetails.keyQuotes as quote}
                            <div class="quote-card p-4 rounded-lg bg-slate-50">
                                <div class="mb-4 opacity-50" style="color: {stageColor}">
                                    <Quotes size={24} />
                                </div>
                                <p class="text-slate-600 mb-4 italic">"{quote.quote}"</p>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-slate-700">{quote.author}</span>
                                    <span 
                                        class="text-sm px-2 py-1 rounded"
                                        style="background-color: {stageColor}25; color: {stageColor}"
                                    >
                                        {quote.context}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>

                {:else if activeTab === 'actions'}
                    <div class="p-6">
                        <div class="space-y-4">
                            {#each currentStageDetails.recommendedActions as action, i}
                                <div 
                                    class="p-4 rounded-lg border border-slate-200 flex items-start gap-3"
                                >
                                    <div 
                                        class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-white"
                                        style="background-color: {stageColor}"
                                    >
                                        {i + 1}
                                    </div>
                                    <p class="text-slate-600">{action}</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .drawer-overlay {
        backdrop-filter: blur(2px);
    }

    .drawer {
        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    }

    .close-btn {
        transition: background-color 0.2s ease;
    }

    .drawer-content {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    }

    .drawer-content::-webkit-scrollbar {
        width: 6px;
    }

    .drawer-content::-webkit-scrollbar-track {
        background: transparent;
    }

    .drawer-content::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }
</style>